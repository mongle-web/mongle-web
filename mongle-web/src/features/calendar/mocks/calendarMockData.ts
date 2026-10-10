import type { CalendarDream } from '@/features/calendar/types/calendar';
import { toDateKey } from '@/features/calendar/utils/calendar';

// 개발용 Mock 데이터
// 어느 달에 실행해도 화면이 보이도록 "이번 달 / 지난 달" 기준으로 날짜를 만든다.
// TODO: 백엔드 API 연동 후 삭제

const today = new Date();

const dateOf = (monthOffset: number, day: number) =>
  toDateKey(new Date(today.getFullYear(), today.getMonth() + monthOffset, day));

export const calendarMockDreams: CalendarDream[] = [
  {
    id: 1,
    date: dateOf(0, 3),
    title: '오랜만에 만난 친구',
    keywords: ['친구', '학교'],
    thumbnailUrl: 'https://picsum.photos/seed/mongle-1/400/300',
  },
  {
    id: 2,
    date: dateOf(0, 7),
    title: '끝없이 이어지는 계단',
    keywords: ['계단', '새로운 일'],
    thumbnailUrl: 'https://picsum.photos/seed/mongle-2/400/300',
  },
  {
    id: 3,
    date: dateOf(0, 8),
    title: '이상한 골목길',
    keywords: ['골목', '비'],
    // 이미지 로딩 실패 UI 확인용 (일부러 잘못된 주소)
    thumbnailUrl: 'https://invalid.mongle.local/broken.png',
  },
  {
    id: 4,
    date: dateOf(0, 16),
    title: '지각하는 꿈',
    keywords: ['계단', '새로운 일'],
  },
  {
    id: 5,
    date: dateOf(-1, 12),
    title: '파도 너머의 밤',
    keywords: ['바다', '밤하늘'],
    thumbnailUrl: 'https://picsum.photos/seed/mongle-5/400/300',
  },
  {
    id: 6,
    date: dateOf(-1, 20),
    title: '하늘을 나는 꿈',
    keywords: ['하늘', '자유'],
  },
];
