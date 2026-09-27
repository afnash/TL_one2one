import type { StudentTimetableEntry } from "@/types";

export function ReportTimetable({ entries, currentSessionId }: { entries: StudentTimetableEntry[]; currentSessionId?: string }) {
  if (!entries.length) return <p className="text-sm text-slate-500">No timetable entries available.</p>;
  return <div className="overflow-x-auto rounded-xl border border-slate-200">
    <table className="w-full text-left text-sm">
      <caption className="sr-only">Student timetable across all tutors and subjects</caption>
      <thead className="bg-slate-50 text-slate-600"><tr>{["Date", "Start", "Duration", "Subject / topic", "Tutor", "Status"].map(title => <th key={title} scope="col" className="px-3 py-2 font-semibold whitespace-nowrap">{title}</th>)}</tr></thead>
      <tbody>{entries.map(entry => <tr key={entry.sessionId} className={`border-t border-slate-100 ${entry.sessionId === currentSessionId ? "bg-indigo-50" : ""}`}>
        <td className="px-3 py-2 whitespace-nowrap">{entry.date}{entry.sessionId === currentSessionId && <span className="block text-xs text-indigo-700">This session</span>}</td>
        <td className="px-3 py-2 whitespace-nowrap">{entry.startTime || "Not set"}</td>
        <td className="px-3 py-2 whitespace-nowrap">{entry.durationMinutes} min</td>
        <td className="px-3 py-2 min-w-40">{entry.subject}<span className="block text-xs text-slate-500">{entry.topic}</span></td>
        <td className="px-3 py-2">{entry.tutorName}</td><td className="px-3 py-2 capitalize">{entry.status.toLowerCase()}</td>
      </tr>)}</tbody>
    </table>
  </div>;
}
