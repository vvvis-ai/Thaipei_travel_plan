'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type PlanId = 'A' | 'B' | 'C';
type TabId = 'plan' | 'hotspots';
type Category = 'hotel' | 'restaurant' | 'street' | 'dessert' | 'market' | 'show';

type Place = {
  id: string;
  name: string;
  zh?: string;
  category: Category;
  lat: number;
  lng: number;
  note: string;
  score: number;
  reason: string;
  status?: string;
};

const categoryMeta: Record<Category, { label: string; color: string; icon: string }> = {
  hotel: { label: '숙소', color: '#19312c', icon: '⌂' },
  restaurant: { label: '대표 맛집', color: '#df5b43', icon: '●' },
  street: { label: '길거리 음식', color: '#e39a2e', icon: '◆' },
  dessert: { label: '디저트', color: '#c76486', icon: '✦' },
  market: { label: '야시장', color: '#6b4b8c', icon: '☾' },
  show: { label: '공연장', color: '#39806c', icon: '★' },
};

const places: Place[] = [
  { id: 'hotel', name: '호텔 그레이스리 타이페이', zh: '格拉斯麗台北飯店', category: 'hotel', lat: 25.0431061, lng: 121.5306983, note: '중샤오신성역 인근 · 체크인 15:00 / 체크아웃 12:00', score: 100, reason: '여행 기준점' },
  { id: 'fuzhou', name: 'Fuzhou Ancestral Pepper Cake', zh: '福州世祖胡椒餅', category: 'street', lat: 25.0461036, lng: 121.5133637, note: '미슐랭 빕구르망 · 겉바속촉 후추빵', score: 92, reason: '강한 메모 + A1 이동 동선' },
  { id: 'baishui', name: 'Bai-Shui Tofu Pudding', zh: '白水豆花', category: 'dessert', lat: 25.0300494, lng: 121.5294681, note: '부드러운 두부화 · 타로볼과 고구마볼', score: 83, reason: '융캉제 군집 + 고유 디저트' },
  { id: 'smoothie', name: '스무시 하우스 본관', zh: '思慕昔本館', category: 'dessert', lat: 25.032234, lng: 121.529623, note: '망고빙수 · 더운 시간대 휴식', score: 78, reason: '융캉제 군집 + 계절 적합' },
  { id: 'dtf101', name: '딘타이펑 101점', zh: '鼎泰豐 101店', category: 'restaurant', lat: 25.0333371, lng: 121.5646596, note: '샤오롱바오 · 101 야경과 한 번에', score: 85, reason: '랜드마크 결합 + 대표성' },
  { id: 'dtfxinsheng', name: '딘타이펑 신셩점', zh: '鼎泰豐 新生店', category: 'restaurant', lat: 25.033889, lng: 121.5321338, note: '샤오롱바오 · 호텔과 가까운 대체 지점', score: 88, reason: '숙소 접근성 + 대기 대안' },
  { id: 'yongkang', name: '융캉우육면', zh: '永康牛肉麵', category: 'restaurant', lat: 25.0329382, lng: 121.5281111, note: '미슐랭 빕구르망 단골 · 소고기 국물과 면', score: 94, reason: '강한 메모 + 대만 고유성' },
  { id: 'aychung', name: '아종면선', zh: '阿宗麵線', category: 'street', lat: 25.0432921, lng: 121.5077098, note: '시먼딩 필수 · 진한 국물과 쫄깃한 내장', score: 96, reason: '사용자 필수 메모 + 동선' },
  { id: 'tiantian', name: '天天利美食坊', category: 'street', lat: 25.0449773, lng: 121.5075459, note: '루로우판 + 반숙계란 · 굴전', score: 86, reason: '시먼딩 군집 + 메뉴 고유성' },
  { id: 'jg', name: 'J&G Fried Chicken', zh: '繼光香香雞', category: 'street', lat: 25.042862, lng: 121.507689, note: '대만식 치킨 · 오리지널 지파이', score: 76, reason: '시먼딩 군집 + 빠른 테이크아웃' },
  { id: 'tianjin', name: '천진총좌빙', zh: '天津蔥抓餅', category: 'street', lat: 25.03352, lng: 121.52918, note: '파전 · 계란이나 햄 추가 추천', score: 87, reason: '융캉제 군집 + 짧은 체류' },
  { id: 'arena', name: 'National Taiwan Sport University Arena', zh: '國立體育大學綜合體育館', category: 'show', lat: 25.0347501, lng: 121.383549, note: '9월 5일 14:00—17:00 공연 · 13:00 도착 목표', score: 100, reason: '고정 일정' },
  { id: 'shilin', name: '스린 야시장', zh: '士林夜市', category: 'market', lat: 25.08801, lng: 121.52407, note: '공연 후 선택 가능한 북부 야시장', score: 75, reason: '저녁 운영 + 공연 후 대안' },
  { id: 'raohe', name: '라오허제 야시장', zh: '饒河街觀光夜市', category: 'market', lat: 25.0508854, lng: 121.5774891, note: '사원 입구와 네온 포장마차 · 17:30 전후 추천', score: 91, reason: '강한 한국인 선호 + 야간 동선' },
  { id: 'xingfu', name: 'Xing Fu Tang', zh: '幸福堂', category: 'dessert', lat: 25.04274, lng: 121.50682, note: '흑당 버블티 · 시먼딩 산책과 함께', score: 77, reason: '시먼딩 군집 + 빠른 방문' },
  { id: 'zhenchuan', name: '真川味（一店）', category: 'restaurant', lat: 25.043541, lng: 121.504664, note: '시먼딩의 사천 요리 선택지', score: 66, reason: '지역 군집은 좋지만 대만 고유성 낮음' },
  { id: 'machicheese', name: '마치치즈', category: 'dessert', lat: 25.0307551, lng: 121.5010859, note: '출발 전 영업 상태 재확인', score: 35, reason: '현재 휴업으로 운영 현실성 감점', status: '임시 휴업—출발 전 확인' },
];

const planLabels: Record<PlanId, { title: string; short: string; color: string }> = {
  A: { title: '대표 맛집', short: 'A', color: '#df5b43' },
  B: { title: '길거리 음식', short: 'B', color: '#e39a2e' },
  C: { title: '디저트', short: 'C', color: '#c76486' },
};

const days = [
  {
    key: 'd1', date: '9월 4일 금요일', label: 'DAY 01 · ARRIVAL', title: '타이베이 동부에서 시작',
    common: ['10:50 부산(PUS) 출발', '12:35 타오위안(TPE) 도착', '공항 MRT → A1 타이베이역', '15:30 호텔 체크인'],
    plans: {
      A: { title: '101과 대표 한 끼', summary: '딘타이펑 101점 → 신이 야경 → 라오허제 야시장', time: '16:30—22:00', placeIds: ['dtf101', 'raohe'], food: 950, taxi: 420, transit: 160 },
      B: { title: '융캉제 로컬 푸드', summary: '융캉우육면 → 천진총좌빙 → 융캉제 → 라오허제', time: '16:30—22:00', placeIds: ['yongkang', 'tianjin', 'raohe'], food: 680, taxi: 390, transit: 160 },
      C: { title: '망고와 두부화', summary: '천진총좌빙 → 스무시 하우스 → Bai-Shui → 야경', time: '16:30—21:30', placeIds: ['tianjin', 'smoothie', 'baishui'], food: 600, taxi: 380, transit: 160 },
    },
  },
  {
    key: 'd2', date: '9월 5일 토요일', label: 'DAY 02 · SHOW DAY', title: '14시 공연을 중심으로',
    common: ['11:30 A1 타이베이역 출발', '공항 MRT 일반열차 → A7', '13:00 공연장 도착', '14:00—17:00 공연'],
    plans: {
      A: { title: '후추빵과 딘타이펑', summary: '11:00 후추빵 → 공연 → 딘타이펑 신셩점', time: '10:40—20:30', placeIds: ['fuzhou', 'arena', 'dtfxinsheng'], food: 850, taxi: 360, transit: 140 },
      B: { title: '시먼딩부터 스린까지', summary: '아종면선 → 天天利/J&G → 공연 → 스린 야시장', time: '08:30—21:30', placeIds: ['aychung', 'tiantian', 'jg', 'arena', 'shilin'], food: 720, taxi: 420, transit: 140 },
      C: { title: '흑당과 융캉 디저트', summary: 'Xing Fu Tang → 시먼딩 → 공연 → 융캉제 디저트', time: '08:30—20:30', placeIds: ['xingfu', 'arena', 'baishui'], food: 600, taxi: 380, transit: 140 },
    },
  },
  {
    key: 'd3', date: '9월 6일 일요일', label: 'DAY 03 · DEPARTURE', title: '마지막 한 끼와 귀국',
    common: ['11:40까지 호텔 출발', '택시 → A1 타이베이역', '공항 MRT → 터미널 1', '13:30 공항 · 16:40 출발'],
    plans: {
      A: { title: '신셩점 오픈런', summary: '10:00 딘타이펑 신셩점 → 호텔 짐 수령 → 공항', time: '09:45—13:30', placeIds: ['dtfxinsheng'], food: 620, taxi: 130, transit: 160 },
      B: { title: '놓친 시먼딩 한 곳', summary: '아종면선 등 미방문 음식 1곳 → 호텔 → 공항', time: '08:30—13:30', placeIds: ['aychung'], food: 320, taxi: 230, transit: 160 },
      C: { title: '마지막 망고빙수', summary: '10:00 스무시 하우스 → 호텔 짐 수령 → 공항', time: '09:45—13:30', placeIds: ['smoothie'], food: 260, taxi: 160, transit: 160 },
    },
  },
] as const;

type MapSpot = { id: string; name: string; lat: number; lng: number; color: string; label?: string; note?: string };

function MapPanel({ spots, activeId, onSelect, className = '' }: { spots: MapSpot[]; activeId?: string; onSelect?: (id: string) => void; className?: string }) {
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
      const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false, attributionControl: true }).setView([25.0468, 121.5316], 13);
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
        radius: active ? 12 : 9,
        color: '#fffaf0',
        weight: active ? 4 : 3,
        fillColor: spot.color,
        fillOpacity: 1,
      }).addTo(layerRef.current!);
      const popup = document.createElement('div');
      popup.className = 'map-popup';
      const strong = document.createElement('strong');
      strong.textContent = spot.name;
      popup.appendChild(strong);
      if (spot.note) {
        const p = document.createElement('p');
        p.textContent = spot.note;
        popup.appendChild(p);
      }
      marker.bindPopup(popup);
      marker.bindTooltip(spot.label || spot.name, { direction: 'top', offset: [0, -7], opacity: 0.9 });
      marker.on('click', () => onSelect?.(spot.id));
    });
  }, [spots, activeId, onSelect, ready]);

  useEffect(() => {
    const spot = spots.find((item) => item.id === activeId);
    if (spot && mapRef.current) mapRef.current.flyTo([spot.lat, spot.lng], spot.id === 'arena' ? 13 : 15, { duration: 0.7 });
  }, [activeId, spots]);

  return <div ref={containerRef} className={`leaflet-map ${className}`} aria-label="대화형 타이베이 지도" />;
}

const hotspotCore = [
  { id: 'hs-ximen', name: '시먼딩', zh: '西門町', en: 'Ximending', area: 'Wanhua', lat: 25.04214, lng: 121.50756, ig: 3, x: 3, overlap: true, photo: ['6번 출구 무지개 횡단보도', '아메리카 스트리트 벽화', '시먼 홍러우'], foods: ['Xing Fu Tang · 대기 높음', '아종면선 · 대기 높음', 'J&G Chicken · 테이크아웃', '天天利 · 루로우판'], mrt: 'Ximen', duration: '90—150분', best: '오후부터 밤', risk: '음식 높음 · 사진 중간', day: 'DAY 1 · DAY 3 오전 선택' },
  { id: 'hs-xiangshan', name: '샹산 + 타이베이 101', zh: '象山 + 台北101', en: 'Elephant Mountain + Taipei 101', area: 'Xinyi', lat: 25.02756, lng: 121.57072, ig: 3, x: 3, overlap: true, photo: ['샹산 전망대에서 101 일몰', '블루아워 스카이라인', '비·피로 시 신이 거리 촬영'], foods: ['신이 쇼핑몰', '딘타이펑 101점', '101 전망대 / 88F 카페'], mrt: 'Xiangshan Exit 2', duration: '60—180분', best: '일몰 40—50분 전', risk: '전망대 중상 · 계단 주의', day: 'DAY 2 전용' },
  { id: 'hs-yongkang', name: '융캉제', zh: '永康街', en: 'Yongkang Street', area: 'Da’an / Dongmen', lat: 25.03182, lng: 121.52936, ig: 3, x: 2, overlap: true, photo: ['음식 스타일링', '골목 상점', '망고빙수'], foods: ['천진총좌빙', '융캉우육면 · 대기 높음', '스무시 하우스', 'Bai-Shui Douhua', '딘타이펑 · 40분 이상이면 지점 변경'], mrt: 'Dongmen Exit 5', duration: '90—150분', best: '늦은 오전부터 오후', risk: '높음', day: 'DAY 2 추천' },
  { id: 'hs-raohe', name: '라오허제 야시장', zh: '饒河街觀光夜市', en: 'Raohe Night Market', area: 'Songshan', lat: 25.05091, lng: 121.57755, ig: 3, x: 2, overlap: true, photo: ['사원 입구', '네온 포장마차', '후추빵 화덕 대기열'], foods: ['후추빵 · 대기 높음', '굴국수', '고구마볼', '꼬치와 구이'], mrt: 'Songshan Exit 5', duration: '90—120분', best: '17:30—20:00', risk: '높음', day: 'DAY 1 또는 DAY 2 밤' },
  { id: 'hs-dihua', name: '디화제 / 다다오청', zh: '迪化街 / 大稻埕', en: 'Dihua Street / Dadaocheng', area: 'Datong', lat: 25.05699, lng: 121.51022, ig: 2, x: 2, overlap: false, photo: ['바로크식 상점', '찻집과 헤리티지 카페', '부두 일몰'], foods: ['Salt Peanuts', 'Rice & Shine', '찻집 / 전통 간식'], mrt: 'Beimen / Daqiaotou', duration: '90—150분', best: '오후부터 일몰', risk: '낮음—중간', day: 'DAY 2 추천' },
];

const optionalHotspots = [
  { id: 'opt-huashan', name: 'Huashan 1914', desc: '가이드와 카페 신호는 강하지만 X 신호는 약한 문화공간', lat: 25.0441, lng: 121.5294 },
  { id: 'opt-kaffa', name: 'Simple Kaffa', desc: '커피 취향이 뚜렷할 때 추가하는 니치 스팟', lat: 25.0393, lng: 121.5493 },
  { id: 'opt-music', name: 'Taipei Music Center', desc: '“潮臺北×潮首爾” 무료 전시 · 2026.09.04—13', lat: 25.0535, lng: 121.5976 },
  { id: 'opt-shilin', name: '스린 야시장', desc: '인지도는 높지만 이번 Korean-IG ∩ X 교집합은 라오허보다 약함', lat: 25.088, lng: 121.524 },
];

function SignalBars({ value, label }: { value: number; label: string }) {
  return <div className="signal"><span>{label}</span><div>{[1, 2, 3].map((n) => <i key={n} className={n <= value ? 'on' : ''} />)}</div></div>;
}

export default function Home() {
  const [tab, setTab] = useState<TabId>('plan');
  const [plans, setPlans] = useState<Record<string, PlanId>>({ d1: 'A', d2: 'A', d3: 'A' });
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [activeSpot, setActiveSpot] = useState('hotel');
  const [activeHotspot, setActiveHotspot] = useState('hs-ximen');
  const [showOptional, setShowOptional] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [rateStatus, setRateStatus] = useState('환율 불러오는 중');
  const [rateUpdated, setRateUpdated] = useState('');
  const [twdInput, setTwdInput] = useState('1000');
  const [krwInput, setKrwInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextTab = params.get('tab');
    if (nextTab === 'hotspots' || nextTab === 'plan') setTab(nextTab);
    setPlans((prev) => ({
      d1: ['A', 'B', 'C'].includes(params.get('d1') || '') ? params.get('d1') as PlanId : prev.d1,
      d2: ['A', 'B', 'C'].includes(params.get('d2') || '') ? params.get('d2') as PlanId : prev.d2,
      d3: ['A', 'B', 'C'].includes(params.get('d3') || '') ? params.get('d3') as PlanId : prev.d3,
    }));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    params.set('d1', plans.d1);
    params.set('d2', plans.d2);
    params.set('d3', plans.d3);
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
  }, [tab, plans, hydrated]);

  useEffect(() => {
    let cancelled = false;
    async function loadRate() {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/TWD');
        if (!response.ok) throw new Error('rate');
        const data = await response.json();
        const rate = Number(data?.rates?.KRW);
        if (!rate) throw new Error('rate');
        const updated = data.time_last_update_utc || new Date().toISOString();
        localStorage.setItem('taipei-rate', JSON.stringify({ rate, updated }));
        if (!cancelled) {
          setExchangeRate(rate);
          setRateStatus('실시간 참고 환율');
          setRateUpdated(new Date(updated).toLocaleString('ko-KR'));
          setKrwInput(String(Math.round(1000 * rate)));
        }
      } catch {
        const cached = localStorage.getItem('taipei-rate');
        if (cached && !cancelled) {
          const parsed = JSON.parse(cached);
          setExchangeRate(parsed.rate);
          setRateStatus('마지막 저장 환율');
          setRateUpdated(new Date(parsed.updated).toLocaleString('ko-KR'));
          setKrwInput(String(Math.round(1000 * parsed.rate)));
        } else if (!cancelled) setRateStatus('환율 갱신 실패 · TWD 기준으로 확인');
      }
    }
    loadRate();
    return () => { cancelled = true; };
  }, []);

  const selectedPlaceIds = useMemo(() => days.flatMap((day) => day.plans[plans[day.key]].placeIds), [plans]);
  const duplicateIds = useMemo(() => selectedPlaceIds.filter((id, index, all) => all.indexOf(id) !== index), [selectedPlaceIds]);
  const selectedEstimate = useMemo(() => {
    const dayCosts = days.map((day) => day.plans[plans[day.key]]);
    return dayCosts.reduce((sum, item) => sum + item.food + item.taxi + item.transit, 700);
  }, [plans]);

  const visiblePlaces = places.filter((place) => place.category === 'hotel' || category === 'all' || place.category === category);
  const planMapSpots: MapSpot[] = visiblePlaces.map((place) => ({ id: place.id, name: place.name, lat: place.lat, lng: place.lng, color: selectedPlaceIds.includes(place.id) ? categoryMeta[place.category].color : '#8d958f', label: place.id === 'hotel' ? '숙소' : place.name, note: place.note }));
  const hotspotMapSpots: MapSpot[] = [
    ...hotspotCore.map((spot) => ({ id: spot.id, name: spot.name, lat: spot.lat, lng: spot.lng, color: '#d66043', label: spot.name, note: spot.best })),
    ...(showOptional ? optionalHotspots.map((spot) => ({ id: spot.id, name: spot.name, lat: spot.lat, lng: spot.lng, color: '#5c7f74', label: spot.name, note: spot.desc })) : []),
  ];

  function updatePlan(dayKey: string, value: PlanId) {
    setPlans((prev) => ({ ...prev, [dayKey]: value }));
  }

  async function sharePlan() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function changeTwd(value: string) {
    setTwdInput(value);
    if (exchangeRate) setKrwInput(value ? String(Math.round(Number(value) * exchangeRate)) : '');
  }

  function changeKrw(value: string) {
    setKrwInput(value);
    if (exchangeRate) setTwdInput(value ? String(Math.round(Number(value) / exchangeRate)) : '');
  }

  const daysToGo = Math.max(0, Math.ceil((new Date('2026-09-04T00:00:00+08:00').getTime() - Date.now()) / 86400000));

  return (
    <main className={`site-shell ${tab === 'hotspots' ? 'hotspot-mode' : ''}`}>
      <header className="hero">
        <div className="topbar">
          <button className="brand-mark" aria-label="홈으로">台</button>
          <nav className="desktop-tabs" aria-label="주요 화면">
            <button className={tab === 'plan' ? 'nav-tab active' : 'nav-tab'} onClick={() => setTab('plan')}>내 여행 일정</button>
            <button className={tab === 'hotspots' ? 'nav-tab active' : 'nav-tab'} onClick={() => setTab('hotspots')}>인스타 핫플</button>
          </nav>
          <button className="share-button" onClick={sharePlan}>{copied ? '링크 복사됨' : '일정 공유 ↗'}</button>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">3 DAYS IN TAIPEI · D-{daysToGo}</p>
          <h1>삥과 가는<br /><em>대만여행</em></h1>
          <p className="hero-note">SEP 04—06 · 부산에서 타이베이까지<br />우리의 먹고, 걷고, 공연 보는 주말</p>
        </div>
        <div className="stamp" aria-hidden="true"><span>TAIPEI</span><b>09.04</b><span>LET&apos;S GO!</span></div>
        <div className="flight-strip">
          <div><span>가는 편 · BX793</span><b>10:50 PUS</b><i>→</i><b>12:35 TPE</b></div>
          <div><span>오는 편 · IT606</span><b>16:40 TPE T1</b><i>→</i><b>19:55 PUS</b></div>
        </div>
      </header>

      {tab === 'plan' ? (
        <div className="content-wrap">
          <section aria-labelledby="itinerary-title">
            <div className="section-heading">
              <div><p className="eyebrow">OUR ITINERARY</p><h2 id="itinerary-title">오늘 마음에 맞는<br />플랜을 골라요</h2></div>
              <p className="section-copy">날짜별로 A/B/C를 따로 선택할 수 있어요.<br />선택한 조합은 공유 링크에 그대로 담깁니다.</p>
            </div>
            <div className="day-list">
              {days.map((day, dayIndex) => {
                const selected = day.plans[plans[day.key]];
                const hasDuplicate = selected.placeIds.some((id) => duplicateIds.includes(id));
                return (
                  <article className="itinerary-card" key={day.key}>
                    <div className="date-rail"><span>{String(dayIndex + 1).padStart(2, '0')}</span><b>{day.date}</b><i /></div>
                    <div className="day-body">
                      <div className="day-heading"><div><p>{day.label}</p><h3>{day.title}</h3></div><span className="time-pill">{selected.time}</span></div>
                      <div className="common-route">{day.common.map((item, i) => <span key={item}><i>{i + 1}</i>{item}</span>)}</div>
                      <div className="mini-switch" aria-label={`${day.date} 플랜 선택`}>
                        {(Object.keys(planLabels) as PlanId[]).map((id) => <button key={id} className={plans[day.key] === id ? 'selected' : ''} style={{ '--plan-color': planLabels[id].color } as React.CSSProperties} onClick={() => updatePlan(day.key, id)}><b>{id}</b>{planLabels[id].title}</button>)}
                      </div>
                      <div className="selected-plan"><div className="plan-letter" style={{ background: planLabels[plans[day.key]].color }}>{plans[day.key]}</div><div><h4>{selected.title}</h4><p>{selected.summary}</p></div></div>
                      <div className="stop-chips">{selected.placeIds.map((id) => { const place = places.find((item) => item.id === id)!; return <button key={id} onClick={() => { setActiveSpot(id); document.getElementById('trip-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>{place.name}{duplicateIds.includes(id) && <small>중복</small>}</button>; })}</div>
                      {hasDuplicate && <p className="duplicate-note">같은 장소가 다른 날에도 있어요. 현지에서 한 번만 방문하고 남는 시간은 지도 후보로 바꿔보세요.</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="map-section" id="trip-map" aria-labelledby="map-title">
            <div className="section-heading compact"><div><p className="eyebrow">SAVED PLACES · 16</p><h2 id="map-title">우리만의 타이베이 지도</h2></div><p className="section-copy">컬러 핀은 현재 일정에 포함된 장소예요.<br />회색 핀도 후보로 언제든 확인할 수 있어요.</p></div>
            <div className="filter-row">
              <button className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}>전체</button>
              {(Object.keys(categoryMeta) as Category[]).filter((item) => item !== 'hotel').map((item) => <button className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)}><i style={{ background: categoryMeta[item].color }} />{categoryMeta[item].label}</button>)}
            </div>
            <div className="map-layout">
              <MapPanel spots={planMapSpots} activeId={activeSpot} onSelect={setActiveSpot} />
              <aside className="place-panel">
                {visiblePlaces.map((place) => <button key={place.id} className={activeSpot === place.id ? 'place-row active' : 'place-row'} onClick={() => setActiveSpot(place.id)}><span className="place-dot" style={{ background: categoryMeta[place.category].color }}>{categoryMeta[place.category].icon}</span><span><b>{place.name}</b>{place.zh && <small>{place.zh}</small>}<em>{place.note}</em>{place.status && <mark>{place.status}</mark>}</span><strong>{place.score}</strong></button>)}
              </aside>
            </div>
            {activeSpot && (() => { const place = places.find((item) => item.id === activeSpot)!; return <div className="place-detail"><div><span>선정 점수 {place.score}/100</span><b>{place.reason}</b></div><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`} target="_blank" rel="noreferrer">Google 지도에서 길찾기 ↗</a></div>; })()}
          </section>

          <section className="budget-section" aria-labelledby="budget-title">
            <div className="budget-copy"><p className="eyebrow">BUDGET & EXCHANGE</p><h2 id="budget-title">대만 돈,<br />감 잡고 가기</h2><p>1인 현지비용 기준 · 택시는 2명이 나눠 계산했어요. 항공, 숙소, 공연표, 쇼핑은 제외됩니다.</p><div className="budget-total"><span>현재 선택 일정 예상</span><b>NT$ {selectedEstimate.toLocaleString()}</b><em>{exchangeRate ? `약 ₩${(Math.round(selectedEstimate * exchangeRate / 1000) * 1000).toLocaleString()}` : '환율 계산 중'}</em></div></div>
            <div className="budget-card">
              <div className="rate-head"><div><span>{rateStatus}</span><b>{exchangeRate ? `1 TWD = ${exchangeRate.toFixed(2)} KRW` : 'TWD 기준 표시'}</b></div><small>{rateUpdated || '잠시만 기다려 주세요'}</small></div>
              <div className="converter"><label><span>대만 달러</span><div><b>NT$</b><input inputMode="decimal" value={twdInput} onChange={(e) => changeTwd(e.target.value)} aria-label="대만 달러 금액" /></div></label><i>⇄</i><label><span>한국 원</span><div><b>₩</b><input inputMode="numeric" value={krwInput} onChange={(e) => changeKrw(e.target.value)} aria-label="한국 원 금액" disabled={!exchangeRate} /></div></label></div>
              <div className="budget-bars"><div><span>식비</span><i style={{ width: '52%' }} /><b>선택 플랜 연동</b></div><div><span>교통</span><i style={{ width: '34%' }} /><b>택시 2인 분담</b></div><div><span>예비비</span><i style={{ width: '18%' }} /><b>NT$ 700</b></div></div>
              <p className="rate-disclaimer">참고 환율이며 실제 환전·카드 청구액과 차이가 날 수 있어요.</p>
            </div>
          </section>

          <section className="stay-card"><div className="stay-icon">⌂</div><div><p className="eyebrow">OUR BASE</p><h3>호텔 그레이스리 타이페이</h3><span>忠孝新生 · 중샤오신성역 인근</span></div><div className="stay-time"><span>CHECK IN<b>15:00</b></span><i /><span>CHECK OUT<b>12:00</b></span></div><a href="https://maps.app.goo.gl/o4FxVhyJnfTRpeXFA" target="_blank" rel="noreferrer">지도 보기 ↗</a></section>
        </div>
      ) : (
        <div className="content-wrap hotspot-content">
          <section aria-labelledby="hotspot-title">
            <div className="hotspot-intro"><div><p className="eyebrow">KOREAN SOCIAL PICKS</p><h2 id="hotspot-title">인스타에서 건진<br />타이베이 CORE 5</h2></div><div className="research-note"><b>별도의 참고 노트</b><p>사용자가 제공한 Instagram/X 리서치 요약입니다. 내 일정과 예산에는 자동으로 섞이지 않아요.</p></div></div>
            <div className="hotspot-map-wrap"><MapPanel spots={hotspotMapSpots} activeId={activeHotspot} onSelect={setActiveHotspot} className="hotspot-map" /><div className="map-index">{hotspotCore.map((spot, index) => <button key={spot.id} className={activeHotspot === spot.id ? 'active' : ''} onClick={() => setActiveHotspot(spot.id)}><span>{String(index + 1).padStart(2, '0')}</span>{spot.name}</button>)}</div></div>
            <div className="hotspot-grid">
              {hotspotCore.map((spot, index) => <article key={spot.id} className={activeHotspot === spot.id ? 'hotspot-card active' : 'hotspot-card'} onMouseEnter={() => setActiveHotspot(spot.id)}><div className="hotspot-num">CORE {String(index + 1).padStart(2, '0')}</div><div className="hotspot-title-row"><div><h3>{spot.name}</h3><p>{spot.zh} · {spot.en}</p></div>{spot.overlap && <span>내 저장 목록에도 있음</span>}</div><div className="signal-row"><SignalBars label="Instagram" value={spot.ig} /><SignalBars label="X signal" value={spot.x} /></div><div className="photo-hook"><span>PHOTO HOOK</span>{spot.photo.map((item) => <p key={item}>↳ {item}</p>)}</div><div className="hotspot-meta"><span><small>NEAREST MRT</small>{spot.mrt}</span><span><small>TIME NEEDED</small>{spot.duration}</span><span><small>BEST TIME</small>{spot.best}</span><span><small>WAIT RISK</small>{spot.risk}</span></div><div className="food-nearby"><b>FOOD NEARBY</b><div>{spot.foods.map((food) => <span key={food}>{food}</span>)}</div></div><footer><span>{spot.area}</span><b>{spot.day}</b></footer></article>)}
            </div>
          </section>

          <section className="optional-section" aria-labelledby="optional-title"><div className="section-heading compact"><div><p className="eyebrow">OPTIONAL · NOT CORE</p><h2 id="optional-title">시간이 남으면 펼쳐보기</h2></div><button className={`toggle ${showOptional ? 'on' : ''}`} onClick={() => setShowOptional((value) => !value)} aria-pressed={showOptional}><i />선택 후보 지도에 {showOptional ? '표시 중' : '숨김'}</button></div><div className="optional-grid">{optionalHotspots.map((spot) => <article key={spot.id}><span>OPTIONAL</span><h3>{spot.name}</h3><p>{spot.desc}</p></article>)}<article className="outside-option"><span>OUTSIDE CITY CORE</span><h3>지우펀 · 스펀 · 예류</h3><p>한국인 여행 후기에는 자주 등장하지만 이번 2박 3일 도심 일정에서는 제외합니다.</p></article></div></section>
        </div>
      )}

      <footer className="site-footer"><div><b>삥과 가는 대만여행</b><span>2026.09.04—06 · TAIPEI</span></div><p>영업시간과 교통편은 변동될 수 있으니 출발 전에 한 번 더 확인해 주세요.</p></footer>
      <nav className="mobile-tabs" aria-label="모바일 주요 화면"><button className={tab === 'plan' ? 'active' : ''} onClick={() => setTab('plan')}><span>日</span>내 여행 일정</button><button className={tab === 'hotspots' ? 'active' : ''} onClick={() => setTab('hotspots')}><span>✦</span>인스타 핫플</button></nav>
    </main>
  );
}
