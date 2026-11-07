/* 전주 맞춤밥상 MVP — 루트 생성 + 식이 판정 (DOM 없이도 plan()은 동작) */

var T = {
  ko: {
    mapTitle:'루트 약도', mapNote:'지도 위 장소는 가상 샘플이라 위치가 임의입니다. 검정 핀은 한옥마을 밖, 흰 핀은 안.',
    title:'전주 맞춤밥상', hero:'오늘 전주,<br>어디까지 가봤어?', sub:'일행 누구도 빠지지 않는 전주 하루 체류 루트',
    sampleBanner:'⚠ 현재 장소 15곳은 구조 시연용 가상 샘플입니다. 실제 조사 데이터(data.js)로 교체해야 합니다.',
    date:'방문 날짜', arrive:'도착 시간', depart:'출발 시간', mode:'이동 수단', walk:'도보', car:'차', lang:'언어',
    people:'인원별 식이 조건', addPerson:'+ 인원 추가', person:'인원', remove:'삭제',
    vegan:'비건', halal:'할랄', peanut:'땅콩', shellfish:'갑각류',
    indoor:'실내 위주', make:'루트 만들기', exA:'예시 A (커플·도보)', exB:'예시 B (할랄 포함·영어)',
    mStay:'예상 체류시간', mOut:'한옥마을 밖 비중', mShops:'들르는 지역 가게',
    shops:'곳', hour:'시간', min:'분',
    allergy:'참고용입니다. 알레르기가 있다면 주문 전 직원에게 꼭 확인하세요.',
    stale:'정보가 오래되었을 수 있음', gap:'추천할 곳이 부족합니다 — 비는 시간', moveMin:'이동',
    ok:'가능', unsure:'불확실', no:'불가', noMeal:'(조건에 맞는 메뉴 없음)',
    src_ai:'AI 추정', src_shop:'가게 확인', order:'주문 문장',
    hanokIn:'한옥마을', hanokOut:'한옥마을 밖',
    type_meal:'식사', type_cafe:'카페·디저트', type_activity:'체험·시장',
    nextDay:'하루 더 머물면?', nextDayTitle:'다음 날 오전 루트', stayZone:'숙박할 만한 권역',
    totalStay:'1박 합산 예상 체류시간', nextEmpty:'다음 날 오전에 추천할 곳이 부족합니다.',
    noData:'재료 데이터 없음', ingredients:'재료', day2:'다음 날',
    shortRoute:'남은 시간이 2시간 이하여서 가까운 곳만 짧게 제안합니다.',
    ing:{meat:'육류',pork:'돼지고기',fish:'생선/멸치육수',shellfish:'갑각류',egg:'달걀',dairy:'유제품',honey:'꿀',peanut:'땅콩',alcohol:'술'},
    why_halalMeat:'육류 포함 — 도축 방식 확인 필요', why_contains:'포함: ',
    ph:{ vegan:'고기, 생선, 달걀, 유제품이 들어가지 않은 메뉴인가요?', halal:'돼지고기와 술이 들어가지 않은 메뉴인가요?',
         peanut:'땅콩 알레르기가 있어요. 땅콩이 들어갔나요?', shellfish:'갑각류(새우, 게) 알레르기가 있어요. 들어갔나요?' },
    orderIt:'주문할게요.'
  },
  en: {
    mapTitle:'Route map', mapNote:'Places on the map are fictional samples with arbitrary positions. Black pin = outside Hanok Village, white = inside.',
    title:'Jeonju Custom Table', hero:'Jeonju today,<br>how far will you go?', sub:'A Jeonju day route where nobody in your group is left out',
    sampleBanner:'⚠ The 15 places are fictional samples to demo the structure. Replace them with real surveyed data (data.js).',
    date:'Date', arrive:'Arrival', depart:'Departure', mode:'Getting around', walk:'Walk', car:'Car', lang:'Language',
    people:'Dietary needs per person', addPerson:'+ Add person', person:'Person', remove:'Remove',
    vegan:'Vegan', halal:'Halal', peanut:'Peanut', shellfish:'Shellfish',
    indoor:'Indoor only', make:'Build route', exA:'Example A (couple, walking)', exB:'Example B (halal, English)',
    mStay:'Est. time in Jeonju', mOut:'Outside Hanok Village', mShops:'Local shops visited',
    shops:'', hour:'h', min:'min',
    allergy:'For reference only. If you have an allergy, always confirm with staff before ordering.',
    stale:'Info may be outdated', gap:'Not enough places to recommend — free time', moveMin:'travel',
    ok:'OK', unsure:'Unsure', no:'No', noMeal:'(no matching dish)',
    src_ai:'AI estimate', src_shop:'Shop-confirmed', order:'Order phrase',
    hanokIn:'Hanok Village', hanokOut:'Outside Hanok',
    type_meal:'Meal', type_cafe:'Cafe / dessert', type_activity:'Activity / market',
    nextDay:'Stay one more day?', nextDayTitle:'Next-morning route', stayZone:'Where to stay',
    totalStay:'Total time with overnight stay', nextEmpty:'Not enough places to recommend for the next morning.',
    noData:'No ingredient data', ingredients:'Ingredients', day2:'Next day',
    shortRoute:'Two hours or less left, so only a few nearby stops are suggested.',
    ing:{meat:'meat',pork:'pork',fish:'fish/anchovy stock',shellfish:'shellfish',egg:'egg',dairy:'dairy',honey:'honey',peanut:'peanut',alcohol:'alcohol'},
    why_halalMeat:'Contains meat — slaughter method unknown', why_contains:'Contains: ',
    ph:{ vegan:'Does this dish contain meat, fish, egg or dairy?', halal:'Does this dish contain pork or alcohol?',
         peanut:'I have a peanut allergy. Does it contain peanuts?', shellfish:'I have a shellfish allergy. Does it contain shrimp or crab?' },
    orderIt:''
  }
};

/* ---------- 유틸 ---------- */
function toMin(s){ var p=s.split(':'); return +p[0]*60 + +p[1]; }
function fmt(m){ var h=Math.floor(m/60), mm=m%60; return (h<10?'0':'')+h+':'+(mm<10?'0':'')+mm; }
function weekday(dateStr){ return new Date(dateStr+'T00:00:00').getDay(); }
function addDays(dateStr,n){ var d=new Date(dateStr+'T00:00:00'); d.setDate(d.getDate()+n); var z=function(v){return (v<10?'0':'')+v;}; return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate()); }

function travelMin(a,b,mode){
  if(!a) return 15; // 첫 이동: 전주역/터미널 → 첫 장소 (고정 가정)
  var d=Math.hypot(a.x-b.x,a.y-b.y);
  return Math.round(mode==='walk' ? d*1.3/4.5*60 : 5 + d*1.4/25*60);
}
var WALK_MAX=25;

/* ---------- 식이 판정 ---------- */
var RANK={ok:0,unsure:1,no:2};
// diets: ['vegan','halal','peanut','shellfish'] 중 0개 이상. 반환 {s:'ok'|'unsure'|'no', reasons:[]}
function judgeMenu(menu, diets){
  if(!menu.ing) return {s:'unsure', reasons:['noData']}; // 재료 데이터 없으면 절대 '가능' 아님
  var worst='ok', reasons=[];
  function bump(s){ if(RANK[s]>RANK[worst]) worst=s; }
  function has(arr){ return arr.filter(function(k){return menu.ing.indexOf(k)>=0;}); }
  diets.forEach(function(d){
    var hit;
    if(d==='vegan'){ hit=has(['meat','pork','fish','shellfish','egg','dairy','honey']); if(hit.length){bump('no'); reasons.push({c:hit});} }
    else if(d==='halal'){
      hit=has(['pork','alcohol']); if(hit.length){bump('no'); reasons.push({c:hit});}
      else if(menu.ing.indexOf('meat')>=0){ bump('unsure'); reasons.push('halalMeat'); }
    }
    else if(d==='peanut'){ hit=has(['peanut']); if(hit.length){bump('no'); reasons.push({c:hit});} }
    else if(d==='shellfish'){ hit=has(['shellfish']); if(hit.length){bump('no'); reasons.push({c:hit});} }
  });
  return {s:worst, reasons:reasons};
}
// 한 장소에서 한 사람의 판정 = 메뉴들 중 가장 나은 것
function judgePerson(place, diets){
  var best=null, oks=[];
  place.menus.forEach(function(m){
    var j=judgeMenu(m,diets); j.menu=m;
    if(j.s==='ok') oks.push(m);
    if(!best || RANK[j.s]<RANK[best.s]) best=j;
  });
  return {s:best?best.s:'no', best:best, oks:oks};
}
function placeOkForAll(place, people){
  return people.every(function(p){ return judgePerson(place,p).s==='ok'; });
}

/* ---------- 루트 생성 ---------- */
var LUNCH=[11*60, 14*60+30], DINNER=[17*60+30, 20*60+30];

// opts: {date, arrive:'HH:MM', depart:'HH:MM', mode, people:[[diets]...], indoorOnly, exclude:[ids]}
function plan(opts){
  var arr=toMin(opts.arrive), dep=toMin(opts.depart), dow=weekday(opts.date);
  var cursor=arr, last=null, lastType=null, stops=[], gaps=[], used={};
  (opts.exclude||[]).forEach(function(id){used[id]=1;});
  var hadLunch=false, hadDinner=false;
  var maxStops=(dep-arr<=120)?3:99;
  var short=(dep-arr<=120);

  function candidates(types){
    var out=[];
    PLACES.forEach(function(p){
      if(used[p.id] || types.indexOf(p.type)<0) return;
      if(p.closed.indexOf(dow)>=0) return;
      if(opts.indoorOnly && !p.indoor) return;
      if(p.type==='meal' && !placeOkForAll(p,opts.people)) return;
      var tv=travelMin(last,p,opts.mode);
      if(last && opts.mode==='walk' && tv>WALK_MAX) return;
      var start=Math.max(cursor+tv, toMin(p.open));
      if(start-(cursor+tv)>30) return;               // 개점까지 30분 넘게 기다려야 하면 제외
      var end=start+p.stay;
      if(end>toMin(p.close) || end>dep) return;      // 영업시간·출발시간 안에 끝나야 함
      var score=(p.area==='out'?3:0) - tv/10;
      // 늦게까지 여는 장소는 저녁 이후를 위해 남겨 둔다 (낮 시간대에는 감점)
      if(p.type!=='meal' && start<17*60) score -= Math.max(0,(toMin(p.close)-20*60)/60)*2;
      out.push({p:p,tv:tv,start:start,end:end,score:score});
    });
    out.sort(function(a,b){return b.score-a.score;});
    return out;
  }

  var guard=0;
  while(cursor<dep-30 && stops.length<maxStops && guard++<100){
    var prefs;
    var inLunch=!hadLunch && cursor>=LUNCH[0]-30 && cursor<LUNCH[1];
    var inDinner=!hadDinner && cursor>=DINNER[0]-30 && cursor<DINNER[1];
    if(inLunch||inDinner) prefs=[['meal'],['cafe','activity']];
    else if(cursor>=20*60) prefs=[['cafe','activity']];
    else if(lastType==='meal'||lastType==='activity') prefs=[['cafe'],['activity']];
    else prefs=[['activity'],['cafe']];

    var pick=null;
    for(var i=0;i<prefs.length&&!pick;i++){ var c=candidates(prefs[i]); if(c.length) pick=c[0]; }
    // 식사 시간대에 식사가 없으면, 그 시간대를 포기하고 다른 걸로 이어가되(식사 누락은 gap 아님) 조건은 완화하지 않음
    if(!pick){
      var g=gaps[gaps.length-1];
      if(g && g.to===cursor) g.to=cursor+30; else gaps.push({from:cursor,to:cursor+30});
      cursor+=30; continue;
    }
    if(pick.p.type==='meal'){ if(cursor<LUNCH[1]+60 && pick.start<DINNER[0]-30) hadLunch=true; else hadDinner=true; }
    stops.push({place:pick.p, travel:pick.tv, start:pick.start, end:pick.end});
    used[pick.p.id]=1; last=pick.p; lastType=pick.p.type; cursor=pick.end;
  }
  if(!short && dep-cursor>60){ // 마지막 장소 이후 1시간 넘게 비면 gap
    var g2=gaps[gaps.length-1];
    if(g2 && g2.to>=cursor) g2.to=dep; else gaps.push({from:cursor,to:dep});
  }
  // 앞쪽에서 비어버린 구간 중 30분 단위 조각 병합 이미 처리됨
  var total=stops.reduce(function(s,x){return s+x.travel+(x.end-x.start);},0);
  var out=stops.filter(function(x){return x.place.area==='out';}).length;
  return {stops:stops, gaps:gaps, stayMin:total, outCount:out, outRatio:stops.length?Math.round(out/stops.length*100):0, shopCount:stops.length, short:short, date:opts.date, arrive:arr, depart:dep};
}

/* ================= 화면 ================= */
var state={ people:[[]], lang:'ko' };
var lastResult=null, lastOpts=null;

if(typeof document!=='undefined'){
  var $=function(id){return document.getElementById(id);};
  var t=function(){return T[state.lang];};

  function today(){ var d=new Date(), z=function(v){return (v<10?'0':'')+v;}; return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate()); }

  function renderStatic(){
    var L=t();
    $('title').textContent=L.title; $('hero').innerHTML=L.hero; $('sub').textContent=L.sub; $('banner').textContent=L.sampleBanner;
    $('lbDate').textContent=L.date; $('lbArr').textContent=L.arrive; $('lbDep').textContent=L.depart;
    $('lbMode').textContent=L.mode; $('lbLang').textContent=L.lang;
    $('optWalk').textContent=L.walk; $('optCar').textContent=L.car;
    $('lbPeople').textContent=L.people; $('btnAdd').textContent=L.addPerson;
    $('lbIndoor').textContent=L.indoor; $('btnMake').textContent=L.make;
    $('btnA').textContent=L.exA; $('btnB').textContent=L.exB;
    renderPeople();
  }
  function renderPeople(){
    var L=t(), box=$('people'); box.innerHTML='';
    state.people.forEach(function(diets,i){
      var row=document.createElement('div'); row.className='person';
      var h='<b>'+L.person+' '+(i+1)+'</b>';
      ['vegan','halal','peanut','shellfish'].forEach(function(d){
        h+='<label class="chip"><input type="checkbox" data-i="'+i+'" data-d="'+d+'" '+(diets.indexOf(d)>=0?'checked':'')+'><span>'+L[d]+'</span></label>';
      });
      if(state.people.length>1) h+='<button class="link" data-rm="'+i+'">'+L.remove+'</button>';
      row.innerHTML=h; box.appendChild(row);
    });
    box.querySelectorAll('input[type=checkbox]').forEach(function(el){
      el.onchange=function(){
        var i=+el.dataset.i, d=el.dataset.d, a=state.people[i], k=a.indexOf(d);
        if(el.checked && k<0) a.push(d); if(!el.checked && k>=0) a.splice(k,1);
      };
    });
    box.querySelectorAll('[data-rm]').forEach(function(el){ el.onclick=function(){ state.people.splice(+el.dataset.rm,1); renderPeople(); }; });
  }

  function dur(m){ var L=t(), h=Math.floor(m/60), mm=m%60; return (h?h+L.hour+' ':'')+mm+L.min; }
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function placeName(p){ return state.lang==='en'?p.en:p.name; }
  function ingList(menu){
    var L=t(); if(!menu.ing) return L.noData;
    return menu.ing.length? menu.ing.map(function(k){return L.ing[k];}).join(', ') : '—';
  }
  function reasonText(j){
    var L=t(), out=[];
    j.reasons.forEach(function(r){
      if(r==='noData') out.push(L.noData);
      else if(r==='halalMeat') out.push(L.why_halalMeat);
      else out.push(L.why_contains+r.c.map(function(k){return L.ing[k];}).join(', '));
    });
    return out.join(' / ');
  }
  function srcText(menu,place){
    var L=t(); return menu.verified? L.src_shop+' ('+place.checked+')' : L.src_ai;
  }
  function staleBadge(place){
    var days=(Date.now()-new Date(place.checked).getTime())/86400000;
    return days>90? ' <span class="warn">'+esc(t().stale)+'</span>':'';
  }

  function mealHtml(place,people){
    var L=t(), h='<div class="verdicts">';
    people.forEach(function(diets,i){
      var jp=judgePerson(place,diets), cls=jp.s;
      var label=L[jp.s==='ok'?'ok':jp.s==='unsure'?'unsure':'no'];
      h+='<div class="vd '+cls+'"><span class="tag '+cls+'">'+L.person+' '+(i+1)+' · '+label+'</span> ';
      if(jp.s==='ok'){
        var m=jp.oks[0];
        h+='<b>'+esc(state.lang==='en'?m.en:m.ko)+'</b> <small>('+esc(L.ingredients)+': '+esc(ingList(m))+') · '+esc(srcText(m,place))+'</small>';
        var phKo=diets.map(function(d){return T.ko.ph[d];}).join(' ');
        h+='<div class="order">'+L.order+': “'+esc(m.ko)+' 주문할게요.'+(phKo?' '+esc(phKo):'')+'”';
        if(state.lang==='en'){
          var phEn=diets.map(function(d){return T.en.ph[d];}).join(' ');
          h+='<br><small>= “I\'d like the '+esc(m.en)+'.'+(phEn?' '+esc(phEn):'')+'”</small>';
        }
        h+='</div>';
      } else {
        h+='<small>'+esc(reasonText(jp.best))+'</small>';
      }
      h+='</div>';
    });
    return h+staleBadge(place)+'</div>';
  }

  function mapSvg(res){
    var L=t(), W=640, H=320, pad=44;
    if(!res.stops.length) return '';
    var pts=res.stops.map(function(s){return {x:s.place.x,y:s.place.y};}).concat([{x:0,y:0}]);
    var minX=Math.min.apply(null,pts.map(function(p){return p.x;})), maxX=Math.max.apply(null,pts.map(function(p){return p.x;}));
    var minY=Math.min.apply(null,pts.map(function(p){return p.y;})), maxY=Math.max.apply(null,pts.map(function(p){return p.y;}));
    var spanX=Math.max(maxX-minX,1), spanY=Math.max(maxY-minY,1);
    var k=Math.min((W-2*pad)/spanX,(H-2*pad)/spanY);
    var offX=(W-spanX*k)/2, offY=(H-spanY*k)/2;
    function px(x){return offX+(x-minX)*k;} function py(y){return H-(offY+(y-minY)*k);}
    var svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(L.mapTitle)+'" style="width:100%;height:auto;display:block;border-radius:12px;background:#fff">';
    for(var gx=0;gx<=W;gx+=64) svg+='<line x1="'+gx+'" y1="0" x2="'+gx+'" y2="'+H+'" stroke="#1A1A1A12"/>';
    for(var gy=0;gy<=H;gy+=64) svg+='<line x1="0" y1="'+gy+'" x2="'+W+'" y2="'+gy+'" stroke="#1A1A1A12"/>';
    svg+='<circle cx="'+px(0)+'" cy="'+py(0)+'" r="'+(0.5*k)+'" fill="#FFD84D55" stroke="#1A1A1A" stroke-dasharray="4 4"/>';
    svg+='<text x="'+px(0)+'" y="'+(py(0)+0.5*k+14)+'" text-anchor="middle" font-size="12" font-weight="700" fill="#1A1A1A">'+esc(L.hanokIn)+'</text>';
    var line=res.stops.map(function(s){return px(s.place.x)+','+py(s.place.y);}).join(' ');
    svg+='<polyline points="'+line+'" fill="none" stroke="#1A1A1A" stroke-width="3" stroke-dasharray="7 5" stroke-linejoin="round"/>';
    res.stops.forEach(function(s,i){
      var inH=s.place.area==='hanok', x=px(s.place.x), y=py(s.place.y);
      svg+='<g><circle cx="'+x+'" cy="'+y+'" r="13" fill="'+(inH?'#fff':'#1A1A1A')+'" stroke="#1A1A1A" stroke-width="2"/>'
         +'<text x="'+x+'" y="'+(y+5)+'" text-anchor="middle" font-size="13" font-weight="800" fill="'+(inH?'#1A1A1A':'#FFD84D')+'">'+(i+1)+'</text></g>';
    });
    var bar=1*k;
    svg+='<line x1="16" y1="'+(H-16)+'" x2="'+(16+bar)+'" y2="'+(H-16)+'" stroke="#1A1A1A" stroke-width="3"/>'
       +'<text x="'+(16+bar+6)+'" y="'+(H-12)+'" font-size="11" fill="#1A1A1A">1 km</text></svg>';
    return '<div class="mapbox"><div class="mapt">'+esc(L.mapTitle)+'</div>'+svg+'<small>'+esc(L.mapNote)+'</small></div>';
  }

  var pendingMaps=[], mapSeq=0;
  // 실제 지도(Leaflet + OpenStreetMap). 라이브러리를 못 불러오면(오프라인) 약도로 대체
  function mapHtml(res){
    if(!res.stops.length) return '';
    if(typeof L==='undefined' || !L.map) return mapSvg(res);
    var S=t(), id='lmap'+(++mapSeq);
    pendingMaps.push({id:id,res:res});
    return '<div class="mapbox"><div class="mapt">'+esc(S.mapTitle)+'</div><div class="lmap" id="'+id+'"></div><small>'+esc(S.mapNote)+'</small></div>';
  }
  function initMaps(){
    pendingMaps.splice(0).forEach(function(m){
      var el=document.getElementById(m.id); if(!el) return;
      var S=t(), map=L.map(el,{scrollWheelZoom:false});
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(map);
      var c=[HANOK.lat,HANOK.lng], pts=m.res.stops.map(function(s){return [s.place.lat,s.place.lng];});
      L.circle(c,{radius:500,color:'#1A1A1A',weight:1.5,dashArray:'4 4',fillColor:'#FFD84D',fillOpacity:0.35}).addTo(map).bindTooltip(S.hanokIn);
      L.polyline(pts,{color:'#1A1A1A',weight:3,dashArray:'7 5'}).addTo(map);
      m.res.stops.forEach(function(s,i){
        var inH=s.place.area==='hanok';
        L.marker(pts[i],{icon:L.divIcon({className:'',html:'<div class="pin '+(inH?'in':'out')+'">'+(i+1)+'</div>',iconSize:[26,26],iconAnchor:[13,13]})})
          .addTo(map).bindTooltip(placeName(s.place));
      });
      map.fitBounds(L.latLngBounds(pts.concat([c])),{padding:[30,30]});
    });
  }

  function routeHtml(res,people){
    var L=t(), items=[];
    res.stops.forEach(function(s){ items.push({k:'s',at:s.start,s:s}); });
    res.gaps.forEach(function(g){ items.push({k:'g',at:g.from,g:g}); });
    items.sort(function(a,b){return a.at-b.at;});
    var h='<ol class="route">';
    items.forEach(function(it){
      if(it.k==='g'){
        h+='<li class="gap">⏳ '+fmt(it.g.from)+'–'+fmt(it.g.to)+' · '+esc(L.gap)+' ('+dur(it.g.to-it.g.from)+')</li>'; return;
      }
      var s=it.s, p=s.place;
      h+='<li><div class="time">'+fmt(s.start)+'–'+fmt(s.end)+'</div><div class="body">'
       +'<div class="nm"><span class="num">'+(res.stops.indexOf(s)+1)+'</span>'+esc(placeName(p))+' <span class="tag t-'+p.type+'">'+L['type_'+p.type]+'</span> <span class="tag '+(p.area==='out'?'out':'in')+'">'+(p.area==='out'?L.hanokOut:L.hanokIn)+'</span></div>'
       +'<small>'+L.moveMin+' '+s.travel+L.min+' · '+dur(s.end-s.start)+'</small>'
       +(p.type==='meal'?mealHtml(p,people):'')
       +'</div></li>';
    });
    return h+'</ol>';
  }

  function show(){
    var L=t(), res=lastResult, people=lastOpts.people;
    var needAllergy=people.some(function(d){return d.indexOf('peanut')>=0||d.indexOf('shellfish')>=0;});
    var h='';
    if(needAllergy) h+='<div class="alert">⚠ '+esc(L.allergy)+'</div>';
    if(res.short) h+='<div class="note">'+esc(L.shortRoute)+'</div>';
    h+='<div class="metrics">'
      +'<div><span>'+L.mStay+'</span><b>'+dur(res.stayMin)+'</b></div>'
      +'<div><span>'+L.mOut+'</span><b>'+res.outRatio+'%</b></div>'
      +'<div><span>'+L.mShops+'</span><b>'+res.shopCount+L.shops+'</b></div></div>';
    h+=mapHtml(res)+routeHtml(res,people);
    h+='<button id="btnNext" class="primary alt">'+L.nextDay+'</button><div id="next"></div>';
    $('result').innerHTML=h;
    initMaps();
    $('btnNext').onclick=showNext;
  }

  function showNext(){
    var L=t(), r1=lastResult;
    var used=r1.stops.map(function(s){return s.place.id;});
    var o=Object.assign({},lastOpts,{date:addDays(lastOpts.date,1),arrive:'09:30',depart:'13:30',exclude:used});
    var r2=plan(o);
    var totalAll=r1.stayMin+r2.stayMin;
    var allStops=r1.stops.length+r2.stops.length, outAll=r1.outCount+r2.outCount;
    var h='<div class="next"><h3>'+L.nextDayTitle+'</h3>';
    h+='<div class="metrics"><div><span>'+L.totalStay+'</span><b>'+dur(totalAll)+'</b></div>'
      +'<div><span>'+L.mOut+'</span><b>'+Math.round(outAll/allStops*100)+'%</b></div>'
      +'<div><span>'+L.mShops+'</span><b>'+allStops+L.shops+'</b></div></div>';
    h+= r2.stops.length? mapHtml(r2)+routeHtml(r2,lastOpts.people) : '<div class="note">'+esc(L.nextEmpty)+'</div>';
    h+='<h4>'+L.stayZone+'</h4><ul>'+STAY_ZONES.map(function(z){
      return '<li>'+esc(state.lang==='en'?z.en:z.ko)+' — '+esc(state.lang==='en'?z.note_en:z.note_ko)+'</li>';}).join('')+'</ul></div>';
    $('next').innerHTML=h;
    initMaps();
    $('next').scrollIntoView({behavior:'smooth'});
  }

  function make(){
    var arr=$('arr').value, dep=$('dep').value;
    if(!arr||!dep||toMin(dep)<=toMin(arr)){ $('result').innerHTML='<div class="alert">출발 시간이 도착 시간보다 늦어야 합니다.</div>'; return; }
    lastOpts={date:$('date').value||today(), arrive:arr, depart:dep, mode:$('mode').value,
              people:state.people.map(function(a){return a.slice();}), indoorOnly:$('indoor').checked};
    lastResult=plan(lastOpts);
    show();
  }

  function setPeople(arr){ state.people=arr; renderPeople(); }
  function example(kind){
    if(kind==='A'){ state.lang='ko'; $('lang').value='ko'; $('arr').value='13:00'; $('dep').value='21:00'; $('mode').value='walk'; setPeople([[],[]]); }
    else { state.lang='en'; $('lang').value='en'; $('arr').value='10:00'; $('dep').value='21:00'; $('mode').value='car'; setPeople([['halal'],[],[],[]]); }
    renderStatic(); make();
  }

  window.addEventListener('DOMContentLoaded',function(){
    $('date').value=today(); $('arr').value='13:00'; $('dep').value='21:00';
    $('lang').onchange=function(){ state.lang=$('lang').value; renderStatic(); if(lastResult) show(); };
    $('btnAdd').onclick=function(){ state.people.push([]); renderPeople(); };
    $('btnMake').onclick=make; $('btnA').onclick=function(){example('A');}; $('btnB').onclick=function(){example('B');};
    renderStatic();
  });
}
