# 한성자동차 관리프로그램

한성자동차의 작업자, 지점, 계약, 근태, 대체근무, 급여·청구 및 문서 업무를 통합 관리하는 웹 프로그램입니다.

## 현재 구현

- 실제 원본 48개 파일의 목록·출처 인덱싱
- Excel 원시 행을 로컬 SQLite에 보존
- 재직·퇴사 근로자와 지점·직무·계약기간 통합
- 대체인력 프로필과 근무 이력 통합
- 24개 직무별 2026년 급여 규칙 구조화
- 2026년 9월 개인별 급여·청구 결과 연결
- 연차대장 원본행 보존과 정규화 검증 화면
- 실제 로컬 DB 기반 대시보드와 업무 목록

상세 기획은 `docs/PRODUCT_SPEC.md`를 확인하세요.

## 기술 구성

- Next.js 16, React 19, TypeScript, Tailwind CSS
- Node.js 내장 SQLite
- ExcelJS 기반 원본 가져오기

## 실제 자료 가져오기 및 실행

```powershell
npm install
npm run data:import -- --source="C:\Users\hansuk\Desktop\한성자동차\한성자동차 관리프로그램\doc"
npm run data:summary
npm run dev
```

접속 주소는 `http://localhost:3000`입니다. 생성되는 `data/local/hansung.sqlite`에는 개인정보와 급여 자료가 들어 있으므로 Git에서 자동 제외됩니다. 원본도 Git에 올리지 않습니다.

## 검증

```powershell
npm run test:payroll
npm run lint
npm run build
```

## 주요 문서

- `docs/PRODUCT_SPEC.md`: 전체 제품 기획안
- `docs/DATA_MODEL.md`: 실제 자료 기반 데이터 구조
- `docs/CALCULATION_RULES.md`: 급여·청구 계산 구조와 확인 항목
- `docs/IMPORT_GUIDE.md`: 로컬 원본 가져오기 방법
- `reference/README.md`: 참고자료와 개인정보 관리 원칙
- `AGENTS.md`: 개발 규칙
