import "server-only";
import { withDatabase } from "@/lib/database";

type Row = Record<string, unknown>;
const all = (sql: string, ...params: unknown[]) => withDatabase((db) => db.prepare(sql).all(...params) as Row[]);
const one = (sql: string, ...params: unknown[]) => withDatabase((db) => db.prepare(sql).get(...params) as Row | undefined);

export function attendanceMonth(month: string) {
  const prefix = /^\d{4}-\d{2}$/.test(month) ? month : new Date().toISOString().slice(0,7);
  const events=all(`SELECT e.*,w.name worker_name,w.employee_no,s.name site_name,j.name job_name
    FROM app_attendance_events e JOIN app_workers w ON w.id=e.worker_id
    LEFT JOIN app_sites s ON s.id=e.site_id
    LEFT JOIN app_assignments a ON a.id=e.assignment_id LEFT JOIN app_jobs j ON j.id=a.job_id
    WHERE substr(e.work_date,1,7)=? ORDER BY e.work_date DESC,w.name,e.id DESC`,prefix);
  const summary=all(`SELECT w.id,w.name,w.employee_no,s.name site_name,j.name job_name,
    SUM(CASE WHEN e.event_type='연장' THEN e.minutes ELSE 0 END) overtime_minutes,
    SUM(CASE WHEN e.event_type='야간' THEN e.minutes ELSE 0 END) night_minutes,
    SUM(CASE WHEN e.event_type='휴일' THEN e.minutes ELSE 0 END) holiday_minutes,
    SUM(CASE WHEN e.event_type='지각' THEN 1 ELSE 0 END) tardy_count,
    SUM(CASE WHEN e.event_type='조퇴' THEN 1 ELSE 0 END) early_count,
    SUM(CASE WHEN e.event_type='결근' THEN e.days ELSE 0 END) absence_days,
    SUM(CASE WHEN e.event_type='무급' THEN e.days ELSE 0 END) unpaid_days
    FROM app_workers w
    LEFT JOIN app_assignments a ON a.worker_id=w.id AND a.status='활성'
    LEFT JOIN app_sites s ON s.id=a.site_id LEFT JOIN app_jobs j ON j.id=a.job_id
    LEFT JOIN app_attendance_events e ON e.worker_id=w.id AND substr(e.work_date,1,7)=?
    WHERE w.status IN ('재직','휴직') GROUP BY w.id ORDER BY s.name,w.name`,prefix);
  return {month:prefix,events,summary};
}

export function leaveOverview() {
  const balances=all(`SELECT w.id,w.name,w.employee_no,w.status,
    ROUND(COALESCE(SUM(CASE l.event_type WHEN '발생' THEN l.leave_days WHEN '사용' THEN -l.leave_days WHEN '조정' THEN l.leave_days WHEN '취소' THEN l.leave_days WHEN '만료' THEN -l.leave_days WHEN '퇴사정산' THEN -l.leave_days ELSE 0 END),0),2) balance,
    MAX(l.event_date) last_event_date
    FROM app_workers w LEFT JOIN app_leave_ledger l ON l.worker_id=w.id
    GROUP BY w.id ORDER BY CASE w.status WHEN '재직' THEN 0 ELSE 1 END,w.name`);
  const ledger=all(`SELECT l.*,w.name worker_name,w.employee_no FROM app_leave_ledger l JOIN app_workers w ON w.id=l.worker_id ORDER BY l.event_date DESC,l.id DESC LIMIT 300`);
  return {balances,ledger};
}

export function substituteOverview() {
  const people=all(`SELECT p.*,
    COUNT(h.id) total_count,
    MAX(h.work_date) recent_work_date,
    GROUP_CONCAT(DISTINCT s.name) site_names,
    GROUP_CONCAT(DISTINCT j.name) job_names
    FROM app_substitute_people p
    LEFT JOIN app_substitute_work_history h ON h.substitute_id=p.id
    LEFT JOIN app_sites s ON s.id=h.site_id LEFT JOIN app_jobs j ON j.id=h.job_id
    GROUP BY p.id ORDER BY total_count DESC,p.name`);
  const requests=all(`SELECT r.*,s.name site_name,j.name job_name,p.name substitute_name,p.phone substitute_phone
    FROM app_substitute_requests r JOIN app_sites s ON s.id=r.site_id JOIN app_jobs j ON j.id=r.job_id
    LEFT JOIN app_substitute_people p ON p.id=r.assigned_substitute_id
    ORDER BY CASE r.status WHEN '요청' THEN 0 WHEN '섭외중' THEN 1 WHEN '배정' THEN 2 WHEN '완료' THEN 3 ELSE 4 END,r.work_date,r.id DESC`);
  return {people,requests};
}

export function substituteCandidates(requestId: number) {
  const request=one(`SELECT r.*,s.name site_name,j.name job_name FROM app_substitute_requests r JOIN app_sites s ON s.id=r.site_id JOIN app_jobs j ON j.id=r.job_id WHERE r.id=?`,requestId);
  if (!request) return {request:null,candidates:[]};
  const candidates=all(`SELECT p.id,p.name,p.phone,p.experience_type,p.status,
    COUNT(h.id) total_count,
    SUM(CASE WHEN h.site_id=? THEN 1 ELSE 0 END) site_count,
    SUM(CASE WHEN h.job_id=? THEN 1 ELSE 0 END) job_count,
    MAX(h.work_date) recent_work_date,
    (SUM(CASE WHEN h.site_id=? THEN 3 ELSE 0 END)+SUM(CASE WHEN h.job_id=? THEN 2 ELSE 0 END)+COUNT(h.id)) score
    FROM app_substitute_people p LEFT JOIN app_substitute_work_history h ON h.substitute_id=p.id
    WHERE p.status='활동' GROUP BY p.id ORDER BY score DESC,recent_work_date DESC,p.name`,request.site_id,request.job_id,request.site_id,request.job_id);
  return {request,candidates};
}

export function phase2Options() {
  return {
    workers:all("SELECT id,name,employee_no,status FROM app_workers WHERE status IN ('재직','휴직') ORDER BY name"),
    sites:all("SELECT id,name FROM app_sites WHERE operation_status='운영' ORDER BY name"),
    jobs:all("SELECT id,name FROM app_jobs WHERE is_active=1 ORDER BY name"),
    assignments:all(`SELECT a.id,a.worker_id,a.site_id,a.job_id,w.name worker_name,s.name site_name,j.name job_name FROM app_assignments a JOIN app_workers w ON w.id=a.worker_id JOIN app_sites s ON s.id=a.site_id JOIN app_jobs j ON j.id=a.job_id WHERE a.status='활성' ORDER BY w.name`),
    substitutes:all("SELECT id,name,phone,status FROM app_substitute_people WHERE status='활동' ORDER BY name")
  };
}

export function phase2Summary() {
  return {
    attendanceEvents:Number(one("SELECT COUNT(*) count FROM app_attendance_events")?.count??0),
    leaveEntries:Number(one("SELECT COUNT(*) count FROM app_leave_ledger")?.count??0),
    substitutePeople:Number(one("SELECT COUNT(*) count FROM app_substitute_people WHERE status='활동'")?.count??0),
    openSubstituteRequests:Number(one("SELECT COUNT(*) count FROM app_substitute_requests WHERE status IN ('요청','섭외중')")?.count??0)
  };
}
