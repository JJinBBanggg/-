/**
 * 구글 앱스 스크립트(GAS) 연동 및 퀴즈 결과 제출 모듈
 * 
 * [완전 익명 보장 원칙]
 * - 학생의 이름, 번호, 생년월일, IP 등 어떠한 개인정보도 수집/전송하지 않습니다.
 * - 오직 [제출 시각, 총점, 각 문항별 정오답 여부]만 안전하게 전송됩니다.
 */

// ==============================================================================
// 1. 구글 앱스 스크립트(GAS) 배포 URL 설정
// ==============================================================================
// 교사/관리자가 배포한 웹 앱 URL을 아래 따옴표 안에 붙여넣으세요.
// 설정하지 않아도 퀴즈는 정상 작동하며, 로컬 시뮬레이션 모드로 작동합니다.
const DEFAULT_GAS_URL = ""; 

const GAS_STORAGE_KEY = "DIGITAL_CITIZEN_QUIZ_GAS_URL";

/**
 * 현재 설정된 GAS URL 가져오기 (로컬스토리지 우선, 없으면 기본값)
 */
function getGasUrl() {
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem(GAS_STORAGE_KEY);
    if (saved && saved.trim() !== "") {
      return saved.trim();
    }
  }
  return DEFAULT_GAS_URL.trim();
}

/**
 * GAS URL 저장하기 (웹 화면에서 교사가 직접 변경할 때 사용)
 */
function setGasUrl(newUrl) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(GAS_STORAGE_KEY, (newUrl || "").trim());
  }
}

/**
 * 현재 한국 시간(KST) 포맷 문자열 생성 (YYYY-MM-DD HH:mm:ss)
 */
function getKoreanTimeString() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 퀴즈 결과 데이터를 구글 앱스 스크립트(GAS)로 전송하는 메인 함수
 * 
 * @param {Object} quizSummary - 퀴즈 결과 데이터
 *   - score: 맞힌 문항 수 (0~10)
 *   - total: 전체 문항 수 (10)
 *   - answers: 각 문항별 정오답 결과 배열 [{ qId: 1, isCorrect: true, selected: 1, correct: 1 }, ...]
 * @returns {Promise<{success: boolean, message: string, simulated?: boolean}>}
 */
async function submitQuizResult(quizSummary) {
  const gasUrl = getGasUrl();
  const submittedAt = getKoreanTimeString();

  // 문항별 O / X 매핑 생성
  const qDetail = {};
  const qOXList = [];

  quizSummary.answers.forEach((ans, index) => {
    const ox = ans.isCorrect ? "O" : "X";
    qDetail[`q${index + 1}`] = ox;
    qOXList.push(`Q${index + 1}:${ox}`);
  });

  // 전송할 페이로드 구성 (개인정보 절대 미포함)
  const payload = {
    submittedAt: submittedAt,
    totalScore: quizSummary.score,
    maxScore: quizSummary.total,
    scoreRate: Math.round((quizSummary.score / quizSummary.total) * 100) + "%",
    summary: qOXList.join(", "),
    ...qDetail // q1, q2, ... q10 각각 'O' or 'X'
  };

  console.log("🚀 [디지털 시민성 퀴즈] 전송할 익명 데이터:", payload);

  // 1) GAS URL이 설정되지 않은 경우 -> 로컬 시뮬레이션 성공 처리
  if (!gasUrl || !gasUrl.startsWith("http")) {
    console.info("ℹ️ 구글 앱스 스크립트 URL이 설정되지 않아 로컬 모의(Mock) 전송으로 처리되었습니다.");
    // 교사가 테스트하기 편하도록 콘솔에 안내
    return {
      success: true,
      simulated: true,
      message: "로컬 시뮬레이션 완료 (GAS URL이 설정되면 구글 시트로 자동 전송됩니다.)",
      data: payload
    };
  }

  // 2) 실제 GAS Web App으로 전송
  // 구글 앱스 스크립트(Web App)는 CORS preflight 및 리다이렉트(302) 특성이 있으므로
  // mode: 'no-cors' 및 Content-Type: 'text/plain'으로 전송하는 것이 가장 안정적입니다.
  try {
    await fetch(gasUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    console.log("✅ 구글 앱스 스크립트로 익명 퀴즈 결과 전송 완료!");
    return {
      success: true,
      simulated: false,
      message: "구글 스프레드시트에 성공적으로 기록되었습니다!",
      data: payload
    };
  } catch (error) {
    console.error("❌ GAS 전송 오류 발생:", error);
    return {
      success: false,
      simulated: false,
      message: "결과 전송 중 네트워크 오류가 발생했습니다: " + error.message,
      data: payload
    };
  }
}

// 브라우저 전역 객체 등록
if (typeof window !== "undefined") {
  window.submitQuizResult = submitQuizResult;
  window.getGasUrl = getGasUrl;
  window.setGasUrl = setGasUrl;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { submitQuizResult, getGasUrl, setGasUrl };
}
