/**
 * 에니어그램 18개 날개 유형 진단 및 점수 산출 엔진
 */

class EnneagramEngine {
  constructor() {
    this.scores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    this.userAnswers = [];
  }

  reset() {
    this.scores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    this.userAnswers = [];
  }

  recordAnswer(questionIndex, selectedOptionIndex) {
    this.userAnswers[questionIndex] = selectedOptionIndex;
  }

  calculateResult() {
    // 점수 초기화 후 가중치 합산
    this.scores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };

    this.userAnswers.forEach((optIdx, qIdx) => {
      if (optIdx !== undefined && QUESTIONS_DATA[qIdx]) {
        const option = QUESTIONS_DATA[qIdx].options[optIdx];
        if (option && option.weights) {
          for (const [type, weight] of Object.entries(option.weights)) {
            this.scores[type] = (this.scores[type] || 0) + weight;
          }
        }
      }
    });

    // 1. 주 유형 (Highest core score) 산출
    let mainType = 1;
    let maxScore = -1;

    for (let t = 1; t <= 9; t++) {
      if (this.scores[t] > maxScore) {
        maxScore = this.scores[t];
        mainType = t;
      }
    }

    // 2. 인접 날개 후보 지정
    const wingCandidates = {
      1: [9, 2],
      2: [1, 3],
      3: [2, 4],
      4: [3, 5],
      5: [4, 6],
      6: [5, 7],
      7: [6, 8],
      8: [7, 9],
      9: [8, 1]
    };

    const [wA, wB] = wingCandidates[mainType];
    const scoreWA = this.scores[wA] || 0;
    const scoreWB = this.scores[wB] || 0;

    // 더 점수가 높은 날개 선택 (같을 경우 앞선 날개 기본 선택)
    const selectedWing = scoreWA >= scoreWB ? wA : wB;

    const wingCode = `${mainType}w${selectedWing}`;
    const resultData = ENNEAGRAM_18_DATA[wingCode] || ENNEAGRAM_18_DATA["1w9"];

    // 3. 백분율 차트용 9개 유형 분포 계산
    const totalPoints = Object.values(this.scores).reduce((a, b) => a + b, 0) || 1;
    const chartData = {};
    for (let t = 1; t <= 9; t++) {
      chartData[t] = {
        score: this.scores[t],
        percentage: Math.round((this.scores[t] / totalPoints) * 100)
      };
    }

    return {
      mainType,
      selectedWing,
      wingCode,
      resultData,
      scores: this.scores,
      chartData
    };
  }
}

window.enneagramEngine = new EnneagramEngine();
