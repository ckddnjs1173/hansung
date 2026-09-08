PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Legacy/import tables are retained only for one-time migration and audit.
CREATE TABLE IF NOT EXISTS import_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  source_dir TEXT NOT NULL,
  file_count INTEGER NOT NULL DEFAULT 0,
  row_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running',
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS source_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  import_run_id INTEGER NOT NULL REFERENCES import_runs(id),
  relative_path TEXT NOT NULL,
  category TEXT NOT NULL,
  extension TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  modified_at TEXT NOT NULL,
  UNIQUE(import_run_id, relative_path)
);

CREATE TABLE IF NOT EXISTS source_rows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_file_id INTEGER NOT NULL REFERENCES source_files(id),
  sheet_name TEXT NOT NULL,
  row_number INTEGER NOT NULL,
  values_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_key TEXT NOT NULL UNIQUE,
  employee_no TEXT,
  name TEXT NOT NULL,
  birth_date TEXT,
  phone TEXT,
  status TEXT NOT NULL,
  occupation TEXT,
  joined_at TEXT,
  left_at TEXT,
  source_file_id INTEGER REFERENCES source_files(id)
);

CREATE TABLE IF NOT EXISTS sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  division TEXT,
  address TEXT,
  manager_name TEXT,
  source_file_id INTEGER REFERENCES source_files(id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER NOT NULL REFERENCES workers(id),
  site_id INTEGER REFERENCES sites(id),
  job_name TEXT,
  contract_first TEXT,
  contract_second TEXT,
  status TEXT NOT NULL,
  source_file_id INTEGER REFERENCES source_files(id),
  UNIQUE(worker_id, site_id, job_name, contract_first, contract_second)
);

CREATE TABLE IF NOT EXISTS substitute_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  experience_type TEXT,
  total_work_count REAL NOT NULL DEFAULT 0,
  service_count REAL NOT NULL DEFAULT 0,
  showroom_count REAL NOT NULL DEFAULT 0,
  work_history_text TEXT,
  recent_site TEXT,
  recent_work_date TEXT,
  note TEXT,
  source_file_id INTEGER REFERENCES source_files(id)
);

CREATE TABLE IF NOT EXISTS substitute_work_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  substitute_id INTEGER REFERENCES substitute_profiles(id),
  worker_key TEXT NOT NULL,
  work_date TEXT,
  work_type TEXT,
  site_name TEXT,
  department TEXT,
  hours REAL,
  source_file_id INTEGER REFERENCES source_files(id)
);

CREATE TABLE IF NOT EXISTS pay_rule_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_name TEXT NOT NULL,
  effective_year INTEGER NOT NULL,
  source_sheet TEXT NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'needs_review',
  source_file_id INTEGER REFERENCES source_files(id),
  UNIQUE(job_name, effective_year)
);

CREATE TABLE IF NOT EXISTS pay_rule_components (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pay_rule_version_id INTEGER NOT NULL REFERENCES pay_rule_versions(id),
  row_number INTEGER NOT NULL,
  label TEXT NOT NULL,
  amount REAL,
  rate REAL,
  formula_text TEXT,
  note TEXT,
  UNIQUE(pay_rule_version_id, row_number)
);

CREATE TABLE IF NOT EXISTS monthly_billing_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  billing_month TEXT NOT NULL,
  employee_no TEXT,
  worker_name TEXT,
  department TEXT,
  job_name TEXT,
  work_type TEXT,
  join_date TEXT,
  leave_date TEXT,
  standard_days REAL,
  worked_days REAL,
  standard_total REAL,
  payroll_total REAL,
  indirect_total REAL,
  welfare_cost REAL,
  management_fee REAL,
  profit REAL,
  supply_amount REAL,
  vat REAL,
  total_amount REAL,
  calculation_json TEXT NOT NULL,
  source_file_id INTEGER REFERENCES source_files(id)
);

CREATE TABLE IF NOT EXISTS leave_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_name TEXT,
  worker_status TEXT NOT NULL,
  source_sheet TEXT NOT NULL,
  row_number INTEGER NOT NULL,
  values_json TEXT NOT NULL,
  source_file_id INTEGER REFERENCES source_files(id)
);

-- Operational database: the application writes here after Excel retirement.
CREATE TABLE IF NOT EXISTS app_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  login_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('owner','operator')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  short_name TEXT,
  site_type TEXT NOT NULL DEFAULT '기타',
  address TEXT,
  manager_name TEXT,
  command_manager_name TEXT,
  operation_status TEXT NOT NULL DEFAULT '운영' CHECK(operation_status IN ('운영','중단','종료')),
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT,
  work_type TEXT NOT NULL DEFAULT '주중',
  standard_hours REAL,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_pay_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL REFERENCES app_jobs(id),
  site_id INTEGER REFERENCES app_sites(id),
  effective_from TEXT NOT NULL,
  effective_to TEXT,
  base_salary REAL NOT NULL DEFAULT 0,
  meal_allowance REAL NOT NULL DEFAULT 0,
  fixed_overtime_allowance REAL NOT NULL DEFAULT 0,
  fixed_night_allowance REAL NOT NULL DEFAULT 0,
  fixed_holiday_allowance REAL NOT NULL DEFAULT 0,
  other_allowance REAL NOT NULL DEFAULT 0,
  monthly_standard_hours REAL,
  note TEXT,
  status TEXT NOT NULL DEFAULT '적용' CHECK(status IN ('적용','종료','검토')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_workers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_no TEXT UNIQUE,
  name TEXT NOT NULL,
  birth_date TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  joined_at TEXT,
  left_at TEXT,
  status TEXT NOT NULL DEFAULT '재직' CHECK(status IN ('입사예정','재직','휴직','퇴사')),
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER NOT NULL REFERENCES app_workers(id),
  site_id INTEGER NOT NULL REFERENCES app_sites(id),
  job_id INTEGER NOT NULL REFERENCES app_jobs(id),
  work_type TEXT NOT NULL DEFAULT '주중',
  started_at TEXT NOT NULL,
  ended_at TEXT,
  status TEXT NOT NULL DEFAULT '활성' CHECK(status IN ('예정','활성','종료')),
  pay_rule_id INTEGER REFERENCES app_pay_rules(id),
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER NOT NULL REFERENCES app_workers(id),
  assignment_id INTEGER REFERENCES app_assignments(id),
  contract_type TEXT NOT NULL DEFAULT '최초' CHECK(contract_type IN ('최초','연장','변경','종료')),
  sequence_no INTEGER NOT NULL DEFAULT 1,
  started_at TEXT NOT NULL,
  ended_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT '유효' CHECK(status IN ('예정','유효','만료','종료')),
  previous_contract_id INTEGER REFERENCES app_contracts(id),
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_role TEXT NOT NULL DEFAULT 'owner',
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  summary TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workers_status ON workers(status);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_billing_month ON monthly_billing_items(billing_month);
CREATE INDEX IF NOT EXISTS idx_source_rows_file ON source_rows(source_file_id, sheet_name);
CREATE INDEX IF NOT EXISTS idx_app_workers_status ON app_workers(status);
CREATE INDEX IF NOT EXISTS idx_app_assignments_worker ON app_assignments(worker_id, status);
CREATE INDEX IF NOT EXISTS idx_app_assignments_site ON app_assignments(site_id, status);
CREATE INDEX IF NOT EXISTS idx_app_contracts_worker ON app_contracts(worker_id, status);
CREATE INDEX IF NOT EXISTS idx_app_pay_rules_job ON app_pay_rules(job_id, effective_from);
