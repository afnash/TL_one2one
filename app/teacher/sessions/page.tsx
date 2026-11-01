"use client";

import { ScheduleSession } from "@/components/session/ScheduleSession";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Layers, Play } from "lucide-react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyNote, initials, ListRow, PageHeader, RowList } from "@/components/dashboard/parts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TeacherSessionsPage() {
  const router = useRouter();
  const { sessions, startLiveSession } = useLMS();

  const upcoming = sessions.filter((s) => ["SCHEDULED", "LIVE"].includes(s.status));
  const completed = sessions.filter((s) => s.status === "COMPLETED");

  const start = (sessionId: string) => {
    startLiveSession(sessionId);
    router.push(`/teacher/session/${sessionId}`);
  };

  const renderList = (list: typeof sessions, empty: string) =>
    list.length === 0 ? (
      <EmptyNote>{empty}</EmptyNote>
    ) : (
      <Card>
        <CardContent>
          <RowList>
            {list.map((sess) => (
              <ListRow
                key={sess.id}
                lead={
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                      {initials(sess.studentName)}
                    </AvatarFallback>
                  </Avatar>
                }
                title={`${sess.studentName} · ${sess.subject}`}
                meta={`${sess.topic} · ${sess.date} at ${sess.scheduledTime} · ${
                  sess.actualDurationSeconds ? `${Math.round(sess.actualDurationSeconds / 60)} min` : `${sess.durationMinutes} min`
                }`}
                action={
                  ["SCHEDULED", "LIVE"].includes(sess.status) ? (
                    <Button size="sm" onClick={() => start(sess.id)}>
                      <Play data-icon="inline-start" />
                      {sess.status === "LIVE" ? "Rejoin" : "Start"}
                    </Button>
                  ) : (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={sess.whiteboardId ? `/teacher/whiteboards/${sess.whiteboardId}` : "/teacher/whiteboards"}>
                          <Layers data-icon="inline-start" />
                          Board
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/teacher/session/${sess.id}/report`}>
                          <FileText data-icon="inline-start" />
                          Report
                        </Link>
                      </Button>
                    </div>
                  )
                }
              />
            ))}
          </RowList>
        </CardContent>
      </Card>
    );

  return (
    <AppShell headerTitle="Lessons">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-16">
        <PageHeader title="Lessons" description="Schedule lessons, start the classroom and write up reports." />
        <ScheduleSession />
        <Tabs defaultValue="upcoming" className="gap-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">{renderList(upcoming, "No lessons scheduled yet.")}</TabsContent>
          <TabsContent value="completed">{renderList(completed, "Completed lessons appear here.")}</TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
