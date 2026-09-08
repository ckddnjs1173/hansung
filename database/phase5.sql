PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_user_credentials (
  user_id INTEGER PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_document_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  body_html TEXT NOT NULL,
  version_no INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_generated_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id INTEGER NOT NULL REFERENCES app_document_templates(id),
  worker_id INTEGER NOT NULL REFERENCES app_workers(id),
  title TEXT NOT NULL,
  rendered_html TEXT NOT NULL,
  template_version INTEGER NOT NULL,
  generated_by_user_id INTEGER REFERENCES app_users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_app_generated_docs_worker ON app_generated_documents(worker_id, created_at);
CREATE INDEX IF NOT EXISTS idx_app_audit_created ON app_audit_logs(created_at);

INSERT OR IGNORE INTO app_document_templates(template_key,name,document_type,body_html,version_no)
VALUES
('employment-contract','근로계약서','근로계약서','<h1>근로계약서</h1><p>성명: {{worker_name}}</p><p>사번: {{employee_no}}</p><p>입사일: {{joined_at}}</p><p>근무지: {{site_name}}</p><p>직무: {{job_name}}</p><p>계약기간: {{contract_period}}</p><p>본 문서는 프로그램 등록정보를 기준으로 생성된 초안입니다. 최종 서명 전 계약조건을 반드시 확인하십시오.</p>',1),
('onboarding-guide','입사안내','입사안내','<h1>입사 안내</h1><p>{{worker_name}} 님의 입사를 안내드립니다.</p><p>근무지: {{site_name}}</p><p>직무: {{job_name}}</p><p>입사일: {{joined_at}}</p><p>세부 준비사항은 운영 담당자가 최종 확인해 주세요.</p>',1);
