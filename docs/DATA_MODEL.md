# 실제 데이터 모델

## 원칙

- Excel·Word·PDF·PowerPoint 원본은 읽기 전용이며 Git에 저장하지 않는다.
- 가져오기마다 원본 파일, 시트, 행 번호를 기록해 출처를 추적한다.
- 원본 행(`source_rows`)과 업무용 정규화 테이블을 함께 보존한다.
- 빈 값은 0으로 바꾸지 않고 검증 대상으로 남긴다.

## 핵심 연결

`근로자 → 배치(지점·직무·계약기간) → 근태·연차 → 급여규칙 → 월 청구`

- `workers`: 재직·퇴사 근로자 통합 마스터
- `sites`: 사용사업관리대장에서 확인한 지점
- `assignments`: 사람·지점·직무·1/2차 계약기간
- `substitute_profiles`, `substitute_work_history`: 대체인력과 근무 이력
- `pay_rule_versions`, `pay_rule_components`: 직무별 급여표와 구성 항목
- `monthly_billing_items`: 개인별 청구 계산 결과
- `leave_sources`: 연차대장 원본행과 검증 구역
- `source_files`, `source_rows`: 원본 출처와 재처리용 로컬 자료

이름·생년월일·전화번호와 급여 금액이 포함된 DB는 `data/local/`에 생성되며 Git에서 차단된다. 운영 배포 전에는 인증, 권한별 마스킹, 암호화와 감사 로그가 추가로 필요하다.
