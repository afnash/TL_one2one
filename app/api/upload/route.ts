import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (file.size > 50 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "File size exceeds 50 MB limit" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFileName = `${Date.now()}_${cleanName}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;

    return new Response(
      JSON.stringify({
        url: publicUrl,
        fileName: file.name,
        sizeBytes: file.size,
        mimeType: file.type,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error during upload" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
