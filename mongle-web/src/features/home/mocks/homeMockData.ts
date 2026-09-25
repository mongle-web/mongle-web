export interface RecentDream {
  id: number;
  title: string;
  date: string;
  imageUrl?: string;
}

export const recentDreams: RecentDream[] = [
  {
    id: 1,
    title: '오랜만에 만난 친구',
    date: '9월 16일 (수)',
  },
  {
    id: 2,
    title: '지각하는 꿈',
    date: '9월 8일 (화)',
  },
  {
    id: 3,
    title: '이상한 골목길',
    date: '8월 31일 (월)',
  },
];
