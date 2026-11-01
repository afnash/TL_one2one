"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers, Play } from "lucide-react";
import { useLMS } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyNote, initials, ListRow, PageHeader, RowList } from "@/components/dashboard/parts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StudentSessionsPage() {
  const router = useRouter();
  const { sessions, startLiveSession } = useLMS();

  const upcoming = sessions.filter((s) => ["SCHEDULED", "LIVE"].includes(s.status));
  const past = sessions.filter((s) => ["COMPLETED", "CANCELLED"].includes(s.status));

  const join = (sessionId: string) => {
    startLiveSession(sessionId);
    router.push(`/student/session/${sessionId}`);
  };

  const renderList = (list: typeof sessions, isUpcoming: boolean) =>
    list.length === 0 ? (
      <EmptyNote>{isUpcoming ? "No lessons scheduled yet." : "No past lessons yet."}</EmptyNote>
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
                      {initials(sess.teacherName)}
                    </AvatarFallback>
                  </Avatar>
                }
                title={`${sess.subject}: ${sess.topic}`}
                meta={`${sess.teacherName} · ${sess.date} at ${sess.scheduledTime} · ${sess.durationMinutes} min${
                  sess.status === "CANCELLED" ? " · cancelled" : ""
                }`}
                action={
                  isUpcoming ? (
                    <Button size="sm" onClick={() => join(sess.id)}>
                      <Play data-icon="inline-start" />
                      {sess.status === "LIVE" ? "Join now" : "Start"}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={sess.whiteboardId ? `/student/whiteboards/${sess.whiteboardId}` : "/student/whiteboards"}>
                        <Layers data-icon="inline-start" />
                        Whiteboard
                      </Link>
                    </Button>
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
      <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-16">
        <PageHeader title="Lessons" description="Upcoming lessons with your teacher, and the boards from past ones." />
        <Tabs defaultValue="upcoming" className="gap-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">{renderList(upcoming, true)}</TabsContent>
          <TabsContent value="past">{renderList(past, false)}</TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
