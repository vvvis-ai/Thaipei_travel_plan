'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type TabId = 'plan' | 'shopping' | 'hotspots';
type DayKey = 'd1' | 'd2' | 'd3';
type Category = 'hotel' | 'restaurant' | 'street' | 'dessert' | 'market' | 'show';
type Place = { id: string; name: string; zh?: string; category: Category; lat: number; lng: number; note: string; status?: string };
type MapSpot = { id: string; name: string; lat: number; lng: number; color: string; picked?: boolean; note: string };
type DaySelections = Record<DayKey, string[]>;

const emptySelections: DaySelections = { d1: [], d2: [], d3: [] };
const categoryMeta: Record<Category, { label: string; color: string; icon: string }> = {
  hotel: { label: '숙소', color: '#19312c', icon: '⌂' }, restaurant: { label: '맛집', color: '#df5b43', icon: '●' },
  street: { label: '길거리 음식', color: '#e39a2e', icon: '◆' }, dessert: { label: '디저트', color: '#c76486', icon: '✦' },
  market: { label: '야시장', color: '#6b4b8c', icon: '☾' }, show: { label: '공연장', color: '#39806c', icon: '★' },
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

const days: { key: DayKey; number: string; date: string; label: string; fixed: { time: string; title: string; detail: string }[] }[] = [
  { key: 'd1', number: '01', date: '9월 4일 금요일', label: 'ARRIVAL', fixed: [{ time: '10:50', title: '부산 출발', detail: 'BX793 · PUS → TPE 12:35 도착' }, { time: '15:00', title: '숙소 체크인', detail: '호텔 그레이스리 타이페이' }] },
  { key: 'd2', number: '02', date: '9월 5일 토요일', label: 'FREE DAY', fixed: [] },
  { key: 'd3', number: '03', date: '9월 6일 일요일', label: 'DEPARTURE', fixed: [{ time: '12:00', title: '숙소 체크아웃', detail: '호텔 그레이스리 타이페이' }, { time: '16:40', title: '타이베이 출발', detail: 'IT606 · TPE T1 → PUS 19:55 도착' }] },
];

const shoppingPlaces = [
  { id: 'shop-101', name: '타이베이 101 쇼핑몰', zh: '台北101 購物中心', area: '신이 · Taipei 101역', timing: 'DAY 1 저녁 · 야경과 함께', hours: '일—목 11:00—21:30 · 금·토 11:00—22:00', items: ['대만 디자인 기념품', '뷰티·향수', '펑리수·차 선물세트'], tip: '브랜드 쇼핑과 선물을 한 번에 보기 좋아요.', map: 'https://www.google.com/maps/search/?api=1&query=Taipei+101+Shopping+Mall', official: 'https://www.taipei-101.com.tw/ko/shopping' },
  { id: 'shop-eslite', name: '성품생활 송옌점', zh: '誠品生活松菸', area: '송산문창원구 · 신이', timing: 'DAY 1 또는 2 · 비 오는 시간', hours: '상점별 운영시간 확인', items: ['대만 문구·노트', '독립 디자인 소품', '책·잡지', '라이프스타일 잡화'], tip: '문구와 디자인 선물 취향이라면 가장 먼저 볼 곳.', map: 'https://www.google.com/maps/search/?api=1&query=Eslite+Spectrum+Songyan', official: 'https://meet.eslite.com/tw/en/store?Area=TW' },
  { id: 'shop-syntrend', name: '삼창생활원구', zh: '三創數位生活園區', area: '중샤오신성 · 숙소 근처', timing: 'DAY 1 체크인 뒤 또는 DAY 3 오전', hours: '일—목 11:00—21:30 · 금·토 11:00—22:00', items: ['카메라·액세서리', '게임·캐릭터 굿즈', '오디오', '스마트 기기'], tip: '숙소에서 가까워 짧게 들르기 좋은 디지털 쇼핑몰.', map: 'https://www.google.com/maps/search/?api=1&query=Syntrend+Creative+Park', official: 'https://www.syntrend.com.tw/en/about.html' },
  { id: 'shop-citymall', name: '타이베이 지하상가', zh: '台北地下街', area: '타이베이 메인역 · Y구역', timing: 'DAY 3 · 공항 MRT 타기 전', hours: '월—금 11:00—21:30 · 토·일 11:00—22:00', items: ['캐릭터·애니 굿즈', '가챠·피규어', '게임', '가성비 패션 잡화'], tip: '비를 피하면서 공항 이동 동선에 붙이기 좋아요.', map: 'https://www.google.com/maps/search/?api=1&query=Taipei+City+Mall', official: 'https://travel.taipei/en/attraction/details/2145' },
  { id: 'shop-dihua', name: '디화제', zh: '迪化街', area: '다다오청 · 베이먼', timing: 'DAY 2 오후 · 카페 산책과 함께', hours: '가게별 상이 · 낮 방문 추천', items: ['대만 차·티웨어', '말린 과일·견과', '한방 향낭', '대나무·라탄 소품'], tip: '오래된 상점과 새 디자인 숍을 같이 구경하는 동네.', map: 'https://www.google.com/maps/search/?api=1&query=Dihua+Street+Taipei' },
  { id: 'shop-carrefour', name: '까르푸 구이린점', zh: '家樂福桂林店', area: '시먼딩 남쪽 · 룽산쓰 근처', timing: 'DAY 1 밤 · 간식 한 번에 담기', hours: '방문 전 당일 운영시간 확인', items: ['누가크래커·펑리수', '과자·라면', '대만 차·커피', '맥주·위스키'], tip: '여러 브랜드를 비교해 실속 선물을 담기 좋아요.', map: 'https://www.google.com/maps/search/?api=1&query=Carrefour+Guilin+Store+Taipei' },
];

const hotspotCore = [
  { id: 'hs-ximen', name: '시먼딩', zh: '西門町', en: 'Ximending', area: 'Wanhua', lat: 25.04214, lng: 121.50756, ig: 3, x: 3, overlap: true, photo: ['6번 출구 무지개 횡단보도', '아메리카 스트리트 벽화', '시먼 홍러우'], foods: ['Xing Fu Tang · 대기 높음', '아종면선 · 대기 높음', 'J&G Chicken · 테이크아웃', '天天利 · 루로우판'], mrt: 'Ximen', duration: '90—150분', best: '오후부터 밤', risk: '음식 높음 · 사진 중간', day: 'DAY 1 · DAY 3 오전 선택' },
  { id: 'hs-xiangshan', name: '샹산 + 타이베이 101', zh: '象山 + 台北101', en: 'Elephant Mountain + Taipei 101', area: 'Xinyi', lat: 25.02756, lng: 121.57072, ig: 3, x: 3, overlap: true, photo: ['샹산 전망대에서 101 일몰', '블루아워 스카이라인', '비·피로 시 신이 거리 촬영'], foods: ['신이 쇼핑몰', '딘타이펑 101점', '101 전망대 / 88F 카페'], mrt: 'Xiangshan Exit 2', duration: '60—180분', best: '일몰 40—50분 전', risk: '전망대 중상 · 계단 주의', day: 'DAY 2 전용' },
  { id: 'hs-yongkang', name: '융캉제', zh: '永康街', en: 'Yongkang Street', area: 'Da’an / Dongmen', lat: 25.03182, lng: 121.52936, ig: 3, x: 2, overlap: true, photo: ['음식 스타일링', '골목 상점', '망고빙수'], foods: ['천진총좌빙', '융캉우육면 · 대기 높음', '스무시 하우스', 'Bai-Shui Douhua', '딘타이펑 · 40분 이상이면 지점 변경'], mrt: 'Dongmen Exit 5', duration: '90—150분', best: '늦은 오전부터 오후', risk: '높음', day: 'DAY 2 추천' },
  { id: 'hs-raohe', name: '라오허제 야시장', zh: '饒河街觀光夜市', en: 'Raohe Night Market', area: 'Songshan', lat: 25.05091, lng: 121.57755, ig: 3, x: 2, overlap: true, photo: ['사원 입구', '네온 포장마차', '후추빵 화덕 대기열'], foods: ['후추빵 · 대기 높음', '굴국수', '고구마볼', '꼬치와 구이'], mrt: 'Songshan Exit 5', duration: '90—120분', best: '17:30—20:00', risk: '높음', day: 'DAY 1 또는 DAY 2 밤' },
  { id: 'hs-dihua', name: '디화제 / 다다오청', zh: '迪化街 / 大稻埕', en: 'Dihua Street / Dadaocheng', area: 'Datong', lat: 25.05699, lng: 121.51022, ig: 2, x: 2, overlap: false, photo: ['바로크식 상점', '찻집과 헤리티지 카페', '부두 일몰'], foods: ['Salt Peanuts', 'Rice & Shine', '찻집 / 전통 간식'], mrt: 'Beimen / Daqiaotou', duration: '90—150분', best: '오후부터 일몰', risk: '낮음—중간', day: 'DAY 2 추천' },
];
const optionalHotspots = [
  { id: 'opt-huashan', name: 'Huashan 1914', desc: '카페와 전시를 한 번에 보는 문화공간', lat: 25.0441, lng: 121.5294 },
  { id: 'opt-kaffa', name: 'Simple Kaffa', desc: '커피 취향이 뚜렷할 때 추가하는 니치 스팟', lat: 25.0393, lng: 121.5493 },
  { id: 'opt-music', name: 'Taipei Music Center', desc: '건축과 전시를 함께 담는 난강 포토 스팟', lat: 25.0535, lng: 121.5976 },
  { id: 'opt-shilin', name: '스린 야시장', desc: '먹거리와 네온 골목이 많은 북부 대표 야시장', lat: 25.088, lng: 121.524 },
];

function MapPanel({ spots, activeId, onSelect, className = '' }: { spots: MapSpot[]; activeId: string; onSelect: (id: string) => void; className?: string }) {
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
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map); mapRef.current = map; setReady(true);
    }
    init();
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null; layerRef.current = null; leafletRef.current = null; };
  }, []);
  useEffect(() => {
    if (!ready || !leafletRef.current || !layerRef.current) return;
    const L = leafletRef.current; layerRef.current.clearLayers();
    spots.forEach((spot) => {
      const active = spot.id === activeId;
      const marker = L.circleMarker([spot.lat, spot.lng], { radius: active ? 12 : spot.picked ? 10 : 8, color: spot.picked ? '#fff4d6' : '#fffaf0', weight: active ? 5 : spot.picked ? 4 : 2, fillColor: spot.color, fillOpacity: spot.picked ? 1 : .84 }).addTo(layerRef.current!);
      const popup = document.createElement('div'); popup.className = 'map-popup';
      const strong = document.createElement('strong'); strong.textContent = spot.name; popup.appendChild(strong);
      const p = document.createElement('p'); p.textContent = spot.picked ? `✓ 일정에 반영됨 · ${spot.note}` : spot.note; popup.appendChild(p);
      marker.bindPopup(popup); marker.bindTooltip(spot.name, { direction: 'top', offset: [0, -7], opacity: .9 }); marker.on('click', () => onSelect(spot.id));
    });
  }, [spots, activeId, onSelect, ready]);
  useEffect(() => { const spot = spots.find((item) => item.id === activeId); if (spot && mapRef.current) mapRef.current.flyTo([spot.lat, spot.lng], spot.id === 'arena' ? 13 : 15, { duration: .6 }); }, [activeId, spots]);
  return <div ref={containerRef} className={`leaflet-map ${className}`} aria-label="대화형 타이베이 지도" />;
}

function SignalBars({ value, label }: { value: number; label: string }) {
  return <div className="signal"><span>{label}</span><div>{[1, 2, 3].map((n) => <i key={n} className={n <= value ? 'on' : ''} />)}</div></div>;
}

export default function Home() {
  const [tab, setTab] = useState<TabId>('plan');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [activeSpot, setActiveSpot] = useState('hotel');
  const [activeHotspot, setActiveHotspot] = useState('hs-ximen');
  const [showOptional, setShowOptional] = useState(false);
  const [selections, setSelections] = useState<DaySelections>(emptySelections);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search); const nextTab = params.get('tab');
      if (nextTab === 'plan' || nextTab === 'shopping' || nextTab === 'hotspots') setTab(nextTab);
      try {
        const saved = localStorage.getItem('taipei-itinerary-v2');
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<DaySelections>;
          setSelections({ d1: Array.isArray(parsed.d1) ? parsed.d1 : [], d2: Array.isArray(parsed.d2) ? parsed.d2 : [], d3: Array.isArray(parsed.d3) ? parsed.d3 : [] });
        } else {
          const legacy = JSON.parse(localStorage.getItem('taipei-picked') || '[]') as string[];
          setSelections({ ...emptySelections, d2: Array.isArray(legacy) ? legacy.filter((id) => places.some((place) => place.id === id && place.category !== 'hotel')) : [] });
        }
      } catch { setSelections(emptySelections); }
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('taipei-itinerary-v2', JSON.stringify(selections));
    localStorage.setItem('taipei-picked', JSON.stringify(Object.values(selections).flat()));
  }, [selections, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams(window.location.search); params.set('tab', tab); window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
  }, [tab, hydrated]);

  const pickedIds = useMemo(() => Object.values(selections).flat(), [selections]);
  const visiblePlaces = places.filter((place) => place.category === 'hotel' || category === 'all' || place.category === category);
  const activePlace = places.find((place) => place.id === activeSpot) || places[0];
  const mapSpots: MapSpot[] = visiblePlaces.map((place) => ({ ...place, color: categoryMeta[place.category].color, picked: pickedIds.includes(place.id) }));
  const hotspotMapSpots: MapSpot[] = [...hotspotCore.map((spot) => ({ id: spot.id, name: spot.name, lat: spot.lat, lng: spot.lng, color: '#d66043', note: spot.best })), ...(showOptional ? optionalHotspots.map((spot) => ({ id: spot.id, name: spot.name, lat: spot.lat, lng: spot.lng, color: '#5c7f74', note: spot.desc })) : [])];

  function assignedDay(id: string) { return days.find((day) => selections[day.key].includes(id))?.key; }
  function toggleDay(id: string, dayKey: DayKey) {
    setSelections((current) => {
      const wasAssigned = current[dayKey].includes(id);
      const next: DaySelections = { d1: current.d1.filter((item) => item !== id), d2: current.d2.filter((item) => item !== id), d3: current.d3.filter((item) => item !== id) };
      if (!wasAssigned) next[dayKey] = [...next[dayKey], id];
      return next;
    });
  }
  function removeFromPlan(id: string) { setSelections((current) => ({ d1: current.d1.filter((item) => item !== id), d2: current.d2.filter((item) => item !== id), d3: current.d3.filter((item) => item !== id) })); }
  function changeCategory(next: Category | 'all') { setCategory(next); const current = places.find((place) => place.id === activeSpot); if (next !== 'all' && current?.category !== next && current?.category !== 'hotel') setActiveSpot('hotel'); }
  function changeTab(next: TabId) { setTab(next); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  return (
    <main className={`site-shell simplified-site ${tab === 'hotspots' ? 'hotspot-mode' : ''} ${tab === 'shopping' ? 'shopping-mode' : ''}`}>
      <header className="hero compact-hero">
        <div className="topbar">
          <button className="brand-mark" aria-label="여행 일정 홈" onClick={() => changeTab('plan')}>台</button>
          <nav className="desktop-tabs" aria-label="주요 화면">
            <button className={tab === 'plan' ? 'nav-tab active' : 'nav-tab'} onClick={() => changeTab('plan')}>2박 3일 일정</button>
            <button className={tab === 'shopping' ? 'nav-tab active' : 'nav-tab'} onClick={() => changeTab('shopping')}>쇼핑</button>
            <button className={tab === 'hotspots' ? 'nav-tab active' : 'nav-tab'} onClick={() => changeTab('hotspots')}>인스타 핫플</button>
          </nav>
          {tab === 'plan' && <a className="map-jump" href="#saved-map">지도 목록 보기 ↓</a>}
        </div>
        <div className="hero-copy"><p className="eyebrow">3 DAYS IN TAIPEI</p><h1>삥과 가는<br /><em>대만여행</em></h1><p className="hero-note">{tab === 'plan' && <>SEP 04—06 · 지도에서 고른 곳이 날짜별 일정에 바로 반영돼요</>}{tab === 'shopping' && <>TAIPEI SHOPPING · 선물부터 취향 소품까지 한 번에</>}{tab === 'hotspots' && <>SOCIAL PICKS · 사진이 잘 나오는 타이베이 핵심 스팟</>}</p></div>
        <div className="flight-strip"><div><span>가는 편 · BX793</span><b>10:50 PUS</b><i>→</i><b>12:35 TPE</b></div><div><span>오는 편 · IT606</span><b>16:40 TPE T1</b><i>→</i><b>19:55 PUS</b></div></div>
      </header>

      {tab === 'plan' && <PlanTab selections={selections} pickedIds={pickedIds} visiblePlaces={visiblePlaces} activePlace={activePlace} activeSpot={activeSpot} category={category} mapSpots={mapSpots} setActiveSpot={setActiveSpot} assignedDay={assignedDay} toggleDay={toggleDay} removeFromPlan={removeFromPlan} changeCategory={changeCategory} />}
      {tab === 'shopping' && <ShoppingTab />}
      {tab === 'hotspots' && <HotspotTab activeHotspot={activeHotspot} setActiveHotspot={setActiveHotspot} hotspotMapSpots={hotspotMapSpots} showOptional={showOptional} setShowOptional={setShowOptional} />}

      <footer className="site-footer"><div><b>삥과 가는 대만여행</b><span>2026.09.04—06 · TAIPEI</span></div><p>영업시간은 바뀔 수 있으니 가기 전에 공식 안내와 Google 지도를 확인해 주세요.</p></footer>
      <nav className="mobile-tabs" aria-label="모바일 주요 화면"><button className={tab === 'plan' ? 'active' : ''} onClick={() => changeTab('plan')}><span>日</span>일정</button><button className={tab === 'shopping' ? 'active' : ''} onClick={() => changeTab('shopping')}><span>袋</span>쇼핑</button><button className={tab === 'hotspots' ? 'active' : ''} onClick={() => changeTab('hotspots')}><span>✦</span>인스타</button></nav>
    </main>
  );
}

type PlanProps = {
  selections: DaySelections; pickedIds: string[]; visiblePlaces: Place[]; activePlace: Place; activeSpot: string; category: Category | 'all'; mapSpots: MapSpot[];
  setActiveSpot: (id: string) => void; assignedDay: (id: string) => DayKey | undefined; toggleDay: (id: string, day: DayKey) => void; removeFromPlan: (id: string) => void; changeCategory: (category: Category | 'all') => void;
};

function PlanTab({ selections, pickedIds, visiblePlaces, activePlace, activeSpot, category, mapSpots, setActiveSpot, assignedDay, toggleDay, removeFromPlan, changeCategory }: PlanProps) {
  return <div className="content-wrap compact-content">
    <section className="open-itinerary" aria-labelledby="itinerary-title">
      <div className="section-heading compact"><div><p className="eyebrow">MY 3-DAY ITINERARY</p><h2 id="itinerary-title">고른 장소까지 한눈에</h2></div><p className="section-copy">아래 지도 목록에서 날짜를 누르면 여기에 바로 들어와요.<br />일정 옆 × 버튼을 누르면 언제든 선택 취소할 수 있어요.</p></div>
      <div className="open-day-list">{days.map((day) => {
        const dayPlaces = selections[day.key].map((id) => places.find((place) => place.id === id)).filter((place): place is Place => Boolean(place));
        return <article className="open-day-card" key={day.key}>
          <header><span>DAY {day.number}</span><div><b>{day.date}</b><small>{day.label}</small></div></header>
          {day.fixed.length > 0 && <div className="fixed-list">{day.fixed.map((item) => <div key={`${day.number}-${item.time}`}><time>{item.time}</time><span><b>{item.title}</b><small>{item.detail}</small></span></div>)}</div>}
          <div className="day-picked-list" aria-label={`${day.date} 선택 일정`}><span>선택 일정 · {dayPlaces.length}</span>{dayPlaces.length ? dayPlaces.map((place) => <div key={place.id}><button className="day-place-focus" onClick={() => { setActiveSpot(place.id); document.getElementById('saved-map')?.scrollIntoView({ behavior: 'smooth' }); }}><i style={{ background: categoryMeta[place.category].color }} />{place.name}</button><button className="day-place-remove" onClick={() => removeFromPlan(place.id)} aria-label={`${place.name} 일정에서 빼기`}>×</button></div>) : <p>아직 고른 장소가 없어요.</p>}</div>
          <a href="#saved-map">+ 지도 목록에서 일정 고르기</a>
        </article>;
      })}</div>
    </section>

    <section className="map-section" id="saved-map" aria-labelledby="map-title">
      <div className="section-heading compact"><div><p className="eyebrow">SAVED PLACES · {places.length - 1}</p><h2 id="map-title">날짜를 골라 일정에 담아요</h2></div><p className="section-copy">장소마다 1·2·3일차 중 하나를 선택하세요.<br />선택된 날짜를 다시 누르거나 ‘일정에서 빼기’를 누르면 취소돼요.</p></div>
      <div className="pick-summary itinerary-summary" aria-live="polite"><div><span>MY ITINERARY</span><b>{pickedIds.length}곳 반영됐어요</b></div>{pickedIds.length ? <div className="summary-days">{days.map((day) => <div key={day.key}><span>DAY {day.number}</span><b>{selections[day.key].length}</b></div>)}</div> : <p>아직 비어 있어요. 장소 목록에서 원하는 날짜를 눌러보세요.</p>}</div>
      <div className="filter-row" aria-label="장소 분류"><button className={category === 'all' ? 'active' : ''} onClick={() => changeCategory('all')}>전체</button>{(Object.keys(categoryMeta) as Category[]).filter((item) => item !== 'hotel').map((item) => <button className={category === item ? 'active' : ''} key={item} onClick={() => changeCategory(item)}><i style={{ background: categoryMeta[item].color }} />{categoryMeta[item].label}</button>)}</div>
      <div className="map-layout choice-layout schedule-choice-layout">
        <MapPanel spots={mapSpots} activeId={activeSpot} onSelect={setActiveSpot} className="choice-map" />
        <aside className="place-panel schedule-place-panel" aria-label="저장 장소 목록">{visiblePlaces.map((place) => {
          const dayKey = assignedDay(place.id);
          return <article key={place.id} className={`${activeSpot === place.id ? 'place-schedule-row active' : 'place-schedule-row'} ${dayKey ? 'picked' : ''}`}>
            <button className="place-focus" onClick={() => setActiveSpot(place.id)}><span className="place-dot" style={{ background: categoryMeta[place.category].color }}>{dayKey ? `D${dayKey.slice(1)}` : categoryMeta[place.category].icon}</span><span><b>{place.name}</b>{place.zh && <small>{place.zh}</small>}<em>{place.note}</em>{place.status && <mark>{place.status}</mark>}</span></button>
            {place.category !== 'hotel' && <div className="row-day-buttons" aria-label={`${place.name} 날짜 선택`}>{days.map((day) => <button key={day.key} className={dayKey === day.key ? 'selected' : ''} onClick={() => toggleDay(place.id, day.key)} aria-pressed={dayKey === day.key}>{day.number.slice(1)}일차</button>)}{dayKey && <button className="remove-pick" onClick={() => removeFromPlan(place.id)}>일정에서 빼기</button>}</div>}
          </article>;
        })}</aside>
      </div>
      <div className="place-detail choice-detail schedule-detail"><div><span>{categoryMeta[activePlace.category].label}</span><b>{activePlace.name}</b><small>{activePlace.note}</small></div><div className="place-actions">{activePlace.category !== 'hotel' && <div className="detail-day-buttons">{days.map((day) => <button key={day.key} className={assignedDay(activePlace.id) === day.key ? 'done' : ''} onClick={() => toggleDay(activePlace.id, day.key)}>{assignedDay(activePlace.id) === day.key ? `✓ ${day.number.slice(1)}일차` : `${day.number.slice(1)}일차 추가`}</button>)}</div>}<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activePlace.name} ${activePlace.zh || ''}`)}`} target="_blank" rel="noreferrer">Google 지도에서 보기 ↗</a></div></div>
    </section>
    <section className="stay-card simple-stay"><div className="stay-icon">⌂</div><div><p className="eyebrow">OUR BASE</p><h3>호텔 그레이스리 타이페이</h3><span>忠孝新生 · 중샤오신성역 인근</span></div><div className="stay-time"><span>CHECK IN<b>15:00</b></span><i /><span>CHECK OUT<b>12:00</b></span></div><a href="https://maps.app.goo.gl/o4FxVhyJnfTRpeXFA" target="_blank" rel="noreferrer">Google 지도 ↗</a></section>
  </div>;
}

function ShoppingTab() {
  return <div className="content-wrap shopping-content"><section aria-labelledby="shopping-title"><div className="shopping-intro"><div><p className="eyebrow">TAIPEI SHOPPING LIST</p><h2 id="shopping-title">선물도 취향도<br />놓치지 않게</h2></div><p>여행 동선에 붙이기 쉬운 쇼핑 장소만 골랐어요. 추천 품목을 먼저 보고, 마음에 드는 곳은 지도에서 바로 확인하세요.</p></div><div className="shopping-grid">{shoppingPlaces.map((shop, index) => <article className="shopping-card" key={shop.id}><div className="shopping-card-head"><span>{String(index + 1).padStart(2, '0')}</span><em>{shop.timing}</em></div><h3>{shop.name}</h3><p className="shop-zh">{shop.zh}</p><div className="shop-meta"><span>WHERE<b>{shop.area}</b></span><span>HOURS<b>{shop.hours}</b></span></div><div className="shop-items"><small>추천 품목</small><div>{shop.items.map((item) => <span key={item}>{item}</span>)}</div></div><p className="shop-tip">TIP · {shop.tip}</p><footer><a href={shop.map} target="_blank" rel="noreferrer">Google 지도 ↗</a>{shop.official && <a href={shop.official} target="_blank" rel="noreferrer">공식 안내 ↗</a>}</footer></article>)}</div><div className="shopping-note"><b>가볍게 챙기는 쇼핑 팁</b><p>여권은 면세가 가능한 매장에서 필요할 수 있어요. 식품은 유통기한과 반입 가능 여부를 확인하고, 전자제품은 전압·플러그·국제 보증을 구매 전에 꼭 확인하세요.</p></div></section></div>;
}

type HotspotProps = { activeHotspot: string; setActiveHotspot: (id: string) => void; hotspotMapSpots: MapSpot[]; showOptional: boolean; setShowOptional: React.Dispatch<React.SetStateAction<boolean>> };
function HotspotTab({ activeHotspot, setActiveHotspot, hotspotMapSpots, showOptional, setShowOptional }: HotspotProps) {
  return <div className="content-wrap hotspot-content"><section aria-labelledby="hotspot-title"><div className="hotspot-intro"><div><p className="eyebrow">KOREAN SOCIAL PICKS</p><h2 id="hotspot-title">인스타에서 건진<br />타이베이 CORE 5</h2></div><div className="research-note"><b>사진 포인트 중심</b><p>잘 나오는 시간과 구도, 근처 먹거리까지 모았어요. 일정에 넣을 때는 이동 시간도 함께 확인해 주세요.</p></div></div><div className="hotspot-map-wrap"><MapPanel spots={hotspotMapSpots} activeId={activeHotspot} onSelect={setActiveHotspot} className="hotspot-map" /><div className="map-index">{hotspotCore.map((spot, index) => <button key={spot.id} className={activeHotspot === spot.id ? 'active' : ''} onClick={() => setActiveHotspot(spot.id)}><span>{String(index + 1).padStart(2, '0')}</span>{spot.name}</button>)}</div></div><div className="hotspot-grid">{hotspotCore.map((spot, index) => <article key={spot.id} className={activeHotspot === spot.id ? 'hotspot-card active' : 'hotspot-card'} onMouseEnter={() => setActiveHotspot(spot.id)}><div className="hotspot-num">CORE {String(index + 1).padStart(2, '0')}</div><div className="hotspot-title-row"><div><h3>{spot.name}</h3><p>{spot.zh} · {spot.en}</p></div>{spot.overlap && <span>지도 목록과 동선 연결</span>}</div><div className="signal-row"><SignalBars label="Instagram" value={spot.ig} /><SignalBars label="인기 체감" value={spot.x} /></div><div className="photo-hook"><span>PHOTO HOOK</span>{spot.photo.map((item) => <p key={item}>↳ {item}</p>)}</div><div className="hotspot-meta"><span><small>NEAREST MRT</small>{spot.mrt}</span><span><small>TIME NEEDED</small>{spot.duration}</span><span><small>BEST TIME</small>{spot.best}</span><span><small>WAIT RISK</small>{spot.risk}</span></div><div className="food-nearby"><b>FOOD NEARBY</b><div>{spot.foods.map((food) => <span key={food}>{food}</span>)}</div></div><footer><span>{spot.area}</span><b>{spot.day}</b></footer></article>)}</div></section><section className="optional-section" aria-labelledby="optional-title"><div className="section-heading compact"><div><p className="eyebrow">OPTIONAL · NOT CORE</p><h2 id="optional-title">시간이 남으면 펼쳐보기</h2></div><button className={`toggle ${showOptional ? 'on' : ''}`} onClick={() => setShowOptional((value) => !value)} aria-pressed={showOptional}><i />선택 후보 지도에 {showOptional ? '표시 중' : '숨김'}</button></div><div className="optional-grid">{optionalHotspots.map((spot) => <article key={spot.id}><span>OPTIONAL</span><h3>{spot.name}</h3><p>{spot.desc}</p></article>)}<article className="outside-option"><span>OUTSIDE CITY CORE</span><h3>지우펀 · 스펀 · 예류</h3><p>매력적이지만 이번 2박 3일 도심 일정에서는 이동 시간을 넉넉히 잡아야 해요.</p></article></div></section></div>;
}
