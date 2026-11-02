"use client";

import React, { useState } from "react";
import { useLMS } from "@/lib/store";
import { AlertCircle, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ScheduleSession() {
  const { user, students, directory, createSession } = useLMS();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");

  const currentTeacher = directory.teachers?.find((t) => t.id === user.id);
  const teacherSubjects: string[] =
    currentTeacher?.subjects?.length
      ? currentTeacher.subjects
      : (user as { subjects?: string[] }).subjects?.length
      ? (user as { subjects?: string[] }).subjects!
      : ["Mathematics"];

  const [chosenSubject, setChosenSubject] = useState(teacherSubjects[0] || "Mathematics");

  const handleOpen = () => {
    setError("");
    setChosenSubject(teacherSubjects[0] || "Mathematics");
    setOpen(true);
  };

  return (
    <>
      <Button onClick={handleOpen}>
        <Plus data-icon="inline-start" />
        Schedule a lesson
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule a 1:1 lesson</DialogTitle>
            <DialogDescription>Pick a subject from your profile and the students who will join.</DialogDescription>
          </DialogHeader>

          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setError("");
              if (!selected.length) {
                setError("Please select at least one student for this session.");
                return;
              }

              const data = new FormData(e.currentTarget);
              const first = students.find((s) => s.id === selected[0]) || {
                id: selected[0],
                name: "Student",
                avatar: "/icon.jpg",
              };

              const meetingLink = String(data.get("meetingLink") || "").trim();
              if (meetingLink && !/^https?:\/\//i.test(meetingLink)) {
                setError("Please enter a valid HTTP or HTTPS meeting link (or leave blank).");
                return;
              }

              createSession({
                teacherId: user.id,
                teacherName: user.name || "Teacher",
                teacherAvatar: user.avatar || "/icon.jpg",
                studentId: first.id,
                studentName: selected.length === 1 ? first.name : `${selected.length} students`,
                studentAvatar: (first as { avatar?: string }).avatar || "/icon.jpg",
                studentIds: selected,
                topic: String(data.get("topic") || "General Tutorial").trim(),
                subject: chosenSubject,
                date: String(data.get("date")),
                scheduledTime: String(data.get("time")),
                durationMinutes: Number(data.get("duration") || 60),
                meetingLink,
                status: "SCHEDULED",
                writerIds: [],
                raisedHands: [],
              });

              setOpen(false);
              setSelected([]);
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="sched-subject">Subject</FieldLabel>
                <select
                  id="sched-subject"
                  required
                  value={chosenSubject}
                  onChange={(e) => setChosenSubject(e.target.value)}
                  className={selectClass}
                >
                  {teacherSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </Field>

              <Field>
                <FieldLabel htmlFor="sched-topic">Topic</FieldLabel>
                <Input id="sched-topic" name="topic" required placeholder="e.g. Quadratic equations and graphing" />
              </Field>

              <div className="grid gap-3 sm:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="sched-date">Date</FieldLabel>
                  <Input id="sched-date" name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="sched-time">Start time</FieldLabel>
                  <Input id="sched-time" name="time" type="time" required defaultValue="10:00" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="sched-duration">Minutes</FieldLabel>
                  <Input id="sched-duration" name="duration" type="number" min={15} max={240} defaultValue={60} required />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="sched-link">External meeting link (optional)</FieldLabel>
                <Input
                  id="sched-link"
                  name="meetingLink"
                  type="url"
                  placeholder="Leave empty to use the built-in video room"
                />
              </Field>

              <Field>
                <FieldLabel>Students</FieldLabel>
                <div className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-lg border bg-background p-1.5">
                  {students.map((s) => {
                    const isChecked = selected.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={cn(
                          "flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                          isChecked && "bg-secondary text-secondary-foreground"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              setSelected(e.target.checked ? [...selected, s.id] : selected.filter((id) => id !== s.id))
                            }
                            className="accent-primary"
                          />
                          {s.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{s.grade}</span>
                      </label>
                    );
                  })}
                  {!students.length && (
                    <p className="p-2 text-center text-sm text-muted-foreground">No students assigned to you yet.</p>
                  )}
                </div>
              </Field>
            </FieldGroup>

            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Schedule lesson</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
