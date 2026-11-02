"use client";

import React from "react";
import { ExternalLink, FileText, Trash2, Video } from "lucide-react";
import { useLMS } from "@/lib/store";
import { safeResourceUrl } from "@/lib/supabase";
import { AppShell } from "@/components/layout/AppShell";
import { ConfirmAction } from "@/components/dashboard/ConfirmAction";
import { EmptyNote, ListRow, PageHeader, RowList, Stat } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminMaterialsPage() {
  const { materials, deleteStudyMaterial } = useLMS();
  const megabytes = (materials.reduce((n, m) => n + (m.sizeBytes || 0), 0) / 1048576).toFixed(2);

  return (
    <AppShell headerTitle="Materials">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-16">
        <PageHeader title="Materials" description="Files and links shared across the platform." />
        <div className="grid max-w-md grid-cols-2 gap-4">
          <Stat label="Resources" value={materials.length} />
          <Stat label="Uploaded" value={`${megabytes} MB`} />
        </div>
        {materials.length === 0 ? (
          <EmptyNote>No materials have been shared yet.</EmptyNote>
        ) : (
          <Card>
            <CardContent>
              <RowList>
                {materials.map((m) => (
                  <ListRow
                    key={m.id}
                    lead={m.type === "VIDEO" ? <Video className="size-5 text-muted-foreground" /> : <FileText className="size-5 text-muted-foreground" />}
                    title={m.title}
                    meta={[m.subject, m.size].filter(Boolean).join(" · ")}
                    action={
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" aria-label={`Open ${m.title}`} asChild>
                          <a href={safeResourceUrl(m.url) || undefined} target="_blank" rel="noopener noreferrer">
                            <ExternalLink />
                          </a>
                        </Button>
                        <ConfirmAction
                          title={`Remove “${m.title}”?`}
                          description="This removes the resource from the library for everyone."
                          onConfirm={() => deleteStudyMaterial(m.id)}
                          trigger={
                            <Button variant="ghost" size="icon" aria-label={`Remove ${m.title}`} className="text-muted-foreground hover:text-destructive">
                              <Trash2 />
                            </Button>
                          }
                        />
                      </div>
                    }
                  />
                ))}
              </RowList>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
