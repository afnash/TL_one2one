"use client";

import { safeResourceUrl } from "@/lib/supabase";
import React, { useState } from "react";
import { Download, Eye, FileText, Play, Video } from "lucide-react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { VideoPlayerModal } from "@/components/media/VideoPlayer";
import { PDFViewerModal } from "@/components/media/PDFViewerModal";
import { EmptyNote, ListRow, PageHeader, RowList } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type ModalState = { url: string; title: string; subject?: string; description?: string; type?: string } | null;

export default function StudentMaterialsPage() {
  const { materials, subjects } = useLMS();
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [videoModal, setVideoModal] = useState<ModalState>(null);
  const [docModal, setDocModal] = useState<ModalState>(null);

  const filtered = materials.filter((m) => selectedSubject === "ALL" || m.subject === selectedSubject);

  return (
    <AppShell headerTitle="Materials">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-16">
        <PageHeader title="Materials" description="Notes, worksheets and videos shared by your teacher." />

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
          <EmptyNote>No materials here yet.</EmptyNote>
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
                      meta={[m.subject, m.topic, isVideo ? "Video" : m.type, m.size, m.uploadDate].filter(Boolean).join(" · ")}
                      action={
                        <div className="flex items-center gap-1">
                          {isVideo ? (
                            <Button size="sm" onClick={() => setVideoModal(open)}>
                              <Play data-icon="inline-start" />
                              Watch
                            </Button>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => setDocModal(open)}>
                                <Eye data-icon="inline-start" />
                                {isPDF ? "View PDF" : "View"}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label={`Open ${m.title} in a new tab`}
                                onClick={() => window.open(safeResourceUrl(m.url), "_blank", "noopener,noreferrer")}
                              >
                                <Download />
                              </Button>
                            </>
                          )}
                        </div>
                      }
                    />
                  );
                })}
              </RowList>
            </CardContent>
          </Card>
        )}

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
