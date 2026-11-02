import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { rateLimited } from "@/lib/rate-limit";
import { getSession, sameOrigin } from "@/lib/session";
import { supabaseAdminRequest, supabaseServerConfigured, supabaseUrl } from "@/lib/supabase-server";

// Only document, image and video types that browsers render inertly. HTML, SVG
// and scripts are rejected so uploads cannot run code on this origin.
const ALLOWED: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  mp4: "video/mp4",
  txt: "text/plain",
};
// The extension alone is not trusted: the file's leading bytes must match the type.
const startsWith = (buffer: Buffer, bytes: number[], offset = 0) => bytes.every((byte, index) => buffer[offset + index] === byte);
function matchesType(extension: string, buffer: Buffer) {
  switch (extension) {
    case "pdf": return startsWith(buffer, [0x25, 0x50, 0x44, 0x46, 0x2d]);
    case "png": return startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "jpg": case "jpeg": return startsWith(buffer, [0xff, 0xd8, 0xff]);
    case "mp4": return startsWith(buffer, [0x66, 0x74, 0x79, 0x70], 4);
    case "docx": return startsWith(buffer, [0x50, 0x4b, 0x03, 0x04]);
    case "doc": return startsWith(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    case "txt": return !buffer.subarray(0, 65536).some(byte => byte === 0 || (byte < 32 && ![9, 10, 12, 13].includes(byte)));
    default: return false;
  }
}
const MAX_BYTES = 50 * 1024 * 1024;
const UPLOADERS = ["TEACHER", "MANAGER", "SUPERADMIN"];
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Invalid origin", 403);
  const session = await getSession();
  if (!session) return fail("Sign in to upload files", 401);
  if (!UPLOADERS.includes(session.role)) return fail("Only staff can upload files", 403);
  if (rateLimited(`upload:${session.id}`, 30, 60 * 60 * 1000)) return fail("Upload limit reached. Try again later.", 429);
  if (Number(req.headers.get("content-length") || 0) > MAX_BYTES + 1024 * 1024) return fail("File size exceeds 50 MB limit", 413);

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return fail("No file uploaded", 400);
    if (file.size > MAX_BYTES) return fail("File size exceeds 50 MB limit", 413);

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const contentType = ALLOWED[extension];
    if (!contentType) return fail("Unsupported file type. Upload PDF, Word, PNG, JPEG, MP4 or TXT files.", 415);

    const base = file.name.slice(0, -(extension.length + 1)).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80) || "file";
    const fileName = `${base}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!matchesType(extension, buffer)) return fail("The file content does not match its extension.", 415);

    let url: string;
    // Public bucket: anyone holding the (unguessable) URL can read the file. Moving to a
    // private bucket needs signed URLs minted per viewer wherever materials render.
    if (supabaseServerConfigured) {
      const objectPath = `${randomUUID()}/${fileName}`;
      await supabaseAdminRequest(`/storage/v1/object/study-materials/${objectPath}`, { method: "POST", body: buffer, headers: { "Content-Type": contentType } });
      url = `${supabaseUrl}/storage/v1/object/public/study-materials/${objectPath}`;
    } else {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });
      const uniqueFileName = `${Date.now()}_${randomUUID().slice(0, 8)}_${fileName}`;
      await writeFile(path.join(uploadsDir, uniqueFileName), buffer);
      url = `/uploads/${uniqueFileName}`;
    }

    return NextResponse.json({ url, fileName: file.name, sizeBytes: file.size, mimeType: contentType });
  } catch (error) {
    console.error("Upload handler error:", error);
    return fail("Upload failed. Please try again.", 500);
  }
}
