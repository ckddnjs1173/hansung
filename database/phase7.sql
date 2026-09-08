PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_attendance_months (
  month TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT '작성중' CHECK(status IN ('작성중','확정')),
  confirmed_by_user_id INTEGER REFERENCES app_users(id),
  confirmed_at TEXT,
  reopened_by_user_id INTEGER REFERENCES app_users(id),
  reopened_at TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_attendance_month_reviews (
  month TEXT NOT NULL,
  worker_id INTEGER NOT NULL REFERENCES app_workers(id),
  reviewed INTEGER NOT NULL DEFAULT 0,
  reviewed_by_user_id INTEGER REFERENCES app_users(id),
  reviewed_at TEXT,
  note TEXT,
  PRIMARY KEY(month, worker_id)
);

CREATE TABLE IF NOT EXISTS app_onboarding_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER NOT NULL REFERENCES app_workers(id),
  assignment_id INTEGER NOT NULL REFERENCES app_assignments(id),
  contract_id INTEGER NOT NULL REFERENCES app_contracts(id),
  pay_rule_id INTEGER REFERENCES app_pay_rules(id),
  contract_document_checked INTEGER NOT NULL DEFAULT 0,
  privacy_document_checked INTEGER NOT NULL DEFAULT 0,
  dispatch_document_checked INTEGER NOT NULL DEFAULT 0,
  onboarding_document_checked INTEGER NOT NULL DEFAULT 0,
  created_by_user_id INTEGER REFERENCES app_users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attendance_month_reviews_month ON app_attendance_month_reviews(month, reviewed);
CREATE INDEX IF NOT EXISTS idx_onboarding_worker ON app_onboarding_runs(worker_id, created_at);
