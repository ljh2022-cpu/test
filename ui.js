/* 화면 (렌더링·이벤트). 로직은 logic.js, 문구는 i18n.js */
(function () {
  if (typeof document === 'undefined') return;

  var state = { people: [[]], lang: 'ko', mode: 'walk' };
  var lastResult = null, lastOpts = null;
  var pendingMaps = [], mapSeq = 0;

  var $ = function (id) { return document.getElementById(id); };
  var t = function () { return T[state.lang]; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function today() { var d = new Date(), z = function (v) { return (v < 10 ? '0' : '') + v; }; return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); }
  function dur(m) { var S = t(), h = Math.floor(m / 60), mm = m % 60; return (h ? h + S.hour + ' ' : '') + mm + S.min; }
  function placeName(p) { return state.lang === 'en' ? p.en : p.name; }

  /* ---------- 입력 영역 ---------- */
  function renderStatic() {
    var S = t();
    document.documentElement.lang = state.lang;
    $('brand').textContent = S.brand; $('hero').innerHTML = S.hero; $('sub').textContent = S.sub; $('banner').textContent = S.sampleBanner;
    $('s1').textContent = S.s1; $('s2').textContent = S.s2; $('s3').textContent = S.s3;
    $('lbDate').textContent = S.date; $('lbArr').textContent = S.arrive; $('lbDep').textContent = S.depart;
    $('peopleHint').textContent = S.peopleHint; $('btnAdd').textContent = '+ ' + S.addPerson;
    $('segWalk').textContent = S.walk; $('segCar').textContent = S.car; $('lbIndoor').textContent = S.indoor;
    $('btnMake').textContent = S.make; $('btnA').textContent = S.exA; $('btnB').textContent = S.exB;
    ['langKo', 'langEn'].forEach(function (id) { $(id).setAttribute('aria-pressed', $(id).dataset.lang === state.lang); });
    ['segWalk', 'segCar'].forEach(function (id) { $(id).setAttribute('aria-pressed', $(id).dataset.mode === state.mode); });
    renderPeople();
  }

  function renderPeople() {
    var S = t(), box = $('people'); box.innerHTML = '';
    state.people.forEach(function (diets, i) {
      var row = document.createElement('div'); row.className = 'person';
      var h = '<span class="avatar" aria-hidden="true">' + (i + 1) + '</span><span class="sr" style="position:absolute;left:-9999px">' + S.person + ' ' + (i + 1) + '</span>';
      ['vegan', 'halal', 'peanut', 'shellfish'].forEach(function (d) {
        h += '<label class="chip"><input type="checkbox" data-i="' + i + '" data-d="' + d + '"' + (diets.indexOf(d) >= 0 ? ' checked' : '') + '><span>' + S[d] + '</span></label>';
      });
      if (state.people.length > 1) h += '<button type="button" class="rm" data-rm="' + i + '" aria-label="' + S.remove + ' ' + (i + 1) + '">×</button>';
      row.innerHTML = h; box.appendChild(row);
    });
    box.querySelectorAll('input[type=checkbox]').forEach(function (el) {
      el.onchange = function () {
        var a = state.people[+el.dataset.i], d = el.dataset.d, k = a.indexOf(d);
        if (el.checked && k < 0) a.push(d);
        if (!el.checked && k >= 0) a.splice(k, 1);
      };
    });
    box.querySelectorAll('[data-rm]').forEach(function (el) { el.onclick = function () { state.people.splice(+el.dataset.rm, 1); renderPeople(); }; });
  }

  /* ---------- 식사 판정 ---------- */
  function ingList(menu) {
    var S = t(); if (!menu.ing) return S.noData;
    return menu.ing.length ? menu.ing.map(function (k) { return S.ing[k]; }).join(', ') : '—';
  }
  function reasonText(j) {
    var S = t(), out = [];
    j.reasons.forEach(function (r) {
      if (r === 'noData') out.push(S.noData);
      else if (r === 'halalMeat') out.push(S.why_halalMeat);
      else out.push(S.why_contains + r.c.map(function (k) { return S.ing[k]; }).join(', '));
    });
    return out.join(' / ');
  }
  function srcText(menu, place) { var S = t(); return menu.verified ? S.src_shop + ' (' + place.checked + ')' : S.src_ai; }
  function staleBadge(place) {
    var days = (Date.now() - new Date(place.checked).getTime()) / 86400000;
    return days > 90 ? ' <span class="warn">' + esc(t().stale) + '</span>' : '';
  }

  function mealHtml(place, people) {
    var S = t(), h = '<div class="vd-list">';
    people.forEach(function (diets, i) {
      var jp = judgePerson(place, diets);
      h += '<div class="vd"><span class="pill ' + jp.s + '">' + S.person + ' ' + (i + 1) + ' · ' + S[jp.s] + '</span>';
      if (jp.s === 'ok') {
        var m = jp.oks[0];
        h += '<b>' + esc(state.lang === 'en' ? m.en : m.ko) + '</b> <small>(' + esc(S.ingredients) + ': ' + esc(ingList(m)) + ') · ' + esc(srcText(m, place)) + '</small>';
        var phKo = diets.map(function (d) { return T.ko.ph[d]; }).join(' ');
        h += '<div class="order">' + S.order + ': “' + esc(m.ko) + ' 주문할게요.' + (phKo ? ' ' + esc(phKo) : '') + '”';
        if (state.lang === 'en') {
          var phEn = diets.map(function (d) { return T.en.ph[d]; }).join(' ');
          h += '<br><small>= “I\'d like the ' + esc(m.en) + '.' + (phEn ? ' ' + esc(phEn) : '') + '”</small>';
        }
        h += '</div>';
      } else {
        h += '<small>' + esc(reasonText(jp.best)) + '</small>';
      }
      h += '</div>';
    });
    return h + staleBadge(place) + '</div>';
  }

  /* ---------- 지도 ---------- */
  function mapSvg(res) {
    var S = t(), W = 640, H = 320, pad = 44;
    var pts = res.stops.map(function (s) { return { x: s.place.x, y: s.place.y }; }).concat([{ x: 0, y: 0 }]);
    var xs = pts.map(function (p) { return p.x; }), ys = pts.map(function (p) { return p.y; });
    var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs), minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    var spanX = Math.max(maxX - minX, 1), spanY = Math.max(maxY - minY, 1);
    var k = Math.min((W - 2 * pad) / spanX, (H - 2 * pad) / spanY), offX = (W - spanX * k) / 2, offY = (H - spanY * k) / 2;
    var px = function (x) { return offX + (x - minX) * k; }, py = function (y) { return H - (offY + (y - minY) * k); };
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(S.mapTitle) + '" style="width:100%;height:auto;display:block;border-radius:14px;background:#FBF8F1">';
    svg += '<circle cx="' + px(0) + '" cy="' + py(0) + '" r="' + (0.5 * k) + '" fill="#FFD84D55" stroke="#1A1A1A" stroke-dasharray="4 4"/>';
    svg += '<text x="' + px(0) + '" y="' + (py(0) + 0.5 * k + 14) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#1A1A1A">' + esc(S.hanokIn) + '</text>';
    svg += '<polyline points="' + res.stops.map(function (s) { return px(s.place.x) + ',' + py(s.place.y); }).join(' ') + '" fill="none" stroke="#1A1A1A" stroke-width="3" stroke-dasharray="7 5" stroke-linejoin="round"/>';
    res.stops.forEach(function (s, i) {
      var inH = s.place.area === 'hanok', x = px(s.place.x), y = py(s.place.y);
      svg += '<circle cx="' + x + '" cy="' + y + '" r="13" fill="' + (inH ? '#fff' : '#1A1A1A') + '" stroke="#1A1A1A" stroke-width="2"/>'
        + '<text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-size="13" font-weight="800" fill="' + (inH ? '#1A1A1A' : '#FFD84D') + '">' + (i + 1) + '</text>';
    });
    svg += '<line x1="16" y1="' + (H - 16) + '" x2="' + (16 + k) + '" y2="' + (H - 16) + '" stroke="#1A1A1A" stroke-width="3"/><text x="' + (22 + k) + '" y="' + (H - 12) + '" font-size="11" fill="#1A1A1A">1 km</text></svg>';
    return svg;
  }

  // 실제 지도(Leaflet + OpenStreetMap). 라이브러리를 못 불러오면(오프라인) 약도로 대체
  function mapHtml(res) {
    if (!res.stops.length) return '';
    var S = t(), inner;
    if (typeof L === 'undefined' || !L.map) inner = mapSvg(res);
    else { var id = 'lmap' + (++mapSeq); pendingMaps.push({ id: id, res: res }); inner = '<div class="lmap" id="' + id + '"></div>'; }
    return '<div class="mapcard"><div class="mapt">' + esc(S.mapTitle) + '</div>' + inner + '<small>' + esc(S.mapNote) + '</small></div>';
  }
  function initMaps() {
    pendingMaps.splice(0).forEach(function (m) {
      var el = $(m.id); if (!el) return;
      var S = t(), map = L.map(el, { scrollWheelZoom: false });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
      var c = [HANOK.lat, HANOK.lng], pts = m.res.stops.map(function (s) { return [s.place.lat, s.place.lng]; });
      L.circle(c, { radius: 500, color: '#1A1A1A', weight: 1.5, dashArray: '4 4', fillColor: '#FFD84D', fillOpacity: 0.35 }).addTo(map).bindTooltip(S.hanokIn);
      L.polyline(pts, { color: '#1A1A1A', weight: 3, dashArray: '7 5' }).addTo(map);
      m.res.stops.forEach(function (s, i) {
        var inH = s.place.area === 'hanok';
        L.marker(pts[i], { icon: L.divIcon({ className: '', html: '<div class="pin ' + (inH ? 'in' : 'out') + '">' + (i + 1) + '</div>', iconSize: [26, 26], iconAnchor: [13, 13] }) })
          .addTo(map).bindTooltip(placeName(s.place));
      });
      map.fitBounds(L.latLngBounds(pts.concat([c])), { padding: [30, 30] });
    });
  }

  /* ---------- 타임라인 / 하루 구역 ---------- */
  function timelineHtml(res, people) {
    var S = t(), items = [];
    res.stops.forEach(function (s) { items.push({ k: 's', at: s.start, s: s }); });
    res.gaps.forEach(function (g) { items.push({ k: 'g', at: g.from, g: g }); });
    items.sort(function (a, b) { return a.at - b.at; });
    var h = '<ol class="tl">';
    items.forEach(function (it) {
      if (it.k === 'g') {
        h += '<li class="tl-gap"><span class="tl-n" aria-hidden="true">…</span><div class="tl-c">' + fmt(it.g.from) + '–' + fmt(it.g.to) + ' · ' + esc(S.gap) + ' (' + dur(it.g.to - it.g.from) + ')</div></li>';
        return;
      }
      var s = it.s, p = s.place, n = res.stops.indexOf(s) + 1;
      h += '<li class="tl-i"><span class="tl-n">' + n + '</span><div class="tl-c">'
        + '<div class="tl-t">' + fmt(s.start) + '–' + fmt(s.end) + '</div>'
        + '<div class="tl-nm">' + esc(placeName(p)) + '<span class="tag">' + S['type_' + p.type] + '</span><span class="tag ' + (p.area === 'out' ? 'out' : '') + '">' + (p.area === 'out' ? S.hanokOut : S.hanokIn) + '</span></div>'
        + '<div class="tl-m">' + S.moveMin + ' ' + s.travel + S.min + ' · ' + dur(s.end - s.start) + '</div>'
        + (p.type === 'meal' ? mealHtml(p, people) : '')
        + '</div></li>';
    });
    return h + '</ol>';
  }

  function summaryHtml(res, mainLabel, mainValue, ratio, shops) {
    var S = t();
    return '<div class="sum"><div class="sum-main"><small>' + esc(mainLabel) + '</small><b>' + mainValue + '</b></div>'
      + '<div class="stat"><small>' + S.mOut + '</small><b>' + ratio + '%</b></div>'
      + '<div class="stat"><small>' + S.mShops + '</small><b>' + shops + S.shops + '</b></div></div>';
  }

  function daySection(title, res, people, sumHtml) {
    var S = t(), h = '<section class="day"><h3 class="day-h">' + esc(title) + '</h3>' + sumHtml;
    if (!res.stops.length && !res.gaps.length) return h + '<div class="note">' + esc(S.nextEmpty) + '</div></section>';
    h += '<div class="day-grid"><div class="col-route">' + timelineHtml(res, people) + '</div><div class="col-map">' + mapHtml(res) + '</div></div></section>';
    return h;
  }

  /* ---------- 결과 ---------- */
  function show() {
    var S = t(), res = lastResult, people = lastOpts.people;
    var needAllergy = people.some(function (d) { return d.indexOf('peanut') >= 0 || d.indexOf('shellfish') >= 0; });
    var h = '';
    if (needAllergy) h += '<div class="alert" role="alert">' + esc(S.allergy) + '</div>';
    if (res.short) h += '<div class="note">' + esc(S.shortRoute) + '</div>';
    h += daySection(S.dayOne, res, people, summaryHtml(res, S.mStay, dur(res.stayMin), res.outRatio, res.shopCount));
    h += '<div class="more"><button type="button" id="btnNext">' + esc(S.nextDay) + '</button></div><div id="next"></div>';
    $('result').innerHTML = h;
    initMaps();
    $('btnNext').onclick = showNext;
  }

  function showNext() {
    var S = t(), r1 = lastResult, people = lastOpts.people;
    var used = r1.stops.map(function (s) { return s.place.id; });
    var r2 = plan(Object.assign({}, lastOpts, { date: addDays(lastOpts.date, 1), arrive: '09:30', depart: '13:30', exclude: used }));
    var all = r1.stops.length + r2.stops.length, outAll = r1.outCount + r2.outCount;
    var h = daySection(S.dayTwo, r2, people, summaryHtml(r2, S.totalStay, dur(r1.stayMin + r2.stayMin), all ? Math.round(outAll / all * 100) : 0, all));
    h += '<div class="stay"><h4>' + esc(S.stayZone) + '</h4><ul>' + STAY_ZONES.map(function (z) {
      return '<li>' + esc(state.lang === 'en' ? z.en : z.ko) + ' — ' + esc(state.lang === 'en' ? z.note_en : z.note_ko) + '</li>';
    }).join('') + '</ul></div>';
    $('next').innerHTML = h;
    initMaps();
    $('next').scrollIntoView({ behavior: 'smooth' });
  }

  function make() {
    var arr = $('arr').value, dep = $('dep').value;
    if (!arr || !dep || toMin(dep) <= toMin(arr)) { $('result').innerHTML = '<div class="alert" role="alert">' + esc(t().errTime) + '</div>'; return; }
    lastOpts = { date: $('date').value || today(), arrive: arr, depart: dep, mode: state.mode,
      people: state.people.map(function (a) { return a.slice(); }), indoorOnly: $('indoor').checked };
    lastResult = plan(lastOpts);
    show();
  }

  function example(kind) {
    if (kind === 'A') { state.lang = 'ko'; $('arr').value = '13:00'; $('dep').value = '21:00'; state.mode = 'walk'; state.people = [[], []]; }
    else { state.lang = 'en'; $('arr').value = '10:00'; $('dep').value = '21:00'; state.mode = 'car'; state.people = [['halal'], [], [], []]; }
    renderStatic(); make();
  }

  window.addEventListener('DOMContentLoaded', function () {
    $('date').value = today(); $('arr').value = '13:00'; $('dep').value = '21:00';
    document.querySelectorAll('[data-lang]').forEach(function (b) { b.onclick = function () { state.lang = b.dataset.lang; renderStatic(); if (lastResult) show(); }; });
    document.querySelectorAll('[data-mode]').forEach(function (b) { b.onclick = function () { state.mode = b.dataset.mode; renderStatic(); }; });
    $('btnAdd').onclick = function () { state.people.push([]); renderPeople(); };
    $('btnMake').onclick = make; $('btnA').onclick = function () { example('A'); }; $('btnB').onclick = function () { example('B'); };
    renderStatic();
  });
})();
