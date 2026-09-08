import "server-only";
import { withDatabase } from "@/lib/database";

type Row = Record<string, unknown>;
const all = (sql: string, ...params: unknown[]) => withDatabase((db) => db.prepare(sql).all(...params) as Row[]);
const one = (sql: string, ...params: unknown[]) => withDatabase((db) => db.prepare(sql).get(...params) as Row | undefined);

const n = (value: unknown) => Number(value ?? 0);
export const won = (value: unknown) => `${Math.round(n(value)).toLocaleString("ko-KR")}원`;
export const roundUp10 = (value: number) => Math.ceil(value / 10) * 10;

export type PayrollCalculationInput = {
  standardDays: number;
  workedDays: number;
  baseSalary: number;
  mealAllowance: number;
  fixedOvertimeAllowance: number;
  fixedNightAllowance: number;
  fixedHolidayAllowance: number;
  otherFixedAllowance: number;
  overtimeHours: number;
  holidayHours: number;
  nightHours: number;
  leavePay: number;
  incentive: number;
  retroactivePay: number;
  otherPay: number;
  otherDeduction: number;
  manualAdjustment: number;
};

export function calculatePayroll(input: PayrollCalculationInput) {
  const ratio = input.standardDays > 0 ? Math.max(0, input.workedDays) / input.standardDays : 0;
  const ordinaryHourly = roundUp10((input.baseSalary + input.mealAllowance) / 209);
  const baseCurrent = Math.round(input.baseSalary * ratio);
  const mealCurrent = Math.round(input.mealAllowance * ratio);
  const overtimePay = Math.round(ordinaryHourly * 1.5 * input.overtimeHours);
  const holidayPay = Math.round(ordinaryHourly * 1.5 * input.holidayHours);
  const nightPay = Math.round(ordinaryHourly * 0.5 * input.nightHours);
  const grossPay = Math.round(
    baseCurrent + mealCurrent + input.fixedOvertimeAllowance + input.fixedNightAllowance +
    input.fixedHolidayAllowance + input.otherFixedAllowance + overtimePay + holidayPay + nightPay +
    input.leavePay + input.incentive + input.retroactivePay + input.otherPay - input.otherDeduction + input.manualAdjustment
  );
  return { ordinaryHourly, baseCurrent, mealCurrent, overtimePay, holidayPay, nightPay, grossPay };
}

function monthRange(month: string) {
  const first = `${month}-01`;
  const [year, m] = month.split("-").map(Number);
  const last = new Date(year, m, 0).toISOString().slice(0, 10);
  return { first, last };
}

export function listPayrollRuns() {
  return all(`SELECT r.*,COUNT(i.id) item_count,
    SUM(CASE WHEN i.review_status='확인필요' THEN 1 ELSE 0 END) review_count,
    COALESCE(SUM(i.gross_pay),0) gross_total
    FROM app_payroll_runs r LEFT JOIN app_payroll_items i ON i.payroll_run_id=r.id
    GROUP BY r.id ORDER BY r.payroll_month DESC`);
}

export function getPayrollRun(id: number) {
  const run = one("SELECT * FROM app_payroll_runs WHERE id=?", id);
  if (!run) return null;
  const items = all(`SELECT i.*,w.name worker_name,w.employee_no,s.name site_name,j.name job_name,
    w.joined_at,w.left_at
    FROM app_payroll_items i JOIN app_workers w ON w.id=i.worker_id
    LEFT JOIN app_assignments a ON a.id=i.assignment_id
    LEFT JOIN app_sites s ON s.id=a.site_id LEFT JOIN app_jobs j ON j.id=a.job_id
    WHERE i.payroll_run_id=? ORDER BY s.name,w.name`, id);
  return { run, items };
}

export function generatePayrollRun(payrollMonth: string, standardDays: number, note?: string) {
  if (!/^\d{4}-\d{2}$/.test(payrollMonth)) throw new Error("급여월 형식이 올바르지 않습니다.");
  if (!(standardDays > 0)) throw new Error("월 기준일수는 0보다 커야 합니다.");
  const { first, last } = monthRange(payrollMonth);
  return withDatabase((db) => {
    const exists = db.prepare("SELECT id FROM app_payroll_runs WHERE payroll_month=?").get(payrollMonth) as Row | undefined;
    if (exists) return Number(exists.id);
    const runResult = db.prepare("INSERT INTO app_payroll_runs(payroll_month,standard_days,note) VALUES(?,?,?)").run(payrollMonth, standardDays, note || null);
    const runId = Number(runResult.lastInsertRowid);
    const assignments = db.prepare(`SELECT a.*,w.joined_at,w.left_at,w.status,j.id job_id
      FROM app_assignments a JOIN app_workers w ON w.id=a.worker_id JOIN app_jobs j ON j.id=a.job_id
      WHERE date(a.started_at)<=date(?) AND (a.ended_at IS NULL OR date(a.ended_at)>=date(?))
      ORDER BY a.worker_id,date(a.started_at) DESC,a.id DESC`).all(last, first) as Row[];
    const selected = new Map<number, Row>();
    for (const row of assignments) if (!selected.has(Number(row.worker_id))) selected.set(Number(row.worker_id), row);
    const insert = db.prepare(`INSERT INTO app_payroll_items(
      payroll_run_id,worker_id,assignment_id,pay_rule_id,standard_days,worked_days,absence_days,
      base_salary,meal_allowance,fixed_overtime_allowance,fixed_night_allowance,fixed_holiday_allowance,other_fixed_allowance,
      ordinary_hourly,overtime_hours,holiday_hours,night_hours,base_current,meal_current,overtime_pay,holiday_pay,night_pay,
      gross_pay,calculation_json,review_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    for (const row of selected.values()) {
      let rule: Row | undefined;
      if (row.pay_rule_id) rule = db.prepare("SELECT * FROM app_pay_rules WHERE id=?").get(row.pay_rule_id) as Row | undefined;
      if (!rule) rule = db.prepare(`SELECT * FROM app_pay_rules WHERE job_id=? AND status='적용'
        AND date(effective_from)<=date(?) AND (effective_to IS NULL OR date(effective_to)>=date(?))
        AND (site_id=? OR site_id IS NULL)
        ORDER BY CASE WHEN site_id=? THEN 0 ELSE 1 END,date(effective_from) DESC LIMIT 1`).get(row.job_id,last,first,row.site_id,row.site_id) as Row | undefined;
      const events = db.prepare(`SELECT event_type,COALESCE(SUM(minutes),0) minutes,COALESCE(SUM(days),0) days
        FROM app_attendance_events WHERE worker_id=? AND date(work_date) BETWEEN date(?) AND date(?) GROUP BY event_type`).all(row.worker_id,first,last) as Row[];
      const event = (type: string) => events.find(e => String(e.event_type) === type);
      const absenceDays = n(event("결근")?.days) + n(event("무급")?.days) + n(event("휴직")?.days);
      const workedDays = Math.max(0, standardDays - absenceDays);
      const overtimeHours = n(event("연장")?.minutes) / 60;
      const holidayHours = n(event("휴일")?.minutes) / 60;
      const nightHours = n(event("야간")?.minutes) / 60;
      const input: PayrollCalculationInput = {
        standardDays, workedDays, baseSalary:n(rule?.base_salary), mealAllowance:n(rule?.meal_allowance),
        fixedOvertimeAllowance:n(rule?.fixed_overtime_allowance), fixedNightAllowance:n(rule?.fixed_night_allowance),
        fixedHolidayAllowance:n(rule?.fixed_holiday_allowance), otherFixedAllowance:n(rule?.other_allowance),
        overtimeHours, holidayHours, nightHours, leavePay:0, incentive:0, retroactivePay:0, otherPay:0, otherDeduction:0, manualAdjustment:0
      };
      const calc = calculatePayroll(input);
      const joinedInMonth = row.joined_at && String(row.joined_at) >= first && String(row.joined_at) <= last;
      const leftInMonth = row.left_at && String(row.left_at) >= first && String(row.left_at) <= last;
      const reviewStatus = !rule || joinedInMonth || leftInMonth ? "확인필요" : "정상";
      insert.run(runId,row.worker_id,row.id,rule?.id??null,standardDays,workedDays,absenceDays,
        input.baseSalary,input.mealAllowance,input.fixedOvertimeAllowance,input.fixedNightAllowance,input.fixedHolidayAllowance,input.otherFixedAllowance,
        calc.ordinaryHourly,overtimeHours,holidayHours,nightHours,calc.baseCurrent,calc.mealCurrent,calc.overtimePay,calc.holidayPay,calc.nightPay,
        calc.grossPay,JSON.stringify({source:"operational",month:payrollMonth,attendance:{absenceDays,overtimeHours,holidayHours,nightHours}}),reviewStatus);
    }
    db.prepare("INSERT INTO app_audit_logs(action,entity_type,entity_id,summary) VALUES('create','payroll_run',?,?)").run(runId,`${payrollMonth} 급여회차 생성`);
    return runId;
  });
}

export function updatePayrollItem(id: number, values: Partial<PayrollCalculationInput> & { workedDays: number; manualReason?: string }) {
  return withDatabase((db) => {
    const current = db.prepare("SELECT * FROM app_payroll_items WHERE id=?").get(id) as Row | undefined;
    if (!current) throw new Error("급여 항목을 찾을 수 없습니다.");
    const run = db.prepare("SELECT status FROM app_payroll_runs WHERE id=?").get(current.payroll_run_id) as Row | undefined;
    if (run?.status === "마감") throw new Error("마감된 급여는 수정할 수 없습니다.");
    const input: PayrollCalculationInput = {
      standardDays:n(current.standard_days), workedDays:n(values.workedDays), baseSalary:n(current.base_salary), mealAllowance:n(current.meal_allowance),
      fixedOvertimeAllowance:n(current.fixed_overtime_allowance), fixedNightAllowance:n(current.fixed_night_allowance),
      fixedHolidayAllowance:n(current.fixed_holiday_allowance), otherFixedAllowance:n(current.other_fixed_allowance),
      overtimeHours:n(values.overtimeHours ?? current.overtime_hours), holidayHours:n(values.holidayHours ?? current.holiday_hours), nightHours:n(values.nightHours ?? current.night_hours),
      leavePay:n(values.leavePay ?? current.leave_pay), incentive:n(values.incentive ?? current.incentive), retroactivePay:n(values.retroactivePay ?? current.retroactive_pay),
      otherPay:n(values.otherPay ?? current.other_pay), otherDeduction:n(values.otherDeduction ?? current.other_deduction), manualAdjustment:n(values.manualAdjustment ?? current.manual_adjustment)
    };
    const calc = calculatePayroll(input);
    const needsReason = input.manualAdjustment !== 0 && !values.manualReason?.trim();
    const reviewStatus = !current.pay_rule_id || needsReason ? "확인필요" : "정상";
    db.prepare(`UPDATE app_payroll_items SET worked_days=?,ordinary_hourly=?,overtime_hours=?,holiday_hours=?,night_hours=?,
      base_current=?,meal_current=?,overtime_pay=?,holiday_pay=?,night_pay=?,leave_pay=?,incentive=?,retroactive_pay=?,other_pay=?,other_deduction=?,
      manual_adjustment=?,manual_reason=?,gross_pay=?,calculation_json=?,review_status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(
      input.workedDays,calc.ordinaryHourly,input.overtimeHours,input.holidayHours,input.nightHours,calc.baseCurrent,calc.mealCurrent,calc.overtimePay,calc.holidayPay,calc.nightPay,
      input.leavePay,input.incentive,input.retroactivePay,input.otherPay,input.otherDeduction,input.manualAdjustment,values.manualReason?.trim()||null,calc.grossPay,
      JSON.stringify({source:"operational",manual:true,input}),reviewStatus,id);
    db.prepare("INSERT INTO app_audit_logs(action,entity_type,entity_id,summary) VALUES('update','payroll_item',?,'급여 항목 수정')").run(id);
    return Number(current.payroll_run_id);
  });
}

export function changePayrollRunStatus(id: number, next: "작성중"|"검토"|"승인"|"마감") {
  return withDatabase((db) => {
    const run = db.prepare("SELECT * FROM app_payroll_runs WHERE id=?").get(id) as Row | undefined;
    if (!run) throw new Error("급여회차를 찾을 수 없습니다.");
    if (run.status === "마감" && next !== "마감") throw new Error("마감 해제는 관리자 기능으로 Phase 5에서 연결합니다.");
    if ((next === "승인" || next === "마감")) {
      const pending = db.prepare("SELECT COUNT(*) count FROM app_payroll_items WHERE payroll_run_id=? AND review_status='확인필요'").get(id) as Row;
      if (n(pending.count) > 0) throw new Error("확인필요 급여가 남아 있어 승인 또는 마감할 수 없습니다.");
    }
    db.prepare(`UPDATE app_payroll_runs SET status=?,approved_at=CASE WHEN ?='승인' THEN CURRENT_TIMESTAMP ELSE approved_at END,
      closed_at=CASE WHEN ?='마감' THEN CURRENT_TIMESTAMP ELSE closed_at END,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(next,next,next,id);
    db.prepare("INSERT INTO app_audit_logs(action,entity_type,entity_id,summary) VALUES('status','payroll_run',?,?)").run(id,`급여 상태 ${next}`);
  });
}
