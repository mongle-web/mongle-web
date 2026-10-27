import type { ConnectedDream } from '@/features/dream-archive/types/dreamArchive';

// 개발용 Mock 데이터 ("연결된 꿈" 탭)
// "기록한 꿈" 탭은 캘린더 Mock(calendarMockDreams)을 그대로 사용
// TODO: 백엔드 API 연동 후 삭제

const today = new Date();

const dateOf = (dayOffset: number) => {
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOffset);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export const connectedMockDreams: ConnectedDream[] = [
  {
    id: 101,
    date: dateOf(1),
    title: '별이 쏟아지는 학교',
    keywords: ['학교', '밤하늘'],
    connectedDreamTitles: [
      '파도 너머의 밤',
      '오랜만에 만난 친구',
      '이상한 골목길',
      '하늘을 나는 꿈',
      '끝없이 이어지는 계단',
    ],
  },
  {
    id: 102,
    date: dateOf(5),
    title: '계단 끝의 회의실',
    keywords: ['계단', '새로운 일'],
    connectedDreamTitles: ['끝없이 이어지는 계단', '지각하는 꿈'],
  },
];
