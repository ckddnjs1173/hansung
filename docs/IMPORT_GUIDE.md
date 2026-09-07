# 실제 자료 가져오기

PowerShell에서 저장소 폴더로 이동한 후 실행한다.

```powershell
npm install
npm run data:import -- --source="C:\Users\hansuk\Desktop\한성자동차\한성자동차 관리프로그램\doc"
npm run data:summary
npm run dev
```

가져오기가 끝나면 `data/local/hansung.sqlite`가 생성된다. 개인정보를 포함하므로 Git에 올리지 않는다. 원본이 변경되면 같은 명령을 다시 실행한다. 기존 로컬 결과를 교체하고 원본 전체를 다시 읽으며 원본 파일 자체는 수정하지 않는다.

`.env.local`의 `HANSUNG_SOURCE_DIR`에 원본 폴더를 지정하면 `--source`를 생략할 수 있다. DB는 프로젝트의 `data/local/hansung.sqlite`에 생성된다.
