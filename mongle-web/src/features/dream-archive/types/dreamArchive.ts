// 보관함 탭 (기록한 꿈 / 연결된 꿈)
export type ArchiveTab = 'recorded' | 'connected';

// 보관함 카드 공통 정보
export interface ArchiveDream {
  id: number;
  date: string; // 'YYYY-MM-DD'
  title: string;
  keywords: string[];
}

// 보관함 "기록한 꿈" 카드 정보
export interface RecordedDream extends ArchiveDream {
  revision: number; // 삭제할 때 백엔드에 넘기는 최신 버전
}

// 보관함 "연결된 꿈" 카드 정보
// 여러 지난 꿈을 이어서 만든 이야기(세계관) 1개
// 카드 문구: "{firstDreamTitle} 외 {connectedDreamCount - 1}개의 꿈을 연결했어요"
export interface ConnectedDream extends ArchiveDream {
  firstDreamTitle: string; // 연결한 꿈 중 가장 오래된 꿈 제목
  connectedDreamCount: number; // 연결한 꿈 수
  revision: number; // 삭제할 때 백엔드에 넘기는 최신 버전
}
