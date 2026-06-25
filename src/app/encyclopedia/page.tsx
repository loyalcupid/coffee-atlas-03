"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Home, BookOpen, Search, ChevronDown, ChevronUp } from "lucide-react";

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
  /* ── 커피품종 ── */
  {
    id: "arabica-species",
    category: "커피품종",
    emoji: "🌿",
    title: "아라비카 (Coffea arabica)",
    subtitle: "세계 커피의 60~70%를 차지하는 주요 종",
    description: "에티오피아 카파 지역이 원산지로, 전 세계 커피 생산량의 약 60~70%를 차지합니다. 복합적인 향미와 높은 산미가 특징이며 스페셜티 커피 시장의 주역입니다. 티피카·버번·게이샤·카투라 등 수백 가지 품종(cultivar)으로 분화합니다.",
    details: [
      "원산지: 에티오피아 카파(Kaffa) 지역, 해발 1,500m 이상 고지대 자생",
      "재배 고도: 600~2,200m — 고지대일수록 밀도 높고 향미 복합성 증가",
      "카페인 함량: 1.2~1.5% — 로부스타의 약 절반 수준",
      "염색체 수: 44개(4배체) — 유전적 다양성이 높아 다양한 품종 분화 가능",
      "특징: 서리·병충해에 약하고 재배 난이도가 높으나 향미 복합성은 최고",
      "주요 생산국: 에티오피아, 콜롬비아, 브라질 고지대, 파나마, 예멘",
    ],
    tags: ["아라비카", "스페셜티", "고지대", "다양한품종"],
  },
  {
    id: "typica",
    category: "커피품종",
    emoji: "🌱",
    title: "티피카 (Typica)",
    subtitle: "모든 아라비카의 뿌리, 가장 오래된 원형 품종",
    description: "예멘에서 유럽을 거쳐 전 세계로 퍼진 아라비카의 원형 품종입니다. 깨끗하고 균형 잡힌 클린컵이 특징이지만 수확량이 매우 적고 병충해에 취약해 생산량이 감소하는 추세입니다.",
    details: [
      "식물 특성: 키가 크고 수직으로 자라며 측면 가지가 드문드문 뻗음",
      "체리 형태: 붉은색 체리, 씨앗은 길쭉한 타원형(elongated)",
      "수확량: 매우 낮음 — 상업 재배 효율이 낮아 점차 줄어드는 추세",
      "풍미: 달콤하고 깨끗한 클린컵, 섬세한 산미, 바닐라·과일의 은은한 단맛",
      "대표 산지: 자메이카 블루 마운틴, 하와이 코나, 중앙아메리카 일부",
      "역사: 17~18세기 예멘 → 인도 → 인도네시아 → 중남미 순서로 전 세계 전파",
    ],
    tags: ["티피카", "원형품종", "클린컵", "자메이카블루마운틴", "코나"],
  },
  {
    id: "bourbon",
    category: "커피품종",
    emoji: "🍒",
    title: "버번 (Bourbon)",
    subtitle: "티피카의 자연 변이종, 달콤함의 대명사",
    description: "아프리카 동쪽 레위니옹 섬(구 부르봉 섬)에서 티피카로부터 자연적으로 변이된 아종입니다. 티피카보다 단맛이 강하고 수확량도 다소 높으며, 레드·옐로·오렌지 버번 등 색 변종이 존재합니다.",
    details: [
      "식물 특성: 티피카보다 짧고 풍성한 잎, 가지가 더 촘촘히 뻗음",
      "체리 형태: 작고 둥근 체리 (레드 버번이 가장 일반적)",
      "수확량: 티피카보다 약 20~30% 높음",
      "풍미: 풍부한 단맛, 캐러멜·초콜릿·붉은 과일의 복합적인 산미",
      "대표 산지: 르완다, 부룬디, 엘살바도르, 과테말라, 브라질(옐로 버번)",
      "파생 품종: 카투라, 카투아이, SL28, 파카스 등 현대 품종의 직계 조상",
    ],
    tags: ["버번", "달콤함", "레드버번", "옐로버번", "르완다", "엘살바도르"],
  },
  {
    id: "geisha-variety",
    category: "커피품종",
    emoji: "✨",
    title: "게이샤 (Geisha / Gesha)",
    subtitle: "세계 최고가 경매를 기록한 전설의 품종",
    description: "에티오피아 게샤(Gesha) 마을에서 수집된 품종으로, 1930년대 탄자니아·코스타리카를 거쳐 파나마에 전해졌습니다. 2004년 파나마 경매에서 최고가를 기록하며 스페셜티 커피 붐을 이끈 주인공입니다.",
    details: [
      "식물 특성: 매우 키가 크고 잎이 길고 좁음, 가지가 드문드문 뻗음",
      "수확량: 매우 낮음 — 생산 효율이 낮아 자연히 고가 유지",
      "재배 조건: 해발 1,500m 이상 고지대 필수, 특수한 기후 조건 요구",
      "풍미: 자스민·베르가못·복숭아·열대과일의 복합 향, 차(Tea)처럼 섬세한 질감",
      "대표 산지: 파나마(에스메랄다 농장), 에티오피아, 콜롬비아, 코스타리카",
      "경매 기록: 2004년 파나마 경매 이후 매년 최고가 경쟁, 현재 kg당 수백만 원대",
    ],
    tags: ["게이샤", "고급", "파나마", "자스민", "최고가경매"],
  },
  {
    id: "caturra",
    category: "커피품종",
    emoji: "🌳",
    title: "카투라 (Caturra)",
    subtitle: "버번의 자연 돌연변이, 실용적인 왜소형 품종",
    description: "1937년 브라질에서 버번의 자연 돌연변이로 발견된 왜소형(dwarf) 품종입니다. 식물이 작아 농장 밀도를 높일 수 있고 생산성이 우수하여 중미 스페셜티 커피의 핵심 품종으로 자리 잡았습니다.",
    details: [
      "식물 특성: 왜소형(dwarf) — 키가 작아 고밀도 재배 가능, 가지가 짧고 조밀",
      "수확량: 버번·티피카보다 높음 — 상업적으로 유리",
      "풍미: 밝은 감귤류 산미, 라이트~미디엄 바디, 깨끗하고 달콤한 마무리",
      "병충해: 커피녹병(Leaf Rust)에 취약 — 내성 품종 개발 진행 중",
      "대표 산지: 콜롬비아, 코스타리카, 온두라스, 니카라과",
      "파생 품종: 카투아이(Catuai) — 카투라 × 문도 노보(Mundo Novo) 교배종",
    ],
    tags: ["카투라", "왜소형", "중미", "감귤산미", "실용품종"],
  },
  {
    id: "robusta-species",
    category: "커피품종",
    emoji: "💪",
    title: "로부스타 (Coffea canephora)",
    subtitle: "강인한 생명력과 높은 카페인의 두 번째 커피 종",
    description: "콩고 분지를 원산지로 하는 두 번째로 많이 재배되는 커피 종입니다. 전 세계 생산량의 약 30~40%를 차지하며, 병충해에 강하고 수확량이 높아 에스프레소 블렌드·인스턴트 커피에 주로 활용됩니다.",
    details: [
      "원산지: 중앙아프리카 콩고 분지 (해발 0~600m 저지대)",
      "카페인 함량: 2.2~2.7% — 아라비카의 약 2배, 자연 병충해 억제제 역할",
      "염색체 수: 22개(2배체) — 아라비카보다 단순한 유전 구조",
      "풍미: 강한 쓴맛, 흙·목재·고무 향, 아라비카보다 현저히 낮은 산미",
      "에스프레소 역할: 블렌드 첨가 시 크레마(Crema)를 풍부하고 지속적으로 만들어줌",
      "주요 생산국: 베트남(세계 최대 로부스타 생산국), 우간다, 인도네시아, 브라질",
    ],
    tags: ["로부스타", "카네포라", "고카페인", "크레마", "베트남", "인스턴트"],
  },
  {
    id: "liberica-species",
    category: "커피품종",
    emoji: "🌺",
    title: "리베리카 (Coffea liberica)",
    subtitle: "세계 생산량 2% 미만의 희귀한 세 번째 커피 종",
    description: "서아프리카 라이베리아가 원산지인 세 번째 커피 종으로 세계 생산량의 2% 미만을 차지합니다. 식물과 체리가 매우 크고, 아라비카·로부스타와 전혀 다른 독특한 풍미로 호불호가 강합니다.",
    details: [
      "식물 특성: 키 9~18m까지 자라는 대형 수목, 잎·체리·씨앗 모두 매우 큰 편",
      "체리 형태: 비대칭적이고 불규칙한 모양, 과육이 두껍고 씨앗이 큼",
      "풍미: 과일향·꽃향기·나무향·훈제향이 혼합된 독특한 맛, 매우 강한 개성",
      "재배 조건: 고온다습한 저지대, 병충해에 비교적 강하고 가뭄에도 견딤",
      "주요 생산국: 필리핀, 말레이시아, 인도네시아 서칼리만탄",
      "필리핀: '카펭 바라코(Kapeng Barako)'로 불리며 국민 커피로 사랑받음",
    ],
    tags: ["리베리카", "희귀종", "카펭바라코", "필리핀", "독특한향"],
  },

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
    tags: ["균형감", "캐러멜", "헤이즐넛", "미디엄로스트"],
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
    title: "게이샤 (Geisha) — 산지 이야기",
    subtitle: "파나마 경매로 세상에 알려진 커피의 전설",
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
      "블렌드: 연중 일정한 맛 유지, 카페 시그니처 메뉴에 적합",
      "마이크로랏(Micro-lot): 단일 농장의 특정 구역에서 소량 생산",
      "내추럴 처리법 싱글 오리진은 과일향이 극대화됨",
    ],
    tags: ["싱글오리진", "블렌드", "테루아", "마이크로랏"],
  },

  /* ── 브루잉 ── */
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

  /* ── 로스팅 8단계 ── */
  {
    id: "roast-light",
    category: "로스팅",
    emoji: "🌾",
    title: "① 라이트 (Light Roast)",
    subtitle: "1차 크랙 이전 · 원산지 테루아가 가장 선명한 단계",
    description: "1차 크랙(First Crack)이 시작되기 전에 꺼내는 가장 연한 로스팅입니다. 원두 본연의 산지 특성이 가장 강하게 표현되며, 과일·허브·꽃향기 같은 섬세하고 복잡한 향미가 돋보입니다.",
    details: [
      "온도: 약 190~196°C / 375~385°F",
      "크랙: 1차 크랙 이전 — 팝핑 소리 없음",
      "색상: 매우 연한 베이지~밀짚색 (탄 색조)",
      "표면: 완전히 건조, 기름기 전혀 없음",
      "산미 ★★★★★  바디 ★☆☆☆☆  단맛 ★☆☆☆☆  쓴맛 ☆☆☆☆☆",
      "맛: 곡물향·풀향·밝은 과일 산미, 차(Tea)처럼 가벼운 질감, 쓴맛 거의 없음",
      "추출 적합: 핸드드립 V60, 에어로프레스 (섬세한 향미 표현에 최적)",
    ],
    tags: ["라이트로스트", "1단계", "1차크랙이전", "강산미", "테루아"],
  },
  {
    id: "roast-cinnamon",
    category: "로스팅",
    emoji: "🍂",
    title: "② 시나몬 (Cinnamon Roast)",
    subtitle: "1차 크랙 시작 · 밝고 생동감 넘치는 산미",
    description: "1차 크랙이 막 시작되는 시점에 꺼내는 단계입니다. 시나몬 스틱과 닮은 연한 갈색이 특징이며, 매우 밝은 산미와 함께 과일·꽃향기가 두드러집니다. 산지 특성이 강하게 표현됩니다.",
    details: [
      "온도: 약 196~204°C / 385~400°F",
      "크랙: 1차 크랙 시작 (팝콘처럼 튀는 소리 시작)",
      "색상: 연한 갈색 (시나몬 스틱 색)",
      "표면: 건조, 기름기 없음",
      "산미 ★★★★★  바디 ★★☆☆☆  단맛 ★★☆☆☆  쓴맛 ★☆☆☆☆",
      "맛: 밝은 감귤류 산미, 녹차·허브향, 과일의 상큼함, 단맛 서서히 시작",
      "추출 적합: 핸드드립 V60·케멕스 (섬세한 향미 강조)",
    ],
    tags: ["시나몬로스트", "2단계", "1차크랙초반", "강산미", "과일향"],
  },
  {
    id: "roast-medium",
    category: "로스팅",
    emoji: "☀️",
    title: "③ 미디엄 (Medium Roast)",
    subtitle: "1차 크랙 완료 · 가장 균형 잡힌 '아메리칸 로스트'",
    description: "1차 크랙이 모두 끝난 후 꺼내는 단계입니다. 산미·바디·단맛이 균형을 이루어 '아메리칸 로스트'라고도 불리며, 원산지 특성과 로스팅 특성이 함께 느껴지는 가장 대중적인 단계입니다.",
    details: [
      "온도: 약 204~210°C / 400~410°F",
      "크랙: 1차 크랙 완료 후, 2차 크랙 이전",
      "색상: 중간 갈색 (밀크 초콜릿색)",
      "표면: 건조, 기름기 거의 없음",
      "산미 ★★★☆☆  바디 ★★★☆☆  단맛 ★★★☆☆  쓴맛 ★★☆☆☆",
      "맛: 균형잡힌 산미와 단맛, 견과류·캐러멜·초콜릿 힌트, 부드러운 마무리",
      "추출 적합: 핸드드립, 드립 머신, 에어로프레스 (범용적)",
    ],
    tags: ["미디엄로스트", "3단계", "1차크랙완료", "균형", "아메리칸로스트"],
  },
  {
    id: "roast-high",
    category: "로스팅",
    emoji: "🌤️",
    title: "④ 하이 (High Roast)",
    subtitle: "1~2차 크랙 사이 · 캐러멜화가 본격화되는 단계",
    description: "1차와 2차 크랙 사이 구간으로, 당분의 캐러멜화가 본격적으로 진행되는 단계입니다. 산미가 줄고 단맛과 바디감이 풍부해지며 쓴맛이 서서히 등장합니다.",
    details: [
      "온도: 약 210~220°C / 410~428°F",
      "크랙: 1차 크랙 완료 후 ~ 2차 크랙 이전 중반",
      "색상: 중간~짙은 갈색",
      "표면: 아주 약간의 기름기 시작 가능",
      "산미 ★★☆☆☆  바디 ★★★★☆  단맛 ★★★★☆  쓴맛 ★★★☆☆",
      "맛: 버터스카치·캐러멜 단맛 두드러짐, 다크 과일향, 쓴맛 증가 시작",
      "추출 적합: 핸드드립, 에스프레소 블렌드 (단맛 강조)",
    ],
    tags: ["하이로스트", "4단계", "캐러멜화", "단맛증가", "바디풍부"],
  },
  {
    id: "roast-city",
    category: "로스팅",
    emoji: "🏙️",
    title: "⑤ 시티 (City Roast)",
    subtitle: "2차 크랙 직전 · 에스프레소 영역의 시작",
    description: "2차 크랙(Second Crack) 직전에 꺼내는 단계로, 에스프레소에 많이 사용되는 범위의 시작점입니다. 초콜릿과 캐러멜의 진한 풍미가 나오면서도 원산지 특성이 어느 정도 남아있습니다.",
    details: [
      "온도: 약 220~225°C / 428~437°F",
      "크랙: 2차 크랙 직전 (조용한 대기 상태)",
      "색상: 짙은 갈색 (다크 초콜릿색)",
      "표면: 약간의 기름기 시작",
      "산미 ★☆☆☆☆  바디 ★★★★☆  단맛 ★★★☆☆  쓴맛 ★★★☆☆",
      "맛: 다크 초콜릿, 캐러멜화된 단맛, 견과류, 적절한 쓴맛의 균형",
      "추출 적합: 에스프레소, 핸드드립, 프렌치프레스 (에스프레소 입문 단계)",
    ],
    tags: ["시티로스트", "5단계", "2차크랙직전", "에스프레소", "다크초콜릿"],
  },
  {
    id: "roast-full-city",
    category: "로스팅",
    emoji: "🌇",
    title: "⑥ 풀시티 (Full City Roast)",
    subtitle: "2차 크랙 시작 · 에스프레소 블렌드의 핵심 단계",
    description: "2차 크랙이 시작되는 단계로 에스프레소 블렌드에 가장 많이 사용됩니다. 표면에 기름기가 뚜렷하게 나타나고, 산미는 거의 사라지며 진한 초콜릿·스모키 풍미가 등장합니다.",
    details: [
      "온도: 약 225~230°C / 437~446°F",
      "크랙: 2차 크랙 시작 (딱딱 터지는 소리)",
      "색상: 짙은 갈색~매우 짙은 갈색",
      "표면: 기름기가 뚜렷하게 배어나와 광택 시작",
      "산미 ☆☆☆☆☆  바디 ★★★★★  단맛 ★★☆☆☆  쓴맛 ★★★★☆",
      "맛: 진한 다크 초콜릿, 가벼운 스모키향, 캐러멜화된 당분, 강한 쓴맛",
      "추출 적합: 에스프레소, 모카포트, 프렌치프레스 (에스프레소의 클래식 범위)",
    ],
    tags: ["풀시티로스트", "6단계", "2차크랙시작", "에스프레소블렌드", "기름기"],
  },
  {
    id: "roast-french",
    category: "로스팅",
    emoji: "🌑",
    title: "⑦ 프렌치 (French Roast)",
    subtitle: "2차 크랙 진행 중 · 강렬하고 스모키한 맛",
    description: "2차 크랙이 활발하게 진행되는 단계입니다. 원두 표면이 기름으로 반짝이고 색은 거의 검은색에 가깝습니다. 산지 원두의 개성은 거의 사라지고 로스팅 자체의 강렬한 스모키·쓴 맛이 지배합니다.",
    details: [
      "온도: 약 230~235°C / 446~455°F",
      "크랙: 2차 크랙 활발히 진행 중",
      "색상: 매우 짙은 갈색 (거의 검은색)",
      "표면: 기름이 풍부하게 배어나와 강하게 반짝임",
      "산미 ☆☆☆☆☆  바디 ★★★★★  단맛 ★☆☆☆☆  쓴맛 ★★★★★",
      "맛: 강한 쓴맛, 스모키·탄향, 매콤한 여운, 원산지 특성 거의 사라짐",
      "추출 적합: 에스프레소, 카페라떼·카푸치노 등 우유 비율 높은 음료",
    ],
    tags: ["프렌치로스트", "7단계", "2차크랙진행", "스모키", "강쓴맛"],
  },
  {
    id: "roast-italian",
    category: "로스팅",
    emoji: "⬛",
    title: "⑧ 이탈리안 (Italian Roast)",
    subtitle: "2차 크랙 완료 후 · 로스팅의 최고 극한 단계",
    description: "2차 크랙이 완전히 끝난 후까지 로스팅하는 가장 어두운 단계입니다. 원두는 검은색에 가깝고 기름으로 완전히 뒤덮입니다. 이 이상 로스팅하면 탄화되므로 사실상 한계 단계이며, 이탈리아 전통 에스프레소 스타일에 사용됩니다.",
    details: [
      "온도: 약 240~245°C / 464~473°F (이 이상은 탄화 위험)",
      "크랙: 2차 크랙 완전히 종료된 이후",
      "색상: 검은색 (탄화 직전 최대 암도)",
      "표면: 매우 풍부한 기름기, 강한 유리 광택",
      "산미 ☆☆☆☆☆  바디 ★★★★★  단맛 ☆☆☆☆☆  쓴맛 ★★★★★",
      "맛: 극도로 강한 쓴맛, 탄맛·스모키, 매운 여운, 당분 모두 연소로 단맛 없음",
      "추출 적합: 전통 이탈리아 에스프레소, 우유 비율이 높은 음료 (쓴맛 희석 필요)",
    ],
    tags: ["이탈리안로스트", "8단계", "2차크랙완료", "극강쓴맛", "탄향", "전통에스프레소"],
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

const CATEGORIES = ["커피품종", "원두 & 산지", "브루잉", "맛 & 향", "로스팅", "음료"];

const CATEGORY_COLORS: Record<string, string> = {
  "커피품종":    "bg-teal-900/40 text-teal-300 border-teal-700/40",
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
  const [activeCategory, setActive] = useState("커피품종");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return ENTRIES.filter(e => {
      const matchCat = !activeCategory || e.category === activeCategory;
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
          <p className="cormorant text-[#FCF5E5]/50 text-sm font-light max-w-xl mx-auto leading-relaxed">
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
              onClick={() => setActive(prev => prev === cat ? "" : cat)}
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
