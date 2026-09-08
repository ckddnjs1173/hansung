PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_payroll_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payroll_month TEXT NOT NULL UNIQUE,
  standard_days REAL NOT NULL,
  status TEXT NOT NULL DEFAULT '작성중' CHECK(status IN ('작성중','검토','승인','마감')),
  note TEXT,
  generated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TEXT,
  closed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_payroll_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payroll_run_id INTEGER NOT NULL REFERENCES app_payroll_runs(id),
  worker_id INTEGER NOT NULL REFERENCES app_workers(id),
  assignment_id INTEGER REFERENCES app_assignments(id),
  pay_rule_id INTEGER REFERENCES app_pay_rules(id),
  standard_days REAL NOT NULL,
  worked_days REAL NOT NULL,
  absence_days REAL NOT NULL DEFAULT 0,
  base_salary REAL NOT NULL DEFAULT 0,
  meal_allowance REAL NOT NULL DEFAULT 0,
  fixed_overtime_allowance REAL NOT NULL DEFAULT 0,
  fixed_night_allowance REAL NOT NULL DEFAULT 0,
  fixed_holiday_allowance REAL NOT NULL DEFAULT 0,
  other_fixed_allowance REAL NOT NULL DEFAULT 0,
  ordinary_hourly REAL NOT NULL DEFAULT 0,
  overtime_hours REAL NOT NULL DEFAULT 0,
  holiday_hours REAL NOT NULL DEFAULT 0,
  night_hours REAL NOT NULL DEFAULT 0,
  base_current REAL NOT NULL DEFAULT 0,
  meal_current REAL NOT NULL DEFAULT 0,
  overtime_pay REAL NOT NULL DEFAULT 0,
  holiday_pay REAL NOT NULL DEFAULT 0,
  night_pay REAL NOT NULL DEFAULT 0,
  leave_pay REAL NOT NULL DEFAULT 0,
  incentive REAL NOT NULL DEFAULT 0,
  retroactive_pay REAL NOT NULL DEFAULT 0,
  other_pay REAL NOT NULL DEFAULT 0,
  other_deduction REAL NOT NULL DEFAULT 0,
  manual_adjustment REAL NOT NULL DEFAULT 0,
  manual_reason TEXT,
  gross_pay REAL NOT NULL DEFAULT 0,
  calculation_json TEXT NOT NULL DEFAULT '{}',
  review_status TEXT NOT NULL DEFAULT '정상' CHECK(review_status IN ('정상','확인필요')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(payroll_run_id, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_app_payroll_runs_month ON app_payroll_runs(payroll_month);
CREATE INDEX IF NOT EXISTS idx_app_payroll_items_run ON app_payroll_items(payroll_run_id, review_status);
CREATE INDEX IF NOT EXISTS idx_app_payroll_items_worker ON app_payroll_items(worker_id, payroll_run_id);
