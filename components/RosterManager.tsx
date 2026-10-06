"use client";

import React, { useState } from "react";
import { useLMS } from "@/lib/store";
import { 
  Building2, 
  GraduationCap, 
  Mail, 
  MapPin, 
  Phone, 
  Plus, 
  Search, 
  Trash2, 
  UserCheck, 
  Users, 
  X,
  Edit3,
  User as UserIcon,
  BookOpen
} from "lucide-react";
import { Manager, Student, Teacher } from "@/types";

interface RosterManagerProps {
  kind: "STUDENT" | "TEACHER" | "MANAGER";
}

export function RosterManager({ kind }: RosterManagerProps) {
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
    deleteManager
  } = useLMS();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Scoped list of people based on logged-in role
  const getPeopleList = () => {
    if (kind === "MANAGER") {
      return directory.managers || [];
    }

    if (kind === "TEACHER") {
      if (role === "SUPERADMIN") return directory.teachers;
      if (role === "MANAGER") return directory.teachers.filter(t => t.managerId === user.id);
      return directory.teachers;
    }

    // Students
    if (role === "SUPERADMIN") return directory.students;
    if (role === "MANAGER") {
      const myTeacherIds = directory.teachers.filter(t => t.managerId === user.id).map(t => t.id);
      return directory.students.filter(s => s.managerId === user.id || myTeacherIds.includes(s.teacherId));
    }
    if (role === "TEACHER") {
      return directory.students.filter(s => s.teacherId === user.id);
    }
    return directory.students;
  };

  const rawPeople = getPeopleList();
  const people = rawPeople.filter((p: any) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = p.name?.toLowerCase().includes(q);
    const emailMatch = p.email?.toLowerCase().includes(q);
    const phoneMatch = p.phone?.toLowerCase().includes(q);
    const locationMatch = "location" in p && p.location?.toLowerCase().includes(q);
    return nameMatch || emailMatch || phoneMatch || locationMatch;
  });

  const current = rawPeople.find((p: any) => p.id === editingId);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    bio: "",
    grade: "",
    subjects: "",
    status: "active" as "active" | "inactive" | "away" | "offline",
    teacherId: "",
    managerId: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
  });

  const openFormForAdd = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      password: "password123",
      phone: "",
      location: "",
      bio: "",
      grade: "Grade 10",
      subjects: "Mathematics, Physics",
      status: "active",
      teacherId: role === "TEACHER" ? user.id : "",
      managerId: role === "MANAGER" ? user.id : "",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
    });
    setOpenModal(true);
  };

  const openFormForEdit = (person: any) => {
    setEditingId(person.id);
    setFormData({
      name: person.name || "",
      email: person.email || "",
      password: person.password || "",
      phone: person.phone || "",
      location: person.location || "",
      bio: person.bio || "",
      grade: person.grade || "",
      subjects: Array.isArray(person.subjects) ? person.subjects.join(", ") : "",
      status: person.status || "active",
      teacherId: person.teacherId || "",
      managerId: person.managerId || "",
      parentName: person.parentContact?.name || "",
      parentEmail: person.parentContact?.email || "",
      parentPhone: person.parentContact?.phone || "",
    });
    setOpenModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subjectList = formData.subjects.split(",").map(s => s.trim()).filter(Boolean);

    if (kind === "MANAGER") {
      if (role !== "SUPERADMIN") {
        alert("Only superadmins can create or modify managers.");
        return;
      }
      const mgrPayload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim() || "password123",
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        avatar: "/icon.jpg",
      };
      if (editingId) {
        updateManager(editingId, mgrPayload);
      } else {
        addManager(mgrPayload);
      }
    } else if (kind === "TEACHER") {
      const assignedManager = directory.managers?.find(m => m.id === formData.managerId);
      const teacherPayload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim() || "password123",
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        subjects: subjectList,
        status: formData.status as "active" | "away" | "offline",
        avatar: "/icon.jpg",
        rating: 5.0,
        totalStudents: 0,
        managerId: formData.managerId || undefined,
        managerName: assignedManager ? assignedManager.name : undefined,
      };
      if (editingId) {
        updateTeacher(editingId, teacherPayload);
      } else {
        addTeacher(teacherPayload);
      }
    } else {
      // Student
      const assignedTeacher = directory.teachers.find(t => t.id === formData.teacherId);
      const assignedManager = directory.managers?.find(m => m.id === formData.managerId);
      const studentPayload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim() || "password123",
        phone: formData.phone.trim(),
        grade: formData.grade.trim() || "General",
        subjects: subjectList,
        avatar: "/icon.jpg",
        teacherId: formData.teacherId || "",
        teacherName: assignedTeacher ? assignedTeacher.name : "Unassigned",
        managerId: formData.managerId || (assignedTeacher?.managerId || undefined),
        managerName: assignedManager ? assignedManager.name : (assignedTeacher?.managerName || undefined),
        overallProgress: 0,
        attendanceRate: 100,
        pendingAssignmentsCount: 0,
        status: (formData.status === "inactive" ? "inactive" : "active") as "active" | "inactive",
        parentContact: {
          name: formData.parentName.trim(),
          email: formData.parentEmail.trim(),
          phone: formData.parentPhone.trim(),
        },
      };
      if (editingId) {
        updateStudent(editingId, studentPayload);
      } else {
        addStudent(studentPayload);
      }
    }

    setOpenModal(false);
    setEditingId(null);
  };

  const titleKind = kind === "MANAGER" ? "Manager" : kind === "TEACHER" ? "Teacher" : "Student";

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${titleKind.toLowerCase()}s by name, email, phone...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          {(role === "SUPERADMIN" || role === "MANAGER" || (role === "TEACHER" && kind === "STUDENT")) && (
            <button
              onClick={openFormForAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add {titleKind}
            </button>
          )}
        </div>
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {people.map((person: any) => {
          return (
            <div
              key={person.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                {/* Header with Avatar and Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={person.avatar || "/icon.jpg"}
                      alt={person.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{person.name}</h3>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 shrink-0" />
                        {person.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize shrink-0 ${
                      person.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {person.status || "active"}
                  </span>
                </div>

                {/* Info Fields */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  {person.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{person.phone}</span>
                    </div>
                  )}

                  {kind === "MANAGER" && person.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{person.location}</span>
                    </div>
                  )}

                  {kind === "TEACHER" && (
                    <>
                      {person.managerName && (
                        <div className="flex items-center gap-2 text-indigo-700">
                          <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>Manager: <strong>{person.managerName}</strong></span>
                        </div>
                      )}
                      {person.subjects?.length > 0 && (
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{person.subjects.join(", ")}</span>
                        </div>
                      )}
                    </>
                  )}

                  {kind === "STUDENT" && (
                    <>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                          {person.grade || "Grade 10"}
                        </span>
                        <span className="text-slate-500">
                          Progress: <strong className="text-slate-800">{person.overallProgress || 0}%</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-indigo-700 pt-1">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>Teacher: <strong>{person.teacherName || "Unassigned"}</strong></span>
                      </div>

                      {person.parentContact?.name && (
                        <div className="flex items-center gap-2 text-amber-800 bg-amber-50/60 p-2 rounded-xl border border-amber-100 mt-2">
                          <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[11px]">Parent: {person.parentContact.name}</p>
                            <p className="text-[10px] text-amber-700/80 truncate">
                              {person.parentContact.phone || person.parentContact.email || "No direct phone"}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => openFormForEdit(person)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit / Assign
                </button>

                {role === "SUPERADMIN" && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to remove ${person.name}?`)) {
                        if (kind === "MANAGER") deleteManager(person.id);
                        else if (kind === "TEACHER") deleteTeacher(person.id);
                        else deleteStudent(person.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title={`Delete ${titleKind}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!people.length && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <p className="text-base font-semibold text-slate-700">No {titleKind.toLowerCase()} profiles found.</p>
          <p className="text-xs text-slate-400 mt-1">Click &quot;Add {titleKind}&quot; above to create one.</p>
        </div>
      )}

      {/* Modal Form for Add/Edit */}
      {openModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? `Edit ${titleKind}` : `Add New ${titleKind}`}
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Login Password *</label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    placeholder="e.g. password123"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. +1 555-0199"
                  />
                </div>

                {kind === "MANAGER" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Location / Branch *</label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="e.g. London Campus / Remote"
                    />
                  </div>
                )}

                {kind === "TEACHER" && (
                  <>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Subjects (Comma separated)</label>
                      <input
                        type="text"
                        value={formData.subjects}
                        onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="e.g. Mathematics, Physics, Chemistry"
                      />
                    </div>

                    {role === "SUPERADMIN" && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Assign to Manager</label>
                        <select
                          value={formData.managerId}
                          onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="">No Manager (Direct)</option>
                          {directory.managers?.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.location || "General"})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="away">Away</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Profile Summary</label>
                      <textarea
                        rows={2}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="Brief background and teaching specialities..."
                      />
                    </div>
                  </>
                )}

                {kind === "STUDENT" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Grade / Level</label>
                      <input
                        type="text"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="e.g. Grade 11 / A-Levels"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Enrolled Subjects</label>
                      <input
                        type="text"
                        value={formData.subjects}
                        onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="e.g. Biology, Chemistry"
                      />
                    </div>

                    {(role === "SUPERADMIN" || role === "MANAGER") && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Teacher *</label>
                        <select
                          value={formData.teacherId}
                          onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="">Unassigned</option>
                          {directory.teachers
                            .filter((t) => role === "SUPERADMIN" || t.managerId === user.id)
                            .map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name} ({t.subjects?.join(", ") || "General"})
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    {role === "SUPERADMIN" && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Manager</label>
                        <select
                          value={formData.managerId}
                          onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="">Inherit from Teacher / None</option>
                          {directory.managers?.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.location || "General"})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Parent Contact Details */}
                    <div className="sm:col-span-2 pt-3 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                        Parent / Guardian Contact Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Parent Name</label>
                          <input
                            type="text"
                            value={formData.parentName}
                            onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            placeholder="e.g. Mary Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Parent Email</label>
                          <input
                            type="email"
                            value={formData.parentEmail}
                            onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            placeholder="e.g. mary@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Parent Phone</label>
                          <input
                            type="tel"
                            value={formData.parentPhone}
                            onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            placeholder="e.g. +1 555-0188"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingId ? "Save Changes" : `Create ${titleKind}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
