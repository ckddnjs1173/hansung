import "server-only";
import { withDatabase } from "@/lib/database";

type Row = Record<string, unknown>;
const all = (sql: string, ...params: unknown[]) => withDatabase((db) => db.prepare(sql).all(...params) as Row[]);
const one = (sql: string, ...params: unknown[]) => withDatabase((db) => db.prepare(sql).get(...params) as Row | undefined);

export type WorkerFilters = { q?: string; site?: string; job?: string; status?: string };

export function listWorkers(filters: WorkerFilters = {}) {
  const clauses = ["1=1"];
  const params: unknown[] = [];
  if (filters.q) { clauses.push("(w.name LIKE ? OR COALESCE(w.employee_no,'') LIKE ? OR COALESCE(w.phone,'') LIKE ?)"); const q=`%${filters.q}%`; params.push(q,q,q); }
  if (filters.status) { clauses.push("w.status=?"); params.push(filters.status); }
  if (filters.site) { clauses.push("s.id=?"); params.push(Number(filters.site)); }
  if (filters.job) { clauses.push("j.id=?"); params.push(Number(filters.job)); }
  return all(`SELECT w.id,w.employee_no,w.name,w.phone,w.status,w.joined_at,w.left_at,
    s.id site_id,s.name site_name,j.id job_id,j.name job_name,a.started_at assignment_started,c.ended_at contract_ended
    FROM app_workers w
    LEFT JOIN app_assignments a ON a.worker_id=w.id AND a.status IN ('예정','활성')
    LEFT JOIN app_sites s ON s.id=a.site_id
    LEFT JOIN app_jobs j ON j.id=a.job_id
    LEFT JOIN app_contracts c ON c.worker_id=w.id AND c.status IN ('예정','유효')
    WHERE ${clauses.join(" AND ")}
    GROUP BY w.id ORDER BY CASE w.status WHEN '재직' THEN 0 WHEN '입사예정' THEN 1 WHEN '휴직' THEN 2 ELSE 3 END,w.name`, ...params);
}

export function getWorker(id: number) {
  const worker=one("SELECT * FROM app_workers WHERE id=?",id);
  if (!worker) return null;
  const assignments=all(`SELECT a.*,s.name site_name,j.name job_name,p.base_salary,p.meal_allowance,p.fixed_overtime_allowance
    FROM app_assignments a JOIN app_sites s ON s.id=a.site_id JOIN app_jobs j ON j.id=a.job_id
    LEFT JOIN app_pay_rules p ON p.id=a.pay_rule_id WHERE a.worker_id=? ORDER BY a.started_at DESC,a.id DESC`,id);
  const contracts=all(`SELECT c.*,s.name site_name,j.name job_name FROM app_contracts c
    LEFT JOIN app_assignments a ON a.id=c.assignment_id LEFT JOIN app_sites s ON s.id=a.site_id LEFT JOIN app_jobs j ON j.id=a.job_id
    WHERE c.worker_id=? ORDER BY c.started_at DESC,c.sequence_no DESC`,id);
  return {worker,assignments,contracts};
}

export function listSites() {
  return all(`SELECT s.*,COUNT(CASE WHEN a.status='활성' THEN 1 END) active_count,GROUP_CONCAT(DISTINCT j.name) job_names
    FROM app_sites s LEFT JOIN app_assignments a ON a.site_id=s.id LEFT JOIN app_jobs j ON j.id=a.job_id
    GROUP BY s.id ORDER BY CASE s.operation_status WHEN '운영' THEN 0 ELSE 1 END,s.name`);
}

export function listJobs() {
  return all(`SELECT j.*,COUNT(DISTINCT CASE WHEN a.status='활성' THEN a.worker_id END) active_count,
    COUNT(p.id) rule_count,MAX(p.effective_from) latest_rule_from
    FROM app_jobs j LEFT JOIN app_assignments a ON a.job_id=j.id LEFT JOIN app_pay_rules p ON p.job_id=j.id
    GROUP BY j.id ORDER BY j.is_active DESC,j.name`);
}

export function listPayRules(jobId?: number) {
  if (jobId) return all(`SELECT p.*,j.name job_name,s.name site_name FROM app_pay_rules p JOIN app_jobs j ON j.id=p.job_id LEFT JOIN app_sites s ON s.id=p.site_id WHERE p.job_id=? ORDER BY p.effective_from DESC`,jobId);
  return all(`SELECT p.*,j.name job_name,s.name site_name FROM app_pay_rules p JOIN app_jobs j ON j.id=p.job_id LEFT JOIN app_sites s ON s.id=p.site_id ORDER BY p.effective_from DESC,j.name`);
}

export function listAssignments() {
  return all(`SELECT a.*,w.name worker_name,w.employee_no,s.name site_name,j.name job_name,p.base_salary,
    c.id contract_id,c.contract_type,c.sequence_no,c.started_at contract_started,c.ended_at contract_ended,c.status contract_status
    FROM app_assignments a JOIN app_workers w ON w.id=a.worker_id JOIN app_sites s ON s.id=a.site_id JOIN app_jobs j ON j.id=a.job_id
    LEFT JOIN app_pay_rules p ON p.id=a.pay_rule_id
    LEFT JOIN app_contracts c ON c.assignment_id=a.id AND c.status IN ('예정','유효')
    ORDER BY CASE a.status WHEN '활성' THEN 0 WHEN '예정' THEN 1 ELSE 2 END,w.name`);
}

export function listContracts() {
  return all(`SELECT c.*,w.name worker_name,w.employee_no,s.name site_name,j.name job_name
    FROM app_contracts c JOIN app_workers w ON w.id=c.worker_id
    LEFT JOIN app_assignments a ON a.id=c.assignment_id LEFT JOIN app_sites s ON s.id=a.site_id LEFT JOIN app_jobs j ON j.id=a.job_id
    ORDER BY CASE c.status WHEN '유효' THEN 0 WHEN '예정' THEN 1 ELSE 2 END,c.ended_at,w.name`);
}

export function options() {
  return {workers:all("SELECT id,name,employee_no,status FROM app_workers WHERE status<>'퇴사' ORDER BY name"),sites:all("SELECT id,name FROM app_sites WHERE operation_status='운영' ORDER BY name"),jobs:all("SELECT id,name,work_type FROM app_jobs WHERE is_active=1 ORDER BY name"),payRules:all("SELECT p.id,p.job_id,p.site_id,p.effective_from,p.base_salary,j.name job_name FROM app_pay_rules p JOIN app_jobs j ON j.id=p.job_id WHERE p.status='적용' ORDER BY j.name,p.effective_from DESC")};
}

export function coreSummary() {
  return {
    workers:Number(one("SELECT COUNT(*) count FROM app_workers")?.count ?? 0),
    activeWorkers:Number(one("SELECT COUNT(*) count FROM app_workers WHERE status='재직'")?.count ?? 0),
    sites:Number(one("SELECT COUNT(*) count FROM app_sites WHERE operation_status='운영'")?.count ?? 0),
    jobs:Number(one("SELECT COUNT(*) count FROM app_jobs WHERE is_active=1")?.count ?? 0),
    assignments:Number(one("SELECT COUNT(*) count FROM app_assignments WHERE status='활성'")?.count ?? 0),
    contracts:Number(one("SELECT COUNT(*) count FROM app_contracts WHERE status='유효'")?.count ?? 0),
    expiring:Number(one("SELECT COUNT(*) count FROM app_contracts WHERE status='유효' AND date(ended_at) BETWEEN date('now') AND date('now','+30 day')")?.count ?? 0)
  };
}
