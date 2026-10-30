// 캘린더 화면에서 사용하는 꿈 요약 정보
export interface CalendarDream {
  id: number;
  date: string; // 'YYYY-MM-DD'
  title: string;
  keywords: string[];
  revision: number; // 삭제할 때 백엔드에 넘기는 최신 버전
  thumbnail?: DreamThumbnail; // 썸네일 주소를 다시 받을 때 사용 (이미지 없는 꿈은 없음)
  thumbnailUrl?: string; // 썸네일 임시 주소 (이미지가 없거나 주소를 못 받으면 없음)
}

// 썸네일 주소를 받을 때 쓰는 이미지 정보 (같은 이미지 · 버전이면 주소를 재사용)
export interface DreamThumbnail {
  imageId: number;
  imageVersion: number;
}

// 캘린더 한 칸(하루)의 정보
export interface CalendarDay {
  date: Date;
  dateKey: string; // 'YYYY-MM-DD'
  isCurrentMonth: boolean; // 표시 중인 달에 속한 날짜인지 (앞뒤 달 날짜는 false)
  dream?: CalendarDream;
}
