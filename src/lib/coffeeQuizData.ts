export type QuizQuestion = {
  id: string;
  type: "OX" | "MC";
  difficulty: "basic" | "intermediate" | "advanced";
  question: string;
  options?: string[];
  answer: boolean | string;
  explanation: string;
};

export type CoffeeLevel = {
  label: string;
  emoji: string;
  desc: string;
  color: string;
};

export const QUIZ_POOL: QuizQuestion[] = [
  // ── BASIC OX (pool of 6) ──
  {
    id: "b_ox_1", type: "OX", difficulty: "basic",
    question: "에스프레소는 커피 원두를 곱게 갈아 뜨거운 물을 고압으로 통과시켜 추출한다.",
    answer: true,
    explanation: "에스프레소는 약 9기압의 압력으로 25~30초간 추출합니다.",
  },
  {
    id: "b_ox_2", type: "OX", difficulty: "basic",
    question: "아메리카노는 에스프레소에 뜨거운 물을 추가하여 만든다.",
    answer: true,
    explanation: "아메리카노는 에스프레소 샷에 물을 희석한 음료입니다.",
  },
  {
    id: "b_ox_3", type: "OX", difficulty: "basic",
    question: "카페 라떼에는 스팀 밀크(steamed milk)가 들어간다.",
    answer: true,
    explanation: "카페 라떼는 에스프레소에 스팀 밀크를 넣어 만듭니다.",
  },
  {
    id: "b_ox_4", type: "OX", difficulty: "basic",
    question: "커피 원두는 커피 나무 열매의 씨앗을 로스팅한 것이다.",
    answer: true,
    explanation: "커피체리(열매)의 씨앗이 생두이며, 이를 로스팅하면 원두가 됩니다.",
  },
  {
    id: "b_ox_5", type: "OX", difficulty: "basic",
    question: "아이스 아메리카노는 에스프레소에 얼음만 넣어 만든다.",
    answer: false,
    explanation: "아이스 아메리카노는 에스프레소에 차가운 물과 얼음을 함께 넣어 만듭니다.",
  },
  {
    id: "b_ox_6", type: "OX", difficulty: "basic",
    question: "드립 커피(핸드드립)는 에스프레소 머신 없이 만들 수 있다.",
    answer: true,
    explanation: "핸드드립은 드리퍼와 필터, 주전자만 있으면 에스프레소 머신 없이 추출 가능합니다.",
  },
  // ── BASIC MC (pool of 4) ──
  {
    id: "b_mc_1", type: "MC", difficulty: "basic",
    question: "카푸치노의 전통적인 구성 비율로 올바른 것은?",
    options: [
      "에스프레소 : 스팀 밀크 : 우유 폼 = 1:1:1",
      "에스프레소 : 스팀 밀크 : 우유 폼 = 2:1:1",
      "에스프레소 : 스팀 밀크 : 우유 폼 = 1:2:1",
      "에스프레소 : 스팀 밀크 : 우유 폼 = 1:3:1",
    ],
    answer: "에스프레소 : 스팀 밀크 : 우유 폼 = 1:1:1",
    explanation: "전통 카푸치노는 에스프레소, 스팀 밀크, 우유 폼을 1:1:1 비율로 구성합니다.",
  },
  {
    id: "b_mc_2", type: "MC", difficulty: "basic",
    question: "에스프레소 더블샷을 뜻하는 이탈리아어 용어는?",
    options: ["도피오(Doppio)", "리스트레토(Ristretto)", "룽고(Lungo)", "마키아토(Macchiato)"],
    answer: "도피오(Doppio)",
    explanation: "도피오(Doppio)는 이탈리아어로 '두 배'를 뜻하며, 에스프레소 더블샷을 의미합니다.",
  },
  {
    id: "b_mc_3", type: "MC", difficulty: "basic",
    question: "다음 중 커피를 상업적 규모로 생산하지 않는 나라는?",
    options: ["일본", "에티오피아", "콜롬비아", "브라질"],
    answer: "일본",
    explanation: "일본은 커피를 소비하지만 상업적 규모의 재배는 하지 않습니다. 나머지는 세계적인 커피 생산국입니다.",
  },
  {
    id: "b_mc_4", type: "MC", difficulty: "basic",
    question: "로스팅 전 커피콩(생두)의 색깔은?",
    options: ["초록색", "갈색", "검은색", "흰색"],
    answer: "초록색",
    explanation: "수확 후 가공된 생두는 초록빛을 띠며, 로스팅 과정에서 갈색~검은색으로 변합니다.",
  },
  // ── INTERMEDIATE OX (pool of 6) ──
  {
    id: "i_ox_1", type: "OX", difficulty: "intermediate",
    question: "예가체프(Yirgacheffe)는 에티오피아의 대표적인 커피 산지이다.",
    answer: true,
    explanation: "예가체프는 에티오피아 남부의 커피 생산지로, 꽃향과 과일향이 특징입니다.",
  },
  {
    id: "i_ox_2", type: "OX", difficulty: "intermediate",
    question: "다크 로스트(강배전) 원두는 라이트 로스트(약배전)보다 카페인 함량이 더 높다.",
    answer: false,
    explanation: "로스팅이 강할수록 카페인이 일부 분해되므로, 라이트 로스트 원두의 카페인 함량이 실제로 더 높습니다.",
  },
  {
    id: "i_ox_3", type: "OX", difficulty: "intermediate",
    question: "게이샤(Geisha) 커피 품종은 파나마에서만 재배된다.",
    answer: false,
    explanation: "게이샤 품종의 원산지는 에티오피아 게샤 지역이며, 파나마 외에도 콜롬비아, 에티오피아 등 여러 나라에서 재배됩니다.",
  },
  {
    id: "i_ox_4", type: "OX", difficulty: "intermediate",
    question: "콜드브루(Cold Brew)는 차가운 물로 12~24시간 동안 장시간 추출하는 방식이다.",
    answer: true,
    explanation: "콜드브루는 찬물에 원두를 장시간 담가 추출하며, 산미가 낮고 부드러운 것이 특징입니다.",
  },
  {
    id: "i_ox_5", type: "OX", difficulty: "intermediate",
    question: "SCA(스페셜티커피협회) 기준으로 스페셜티 커피는 100점 만점에 80점 이상이어야 한다.",
    answer: true,
    explanation: "SCA 기준으로 80점 이상을 받은 커피만 스페셜티 커피로 인정받습니다.",
  },
  {
    id: "i_ox_6", type: "OX", difficulty: "intermediate",
    question: "플랫 화이트(Flat White)는 카페 라떼보다 우유 양이 더 많다.",
    answer: false,
    explanation: "플랫 화이트는 카페 라떼보다 우유 양이 적고 에스프레소 비율이 높아 더 진한 맛이 납니다.",
  },
  // ── INTERMEDIATE MC (pool of 4) ──
  {
    id: "i_mc_1", type: "MC", difficulty: "intermediate",
    question: "핸드드립에서 '블루밍(Blooming)' 또는 '뜸들이기'란 무엇인가?",
    options: [
      "뜨거운 물로 원두를 적셔 이산화탄소를 배출시키는 과정",
      "원두를 갈기 전에 물에 불리는 과정",
      "커피 잔을 뜨거운 물로 예열하는 과정",
      "원두를 산지별로 분류하는 과정",
    ],
    answer: "뜨거운 물로 원두를 적셔 이산화탄소를 배출시키는 과정",
    explanation: "블루밍은 신선한 원두에서 발생하는 이산화탄소를 배출시켜 고른 추출을 돕는 단계입니다.",
  },
  {
    id: "i_mc_2", type: "MC", difficulty: "intermediate",
    question: "에티오피아 커피의 가장 특징적인 향미 프로파일은?",
    options: [
      "꽃향기, 베리류, 과일향",
      "진한 초콜릿, 견과류",
      "흙냄새, 나무향",
      "연기향, 탄향",
    ],
    answer: "꽃향기, 베리류, 과일향",
    explanation: "에티오피아 커피, 특히 예가체프는 재스민, 베르가못, 블루베리 등의 향미가 특징적입니다.",
  },
  {
    id: "i_mc_3", type: "MC", difficulty: "intermediate",
    question: "에스프레소의 이상적인 추출 시간은?",
    options: ["25~30초", "10~15초", "45~60초", "1분~2분"],
    answer: "25~30초",
    explanation: "SCA 기준 에스프레소는 25~30초 사이에 추출되는 것이 이상적입니다.",
  },
  {
    id: "i_mc_4", type: "MC", difficulty: "intermediate",
    question: "커피 '제2의 물결(Second Wave)'을 주도한 대표 기업은?",
    options: ["스타벅스(Starbucks)", "블루보틀(Blue Bottle)", "네스카페(Nescafé)", "일리(illy)"],
    answer: "스타벅스(Starbucks)",
    explanation: "스타벅스는 1980~90년대 에스프레소 기반 음료를 대중화하며 제2의 물결을 이끌었습니다.",
  },
  // ── ADVANCED OX (pool of 6) ──
  {
    id: "a_ox_1", type: "OX", difficulty: "advanced",
    question: "수프리모(Supremo)는 콜롬비아 커피 등급 중 가장 큰 크기의 원두 등급이다.",
    answer: true,
    explanation: "콜롬비아는 원두 크기로 등급을 나누며, 수프리모(스크린 17~18 이상)가 가장 큰 등급입니다.",
  },
  {
    id: "a_ox_2", type: "OX", difficulty: "advanced",
    question: "무산소 발효(Anaerobic Fermentation)는 커피 체리를 밀폐된 탱크 안에서 산소 없이 발효시키는 방식이다.",
    answer: true,
    explanation: "무산소 발효는 독특하고 복잡한 풍미를 만들어내는 혁신적인 가공 방식입니다.",
  },
  {
    id: "a_ox_3", type: "OX", difficulty: "advanced",
    question: "워시드(Washed) 가공법은 커피 체리의 과육 제거 후 발효 없이 바로 건조시킨다.",
    answer: false,
    explanation: "워시드 가공법은 과육 제거 후 물에 담가 발효시키는 과정을 거친 뒤 건조합니다.",
  },
  {
    id: "a_ox_4", type: "OX", difficulty: "advanced",
    question: "파카마라(Pacamara)는 파카스(Pacas)와 마라고지페(Maragogipe)를 교배한 커피 품종이다.",
    answer: true,
    explanation: "파카마라는 엘살바도르에서 개발된 교배 품종으로, 큰 원두와 복잡한 향미가 특징입니다.",
  },
  {
    id: "a_ox_5", type: "OX", difficulty: "advanced",
    question: "에티오피아는 커피 아라비카(Coffea arabica)의 원산지이다.",
    answer: true,
    explanation: "에티오피아 남서부 카파(Kaffa) 지역이 아라비카 커피의 발상지로 알려져 있습니다.",
  },
  {
    id: "a_ox_6", type: "OX", difficulty: "advanced",
    question: "로부스타(Robusta) 품종은 아라비카(Arabica)보다 카페인 함량이 낮다.",
    answer: false,
    explanation: "로부스타의 카페인 함량은 아라비카보다 약 2배 높습니다. 그래서 인스턴트 커피 원료로 많이 사용됩니다.",
  },
  // ── ADVANCED MC (pool of 5) ──
  {
    id: "a_mc_1", type: "MC", difficulty: "advanced",
    question: "'자메이카 블루 마운틴(Jamaica Blue Mountain)' 커피의 생산 지역은?",
    options: [
      "자메이카 블루 마운틴 산맥",
      "하와이 코나(Kona) 지역",
      "에티오피아 예가체프 고원",
      "과테말라 안티구아",
    ],
    answer: "자메이카 블루 마운틴 산맥",
    explanation: "블루 마운틴 커피는 자메이카의 블루 마운틴 산맥 해발 900~1500m에서 생산됩니다.",
  },
  {
    id: "a_mc_2", type: "MC", difficulty: "advanced",
    question: "커피 '제3의 물결(Third Wave)'을 가장 잘 설명한 것은?",
    options: [
      "원산지·품종·가공법을 강조하며 바리스타를 장인으로 여기는 움직임",
      "인스턴트 커피의 전 세계 대중화",
      "에스프레소 머신의 상업적 발명과 보급",
      "대형 프랜차이즈 카페의 전 세계 확장",
    ],
    answer: "원산지·품종·가공법을 강조하며 바리스타를 장인으로 여기는 움직임",
    explanation: "제3의 물결은 2000년대 이후 커피의 품질·투명성·장인정신을 강조하는 운동입니다.",
  },
  {
    id: "a_mc_3", type: "MC", difficulty: "advanced",
    question: "RDT(Ross Droplet Technique)란 무엇인가?",
    options: [
      "원두를 갈기 전 소량의 물을 첨가해 정전기·미분 발생을 줄이는 기법",
      "에스프레소 추출 시 압력을 단계적으로 조절하는 기술",
      "커피 필터를 뜨거운 물로 린싱(rinsing)하는 방법",
      "우유를 스팀할 때 온도를 정밀하게 조절하는 기법",
    ],
    answer: "원두를 갈기 전 소량의 물을 첨가해 정전기·미분 발생을 줄이는 기법",
    explanation: "RDT는 원두에 물 몇 방울을 뿌려 그라인더 내 정전기를 줄이고 더 균일한 분쇄를 돕는 기법입니다.",
  },
  {
    id: "a_mc_4", type: "MC", difficulty: "advanced",
    question: "커피의 TDS(Total Dissolved Solids, 총용존고형물)를 측정하는 기기는?",
    options: [
      "굴절계(Refractometer)",
      "전도율계(Conductivity meter)",
      "pH 미터",
      "비중계(Hydrometer)",
    ],
    answer: "굴절계(Refractometer)",
    explanation: "커피용 굴절계로 TDS를 측정해 추출 수율과 농도를 관리합니다.",
  },
  {
    id: "a_mc_5", type: "MC", difficulty: "advanced",
    question: "SCA 골든 컵 스탠다드에서 권장하는 브루잉 커피의 TDS 범위는?",
    options: ["1.15~1.35%", "0.5~0.8%", "2.0~3.0%", "3.5~5.0%"],
    answer: "1.15~1.35%",
    explanation: "SCA 기준 이상적인 브루잉 커피의 TDS는 1.15~1.35%이며, 추출 수율은 18~22%입니다.",
  },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function getRandomQuiz(): QuizQuestion[] {
  const pool = {
    basic_ox:        QUIZ_POOL.filter(q => q.difficulty === "basic"        && q.type === "OX"),
    basic_mc:        QUIZ_POOL.filter(q => q.difficulty === "basic"        && q.type === "MC"),
    intermediate_ox: QUIZ_POOL.filter(q => q.difficulty === "intermediate" && q.type === "OX"),
    intermediate_mc: QUIZ_POOL.filter(q => q.difficulty === "intermediate" && q.type === "MC"),
    advanced_ox:     QUIZ_POOL.filter(q => q.difficulty === "advanced"     && q.type === "OX"),
    advanced_mc:     QUIZ_POOL.filter(q => q.difficulty === "advanced"     && q.type === "MC"),
  };

  // 8 OX (3+3+2) + 7 MC (2+2+3) = 15 questions, 5 per difficulty
  const selected = [
    ...shuffle(pool.basic_ox).slice(0, 3),
    ...shuffle(pool.basic_mc).slice(0, 2),
    ...shuffle(pool.intermediate_ox).slice(0, 3),
    ...shuffle(pool.intermediate_mc).slice(0, 2),
    ...shuffle(pool.advanced_ox).slice(0, 2),
    ...shuffle(pool.advanced_mc).slice(0, 3),
  ];

  return shuffle(selected);
}

export function getCoffeeLevel(score: number, total: number): CoffeeLevel {
  const pct = score / total;
  if (pct >= 0.87) return { label: "커피 마스터",  emoji: "👑", desc: "커피의 모든 것을 꿰뚫는 진정한 전문가",          color: "text-amber-500" };
  if (pct >= 0.73) return { label: "커피 고수",    emoji: "🏆", desc: "깊은 커피 지식을 갖춘 진정한 애호가",            color: "text-yellow-600" };
  if (pct >= 0.53) return { label: "커피 전문가",  emoji: "🎖️", desc: "커피에 대한 탄탄한 지식을 보유하고 있습니다",    color: "text-coffee-brown" };
  if (pct >= 0.33) return { label: "커피 애호가",  emoji: "☕", desc: "커피를 즐기며 지식을 쌓아가고 있습니다",          color: "text-coffee-brown/70" };
  return             { label: "커피 입문자",  emoji: "🌱", desc: "커피의 세계에 첫 발을 내딛은 당신을 환영합니다", color: "text-coffee-brown/50" };
}
