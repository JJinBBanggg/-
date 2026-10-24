# 🛡️ 초등 6학년 디지털 시민성 퀴즈 & 구글 스프레드시트(GAS) 연동 가이드

본 퀴즈 웹사이트는 **초등학교 6학년 학생들의 개인정보(이름, 번호, 생년월일 등)를 절대 수집하지 않으며**, 학생들의 수업 이해도 파악을 위해 **[제출 시각, 총점, 각 문항별 정오답(O/X)]**만 완전 익명으로 안전하게 전송합니다.

---

## 📁 1. 파일 구성 안내

현재 폴더에 아래의 파일들이 준비되어 있습니다:

| 파일명 | 설명 | 비고 |
| :--- | :--- | :--- |
| **`index.html`** | 퀴즈 메인 사용자 인터페이스 (Tailwind CSS, 애니메이션, 반응형 레이아웃) | 3개 파일 모듈형 |
| **`questions.js`** | 초등 6학년 디지털 시민성 10개 문항 데이터 및 친절한 해설 | 3개 파일 모듈형 |
| **`submit.js`** | 구글 앱스 스크립트(GAS) 익명 데이터 전송 로직 | 3개 파일 모듈형 |
| **`single_index.html`** | 위 3개 파일을 단 하나의 완성된 HTML 파일로 합친 올인원(Single File) 버전 | 단일 파일 필요 시 사용 |

> **팁**: 로컬 또는 웹 서버에서 실행할 때 `index.html`을 더블 클릭하여 바로 브라우저에서 열 수 있습니다. (하나의 파일로만 관리하고 싶다면 `single_index.html`을 복사하여 사용하셔도 됩니다.)

---

## 📊 2. 구글 스프레드시트(GAS) 연동 4단계

교사용 구글 스프레드시트와 실시간으로 결과를 연동하는 방법입니다. (약 3분 소요)

### Step 1. 구글 스프레드시트 생성
1. [Google 스프레드시트](https://sheets.google.com)에 접속하여 새 스프레드시트를 만듭니다.
2. 스프레드시트 제목을 지정합니다. (예: `2026학년도 6학년 디지털 시민성 퀴즈 결과`)

### Step 2. Apps Script 열기
1. 상단 메뉴에서 **[확장 프로그램]** > **[Apps Script]**를 클릭합니다.
2. 기본으로 적혀있는 코드를 모두 지우고, 아래 코드를 그대로 붙여넣습니다:

```javascript
function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 시트가 비어있는 경우 첫 행에 헤더(제목) 자동 추가
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "제출 시각", "총점", "만점", "정답률", "전체 요약",
        "Q1(디지털발자국)", "Q2(사이버폭력)", "Q3(팩트체크)", "Q4(저작권)", "Q5(AI윤리)",
        "Q6(스미싱)", "Q7(계정보안)", "Q8(디지털웰빙)", "Q9(온라인안전)", "Q10(선플)"
      ]);
    }
    
    // 학생의 익명 퀴즈 데이터 기록 (개인정보 절대 미포함)
    sheet.appendRow([
      data.submittedAt,
      data.totalScore,
      data.maxScore,
      data.scoreRate,
      data.summary,
      data.q1, data.q2, data.q3, data.q4, data.q5,
      data.q6, data.q7, data.q8, data.q9, data.q10
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. 상단의 💾 저장 버튼을 누릅니다.

### Step 3. 웹 앱으로 배포하기 (★중요)
1. 우측 상단의 파란색 **[배포]** > **[새 배포]**를 클릭합니다.
2. 왼쪽 톱니바퀴 아이콘 옆 **유형 선택**에서 **[웹 앱]**을 선택합니다.
3. 설정을 다음과 같이 지정합니다:
   - **설명**: `디지털 시민성 퀴즈 v1`
   - **다음 사용자로 실행**: `나(내 계정)`
   - **액세스 권한이 있는 사용자**: `모든 사용자(Anyone)`  *(학생들이 로그인 없이 제출할 수 있도록 필수)*
4. **[배포]** 버튼을 누릅니다. (처음 배포 시 구글 계정 액세스 승인 팝업이 뜨면 '고급' > '... 이동'을 눌러 승인합니다.)
5. 배포 완료 창에 표시되는 **웹 앱 URL**(`https://script.google.com/macros/s/.../exec`)을 복사합니다.

### Step 4. 퀴즈 웹사이트에 URL 등록하기
다음 중 **한 가지 방법**을 선택하여 등록하면 끝납니다!

- **방법 A (웹 화면에서 등록 - 가장 간편)**:
  1. `index.html`을 브라우저로 엽니다.
  2. 우측 상단의 **[⚙️ 선생님 설정]** 버튼을 누릅니다.
  3. 복사한 Web App URL을 붙여넣고 **[설정 저장하기]**를 누릅니다.
  *(브라우저의 로컬 스토리지에 자동 저장됩니다)*

- **방법 B (`submit.js` 파일에 고정 등록)**:
  `submit.js` 상단의 `DEFAULT_GAS_URL` 따옴표 안에 URL을 직접 넣어두면 다른 컴퓨터에서도 바로 연동됩니다:
  ```javascript
  const DEFAULT_GAS_URL = "https://script.google.com/macros/s/AKfycb.../exec";
  ```

---

## 🎯 3. 퀴즈 10문항 영역 안내

1. **디지털 발자국**: 한 번 올린 글/사진의 영구성 및 게시 전 신중함
2. **사이버 폭력 예방**: 카톡 감옥, 방폭 등 언어/정신적 학교폭력의 심각성
3. **미디어 리터러시 & 팩트체크**: 허위정보(가짜뉴스) 식별 및 공신력 있는 출처 확인
4. **저작권 존중**: 타인의 저작물(그림/글) 출처 표기 및 정당한 이용 규칙
5. **생성형 AI 윤리**: 숙제 베끼기(표절) 금지 및 AI 비판적 사고, 개인정보 입력 주의
6. **스미싱 예방**: 택배 사칭 등 의심스러운 문자 URL 클릭 금지
7. **계정 및 비밀번호 보안**: 안전한 비밀번호 생성 규칙 및 타인 공유 금지
8. **디지털 웰빙 & 과몰입 방지**: 스마트폰 취침 전 자제 및 스스로 이용 시간 조절
9. **온라인 안전 & 그루밍 예방**: 게임/SNS 낯선 사람의 선물 제안 및 개인정보/사진 요구 거절
10. **선플과 배려**: 화면 너머의 사람 존중 및 따뜻한 댓글 문화 실천
