// 보관함 탭 (기록한 꿈 / 연결된 꿈)
export type ArchiveTab = 'recorded' | 'connected';

// 보관함 "기록한 꿈" 카드 정보
// TODO: 백엔드 API 응답 구조가 확정되면 필드 이름을 맞춰서 수정
export interface ArchiveDream {
  id: number;
  date: string; // 'YYYY-MM-DD'
  title: string;
  keywords: string[];
}

// 보관함 "연결된 꿈" 카드 정보
// 여러 지난 꿈을 이어서 만든 이야기 1개
export interface ConnectedDream extends ArchiveDream {
  connectedDreamTitles: string[]; // 연결에 사용한 꿈 제목들 (첫 번째 제목 + "외 N개"로 표시)
}
