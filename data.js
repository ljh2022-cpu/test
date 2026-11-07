// ============================================================
// 장소 데이터 (샘플). 실제 조사 데이터로 교체하세요.
// ⚠ 아래 15곳은 "구조 시연용 가상 샘플"입니다. 실제 가게 정보가 아닙니다.
//
// 필드 설명
//  type    : 'meal'(식사) | 'cafe'(카페·디저트) | 'activity'(체험·공방·시장)
//  area    : 'hanok'(한옥마을 안) | 'out'(한옥마을 밖)   ← "밖"의 정의는 팀이 확정 후 적용
//  x, y    : 한옥마을 중심(0,0) 기준 km 좌표 (실제로는 위·경도 → 거리 계산으로 교체)
//  open/close : 영업시간 'HH:MM'
//  closed  : 휴무 요일 (0=일 ... 6=토)
//  stay    : 예상 체류시간(분)
//  indoor  : 실내 여부
//  menus   : 식사 장소만. ing = 재료 배열, ing:null 이면 "재료 데이터 없음" → 절대 '가능' 아님
//    재료 키: meat(소·닭·양 등 육류) pork fish(생선·멸치육수 포함) shellfish egg dairy honey peanut alcohol
//  verified: true 이면 출처 "가게 확인(checked 날짜)", false 이면 "AI 추정"
// ============================================================
var PLACES = [
  // ---------- 식사 8 (한옥마을 안 2 / 밖 6) ----------
  { id:'m1', type:'meal', area:'hanok', name:'샘플 전통 비빔밥집', en:'Sample Traditional Bibimbap', x:0.1, y:0.1,
    open:'10:30', close:'20:30', closed:[], stay:60, indoor:true, checked:'2026-10-01',
    menus:[
      { ko:'전주 비빔밥', en:'Jeonju Bibimbap', ing:['meat','egg'], verified:false },
      { ko:'산채 비빔밥', en:'Mountain-herb Bibimbap', ing:[], verified:false }
    ]},
  { id:'m2', type:'meal', area:'hanok', name:'샘플 콩나물국밥집', en:'Sample Bean-sprout Soup', x:-0.2, y:0.2,
    open:'08:00', close:'21:00', closed:[], stay:45, indoor:true, checked:'2026-10-01',
    menus:[
      { ko:'콩나물국밥', en:'Bean-sprout Soup Rice', ing:['fish','egg'], verified:false },
      { ko:'오늘의 추가 메뉴', en:"Today's special", ing:null, verified:false }
    ]},
  { id:'m3', type:'meal', area:'out', name:'샘플 채식 식당', en:'Sample Vegan Kitchen', x:-1.0, y:0.8,
    open:'11:00', close:'20:30', closed:[1], stay:60, indoor:true, checked:'2026-10-01',
    menus:[
      { ko:'비건 쌈밥 정식', en:'Vegan Ssam Set', ing:[], verified:false },
      { ko:'두부 스테이크', en:'Tofu Steak', ing:['peanut'], verified:false }
    ]},
  { id:'m4', type:'meal', area:'out', name:'샘플 한정식집', en:'Sample Korean Table d\'hote', x:-1.3, y:0.4,
    open:'11:30', close:'21:00', closed:[0], stay:75, indoor:true, checked:'2026-10-01',
    menus:[
      { ko:'한정식 A', en:'Korean Set A', ing:['meat','pork','fish','egg','alcohol'], verified:false },
      { ko:'두부·나물 정식', en:'Tofu & Namul Set', ing:['fish'], verified:false }
    ]},
  { id:'m5', type:'meal', area:'out', name:'샘플 중동 음식점', en:'Sample Middle-Eastern Grill', x:-0.7, y:1.4,
    open:'11:00', close:'22:00', closed:[], stay:60, indoor:true, checked:'2026-10-01',
    menus:[
      { ko:'팔라펠 플레이트', en:'Falafel Plate', ing:[], verified:false },
      { ko:'양고기 케밥', en:'Lamb Kebab', ing:['meat'], verified:false },
      { ko:'치킨 라이스', en:'Chicken Rice', ing:['meat','dairy'], verified:false }
    ]},
  { id:'m6', type:'meal', area:'out', name:'샘플 칼국수집', en:'Sample Kalguksu', x:-1.6, y:1.0,
    open:'10:30', close:'19:30', closed:[2], stay:45, indoor:true, checked:'2026-10-01',
    menus:[
      { ko:'바지락 칼국수', en:'Clam Kalguksu', ing:['fish','shellfish'], verified:false },
      { ko:'비빔국수', en:'Spicy Cold Noodles', ing:['egg'], verified:false }
    ]},
  { id:'m7', type:'meal', area:'out', name:'샘플 시장 분식', en:'Sample Market Snack Bar', x:-0.9, y:-0.9,
    open:'09:00', close:'20:00', closed:[], stay:40, indoor:false, checked:'2026-10-01',
    menus:[
      { ko:'야채김밥', en:'Veggie Gimbap', ing:['egg'], verified:false },
      { ko:'떡볶이', en:'Tteokbokki', ing:['fish'], verified:false },
      { ko:'모듬 튀김', en:'Mixed Fry', ing:['shellfish','egg'], verified:false }
    ]},
  { id:'m8', type:'meal', area:'out', name:'샘플 양식 레스토랑', en:'Sample Western Bistro', x:-1.2, y:1.6,
    open:'11:30', close:'22:00', closed:[1], stay:75, indoor:true, checked:'2026-10-01',
    menus:[
      { ko:'가든 샐러드', en:'Garden Salad', ing:[], verified:false },
      { ko:'새우 파스타', en:'Shrimp Pasta', ing:['shellfish','dairy'], verified:false },
      { ko:'땅콩소스 샐러드', en:'Peanut-sauce Salad', ing:['peanut'], verified:false }
    ]},

  // ---------- 카페·디저트 3 ----------
  { id:'c1', type:'cafe', area:'hanok', name:'샘플 전통 찻집', en:'Sample Traditional Tea House', x:0.2, y:-0.1,
    open:'10:00', close:'21:00', closed:[], stay:50, indoor:true, checked:'2026-10-01' },
  { id:'c2', type:'cafe', area:'out', name:'샘플 로스터리 카페', en:'Sample Roastery Cafe', x:-1.1, y:1.1,
    open:'10:00', close:'22:00', closed:[], stay:60, indoor:true, checked:'2026-10-01' },
  { id:'c3', type:'cafe', area:'out', name:'샘플 수제 디저트 가게', en:'Sample Dessert Shop', x:-0.8, y:0.6,
    open:'11:00', close:'21:30', closed:[2], stay:45, indoor:true, checked:'2026-10-01' },

  // ---------- 체험·공방·시장 4 ----------
  { id:'a1', type:'activity', area:'hanok', name:'샘플 한복·전통 체험관', en:'Sample Hanbok Experience', x:0.0, y:0.0,
    open:'10:00', close:'18:00', closed:[], stay:60, indoor:true, checked:'2026-10-01' },
  { id:'a2', type:'activity', area:'out', name:'샘플 한지·도자기 공방', en:'Sample Hanji & Pottery Studio', x:-1.4, y:0.9,
    open:'10:00', close:'17:30', closed:[1], stay:90, indoor:true, checked:'2026-10-01' },
  { id:'a3', type:'activity', area:'out', name:'샘플 남부시장 구경', en:'Sample Traditional Market Walk', x:-0.9, y:-1.0,
    open:'09:00', close:'20:00', closed:[], stay:60, indoor:false, checked:'2026-10-01' },
  { id:'a4', type:'activity', area:'out', name:'샘플 원도심 야경 산책', en:'Sample Old-town Night Walk', x:-1.2, y:1.3,
    open:'00:00', close:'23:59', closed:[], stay:60, indoor:false, checked:'2026-10-01' }
];

// 한옥마을 기준점 (대략값. 팀이 "한옥마을 밖" 정의를 확정하면 함께 조정)
var HANOK = { lat: 35.8149, lng: 127.1530 };

// 좌표 정규화: 실제 데이터는 lat/lng만 넣으면 됩니다 (x, y는 자동 계산).
// 샘플은 x, y(km)만 있으므로 lat/lng를 역산합니다 (가상 위치).
PLACES.forEach(function (p) {
  var kx = 111.32 * Math.cos(HANOK.lat * Math.PI / 180), ky = 110.57;
  if (typeof p.lat === 'number' && typeof p.lng === 'number') {
    p.x = (p.lng - HANOK.lng) * kx;
    p.y = (p.lat - HANOK.lat) * ky;
  } else {
    p.lat = HANOK.lat + p.y / ky;
    p.lng = HANOK.lng + p.x / kx;
  }
});

// 숙박 권역 안내 (샘플 문구. 데이터 출처 미정)
var STAY_ZONES = [
  { ko:'원도심 일대 (샘플)', en:'Old-town area (sample)', note_ko:'다음 날 오전 루트와 가까움', note_en:'Close to next-morning route' },
  { ko:'전주역 인근 (샘플)', en:'Near Jeonju Station (sample)', note_ko:'귀가 시 이동이 편함', note_en:'Easy departure by train' }
];
