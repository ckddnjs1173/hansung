PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

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

CREATE INDEX IF NOT EXISTS idx_workers_status ON workers(status);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_billing_month ON monthly_billing_items(billing_month);
CREATE INDEX IF NOT EXISTS idx_source_rows_file ON source_rows(source_file_id, sheet_name);
