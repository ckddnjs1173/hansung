# 한성자동차 관리프로그램

한성자동차 파견인력 운영을 **Excel 없이 프로그램 안에서 처리하기 위한 내부 웹 시스템**입니다.

## 제품 원칙

- 기존 Excel·Word·PDF는 과거 업무 분석과 최초 1회 데이터 이전을 위한 참고자료입니다.
- 실사용 전환 후 인력, 지점, 직무, 배치, 계약, 근태, 연차, 급여, 청구의 기준 원본은 프로그램 DB입니다.
- 매월 Excel을 업로드하거나 Excel을 먼저 수정한 뒤 프로그램에 반영하는 운영 방식은 사용하지 않습니다.
- Excel/PDF는 필요할 때 제출·보고용으로 **내보내기**만 지원하는 방향으로 개발합니다.

## 현재 개발 단계

### Phase 1 — 핵심 운영 기반

현재 브랜치에서는 다음 업무를 프로그램에서 직접 처리할 수 있도록 전환합니다.

- 인력 신규 등록·수정·상태 관리
- 지점 마스터 등록
- 직무 마스터 등록
- 적용기간이 있는 급여기준 등록
- 인력의 지점·직무 배치
- 최초·연장·변경 계약 이력 관리
- 인력 상세에서 기본정보·배치·계약·적용 급여기준 확인
- 이름·사번·연락처·지점·직무·재직상태 필터
- 관리자/운영자 2인 권한을 위한 데이터 구조
- 중요 등록·변경 감사로그 구조

이후 단계:

1. Phase 2: 근태·연차·대체근무
2. Phase 3: 월 급여 계산·검토·마감
3. Phase 4: 한성자동차 청구·퇴사정산
4. Phase 5: 로그인·권한·문서·내보내기·무료 배포

## 기술 구성

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- 개발/로컬 검증: Node.js SQLite
- 최종 무료 배포 DB는 배포 단계에서 Cloudflare 환경에 맞춰 확정

## 실행

```powershell
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

프로그램은 `data/local/hansung.sqlite`를 자동 생성하고 운영 스키마를 적용합니다. 해당 DB에는 개인정보·급여정보가 포함될 수 있으므로 Git에서 제외됩니다.

## 기존 자료 이전 도구

아래 명령은 **매월 사용하는 운영 기능이 아닙니다.** 기존 Excel 데이터를 새 프로그램으로 최초 1회 옮기거나 계산결과를 비교할 때만 사용하는 레거시 이전 도구입니다.

```powershell
npm run data:import -- --source="C:\Users\hansuk\Desktop\한성자동차\한성자동차 관리프로그램\doc"
npm run data:validate
npm run data:summary
```

최종 데이터 이전이 끝나면 일상 업무에서는 이 명령을 사용하지 않습니다.

## 검증

```powershell
npm run test:payroll
npm run lint
npm run build
```

## 주요 문서

- `docs/PRODUCT_SPEC.md`: 전체 제품 기획
- `docs/DATA_MODEL.md`: 기존 자료 분석 기반 데이터 구조
- `docs/CALCULATION_RULES.md`: 급여·청구 계산 분석
- `docs/IMPORT_GUIDE.md`: 최초 1회 데이터 이전 참고
- `reference/README.md`: 개인정보·원본 자료 관리 원칙
- `AGENTS.md`: 개발 규칙
