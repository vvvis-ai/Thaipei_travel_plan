import type { Metadata } from 'next';
import './globals.css';

const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
  || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: '삥과 가는 대만여행',
  description: '2026년 9월 4일부터 6일까지, 비행기와 숙소 시간만 정해 둔 타이베이 자유여행 지도',
  keywords: ['타이베이 여행', '대만 여행 일정', '타이베이 맛집', '타이베이 핫플'],
  openGraph: {
    title: '삥과 가는 대만여행',
    description: 'TAIPEI · 2026.09.04—06 · 저장 장소에서 그날 갈 곳을 고르는 자유여행',
    type: 'website',
    locale: 'ko_KR',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: '삥과 가는 대만여행' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '삥과 가는 대만여행',
    description: 'TAIPEI · 2026.09.04—06 · 저장 장소에서 그날 갈 곳을 고르는 자유여행',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
