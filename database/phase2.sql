PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_attendance_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER NOT NULL REFERENCES app_workers(id),
  assignment_id INTEGER REFERENCES app_assignments(id),
  site_id INTEGER REFERENCES app_sites(id),
  work_date TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('연장','야간','휴일','지각','조퇴','결근','무급','휴직','대체근무','기타')),
  minutes INTEGER NOT NULL DEFAULT 0,
  days REAL NOT NULL DEFAULT 0,
  started_at TEXT,
  ended_at TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_leave_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER NOT NULL REFERENCES app_workers(id),
  event_date TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('발생','사용','조정','취소','만료','퇴사정산')),
  leave_days REAL NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_substitute_people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  experience_type TEXT,
  status TEXT NOT NULL DEFAULT '활동' CHECK(status IN ('활동','보류','종료')),
  note TEXT,
  legacy_worker_key TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_substitute_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL REFERENCES app_sites(id),
  job_id INTEGER NOT NULL REFERENCES app_jobs(id),
  work_date TEXT NOT NULL,
  started_at TEXT,
  ended_at TEXT,
  hours REAL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT '요청' CHECK(status IN ('요청','섭외중','배정','완료','취소')),
  assigned_substitute_id INTEGER REFERENCES app_substitute_people(id),
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_substitute_work_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  substitute_id INTEGER NOT NULL REFERENCES app_substitute_people(id),
  request_id INTEGER REFERENCES app_substitute_requests(id),
  site_id INTEGER REFERENCES app_sites(id),
  job_id INTEGER REFERENCES app_jobs(id),
  work_date TEXT NOT NULL,
  hours REAL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(request_id, substitute_id)
);

CREATE INDEX IF NOT EXISTS idx_app_attendance_worker_date ON app_attendance_events(worker_id, work_date);
CREATE INDEX IF NOT EXISTS idx_app_attendance_site_date ON app_attendance_events(site_id, work_date);
CREATE INDEX IF NOT EXISTS idx_app_leave_worker_date ON app_leave_ledger(worker_id, event_date);
CREATE INDEX IF NOT EXISTS idx_app_substitute_requests_date ON app_substitute_requests(work_date, status);
CREATE INDEX IF NOT EXISTS idx_app_substitute_history_person ON app_substitute_work_history(substitute_id, work_date);
