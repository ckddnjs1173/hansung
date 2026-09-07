<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 한성자동차 관리프로그램 개발 규칙

## 기획 기준

- 개발 전 `docs/PRODUCT_SPEC.md`를 확인한다.
- 기존 Excel, Word, PDF 자료는 참고자료일 뿐 그대로 복제하지 않는다.
- 작업자, 현장, 계약, 근태, 대체근무, 청구 데이터를 중복 입력하지 않도록 설계한다.
- 관리자들이 별도 교육 없이 사용할 수 있는 단순한 화면을 우선한다.

## 개인정보 및 보안

- 실제 개인정보와 운영 원본은 Git에 저장하지 않는다.
- 이름, 전화번호, 주소, 계좌번호, 급여, 계약서, 서명, 비밀번호를 예제 데이터에 사용하지 않는다.
- 개발과 테스트에는 가상 데이터만 사용한다.
- 비밀값은 환경변수로 관리하며 `.env.example`에는 변수 이름만 기록한다.
- 원본 참고자료는 `reference/README.md`의 관리 원칙을 따른다.

## 개발 및 검증

- TypeScript를 사용한다.
- Next.js App Router 구조를 따른다.
- Next.js 관련 구현 전 `node_modules/next/dist/docs/`의 현재 버전 문서를 확인한다.
- 작업 완료 전 `npm run lint`와 `npm run build`를 실행한다.
- 사용자 요청과 관계없는 파일은 임의로 변경하지 않는다.
