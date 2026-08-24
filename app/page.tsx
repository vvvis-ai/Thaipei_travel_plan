'use client';

import { useEffect, useRef, useState } from 'react';

type Category = 'hotel' | 'restaurant' | 'street' | 'dessert' | 'market' | 'show';

type Place = {
  id: string;
  name: string;
  zh?: string;
  category: Category;
  lat: number;
  lng: number;
  note: string;
  status?: string;
};

type MapSpot = Place & { color: string; picked: boolean };

const categoryMeta: Record<Category, { label: string; color: string; icon: string }> = {
  hotel: { label: '숙소', color: '#19312c', icon: '⌂' },
  restaurant: { label: '맛집', color: '#df5b43', icon: '●' },
  street: { label: '길거리 음식', color: '#e39a2e', icon: '◆' },
  dessert: { label: '디저트', color: '#c76486', icon: '✦' },
  market: { label: '야시장', color: '#6b4b8c', icon: '☾' },
  show: { label: '공연장', color: '#39806c', icon: '★' },
};

const places: Place[] = [
  { id: 'hotel', name: '호텔 그레이스리 타이페이', zh: '格拉斯麗台北飯店', category: 'hotel', lat: 25.0431061, lng: 121.5306983, note: '중샤오신성역 인근 · 체크인 15:00 / 체크아웃 12:00' },
  { id: 'pindo-banqiao', name: '품도 꼬치구이 반차오', zh: '品都串燒攤 板橋', category: 'street', lat: 25.0078694, lng: 121.4637212, note: '푸중역 인근 · 매일 17:30—00:00', status: '17:30 오픈 · 현장 대기' },
  { id: 'latelier-luter', name: '라뜰리에 루터스', zh: '甜滿', category: 'dessert', lat: 25.0313393, lng: 121.5299031, note: '융캉공원 앞 · 누가크래커 · 매일 09:00—20:30', status: '현금 준비 · 재고 소진 가능' },
  { id: 'fuzhou', name: 'Fuzhou Ancestral Pepper Cake', zh: '福州世祖胡椒餅', category: 'street', lat: 25.0461036, lng: 121.5133637, note: '미슐랭 빕구르망 · 겉바속촉 후추빵' },
  { id: 'baishui', name: 'Bai-Shui Tofu Pudding', zh: '白水豆花', category: 'dessert', lat: 25.0300494, lng: 121.5294681, note: '부드러운 두부화 · 타로볼과 고구마볼' },
  { id: 'smoothie', name: '스무시 하우스 본관', zh: '思慕昔本館', category: 'dessert', lat: 25.032234, lng: 121.529623, note: '망고빙수 · 더운 시간대 휴식' },
  { id: 'dtf101', name: '딘타이펑 101점', zh: '鼎泰豐 101店', category: 'restaurant', lat: 25.0333371, lng: 121.5646596, note: '샤오롱바오 · 101 야경과 함께' },
  { id: 'dtfxinsheng', name: '딘타이펑 신셩점', zh: '鼎泰豐 新生店', category: 'restaurant', lat: 25.033889, lng: 121.5321338, note: '샤오롱바오 · 호텔과 가까운 지점' },
  { id: 'yongkang', name: '융캉우육면', zh: '永康牛肉麵', category: 'restaurant', lat: 25.0329382, lng: 121.5281111, note: '미슐랭 빕구르망 단골 · 소고기 국물과 면' },
  { id: 'aychung', name: '아종면선', zh: '阿宗麵線', category: 'street', lat: 25.0432921, lng: 121.5077098, note: '시먼딩 · 진한 국물과 쫄깃한 내장' },
  { id: 'tiantian', name: '天天利美食坊', category: 'street', lat: 25.0449773, lng: 121.5075459, note: '루로우판 + 반숙계란 · 굴전' },
  { id: 'jg', name: 'J&G Fried Chicken', zh: '繼光香香雞', category: 'street', lat: 25.042862, lng: 121.507689, note: '대만식 치킨 · 오리지널 지파이' },
  { id: 'tianjin', name: '천진총좌빙', zh: '天津蔥抓餅', category: 'street', lat: 25.03352, lng: 121.52918, note: '파전 · 계란이나 햄 추가 추천' },
  { id: 'arena', name: 'National Taiwan Sport University Arena', zh: '國立體育大學綜合體育館', category: 'show', lat: 25.0347501, lng: 121.383549, note: '국립대만체육대학교 종합체육관' },
  { id: 'shilin', name: '스린 야시장', zh: '士林夜市', category: 'market', lat: 25.08801, lng: 121.52407, note: '북부의 대표 야시장' },
  { id: 'raohe', name: '라오허제 야시장', zh: '饒河街觀光夜市', category: 'market', lat: 25.0508854, lng: 121.5774891, note: '사원 입구와 네온 포장마차' },
  { id: 'xingfu', name: 'Xing Fu Tang', zh: '幸福堂', category: 'dessert', lat: 25.04274, lng: 121.50682, note: '흑당 버블티 · 시먼딩 산책과 함께' },
  { id: 'zhenchuan', name: '真川味（一店）', category: 'restaurant', lat: 25.043541, lng: 121.504664, note: '시먼딩의 사천 요리 선택지' },
  { id: 'machicheese', name: '마치치즈', category: 'dessert', lat: 25.0307551, lng: 121.5010859, note: '출발 전 영업 상태 재확인', status: '임시 휴업—출발 전 확인' },
];

const days = [
  {
    number: '01', date: '9월 4일 금요일', label: 'ARRIVAL',
    fixed: [
      { time: '10:50', title: '부산 출발', detail: 'BX793 · PUS → TPE 12:35 도착' },
      { time: '15:00', title: '숙소 체크인', detail: '호텔 그레이스리 타이페이' },
    ],
  },
  { number: '02', date: '9월 5일 토요일', label: 'FREE DAY', fixed: [] },
  {
    number: '03', date: '9월 6일 일요일', label: 'DEPARTURE',
    fixed: [
      { time: '12:00', title: '숙소 체크아웃', detail: '호텔 그레이스리 타이페이' },
      { time: '16:40', title: '타이베이 출발', detail: 'IT606 · TPE T1 → PUS 19:55 도착' },
    ],
  },
];

function MapPanel({ spots, activeId, onSelect }: { spots: MapSpot[]; activeId: string; onSelect: (id: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const layerRef = useRef<import('leaflet').LayerGroup | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const L = await import('leaflet');
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([25.0468, 121.5316], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);
    }
    init();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready || !leafletRef.current || !layerRef.current) return;
    const L = leafletRef.current;
    layerRef.current.clearLayers();
    spots.forEach((spot) => {
      const active = spot.id === activeId;
      const marker = L.circleMarker([spot.lat, spot.lng], {
        radius: active ? 12 : spot.picked ? 10 : 8,
        color: spot.picked ? '#fff4d6' : '#fffaf0',
        weight: active ? 5 : spot.picked ? 4 : 2,
        fillColor: spot.color,
        fillOpacity: spot.picked ? 1 : 0.84,
      }).addTo(layerRef.current!);
      const popup = document.createElement('div');
      popup.className = 'map-popup';
      const strong = document.createElement('strong');
      strong.textContent = spot.name;
      popup.appendChild(strong);
      const p = document.createElement('p');
      p.textContent = spot.picked ? `✓ 내 후보 · ${spot.note}` : spot.note;
      popup.appendChild(p);
      marker.bindPopup(popup);
      marker.bindTooltip(spot.name, { direction: 'top', offset: [0, -7], opacity: 0.9 });
      marker.on('click', () => onSelect(spot.id));
    });
  }, [spots, activeId, onSelect, ready]);

  useEffect(() => {
    const spot = spots.find((item) => item.id === activeId);
    if (spot && mapRef.current) mapRef.current.flyTo([spot.lat, spot.lng], spot.id === 'arena' ? 13 : 15, { duration: 0.6 });
  }, [activeId, spots]);

  return <div ref={containerRef} className="leaflet-map choice-map" aria-label="저장한 타이베이 장소 지도" />;
}

export default function Home() {
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [activeSpot, setActiveSpot] = useState('hotel');
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        setPickedIds(JSON.parse(localStorage.getItem('taipei-picked') || '[]'));
      } catch {
        setPickedIds([]);
      }
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem('taipei-picked', JSON.stringify(pickedIds));
  }, [pickedIds, hydrated]);

  const visiblePlaces = places.filter((place) => place.category === 'hotel' || category === 'all' || place.category === category);
  const activePlace = places.find((place) => place.id === activeSpot) || places[0];
  const pickedPlaces = pickedIds.map((id) => places.find((place) => place.id === id)).filter((place): place is Place => Boolean(place));
  const mapSpots: MapSpot[] = visiblePlaces.map((place) => ({ ...place, color: categoryMeta[place.category].color, picked: pickedIds.includes(place.id) }));

  function changeCategory(next: Category | 'all') {
    setCategory(next);
    const current = places.find((place) => place.id === activeSpot);
    if (next !== 'all' && current?.category !== next && current?.category !== 'hotel') setActiveSpot('hotel');
  }

  function togglePicked(id: string) {
    setPickedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function focusPicked(id: string) {
    setCategory('all');
    setActiveSpot(id);
  }

  return (
    <main className="site-shell simplified-site">
      <header className="hero compact-hero">
        <div className="topbar">
          <div className="brand-mark" aria-label="타이베이 여행">台</div>
          <a className="map-jump" href="#saved-map">저장 지도 보기 ↓</a>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">3 DAYS IN TAIPEI</p>
          <h1>삥과 가는<br /><em>대만여행</em></h1>
          <p className="hero-note">SEP 04—06 · 정해진 건 비행기와 숙소뿐<br />나머지는 그날 마음에 드는 곳으로</p>
        </div>
        <div className="flight-strip">
          <div><span>가는 편 · BX793</span><b>10:50 PUS</b><i>→</i><b>12:35 TPE</b></div>
          <div><span>오는 편 · IT606</span><b>16:40 TPE T1</b><i>→</i><b>19:55 PUS</b></div>
        </div>
      </header>

      <div className="content-wrap compact-content">
        <section className="open-itinerary" aria-labelledby="itinerary-title">
          <div className="section-heading compact">
            <div><p className="eyebrow">ONLY THE FIXED TIMES</p><h2 id="itinerary-title">딱 이것만 정했어요</h2></div>
            <p className="section-copy">빈 시간은 미리 채우지 않았어요.<br />저장 지도에서 가고 싶은 곳을 골라 움직여요.</p>
          </div>
          <div className="open-day-list">
            {days.map((day) => (
              <article className="open-day-card" key={day.number}>
                <header><span>DAY {day.number}</span><div><b>{day.date}</b><small>{day.label}</small></div></header>
                {day.fixed.length > 0 && <div className="fixed-list">{day.fixed.map((item) => <div key={`${day.number}-${item.time}`}><time>{item.time}</time><span><b>{item.title}</b><small>{item.detail}</small></span></div>)}</div>}
                <a href="#saved-map">+ 나머지는 지도에서 고르기</a>
              </article>
            ))}
          </div>
        </section>

        <section className="map-section" id="saved-map" aria-labelledby="map-title">
          <div className="section-heading compact">
            <div><p className="eyebrow">SAVED PLACES · {places.length - 1}</p><h2 id="map-title">오늘 갈 곳을 골라요</h2></div>
            <p className="section-copy">저장해 둔 장소는 그대로 모아뒀어요.<br />장소를 눌러 후보에 담고 Google 지도에서 길을 확인하세요.</p>
          </div>

          <div className="pick-summary" aria-live="polite">
            <div><span>MY PICKS</span><b>{pickedPlaces.length}곳 골랐어요</b></div>
            {pickedPlaces.length ? <div className="pick-chips">{pickedPlaces.map((place) => <div className="pick-chip" key={place.id}><button onClick={() => focusPicked(place.id)}>{place.name}</button><button onClick={() => togglePicked(place.id)} aria-label={`${place.name} 후보에서 빼기`}>×</button></div>)}</div> : <p>아직 비어 있어요. 아래 장소에서 <b>가고 싶어요</b>를 눌러보세요.</p>}
          </div>

          <div className="filter-row" aria-label="장소 분류">
            <button className={category === 'all' ? 'active' : ''} onClick={() => changeCategory('all')}>전체</button>
            {(Object.keys(categoryMeta) as Category[]).filter((item) => item !== 'hotel').map((item) => <button className={category === item ? 'active' : ''} key={item} onClick={() => changeCategory(item)}><i style={{ background: categoryMeta[item].color }} />{categoryMeta[item].label}</button>)}
          </div>

          <div className="map-layout choice-layout">
            <MapPanel spots={mapSpots} activeId={activeSpot} onSelect={setActiveSpot} />
            <aside className="place-panel" aria-label="저장 장소 목록">
              {visiblePlaces.map((place) => <button key={place.id} className={`${activeSpot === place.id ? 'place-row active' : 'place-row'} ${pickedIds.includes(place.id) ? 'picked' : ''}`} onClick={() => setActiveSpot(place.id)}><span className="place-dot" style={{ background: categoryMeta[place.category].color }}>{pickedIds.includes(place.id) ? '✓' : categoryMeta[place.category].icon}</span><span><b>{place.name}</b>{place.zh && <small>{place.zh}</small>}<em>{place.note}</em>{place.status && <mark>{place.status}</mark>}</span></button>)}
            </aside>
          </div>

          <div className="place-detail choice-detail">
            <div><span>{categoryMeta[activePlace.category].label}</span><b>{activePlace.name}</b><small>{activePlace.note}</small></div>
            <div className="place-actions">
              {activePlace.category !== 'hotel' && <button className={pickedIds.includes(activePlace.id) ? 'done' : ''} onClick={() => togglePicked(activePlace.id)}>{pickedIds.includes(activePlace.id) ? '✓ 후보에 담았어요' : '+ 가고 싶어요'}</button>}
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activePlace.name} ${activePlace.zh || ''}`)}`} target="_blank" rel="noreferrer">Google 지도에서 보기 ↗</a>
            </div>
          </div>
        </section>

        <section className="stay-card simple-stay">
          <div className="stay-icon">⌂</div>
          <div><p className="eyebrow">OUR BASE</p><h3>호텔 그레이스리 타이페이</h3><span>忠孝新生 · 중샤오신성역 인근</span></div>
          <div className="stay-time"><span>CHECK IN<b>15:00</b></span><i /><span>CHECK OUT<b>12:00</b></span></div>
          <a href="https://maps.app.goo.gl/o4FxVhyJnfTRpeXFA" target="_blank" rel="noreferrer">Google 지도 ↗</a>
        </section>
      </div>

      <footer className="site-footer"><div><b>삥과 가는 대만여행</b><span>2026.09.04—06 · TAIPEI</span></div><p>영업시간은 바뀔 수 있으니 가기 전에 Google 지도에서 확인해 주세요.</p></footer>
    </main>
  );
}
