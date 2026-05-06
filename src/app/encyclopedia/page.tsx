"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Home, BookOpen, Search, ChevronDown, ChevronUp } from "lucide-react";

/* ─────────────────────── 데이터 ──────────────────────── */

interface Entry {
  id: string;
  category: string;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  tags: string[];
}

const ENTRIES: Entry[] = [
  /* ── 원두 & 산지 ── */
  {
    id: "ethiopia",
    category: "원두 & 산지",
    emoji: "🌍",
    title: "에티오피아",
    subtitle: "커피의 발원지",
    description: "커피의 고향으로 불리는 에티오피아는 야생 아라비카 원두의 원산지입니다. 예가체프, 시다마, 하라르 지역이 대표적이며 베리류, 꽃향기, 감귤류의 과일향이 특징입니다.",
    details: [
      "고도 1,500~2,200m의 고지대에서 재배",
      "워시드(Washed)와 내추럴(Natural) 두 방식 모두 생산",
      "예가체프: 자스민·레몬 향의 라이트 로스트가 유명",
      "하라르: 와인처럼 발효된 과일향, 묵직한 바디감",
    ],
    tags: ["아라비카", "고지대", "과일향", "꽃향기"],
  },
  {
    id: "colombia",
    category: "원두 & 산지",
    emoji: "🇨🇴",
    title: "콜롬비아",
    subtitle: "부드럽고 균형잡힌 맛",
    description: "안데스 산맥의 풍부한 강수량과 화산토 덕분에 세계적으로 인기 높은 원두를 생산합니다. 캐러멜, 헤이즐넛, 적색 과일의 향이 어우러진 균형잡힌 맛이 특징입니다.",
    details: [
      "수프레모(Supremo)와 엑셀소(Excelso) 등급으로 분류",
      "워시드 방식으로 깔끔한 산미 유지",
      "우일라, 나리뇨, 안티오키아 지역이 유명",
      "연중 수확 가능한 이상적인 기후 조건",
    ],
    tags: ["균형감", "캐러멜", "헤이즐넛", "미디엄 로스트"],
  },
  {
    id: "brazil",
    category: "원두 & 산지",
    emoji: "🌿",
    title: "브라질",
    subtitle: "세계 최대 커피 생산국",
    description: "전 세계 커피 생산량의 약 30%를 차지하는 최대 생산국입니다. 저산도에 묵직한 바디감, 초콜릿과 견과류의 달콤한 풍미가 블렌드의 베이스로 자주 활용됩니다.",
    details: [
      "내추럴(Natural) 방식으로 과육째 건조하여 단맛 강조",
      "세라도, 미나스 제라이스 지역이 대표 산지",
      "에스프레소 블렌드의 핵심 원두로 사용",
      "낮은 고도(700~1,200m)로 산미가 부드럽고 바디감이 풍부",
    ],
    tags: ["저산도", "묵직함", "초콜릿", "견과류"],
  },
  {
    id: "geisha",
    category: "원두 & 산지",
    emoji: "✨",
    title: "게이샤 (Geisha)",
    subtitle: "세계에서 가장 희귀한 품종",
    description: "에티오피아 게샤 마을에서 유래한 희귀 품종으로, 파나마의 에스메랄다 농장에서 재발견되어 세계적으로 유명해졌습니다. 자스민, 복숭아, 베르가못의 복합적인 향이 경이롭습니다.",
    details: [
      "2004년 파나마 베스트 커피 경매에서 세계 최고가 기록",
      "꽃향기, 열대과일, 차(Tea) 같은 섬세한 맛",
      "생산량이 매우 적어 가격이 높음",
      "에티오피아·파나마·콜롬비아에서 소량 재배",
    ],
    tags: ["희귀품종", "고급", "자스민", "복숭아"],
  },
  {
    id: "arabica-robusta",
    category: "원두 & 산지",
    emoji: "⚖️",
    title: "아라비카 vs 로부스타",
    subtitle: "두 가지 주요 커피 종",
    description: "아라비카는 전 세계 커피의 약 60%를 차지하며 부드럽고 복합적인 향미로 스페셜티에 주로 사용됩니다. 로부스타는 강한 쓴맛과 높은 카페인 함량으로 에스프레소 블렌드나 인스턴트 커피에 활용됩니다.",
    details: [
      "아라비카: 카페인 1.2~1.5%, 고지대(600~2,000m) 재배",
      "로부스타: 카페인 2.2~2.7%, 저지대 재배, 병충해에 강함",
      "로부스타는 에스프레소의 크레마를 풍부하게 만들어줌",
      "대부분의 스페셜티 커피는 아라비카 품종",
    ],
    tags: ["아라비카", "로부스타", "카페인", "비교"],
  },
  {
    id: "single-origin",
    category: "원두 & 산지",
    emoji: "🗺️",
    title: "싱글 오리진 vs 블렌드",
    subtitle: "원두 구성 방식의 차이",
    description: "싱글 오리진은 특정 농장이나 지역의 원두만 사용해 테루아(terroir)를 고스란히 담아냅니다. 블렌드는 여러 산지의 원두를 조합해 일관된 맛과 복합적인 풍미를 만들어냅니다.",
    details: [
      "싱글 오리진: 산지의 개성 강조, 시즌마다 맛 변화 가능",
      "블렌드: 년중 일정한 맛 유지, 카페 시그니처 메뉴에 적합",
      "마이크로랏(Micro-lot): 단일 농장의 특정 구역에서 소량 생산",
      "내추럴 처리법 싱글 오리진은 과일향이 극대화됨",
    ],
    tags: ["싱글오리진", "블렌드", "테루아", "마이크로랏"],
  },

  /* ── 브루잉 방식 ── */
  {
    id: "espresso",
    category: "브루잉",
    emoji: "☕",
    title: "에스프레소",
    subtitle: "모든 커피 음료의 기초",
    description: "9기압의 고압으로 20~30초 동안 뜨거운 물을 통과시켜 추출하는 방식입니다. 25~35ml의 농축된 커피로 황금빛 크레마(Crema)가 특징이며 모든 에스프레소 음료의 베이스가 됩니다.",
    details: [
      "추출 시간: 25~30초가 이상적",
      "분쇄도: 매우 고운 분쇄 (에스프레소 전용)",
      "크레마: 상단의 황금빛 거품, 신선도와 품질의 지표",
      "더블샷(Doppio)은 싱글샷의 2배인 60ml",
    ],
    tags: ["에스프레소", "크레마", "고압", "농축"],
  },
  {
    id: "pour-over",
    category: "브루잉",
    emoji: "💧",
    title: "핸드드립 (Pour Over)",
    subtitle: "섬세함을 담은 추출",
    description: "필터를 통해 뜨거운 물을 천천히 부어 중력으로 추출하는 방식입니다. 원두 본연의 섬세한 맛과 향을 최대한 살릴 수 있어 스페셜티 커피에 가장 많이 사용됩니다.",
    details: [
      "뜸들이기(Bloom): 첫 30~45초 동안 소량의 물로 원두를 적심",
      "물 온도: 90~96°C가 적정",
      "V60, 칼리타, 케멕스 등 다양한 드리퍼 종류",
      "분쇄도: 중간 정도의 굵기가 적합",
    ],
    tags: ["핸드드립", "V60", "스페셜티", "클린컵"],
  },
  {
    id: "cold-brew",
    category: "브루잉",
    emoji: "🧊",
    title: "콜드브루 (Cold Brew)",
    subtitle: "시간이 만드는 부드러움",
    description: "차가운 물로 12~24시간 동안 서서히 추출하는 방식입니다. 열을 가하지 않아 산도가 낮고 달콤하며 부드러운 맛이 특징입니다. 냉장 보관 시 2주까지 유지됩니다.",
    details: [
      "추출 시간: 12~24시간 (냉장 또는 상온)",
      "원두:물 비율 = 1:4~1:5",
      "더치 커피(Dutch Coffee)와 구별: 더치는 드립식 냉수 추출",
      "카페인 함량이 일반 커피보다 높을 수 있음",
    ],
    tags: ["콜드브루", "저산도", "장시간추출", "여름"],
  },
  {
    id: "french-press",
    category: "브루잉",
    emoji: "🫙",
    title: "프렌치프레스",
    subtitle: "풍부한 바디감의 클래식",
    description: "굵게 간 원두를 뜨거운 물에 4분간 담근 후 금속 필터를 눌러 추출합니다. 종이 필터가 없어 오일 성분이 그대로 추출되어 바디감이 풍부하고 진한 맛이 납니다.",
    details: [
      "추출 시간: 4분이 기본",
      "분쇄도: 굵은 분쇄 (입자가 크면 쓴맛 감소)",
      "오일 성분이 콜레스테롤 수치에 영향 가능",
      "미세한 원두 찌꺼기가 섞일 수 있음",
    ],
    tags: ["프렌치프레스", "풀바디", "오일", "침지"],
  },
  {
    id: "aeropress",
    category: "브루잉",
    emoji: "🔧",
    title: "에어로프레스",
    subtitle: "다재다능한 현대적 추출",
    description: "2005년 개발된 비교적 새로운 추출 도구입니다. 압력을 활용해 빠르게 추출하며 에스프레소 스타일부터 아메리카노까지 다양한 레시피를 실험할 수 있습니다.",
    details: [
      "추출 시간: 1~2분으로 매우 빠름",
      "역방향(Inverted) 방식으로 침지 시간 조절 가능",
      "여행용으로 가볍고 튼튼해 인기",
      "매년 월드 에어로프레스 챔피언십 개최",
    ],
    tags: ["에어로프레스", "압력", "레시피", "실험"],
  },
  {
    id: "moka-pot",
    category: "브루잉",
    emoji: "🫖",
    title: "모카포트",
    subtitle: "이탈리아 가정의 에스프레소",
    description: "1933년 이탈리아에서 발명된 스토브탑 추출 기구입니다. 아래 칸의 물이 끓으면서 생기는 증기압이 원두를 통과해 위 칸으로 커피를 밀어올립니다. 에스프레소보다 부드러운 농축 커피가 만들어집니다.",
    details: [
      "비알레티(Bialetti) 브랜드가 가장 유명",
      "2~5기압으로 에스프레소 머신보다 낮은 압력",
      "알루미늄 또는 스테인리스 소재",
      "불 조절이 맛의 핵심 — 약불로 천천히 추출",
    ],
    tags: ["모카포트", "이탈리아", "스토브탑", "농축"],
  },

  /* ── 맛 & 향 ── */
  {
    id: "acidity",
    category: "맛 & 향",
    emoji: "🍋",
    title: "산미 (Acidity)",
    subtitle: "커피의 밝고 생동감 있는 맛",
    description: "커피를 마실 때 혀 옆과 침샘을 자극하는 밝고 상큼한 느낌입니다. 레몬, 사과, 자몽처럼 과일의 신맛과 비슷합니다. 좋은 산미는 커피에 생동감을 더하며 에티오피아, 케냐 원두에서 두드러집니다.",
    details: [
      "낮은 추출 온도, 라이트 로스팅에서 강해짐",
      "과도한 산미는 신맛으로 느껴져 불쾌할 수 있음",
      "구연산, 말산, 주석산 등 유기산이 원인",
      "콜드브루는 열추출보다 산도가 낮음",
    ],
    tags: ["산미", "과일향", "라이트로스트", "스페셜티"],
  },
  {
    id: "body",
    category: "맛 & 향",
    emoji: "🌊",
    title: "바디감 (Body)",
    subtitle: "입 안에서 느끼는 무게와 질감",
    description: "커피를 마셨을 때 입 안에서 느껴지는 질감과 무게감입니다. 물처럼 가벼운 라이트 바디부터 크림처럼 묵직한 풀 바디까지 스펙트럼이 넓습니다. 원두의 오일 함량, 분쇄도, 추출 방식에 따라 달라집니다.",
    details: [
      "프렌치프레스는 오일을 보존해 풀 바디",
      "핸드드립은 종이 필터가 오일을 제거해 미디엄~라이트 바디",
      "브라질, 수마트라 원두는 풀 바디로 유명",
      "에스프레소는 크레마와 함께 진한 바디감",
    ],
    tags: ["바디감", "질감", "오일", "무게"],
  },
  {
    id: "sweetness",
    category: "맛 & 향",
    emoji: "🍯",
    title: "단맛 (Sweetness)",
    subtitle: "자연스러운 달콤함",
    description: "잘 익은 커피 체리와 최적의 로스팅에서 나오는 자연스러운 단맛입니다. 설탕을 넣지 않아도 캐러멜, 초콜릿, 갈색 설탕 같은 달콤함을 느낄 수 있습니다. 과추출이나 탄 로스팅은 단맛을 감소시킵니다.",
    details: [
      "내추럴 처리법 원두에서 단맛이 극대화됨",
      "미디엄 로스트에서 가장 균형잡힌 단맛",
      "과소추출 시 신맛이, 과추출 시 쓴맛이 단맛을 가림",
      "수크로오스가 로스팅 과정에서 캐러멜화되어 단맛 생성",
    ],
    tags: ["단맛", "캐러멜", "내추럴", "미디엄로스트"],
  },
  {
    id: "aroma",
    category: "맛 & 향",
    emoji: "🌸",
    title: "향미 (Aroma)",
    subtitle: "커피의 복합적인 향기 세계",
    description: "커피에서 느껴지는 향기는 800가지 이상의 휘발성 화합물로 구성됩니다. 와인처럼 플로럴, 프루티, 너티, 스파이시, 어시 등 다양한 카테고리로 분류하며 SCA(스페셜티커피협회)의 향미 휠로 표현합니다.",
    details: [
      "드라이 아로마: 분쇄한 원두의 향",
      "웨트 아로마: 물을 부은 직후의 향 (브루잉 아로마)",
      "SCA Flavor Wheel: 꽃향기, 과일, 발효, 곡물, 너티 등 분류",
      "향미는 시간이 지나면 산화되어 약해짐 — 신선한 원두가 핵심",
    ],
    tags: ["아로마", "향미휠", "SCA", "신선도"],
  },
  {
    id: "bitterness",
    category: "맛 & 향",
    emoji: "☕",
    title: "쓴맛 (Bitterness)",
    subtitle: "커피의 기본 맛 성분",
    description: "카페인, 클로로겐산, 트리고넬린 등의 성분에서 비롯되는 쓴맛은 커피의 기본 특성입니다. 적절한 쓴맛은 커피에 깊이를 더하지만, 과추출이나 강한 로스팅은 불쾌한 쓴맛을 만들 수 있습니다.",
    details: [
      "다크 로스트일수록 쓴맛 성분(퀴닌, 피라진) 증가",
      "추출 시간이 길수록 쓴맛 성분 더 많이 용해됨",
      "물 온도가 높을수록 쓴맛 추출 가속화",
      "적절한 쓴맛은 단맛과 균형을 이루어 복합적인 풍미 완성",
    ],
    tags: ["쓴맛", "카페인", "다크로스트", "과추출"],
  },
  {
    id: "aftertaste",
    category: "맛 & 향",
    emoji: "✨",
    title: "애프터테이스트 (Finish)",
    subtitle: "마신 후 남는 여운",
    description: "커피를 삼킨 후 입 안과 목에 남는 지속적인 맛과 향의 여운입니다. 좋은 커피는 길고 달콤하며 깨끗한 여운을 남기고, 품질이 낮은 커피는 쓴맛이나 떫은 여운이 오래 남습니다.",
    details: [
      "긴 여운(Long Finish)은 고품질 스페셜티 커피의 특징",
      "클린컵(Clean Cup): 이물질 없이 깨끗한 맛 마무리",
      "여운의 길이와 질은 컵 테이스팅(Cupping)의 핵심 평가 항목",
      "탄닌 성분은 떫은 여운의 원인",
    ],
    tags: ["애프터테이스트", "여운", "클린컵", "컵핑"],
  },

  /* ── 로스팅 ── */
  {
    id: "light-roast",
    category: "로스팅",
    emoji: "🌤️",
    title: "라이트 로스트",
    subtitle: "원두 본연의 맛을 살리다",
    description: "내부 온도 190~205°C에서 첫 번째 팝음(First Crack) 직후 꺼내는 가장 밝은 로스팅 단계입니다. 산미가 강하고 원두 산지의 개성이 잘 드러나 스페셜티 커피에서 선호됩니다.",
    details: [
      "색상: 밝은 갈색, 표면에 기름기 없음",
      "대표 명칭: 시나몬 로스트, 뉴잉글랜드 로스트",
      "카페인 함량이 다크 로스트보다 약간 더 높음",
      "핸드드립, 에어로프레스에 잘 어울림",
    ],
    tags: ["라이트로스트", "산미", "스페셜티", "원산지"],
  },
  {
    id: "medium-roast",
    category: "로스팅",
    emoji: "☀️",
    title: "미디엄 로스트",
    subtitle: "균형의 정점",
    description: "내부 온도 210~220°C에서 첫 번째 팝음이 끝난 후 꺼내는 단계입니다. 산미와 바디감, 단맛이 조화롭게 균형을 이루어 가장 대중적으로 사랑받는 로스팅입니다.",
    details: [
      "색상: 중간 갈색, 표면에 기름기 거의 없음",
      "대표 명칭: 아메리칸 로스트, 시티 로스트",
      "모든 추출 방식에 두루 어울리는 범용성",
      "콜롬비아, 브라질 원두와 가장 잘 어울림",
    ],
    tags: ["미디엄로스트", "균형", "대중적", "시티로스트"],
  },
  {
    id: "medium-dark-roast",
    category: "로스팅",
    emoji: "🌅",
    title: "미디엄 다크 로스트",
    subtitle: "깊이를 더하다",
    description: "내부 온도 225~230°C에서 두 번째 팝음(Second Crack) 초반에 꺼내는 단계입니다. 표면에 기름기가 생기고 쓴맛이 강해지며 캐러멜, 다크초콜릿 등의 진한 풍미가 나타납니다.",
    details: [
      "색상: 짙은 갈색, 표면에 기름기 시작",
      "대표 명칭: 풀 시티 로스트, 비엔나 로스트",
      "에스프레소 블렌드로 많이 사용",
      "프렌치프레스, 에스프레소 머신에 적합",
    ],
    tags: ["미디엄다크", "다크초콜릿", "에스프레소", "풀시티"],
  },
  {
    id: "dark-roast",
    category: "로스팅",
    emoji: "🌑",
    title: "다크 로스트",
    subtitle: "강렬하고 묵직한 맛",
    description: "내부 온도 240°C 이상에서 두 번째 팝음이 지난 후 꺼내는 가장 진한 로스팅입니다. 원두 본래의 산지 특성은 줄어들고 로스팅 자체의 맛(쓴맛, 스모키함)이 두드러집니다.",
    details: [
      "색상: 거의 검은색, 표면에 기름기 풍부",
      "대표 명칭: 프렌치 로스트, 이탈리안 로스트",
      "카페인 함량은 라이트 로스트보다 약간 낮음",
      "에스프레소, 카페라떼 등 우유 음료와 잘 어울림",
    ],
    tags: ["다크로스트", "스모키", "풀바디", "이탈리안"],
  },

  /* ── 음료 ── */
  {
    id: "americano",
    category: "음료",
    emoji: "🥤",
    title: "아메리카노",
    subtitle: "깔끔하고 담백한 일상의 커피",
    description: "에스프레소에 뜨거운 물을 더해 희석한 음료입니다. 2차 세계대전 당시 이탈리아에서 미군이 에스프레소가 너무 진해 물로 희석해 마신 데서 유래했습니다.",
    details: [
      "비율: 에스프레소 30ml + 물 150~200ml",
      "아이스 아메리카노: 한국에서 가장 많이 팔리는 음료",
      "물을 먼저, 에스프레소를 나중에 넣으면 크레마 보존",
      "에스프레소 원두의 품질이 맛을 결정",
    ],
    tags: ["아메리카노", "에스프레소", "담백함", "기본"],
  },
  {
    id: "latte",
    category: "음료",
    emoji: "🥛",
    title: "카페라떼",
    subtitle: "부드러운 밀크커피의 정석",
    description: "에스프레소에 스팀밀크를 부어 만드는 크리미한 음료입니다. 이탈리아어로 '우유'를 의미하는 라떼는 커피와 우유의 황금 비율로 부드럽고 풍부한 맛을 냅니다.",
    details: [
      "비율: 에스프레소 30ml + 스팀밀크 150~200ml",
      "라떼아트: 스팀밀크의 마이크로폼으로 하트, 로제타 등 그림",
      "카푸치노보다 우유 비율이 높아 더 부드러움",
      "시럽 추가로 바닐라라떼, 헤이즐넛라떼 등 변형 가능",
    ],
    tags: ["라떼", "스팀밀크", "라떼아트", "크리미"],
  },
  {
    id: "cappuccino",
    category: "음료",
    emoji: "☕",
    title: "카푸치노",
    subtitle: "거품의 예술",
    description: "에스프레소, 스팀밀크, 풍부한 밀크폼이 3등분으로 이루어진 이탈리아 전통 음료입니다. 이탈리아 카푸친 수도사들의 갈색 수도복 색깔과 비슷하다고 해서 이름이 붙었습니다.",
    details: [
      "비율: 에스프레소 : 스팀밀크 : 밀크폼 = 1:1:1",
      "드라이 카푸치노: 폼을 더 많이, 웻 카푸치노: 우유를 더 많이",
      "이탈리아에서는 아침에만 마시는 전통",
      "총 용량: 150~180ml로 라떼보다 작음",
    ],
    tags: ["카푸치노", "밀크폼", "이탈리아", "전통"],
  },
  {
    id: "flat-white",
    category: "음료",
    emoji: "🫗",
    title: "플랫화이트",
    subtitle: "진하고 벨벳 같은 질감",
    description: "호주와 뉴질랜드에서 유래한 음료로 더블 에스프레소에 마이크로폼(micro-foam) 밀크를 적게 넣어 커피 맛을 강조합니다. 라떼보다 작고 카푸치노보다 폼이 적은 것이 특징입니다.",
    details: [
      "비율: 더블 에스프레소 60ml + 스팀밀크 100~130ml",
      "마이크로폼: 거품이 매우 작아 벨벳 같은 질감",
      "커피 대 우유 비율이 높아 에스프레소 맛이 강함",
      "스타벅스를 통해 전 세계적으로 유명해짐",
    ],
    tags: ["플랫화이트", "더블샷", "호주", "마이크로폼"],
  },
  {
    id: "macchiato",
    category: "음료",
    emoji: "🎨",
    title: "마키아토",
    subtitle: "에스프레소에 우유 한 점",
    description: "이탈리아어로 '얼룩진'을 의미하는 마키아토는 에스프레소에 소량의 스팀밀크나 폼밀크를 얹은 음료입니다. 에스프레소의 진한 맛을 유지하면서 우유로 거칠기를 부드럽게 합니다.",
    details: [
      "에스프레소 마키아토: 에스프레소 30ml + 폼밀크 1 티스푼",
      "라떼 마키아토: 반대로 우유에 에스프레소를 얹음",
      "스타벅스 카라멜 마키아토는 변형된 형태",
      "이탈리아 전통 마키아토는 매우 소량",
    ],
    tags: ["마키아토", "에스프레소", "소량", "진함"],
  },
  {
    id: "cold-brew-latte",
    category: "음료",
    emoji: "🧊",
    title: "콜드브루라떼",
    subtitle: "여름의 커피",
    description: "콜드브루 원액에 우유를 더해 만드는 여름 음료입니다. 열 추출 커피와 달리 산도가 낮아 우유와 부드럽게 어우러지며, 시원하고 크리미한 맛이 특징입니다.",
    details: [
      "비율: 콜드브루 원액 1 + 우유 2~3",
      "오트밀크, 아몬드밀크 등 대체 우유와도 잘 어울림",
      "콜드브루의 낮은 산도가 우유와 분리되지 않음",
      "질소 콜드브루(Nitro Cold Brew)는 질소 주입으로 거품이 풍부",
    ],
    tags: ["콜드브루라떼", "여름", "저산도", "크리미"],
  },
];

const CATEGORIES = ["전체", "원두 & 산지", "브루잉", "맛 & 향", "로스팅", "음료"];

const CATEGORY_COLORS: Record<string, string> = {
  "원두 & 산지": "bg-emerald-900/40 text-emerald-300 border-emerald-700/40",
  "브루잉":      "bg-blue-900/40 text-blue-300 border-blue-700/40",
  "맛 & 향":    "bg-purple-900/40 text-purple-300 border-purple-700/40",
  "로스팅":      "bg-orange-900/40 text-orange-300 border-orange-700/40",
  "음료":        "bg-pink-900/40 text-pink-300 border-pink-700/40",
};

/* ─────────────────── 카드 컴포넌트 ──────────────────── */
function EntryCard({ entry }: { entry: Entry }) {
  const [open, setOpen] = useState(false);
  const badgeCls = CATEGORY_COLORS[entry.category] ?? "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20";

  return (
    <div className="sign-frame rounded-2xl overflow-hidden flex flex-col transition-all duration-300">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left p-6 flex items-start gap-4 hover:bg-white/5 transition-colors"
      >
        <span className="text-3xl flex-shrink-0 mt-0.5">{entry.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeCls} cormorant tracking-widest uppercase`}>
              {entry.category}
            </span>
          </div>
          <h3 className="playfair text-lg font-bold text-[#FCF5E5] leading-tight">{entry.title}</h3>
          <p className="cormorant text-[#D4AF37]/70 text-base mt-0.5">{entry.subtitle}</p>
          <p className="cormorant text-[#FCF5E5]/55 text-base leading-relaxed mt-2 font-light">{entry.description}</p>
        </div>
        <span className="text-[#D4AF37]/40 flex-shrink-0 mt-1">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-[#D4AF37]/10 pt-4 space-y-4">
          <ul className="space-y-2">
            {entry.details.map((d, i) => (
              <li key={i} className="flex items-start gap-2 cormorant text-[#FCF5E5]/60 text-base font-light">
                <span className="text-[#D4AF37]/50 flex-shrink-0 mt-0.5">✦</span>
                {d}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {entry.tags.map(tag => (
              <span key={tag} className="text-[10px] cormorant text-[#D4AF37]/50 border border-[#D4AF37]/20 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════ MAIN PAGE ═════════════════════════ */
export default function EncyclopediaPage() {
  const [search, setSearch]         = useState("");
  const [activeCategory, setActive] = useState("전체");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return ENTRIES.filter(e => {
      const matchCat = activeCategory === "전체" || e.category === activeCategory;
      const matchSearch = !term ||
        e.title.toLowerCase().includes(term) ||
        e.subtitle.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.tags.some(t => t.toLowerCase().includes(term));
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen cafe-bg">

      {/* Header */}
      <div className="w-full border-b border-[#D4AF37]/20 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors">
            <Home size={20} />
          </Link>
          <span className="text-[#D4AF37]/30">/</span>
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-[#D4AF37]" />
            <h1 className="playfair text-xl font-bold text-[#FCF5E5]">커피 백과사전</h1>
          </div>
          <span className="ml-auto cormorant text-[#FCF5E5]/30 text-sm hidden sm:block">
            {filtered.length}개 항목
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="gold-divider text-[#D4AF37]/40 text-xs tracking-[0.4em] uppercase cormorant">
            Coffee Knowledge
          </div>
          <h2 className="cafe-sign-title text-4xl md:text-5xl text-[#FCF5E5]">
            커피의 모든 것
          </h2>
          <p className="cormorant text-[#FCF5E5]/50 text-xl font-light max-w-xl mx-auto leading-relaxed">
            원두의 산지부터 추출 방식, 맛의 언어까지<br />커피를 더 깊이 이해하는 지식 사전
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/40" size={18} />
          <input
            type="text"
            placeholder="원두, 추출 방식, 맛 용어를 검색하세요..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-[#D4AF37]/20 text-[#FCF5E5] placeholder-[#FCF5E5]/25 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all cormorant text-lg"
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-1.5 rounded-full text-sm cormorant tracking-wide transition-all border ${
                activeCategory === cat
                  ? "bg-[#D4AF37] text-[#1a0f0a] border-[#D4AF37] font-bold"
                  : "border-[#D4AF37]/25 text-[#FCF5E5]/55 hover:border-[#D4AF37]/50 hover:text-[#FCF5E5]/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Entries grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="cormorant text-[#FCF5E5]/30 text-2xl font-light">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(entry => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}

      </div>

      <footer className="w-full py-10 text-center border-t border-[#D4AF37]/15 mt-10">
        <p className="cormorant text-[#FCF5E5]/30 tracking-widest text-sm uppercase">
          © 2026 Coffee Atlas &nbsp;·&nbsp; All rights reserved
        </p>
      </footer>
    </div>
  );
}
