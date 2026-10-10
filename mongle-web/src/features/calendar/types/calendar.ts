// 캘린더 화면에서 사용하는 꿈 요약 정보
// TODO: 백엔드 API 응답 구조가 확정되면 필드 이름을 맞춰서 수정
export interface CalendarDream {
  id: number;
  date: string; // 'YYYY-MM-DD'
  title: string;
  keywords: string[];
  thumbnailUrl?: string; // 이미지를 생성하지 않은 꿈은 없음
}

// 캘린더 한 칸(하루)의 정보
export interface CalendarDay {
  date: Date;
  dateKey: string; // 'YYYY-MM-DD'
  isCurrentMonth: boolean; // 표시 중인 달에 속한 날짜인지 (앞뒤 달 날짜는 false)
  dream?: CalendarDream;
}
