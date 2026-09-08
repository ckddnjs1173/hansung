import "server-only";
import { withDatabase } from "@/lib/database";

type Row=Record<string,unknown>;
const n=(v:unknown)=>Number(v??0);
const all=(sql:string,...params:unknown[])=>withDatabase(db=>db.prepare(sql).all(...params) as Row[]);
const one=(sql:string,...params:unknown[])=>withDatabase(db=>db.prepare(sql).get(...params) as Row|undefined);

export function getWorkerHub(workerId:number){
  const current=one(`SELECT w.*,a.id assignment_id,a.started_at assignment_started,a.work_type,a.pay_rule_id,
    s.name site_name,j.name job_name,p.base_salary,p.meal_allowance,p.effective_from pay_rule_from,
    c.id contract_id,c.ended_at contract_ended,c.status contract_status,c.sequence_no contract_sequence
    FROM app_workers w
    LEFT JOIN app_assignments a ON a.worker_id=w.id AND a.status IN ('활성','예정')
    LEFT JOIN app_sites s ON s.id=a.site_id LEFT JOIN app_jobs j ON j.id=a.job_id
    LEFT JOIN app_pay_rules p ON p.id=a.pay_rule_id
    LEFT JOIN app_contracts c ON c.worker_id=w.id AND c.status IN ('유효','예정')
    WHERE w.id=? ORDER BY CASE a.status WHEN '활성' THEN 0 ELSE 1 END,a.started_at DESC,CASE c.status WHEN '유효' THEN 0 ELSE 1 END,c.ended_at DESC LIMIT 1`,workerId);
  if(!current) return null;
  const attendance=all(`SELECT e.*,s.name site_name FROM app_attendance_events e LEFT JOIN app_sites s ON s.id=e.site_id WHERE e.worker_id=? ORDER BY e.work_date DESC,e.id DESC LIMIT 60`,workerId);
  const leaveLedger=all(`SELECT * FROM app_leave_ledger WHERE worker_id=? ORDER BY event_date DESC,id DESC LIMIT 60`,workerId);
  const leaveBalance=leaveLedger.reduce((sum,row)=>{const days=n(row.leave_days);const type=String(row.event_type??"");return sum+(["발생","조정","취소"].includes(type)?days:-days);},0);
  const payroll=all(`SELECT i.*,r.payroll_month,r.status run_status FROM app_payroll_items i JOIN app_payroll_runs r ON r.id=i.payroll_run_id WHERE i.worker_id=? ORDER BY r.payroll_month DESC LIMIT 24`,workerId);
  const billing=all(`SELECT i.*,r.billing_month,r.status run_status FROM app_billing_items i JOIN app_billing_runs r ON r.id=i.billing_run_id WHERE i.worker_id=? ORDER BY r.billing_month DESC LIMIT 24`,workerId);
  const documents=all(`SELECT d.id,d.title,d.template_version,d.created_at,t.document_type,t.name template_name,u.display_name generated_by FROM app_generated_documents d JOIN app_document_templates t ON t.id=d.template_id LEFT JOIN app_users u ON u.id=d.generated_by_user_id WHERE d.worker_id=? ORDER BY d.id DESC LIMIT 40`,workerId);
  const exits=all(`SELECT * FROM app_exit_settlements WHERE worker_id=? ORDER BY exit_date DESC,id DESC LIMIT 10`,workerId);
  const onboarding=all(`SELECT o.*,u.display_name created_by FROM app_onboarding_runs o LEFT JOIN app_users u ON u.id=o.created_by_user_id WHERE o.worker_id=? ORDER BY o.id DESC LIMIT 10`,workerId);
  const audits=all(`SELECT * FROM app_audit_logs WHERE (entity_type='worker' AND entity_id=?) OR (entity_type='onboarding' AND summary LIKE ?) ORDER BY id DESC LIMIT 80`,workerId,`%${String(current.name??"")}%`);
  return {current,attendance,leaveLedger,leaveBalance,payroll,billing,documents,exits,onboarding,audits};
}
