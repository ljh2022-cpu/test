/* 루트 생성 + 식이 판정 (화면과 무관한 순수 로직. DOM 없이 node로 테스트 가능) */

/* ---------- 유틸 ---------- */
function toMin(s){ var p=s.split(':'); return +p[0]*60 + +p[1]; }
function fmt(m){ var h=Math.floor(m/60), mm=m%60; return (h<10?'0':'')+h+':'+(mm<10?'0':'')+mm; }
function weekday(dateStr){ return new Date(dateStr+'T00:00:00').getDay(); }
function addDays(dateStr,n){
  var d=new Date(dateStr+'T00:00:00'); d.setDate(d.getDate()+n);
  var z=function(v){return (v<10?'0':'')+v;};
  return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate());
}

var WALK_MAX=25; // 도보 한 구간 최대 분

function travelMin(a,b,mode){
  if(!a) return 15; // 첫 이동: 전주역/터미널 → 첫 장소 (고정 가정)
  var d=Math.hypot(a.x-b.x,a.y-b.y);
  return Math.round(mode==='walk' ? d*1.3/4.5*60 : 5 + d*1.4/25*60);
}

/* ---------- 식이 판정 ---------- */
var RANK={ok:0,unsure:1,no:2};

// diets: ['vegan','halal','peanut','shellfish'] 중 0개 이상
// 반환 {s:'ok'|'unsure'|'no', reasons:[]}
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
  var short=(dep-arr<=120);
  var maxStops=short?3:99;

  function candidates(types){
    var out=[];
    PLACES.forEach(function(p){
      if(used[p.id] || types.indexOf(p.type)<0) return;
      if(p.closed.indexOf(dow)>=0) return;
      if(opts.indoorOnly && !p.indoor) return;
      if(p.type==='meal' && !placeOkForAll(p,opts.people)) return; // 조건을 몰래 완화하지 않음
      var tv=travelMin(last,p,opts.mode);
      if(last && opts.mode==='walk' && tv>WALK_MAX) return;
      var start=Math.max(cursor+tv, toMin(p.open));
      if(start-(cursor+tv)>30) return;            // 개점까지 30분 넘게 기다려야 하면 제외
      var end=start+p.stay;
      if(end>toMin(p.close) || end>dep) return;   // 영업시간·출발시간 안에 끝나야 함
      var score=(p.area==='out'?3:0) - tv/10;
      // 늦게까지 여는 장소는 저녁 이후를 위해 남겨 둔다
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
  var total=stops.reduce(function(s,x){return s+x.travel+(x.end-x.start);},0);
  var out=stops.filter(function(x){return x.place.area==='out';}).length;
  return {stops:stops, gaps:gaps, stayMin:total, outCount:out,
          outRatio:stops.length?Math.round(out/stops.length*100):0,
          shopCount:stops.length, short:short, date:opts.date, arrive:arr, depart:dep};
}
