# 한성자동차 관리프로그램

한성자동차 파견인력 운영을 **Excel 없이 프로그램 안에서 처리하기 위한 내부 웹 시스템**입니다.

## 제품 원칙
- 기존 Excel·Word·PDF는 과거 업무 분석과 최초 1회 데이터 이전을 위한 참고자료입니다.
- 실사용 전환 후 인력·지점·직무·배치·계약·근태·연차·대체근무·급여·청구·퇴사정산의 기준 원본은 프로그램 DB입니다.
- 매월 Excel을 업로드하거나 Excel을 먼저 수정한 뒤 프로그램에 반영하지 않습니다.
- Excel/CSV/PDF는 제출·보고용 **출력**으로만 사용합니다.

## 구현 범위
### Phase 1
인력·지점·직무·급여기준·배치·계약 CRUD와 검색/필터.

### Phase 2
근태 예외, 연차 원장, 대체근무 요청·추천·배정·완료.

### Phase 3
월 급여회차, 근태 연계, 일할/연장/휴일/야간 계산, 인센티브·조정, 검토·승인·마감.

### Phase 4
확정 버전형 청구기준, 고객사 청구, 회사부담비용·관리비·이윤·VAT, 퇴사정산.

### Phase 5
- 2인 로그인: `owner`(관리자), `operator`(운영 사용자)
- 비밀번호 scrypt 해시 저장, 서명 세션 쿠키
- 관리자 전용: 급여기준/청구기준 변경, 급여·청구 승인/마감/마감 해제, 사용자 권한관리
- 주요 등록·수정·상태변경 감사로그
- 근로계약서/입사안내 템플릿 기반 문서 생성 및 인쇄/PDF 저장
- 인력·근태·연차·급여·청구·지점 현황 CSV/XLSX 출력
- SQLite 안전 백업 명령

## 최초 실행
```powershell
npm install
npm run auth:bootstrap
npm run dev
```

`auth:bootstrap`은 다음을 수행합니다.
1. 관리자/운영자 계정 생성 또는 비밀번호 재설정
2. 비밀번호를 평문이 아닌 scrypt 해시로 저장
3. `.env.local`에 `AUTH_SECRET`이 없으면 안전한 임의값 생성
4. 자동 생성된 임시 비밀번호를 콘솔에 **한 번만** 표시

기본 로그인 ID는 `owner`, `operator`입니다. 비밀번호를 직접 정하고 싶으면 실행 전에 환경변수 `OWNER_PASSWORD`, `OPERATOR_PASSWORD`를 지정할 수 있습니다.

## 기존 실제 데이터의 최초 1회 전환
기존 로컬 DB가 이미 있다면 Excel을 다시 읽지 않습니다.
```powershell
npm run migration:operational
npm run migration:phase2
```
이미 이전을 완료했다면 다시 실행할 필요가 없습니다.

## 운영 명령
```powershell
npm run dev
npm run db:backup
npm run test:payroll
npm run lint
npm run build
```

`db:backup`은 `data/backups/` 아래에 시점별 SQLite 사본을 생성합니다. 개인정보·급여정보가 포함될 수 있으므로 DB/백업 파일은 Git에 포함하지 않습니다.

## 권한
### owner
전체 조회/입력, 급여·청구 승인/마감, 마감 해제, 급여/청구 기준 관리, 사용자 관리.

### operator
인력·지점·직무·배치·계약·근태·연차·대체근무·급여/청구 입력 및 검토, 문서 생성/보고서 출력. 최종 승인·마감 및 계산기준 변경은 불가합니다.

## 출력
보고서 메뉴에서 CSV와 Excel(.xlsx)을 내려받습니다. 생성 문서는 문서 화면에서 인쇄하거나 브라우저의 `PDF로 저장`을 사용합니다. Excel은 **입력 수단이 아니라 출력 형식**입니다.

## 배포 전 주의
현재 개발 DB는 로컬 파일 기반 SQLite입니다. 단일 PC/단일 지속 디스크 환경에서는 그대로 사용할 수 있지만, 영구 로컬 디스크가 보장되지 않는 배포 환경으로 옮길 때는 `src/lib/database.ts`의 저장소 계층을 지속형 DB로 교체해야 합니다. 실제 배포 환경과 DB는 운영 전환 단계에서 확정합니다.

## 레거시 분석 명령
아래 명령은 일상 운영에서 사용하지 않습니다.
```powershell
npm run data:import -- --source="<과거 원본 폴더>"
npm run data:validate
npm run data:summary
```

## 주요 문서
- `docs/PRODUCT_SPEC.md`: 전체 제품 기획
- `docs/CALCULATION_RULES.md`: 급여·청구 계산 분석
- `reference/README.md`: 개인정보·원본 자료 관리 원칙
- `AGENTS.md`: 개발 규칙
