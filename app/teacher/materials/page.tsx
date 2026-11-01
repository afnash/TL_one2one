"use client";

import { uploadMaterial, safeResourceUrl } from "@/lib/supabase";
import { ConfirmAction } from "@/components/dashboard/ConfirmAction";
import React, { useRef, useState } from "react";
import { AlertCircle, Eye, ExternalLink, FileText, Play, Trash2, UploadCloud, Video } from "lucide-react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { StudyMaterial } from "@/types";
import { VideoPlayerModal } from "@/components/media/VideoPlayer";
import { PDFViewerModal } from "@/components/media/PDFViewerModal";
import { EmptyNote, ListRow, PageHeader, RowList } from "@/components/dashboard/parts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type ModalState = { url: string; title: string; subject?: string; description?: string; type?: string } | null;

export default function TeacherMaterialsPage() {
  const { user, materials, directory, subjects, addStudyMaterial, deleteStudyMaterial } = useLMS();

  const currentTeacher = directory.teachers?.find((t) => t.id === user.id);
  const teacherSubjects: string[] = currentTeacher?.subjects?.length
    ? currentTeacher.subjects
    : (user as { subjects?: string[] }).subjects?.length
      ? (user as { subjects?: string[] }).subjects!
      : ["Mathematics"];

  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTab, setUploadTab] = useState<"FILE" | "LINK">("FILE");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [videoModal, setVideoModal] = useState<ModalState>(null);
  const [docModal, setDocModal] = useState<ModalState>(null);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(teacherSubjects[0] || "Mathematics");
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [type, setType] = useState<StudyMaterial["type"]>("PDF");
  const [resourceUrl, setResourceUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [description, setDescription] = useState("");

  const filtered = materials.filter((m) => selectedSubject === "ALL" || m.subject === selectedSubject);

  // Detect the material type from a pasted link
  const handleResourceUrlChange = (val: string) => {
    setResourceUrl(val);
    if (/youtube\.com|youtu\.be|vimeo\.com/.test(val) || /\.(mp4|webm|mov)(\?.*)?$/i.test(val)) setType("VIDEO");
    else if (/\.pdf(\?.*)?$/i.test(val)) setType("PDF");
  };

  const handleFileSelected = (f: File | null) => {
    setFile(f);
    if (!f) return;
    if (!title.trim()) {
      const clean = f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTitle(clean.charAt(0).toUpperCase() + clean.slice(1));
    }
    if (f.type.startsWith("video/")) setType("VIDEO");
    else if (f.type === "application/pdf" || f.name.endsWith(".pdf")) setType("PDF");
    else if (f.type.startsWith("image/")) setType("IMAGE");
    else setType("DOC");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileSelected(e.dataTransfer.files[0]);
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (uploadTab === "FILE" && !file) return setUploadError("Please select a file to upload.");
    if (uploadTab === "LINK" && !resourceUrl.trim()) return setUploadError("Please enter a valid resource or video URL.");

    setUploading(true);
    setUploadError("");
    try {
      const url = file ? await uploadMaterial(file) : safeResourceUrl(resourceUrl);
      if (!url) throw new Error("Enter an http:// or https:// link.");
      addStudyMaterial({
        title: title.trim(),
        subject: subject || (subjects[0]?.name ?? "Mathematics"),
        topic: topic.trim(),
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        type,
        size: file ? (file.size / 1024 / 1024).toFixed(2) + " MB" : type === "VIDEO" ? "Video Stream" : "Web Resource",
        sizeBytes: file?.size || 0,
        url,
        description: description.trim(),
        assignedTo: "ALL",
      });
      setTitle("");
      setTopic("");
      setKeywords("");
      setDescription("");
      setUploadOpen(false);
      setFile(null);
      setResourceUrl("");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppShell headerTitle="Materials">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-16">
        <PageHeader
          title="Materials"
          description="Upload notes, worksheets and videos for your students."
          action={
            <Button
              onClick={() => {
                setUploadOpen(true);
                setUploadError("");
              }}
            >
              <UploadCloud data-icon="inline-start" />
              Upload material
            </Button>
          }
        />

        {subjects.length > 0 && (
          <ToggleGroup
            type="single"
            variant="outline"
            value={selectedSubject}
            onValueChange={(v) => setSelectedSubject(v || "ALL")}
            className="flex-wrap justify-start"
          >
            <ToggleGroupItem value="ALL">All ({materials.length})</ToggleGroupItem>
            {subjects.map((sub) => (
              <ToggleGroupItem key={sub.id} value={sub.name}>
                {sub.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}

        {filtered.length === 0 ? (
          <EmptyNote>Nothing here yet. Upload a file or add a link to share it with your students.</EmptyNote>
        ) : (
          <Card>
            <CardContent>
              <RowList>
                {filtered.map((m) => {
                  const isVideo =
                    m.type === "VIDEO" ||
                    m.url.includes("youtube") ||
                    m.url.includes("youtu.be") ||
                    /\.(mp4|webm|mov)(\?.*)?$/i.test(m.url);
                  const isPDF = m.type === "PDF" || /\.pdf(\?.*)?$/i.test(m.url);
                  const Icon = isVideo ? Video : FileText;
                  const open: ModalState = { url: m.url, title: m.title, subject: m.subject, description: m.description, type: m.type };
                  return (
                    <ListRow
                      key={m.id}
                      lead={<Icon className="size-5 shrink-0 text-muted-foreground" />}
                      title={m.title}
                      meta={[m.subject, m.topic, isVideo ? "Video" : m.type, m.size, `${m.downloadsCount} downloads`].filter(Boolean).join(" · ")}
                      action={
                        <div className="flex items-center gap-1">
                          {isVideo ? (
                            <Button size="sm" variant="outline" onClick={() => setVideoModal(open)}>
                              <Play data-icon="inline-start" />
                              Play
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => setDocModal(open)}>
                              <Eye data-icon="inline-start" />
                              {isPDF ? "View PDF" : "View"}
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Open ${m.title} in a new tab`}
                            onClick={() => window.open(safeResourceUrl(m.url), "_blank", "noopener,noreferrer")}
                          >
                            <ExternalLink />
                          </Button>
                          <ConfirmAction
                            trigger={
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label={`Delete ${m.title}`}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 />
                              </Button>
                            }
                            title="Delete this material?"
                            description={`"${m.title}" will be removed for you and your students.`}
                            confirmLabel="Delete"
                            onConfirm={() => deleteStudyMaterial(m.id)}
                          />
                        </div>
                      }
                    />
                  );
                })}
              </RowList>
            </CardContent>
          </Card>
        )}

        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-xl">
            <DialogHeader className="border-b p-6">
              <DialogTitle>Upload material</DialogTitle>
              <DialogDescription>Share a file or a link. Students in your subjects will see it.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateMaterial}>
              <div className="p-6">
                <FieldGroup>
                  <Tabs value={uploadTab} onValueChange={(v) => setUploadTab(v as "FILE" | "LINK")} className="gap-4">
                    <TabsList>
                      <TabsTrigger value="FILE">Upload a file</TabsTrigger>
                      <TabsTrigger value="LINK">Add a link</TabsTrigger>
                    </TabsList>
                    <TabsContent value="FILE">
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center transition-colors",
                          isDragging && "border-ring bg-secondary/60",
                        )}
                      >
                        <UploadCloud className="size-6 text-muted-foreground" />
                        <p className="text-sm">{file ? file.name : "Drag a file here, or choose one"}</p>
                        <p className="text-xs text-muted-foreground">PDF, Word, image, MP4 or text, up to 50 MB</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="sr-only"
                          aria-label="Choose a file"
                          onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
                        />
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          Choose file
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="LINK">
                      <Field>
                        <FieldLabel htmlFor="mat-url">Link</FieldLabel>
                        <Input
                          id="mat-url"
                          type="url"
                          placeholder="https://"
                          value={resourceUrl}
                          onChange={(e) => handleResourceUrlChange(e.target.value)}
                        />
                      </Field>
                    </TabsContent>
                  </Tabs>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field className="sm:col-span-2">
                      <FieldLabel htmlFor="mat-title">Title</FieldLabel>
                      <Input id="mat-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="mat-subject">Subject</FieldLabel>
                      <select
                        id="mat-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        {Array.from(new Set([...teacherSubjects, ...subjects.map((s) => s.name)])).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="mat-topic">Topic</FieldLabel>
                      <Input id="mat-topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
                    </Field>
                    <Field className="sm:col-span-2">
                      <FieldLabel htmlFor="mat-keywords">Keywords (comma separated)</FieldLabel>
                      <Input id="mat-keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
                    </Field>
                    <Field className="sm:col-span-2">
                      <FieldLabel htmlFor="mat-desc">Description</FieldLabel>
                      <Textarea id="mat-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
                    </Field>
                  </div>

                  {uploadError && (
                    <Alert variant="destructive">
                      <AlertCircle />
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}
                </FieldGroup>
              </div>
              <DialogFooter className="border-t p-4">
                <Button type="button" variant="ghost" onClick={() => setUploadOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading && <Spinner data-icon="inline-start" />}
                  {uploading ? "Uploading" : "Share material"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <VideoPlayerModal
          isOpen={!!videoModal}
          onClose={() => setVideoModal(null)}
          url={videoModal?.url || ""}
          title={videoModal?.title || ""}
          subject={videoModal?.subject}
          description={videoModal?.description}
        />
        <PDFViewerModal
          isOpen={!!docModal}
          onClose={() => setDocModal(null)}
          url={docModal?.url || ""}
          title={docModal?.title || ""}
          subject={docModal?.subject}
          description={docModal?.description}
          type={docModal?.type}
        />
      </div>
    </AppShell>
  );
}
