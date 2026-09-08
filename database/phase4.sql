PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_billing_rule_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  effective_from TEXT NOT NULL,
  effective_to TEXT,
  pension_rate REAL NOT NULL DEFAULT 0,
  health_rate REAL NOT NULL DEFAULT 0,
  long_term_care_rate REAL NOT NULL DEFAULT 0,
  employment_rate REAL NOT NULL DEFAULT 0,
  industrial_accident_rate REAL NOT NULL DEFAULT 0,
  wage_claim_rate REAL NOT NULL DEFAULT 0,
  asbestos_relief_rate REAL NOT NULL DEFAULT 0,
  disability_rate REAL NOT NULL DEFAULT 0,
  local_business_tax_rate REAL NOT NULL DEFAULT 0,
  welfare_rate REAL NOT NULL DEFAULT 0,
  accident_reserve_rate REAL NOT NULL DEFAULT 0,
  management_fee_rate REAL NOT NULL DEFAULT 0,
  profit_rate REAL NOT NULL DEFAULT 0,
  vat_rate REAL NOT NULL DEFAULT 0.1,
  review_status TEXT NOT NULL DEFAULT '검토' CHECK(review_status IN ('검토','확정','종료')),
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_billing_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  billing_month TEXT NOT NULL UNIQUE,
  payroll_run_id INTEGER NOT NULL REFERENCES app_payroll_runs(id),
  billing_rule_id INTEGER NOT NULL REFERENCES app_billing_rule_versions(id),
  status TEXT NOT NULL DEFAULT '작성중' CHECK(status IN ('작성중','검토','승인','마감')),
  note TEXT,
  generated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TEXT,
  closed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_billing_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  billing_run_id INTEGER NOT NULL REFERENCES app_billing_runs(id),
  payroll_item_id INTEGER NOT NULL REFERENCES app_payroll_items(id),
  worker_id INTEGER NOT NULL REFERENCES app_workers(id),
  assignment_id INTEGER REFERENCES app_assignments(id),
  payroll_gross REAL NOT NULL DEFAULT 0,
  pension REAL NOT NULL DEFAULT 0,
  health REAL NOT NULL DEFAULT 0,
  long_term_care REAL NOT NULL DEFAULT 0,
  employment REAL NOT NULL DEFAULT 0,
  industrial_accident REAL NOT NULL DEFAULT 0,
  wage_claim REAL NOT NULL DEFAULT 0,
  asbestos_relief REAL NOT NULL DEFAULT 0,
  disability REAL NOT NULL DEFAULT 0,
  local_business_tax REAL NOT NULL DEFAULT 0,
  welfare REAL NOT NULL DEFAULT 0,
  accident_reserve REAL NOT NULL DEFAULT 0,
  management_fee REAL NOT NULL DEFAULT 0,
  profit REAL NOT NULL DEFAULT 0,
  one_time_cost REAL NOT NULL DEFAULT 0,
  manual_adjustment REAL NOT NULL DEFAULT 0,
  manual_reason TEXT,
  supply_amount REAL NOT NULL DEFAULT 0,
  vat REAL NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0,
  calculation_json TEXT NOT NULL DEFAULT '{}',
  review_status TEXT NOT NULL DEFAULT '정상' CHECK(review_status IN ('정상','확인필요')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(billing_run_id, payroll_item_id)
);

CREATE TABLE IF NOT EXISTS app_exit_settlements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER NOT NULL REFERENCES app_workers(id),
  assignment_id INTEGER REFERENCES app_assignments(id),
  payroll_item_id INTEGER REFERENCES app_payroll_items(id),
  planned_exit_date TEXT,
  last_work_date TEXT,
  exit_date TEXT NOT NULL,
  exit_reason TEXT,
  remaining_leave_days REAL NOT NULL DEFAULT 0,
  unused_leave_pay REAL NOT NULL DEFAULT 0,
  severance_pay REAL NOT NULL DEFAULT 0,
  other_payment REAL NOT NULL DEFAULT 0,
  other_deduction REAL NOT NULL DEFAULT 0,
  final_settlement_amount REAL NOT NULL DEFAULT 0,
  contract_closed INTEGER NOT NULL DEFAULT 0,
  property_returned INTEGER NOT NULL DEFAULT 0,
  handover_completed INTEGER NOT NULL DEFAULT 0,
  documents_completed INTEGER NOT NULL DEFAULT 0,
  privacy_delete_date TEXT,
  status TEXT NOT NULL DEFAULT '예정' CHECK(status IN ('예정','검토','완료')),
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(worker_id, exit_date)
);

CREATE INDEX IF NOT EXISTS idx_app_billing_rules_effective ON app_billing_rule_versions(effective_from, review_status);
CREATE INDEX IF NOT EXISTS idx_app_billing_runs_month ON app_billing_runs(billing_month);
CREATE INDEX IF NOT EXISTS idx_app_billing_items_run ON app_billing_items(billing_run_id, review_status);
CREATE INDEX IF NOT EXISTS idx_app_exit_worker ON app_exit_settlements(worker_id, status);
CREATE INDEX IF NOT EXISTS idx_app_exit_date ON app_exit_settlements(exit_date, status);
