"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useLMS } from "@/lib/store";
import { Manager, Student, Teacher } from "@/types";
import { initials, PageHeader } from "@/components/dashboard/parts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface RosterManagerProps {
  kind: "STUDENT" | "TEACHER" | "MANAGER";
  title?: string;
  description?: string;
}

type Person = Manager | Teacher | Student;
type FormStatus = "active" | "inactive" | "away" | "offline";

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function RosterManager({ kind, title, description }: RosterManagerProps) {
  const {
    role,
    user,
    directory,
    addStudent,
    addTeacher,
    addManager,
    updateStudent,
    updateTeacher,
    updateManager,
    deleteStudent,
    deleteTeacher,
    deleteManager,
  } = useLMS();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formError, setFormError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Person | null>(null);

  // Scoped list of people based on logged-in role
  const getPeopleList = (): Person[] => {
    if (kind === "MANAGER") return directory.managers || [];

    if (kind === "TEACHER") {
      if (role === "SUPERADMIN") return directory.teachers;
      if (role === "MANAGER") return directory.teachers.filter((t) => t.managerId === user.id);
      return directory.teachers;
    }

    if (role === "SUPERADMIN") return directory.students;
    if (role === "MANAGER") {
      const myTeacherIds = directory.teachers.filter((t) => t.managerId === user.id).map((t) => t.id);
      return directory.students.filter((s) => s.managerId === user.id || myTeacherIds.includes(s.teacherId));
    }
    if (role === "TEACHER") return directory.students.filter((s) => s.teacherId === user.id);
    return directory.students;
  };

  const rawPeople = getPeopleList();
  const people = rawPeople.filter((p) => {
    const q = searchQuery.toLowerCase();
    const loose = p as Partial<Manager & Teacher & Student>;
    return (
      loose.name?.toLowerCase().includes(q) ||
      loose.email?.toLowerCase().includes(q) ||
      loose.phone?.toLowerCase().includes(q) ||
      ("location" in p && loose.location?.toLowerCase().includes(q))
    );
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    bio: "",
    grade: "",
    subjects: "",
    status: "active" as FormStatus,
    teacherId: "",
    managerId: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
  });
  const set = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const openFormForAdd = () => {
    setEditingId(null);
    setFormError("");
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      location: "",
      bio: "",
      grade: "",
      subjects: "",
      status: "active",
      teacherId: role === "TEACHER" ? user.id : "",
      managerId: role === "MANAGER" ? user.id : "",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
    });
    setOpenModal(true);
  };

  const openFormForEdit = (person: Person) => {
    const p = person as Partial<Manager & Teacher & Student>;
    setEditingId(person.id);
    setFormError("");
    setFormData({
      name: p.name || "",
      email: p.email || "",
      password: "",
      phone: p.phone || "",
      location: p.location || "",
      bio: p.bio || "",
      grade: p.grade || "",
      subjects: Array.isArray(p.subjects) ? p.subjects.join(", ") : "",
      status: (p.status as FormStatus) || "active",
      teacherId: p.teacherId || "",
      managerId: p.managerId || "",
      parentName: p.parentContact?.name || "",
      parentEmail: p.parentContact?.email || "",
      parentPhone: p.parentContact?.phone || "",
    });
    setOpenModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subjectList = formData.subjects.split(",").map((s) => s.trim()).filter(Boolean);
    const newPassword = formData.password;
    if ((!editingId && newPassword.length < 8) || (editingId && newPassword && newPassword.length < 8)) {
      setFormError("Passwords must be at least 8 characters.");
      return;
    }
    // Sent once and hashed by the server; left out when editing without a new password.
    const passwordField = newPassword ? { password: newPassword } : {};

    if (kind === "MANAGER") {
      if (role !== "SUPERADMIN") {
        setFormError("Only administrators can create or modify managers.");
        return;
      }
      const mgrPayload: Partial<Manager> & { password?: string } = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        ...passwordField,
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        // Defaults apply to new records only; edits must not overwrite stored values.
        ...(editingId ? {} : { avatar: "/icon.jpg" }),
      };
      if (editingId) updateManager(editingId, mgrPayload);
      else addManager(mgrPayload as Omit<Manager, "id">);
    } else if (kind === "TEACHER") {
      const assignedManager = directory.managers?.find((m) => m.id === formData.managerId);
      const teacherPayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        ...passwordField,
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        subjects: subjectList,
        status: formData.status,
        ...(editingId ? {} : { avatar: "/icon.jpg", rating: 0, totalStudents: 0 }),
        managerId: formData.managerId || undefined,
        managerName: assignedManager ? assignedManager.name : undefined,
      };
      if (editingId) updateTeacher(editingId, teacherPayload);
      else addTeacher(teacherPayload as Omit<Teacher, "id">);
    } else {
      const assignedTeacher = directory.teachers.find((t) => t.id === formData.teacherId);
      const assignedManager = directory.managers?.find((m) => m.id === formData.managerId);
      const studentPayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        ...passwordField,
        phone: formData.phone.trim(),
        grade: formData.grade.trim() || "General",
        subjects: subjectList,
        ...(editingId ? {} : { avatar: "/icon.jpg", overallProgress: 0, attendanceRate: 0, pendingAssignmentsCount: 0 }),
        teacherId: formData.teacherId || "",
        teacherName: assignedTeacher ? assignedTeacher.name : "Unassigned",
        managerId: formData.managerId || assignedTeacher?.managerId || undefined,
        managerName: assignedManager ? assignedManager.name : assignedTeacher?.managerName || undefined,
        status: (formData.status === "inactive" ? "inactive" : "active") as "active" | "inactive",
        parentContact: {
          name: formData.parentName.trim(),
          email: formData.parentEmail.trim(),
          phone: formData.parentPhone.trim(),
        },
      };
      if (editingId) updateStudent(editingId, studentPayload);
      else addStudent(studentPayload as Omit<Student, "id">);
    }

    setOpenModal(false);
    setEditingId(null);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (kind === "MANAGER") deleteManager(pendingDelete.id);
    else if (kind === "TEACHER") deleteTeacher(pendingDelete.id);
    else deleteStudent(pendingDelete.id);
    setPendingDelete(null);
  };

  const titleKind = kind === "MANAGER" ? "Manager" : kind === "TEACHER" ? "Teacher" : "Student";
  const canAdd = role === "SUPERADMIN" || role === "MANAGER" || (role === "TEACHER" && kind === "STUDENT");
  const canDelete = role === "SUPERADMIN";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={title ?? `${titleKind}s`}
        description={description}
        action={
          canAdd && (
            <Button onClick={openFormForAdd}>
              <Plus data-icon="inline-start" />
              Add {titleKind.toLowerCase()}
            </Button>
          )
        }
      />

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label={`Search ${titleKind.toLowerCase()}s`}
          placeholder={`Search ${titleKind.toLowerCase()}s`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {people.length > 0 ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {kind === "STUDENT" && (
                  <>
                    <TableHead className="hidden sm:table-cell">Grade</TableHead>
                    <TableHead className="hidden md:table-cell">Teacher</TableHead>
                    <TableHead className="hidden lg:table-cell w-40">Progress</TableHead>
                  </>
                )}
                {kind === "TEACHER" && (
                  <>
                    <TableHead className="hidden sm:table-cell">Subjects</TableHead>
                    <TableHead className="hidden md:table-cell">Manager</TableHead>
                  </>
                )}
                {kind === "MANAGER" && (
                  <>
                    <TableHead className="hidden sm:table-cell">Location</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                  </>
                )}
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {people.map((person) => {
                const p = person as Partial<Manager & Teacher & Student>;
                const status = p.status || "active";
                const nameCell = (
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                        {initials(p.name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.email}</p>
                    </div>
                  </div>
                );
                return (
                  <TableRow key={person.id}>
                    <TableCell>
                      {role === "TEACHER" && kind === "STUDENT" ? (
                        <Link href={`/teacher/students/${person.id}`} className="block hover:opacity-80">
                          {nameCell}
                        </Link>
                      ) : (
                        nameCell
                      )}
                    </TableCell>
                    {kind === "STUDENT" && (
                      <>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">{p.grade || "–"}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {p.teacherName || "Unassigned"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <Progress value={p.overallProgress || 0} className="h-1.5" />
                            <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
                              {p.overallProgress || 0}%
                            </span>
                          </div>
                        </TableCell>
                      </>
                    )}
                    {kind === "TEACHER" && (
                      <>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {p.subjects?.length ? p.subjects.join(", ") : "–"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {p.managerName || "None"}
                        </TableCell>
                      </>
                    )}
                    {kind === "MANAGER" && (
                      <>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">{p.location || "–"}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{p.phone || "–"}</TableCell>
                      </>
                    )}
                    <TableCell>
                      <span className="inline-flex items-center gap-2 text-sm capitalize">
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            status === "active" ? "bg-emerald-500" : status === "inactive" ? "bg-rose-400" : "bg-muted-foreground/50",
                          )}
                        />
                        {status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" aria-label={`Edit ${p.name}`} onClick={() => openFormForEdit(person)}>
                          <Pencil />
                        </Button>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${p.name}`}
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setPendingDelete(person)}
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <p className="text-sm font-medium">No {titleKind.toLowerCase()}s found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery ? "Try a different search." : canAdd ? `Use “Add ${titleKind.toLowerCase()}” to create one.` : "Nothing to show yet."}
          </p>
        </div>
      )}

      {/* Add / edit form */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-xl">
          <DialogHeader className="border-b p-6">
            <DialogTitle>{editingId ? `Edit ${titleKind.toLowerCase()}` : `Add ${titleKind.toLowerCase()}`}</DialogTitle>
            <DialogDescription>
              {editingId ? "Leave the password blank to keep the current one." : "They sign in with this email and password."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="rm-name">Full name</FieldLabel>
                    <Input id="rm-name" required value={formData.name} onChange={(e) => set("name", e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="rm-email">Email</FieldLabel>
                    <Input id="rm-email" type="email" required value={formData.email} onChange={(e) => set("email", e.target.value)} />
                  </Field>

                  {/* Teachers set a new student's first password; resets need a manager or admin. */}
                  {!(editingId && role === "TEACHER") && (
                    <Field>
                      <FieldLabel htmlFor="rm-password">Password</FieldLabel>
                      <Input
                        id="rm-password"
                        type="password"
                        required={!editingId}
                        minLength={8}
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={(e) => set("password", e.target.value)}
                        placeholder={editingId ? "Unchanged" : "At least 8 characters"}
                      />
                    </Field>
                  )}
                  <Field>
                    <FieldLabel htmlFor="rm-phone">Phone</FieldLabel>
                    <Input id="rm-phone" type="tel" value={formData.phone} onChange={(e) => set("phone", e.target.value)} />
                  </Field>

                  {kind === "MANAGER" && (
                    <Field className="sm:col-span-2">
                      <FieldLabel htmlFor="rm-location">Location or branch</FieldLabel>
                      <Input id="rm-location" required value={formData.location} onChange={(e) => set("location", e.target.value)} />
                    </Field>
                  )}

                  {kind === "TEACHER" && (
                    <>
                      <Field className="sm:col-span-2">
                        <FieldLabel htmlFor="rm-subjects">Subjects (comma separated)</FieldLabel>
                        <Input id="rm-subjects" value={formData.subjects} placeholder="Mathematics, Physics" onChange={(e) => set("subjects", e.target.value)} />
                      </Field>
                      {role === "SUPERADMIN" && (
                        <Field>
                          <FieldLabel htmlFor="rm-manager">Manager</FieldLabel>
                          <select id="rm-manager" className={selectClass} value={formData.managerId} onChange={(e) => set("managerId", e.target.value)}>
                            <option value="">No manager</option>
                            {directory.managers?.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.location || "General"})
                              </option>
                            ))}
                          </select>
                        </Field>
                      )}
                      <Field>
                        <FieldLabel htmlFor="rm-status">Status</FieldLabel>
                        <select id="rm-status" className={selectClass} value={formData.status} onChange={(e) => set("status", e.target.value as FormStatus)}>
                          <option value="active">Active</option>
                          <option value="away">Away</option>
                          <option value="offline">Offline</option>
                          <option value="inactive">Inactive (cannot sign in)</option>
                        </select>
                      </Field>
                      <Field className="sm:col-span-2">
                        <FieldLabel htmlFor="rm-bio">Bio</FieldLabel>
                        <Textarea id="rm-bio" rows={2} value={formData.bio} onChange={(e) => set("bio", e.target.value)} />
                      </Field>
                    </>
                  )}

                  {kind === "STUDENT" && (
                    <>
                      <Field>
                        <FieldLabel htmlFor="rm-grade">Grade or level</FieldLabel>
                        <Input id="rm-grade" value={formData.grade} placeholder="Grade 10" onChange={(e) => set("grade", e.target.value)} />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="rm-student-subjects">Subjects</FieldLabel>
                        <Input id="rm-student-subjects" value={formData.subjects} onChange={(e) => set("subjects", e.target.value)} />
                      </Field>
                      {(role === "SUPERADMIN" || role === "MANAGER") && (
                        <Field>
                          <FieldLabel htmlFor="rm-teacher">Teacher</FieldLabel>
                          <select id="rm-teacher" className={selectClass} value={formData.teacherId} onChange={(e) => set("teacherId", e.target.value)}>
                            <option value="">Unassigned</option>
                            {directory.teachers
                              .filter((t) => role === "SUPERADMIN" || t.managerId === user.id)
                              .map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name} ({t.subjects?.join(", ") || "General"})
                                </option>
                              ))}
                          </select>
                        </Field>
                      )}
                      {role === "SUPERADMIN" && (
                        <Field>
                          <FieldLabel htmlFor="rm-student-manager">Manager</FieldLabel>
                          <select id="rm-student-manager" className={selectClass} value={formData.managerId} onChange={(e) => set("managerId", e.target.value)}>
                            <option value="">Same as teacher</option>
                            {directory.managers?.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.location || "General"})
                              </option>
                            ))}
                          </select>
                        </Field>
                      )}
                    </>
                  )}
                </div>

                {kind === "STUDENT" && (
                  <FieldSet>
                    <FieldLegend variant="label">Parent or guardian</FieldLegend>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field>
                        <FieldLabel htmlFor="rm-parent-name">Name</FieldLabel>
                        <Input id="rm-parent-name" value={formData.parentName} onChange={(e) => set("parentName", e.target.value)} />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="rm-parent-email">Email</FieldLabel>
                        <Input id="rm-parent-email" type="email" value={formData.parentEmail} onChange={(e) => set("parentEmail", e.target.value)} />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="rm-parent-phone">Phone</FieldLabel>
                        <Input id="rm-parent-phone" type="tel" value={formData.parentPhone} onChange={(e) => set("parentPhone", e.target.value)} />
                      </Field>
                    </div>
                  </FieldSet>
                )}

                {formError && (
                  <Alert variant="destructive">
                    <AlertCircle />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
              </FieldGroup>
            </div>
            <DialogFooter className="border-t p-4">
              <Button type="button" variant="ghost" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? "Save changes" : `Create ${titleKind.toLowerCase()}`}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove {(pendingDelete as Partial<Person> & { name?: string } | null)?.name}?</DialogTitle>
            <DialogDescription>This removes the account and they will no longer be able to sign in.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
