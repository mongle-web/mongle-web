import { calendarMockDreams } from '@/features/calendar/mocks/calendarMockData';
import type {
  DreamDetail,
  DreamDetailUpdate,
  DreamStorySegment,
} from '@/features/dream-detail/types/dreamDetail';

// 개발용 Mock 데이터
// 캘린더 Mock(calendarMockDreams)과 같은 id · 날짜 · 제목을 쓰고, 상세에만 필요한 내용을 덧붙인다
// TODO: 백엔드 API 연동 후 삭제

const WAVE_CONTENT = `바다에 있었다. 엄청 큰 파도가 밀려옴.
친구랑 같이 있었던 것 같음.
갑자기 학교 복도로 바뀜.
교실 찾는데 아무도 없음.
밖에는 밤하늘. 별이 엄청 많았음.
무섭기도 하고 예뻤음.`;

const WAVE_STORY: DreamStorySegment[] = [
  { text: '바다', isAi: false },
  { text: '에 있었다.', isAi: true },
  { text: ' 엄청 큰 파도가 ', isAi: false },
  { text: '밀려오고 있었다.', isAi: true },
  { text: ' ', isAi: false },
  { text: '어떻게 그곳에 가게 됐는지는 기억나지 않지만,', isAi: true },
  { text: ' 친구와 함께 있었던 것 같다. ', isAi: false },
  { text: '그런데 어느 순간 주변 풍경이 달라졌다.', isAi: true },
  { text: ' 갑자기 학교 복도', isAi: false },
  { text: '에 서 있었다. 나는 어디로 가야 할지 몰라', isAi: true },
  { text: ' 교실을 찾아다녔지만 아무도 없었다. ', isAi: false },
  { text: '창 밖으로 시선을 돌리자', isAi: true },
  { text: ' 밤하늘에 별이 가득했다. ', isAi: false },
  { text: '그 광경을 바라보는 동안', isAi: true },
  { text: ' 무섭기도 하고 예쁘기도 했다.', isAi: false },
];

const LATE_CONTENT =
  '아침에 눈을 떴는데 출근 시간까지 10분밖에 남지 않았다. 급하게 씻고 옷을 입으려고 했는데 평소에 입던 옷이 아무리 찾아도 보이지 않았다. 겨우 준비를 마치고 집을 나왔지만 엘리베이터가 계속 다른 층에 멈춰서 내려갈 수가 없었다. 회사에 도착했을 때는 이미 회의가 시작된 상태였고, 회의실 문을 열자 모든 사람이 나를 쳐다봤다. 자리에 앉으려고 하는 순간 알람 소리가 들리면서 잠에서 깼다.';

// 수정한 내용 보관 (새로고침하면 초기화)
const editedContents = new Map<number, string>();

// 이미지가 있는 꿈은 AI 이야기까지 있는 예시, 없는 꿈은 원문만 있는 예시
export const getDreamDetailMock = (dreamId: number): DreamDetail | undefined => {
  const dream = calendarMockDreams.find((item) => item.id === dreamId);
  if (!dream) return undefined;

  const hasImage = Boolean(dream.thumbnailUrl);
  const editedContent = editedContents.get(dreamId);

  return {
    id: dream.id,
    date: dream.date,
    title: dream.title,
    content: editedContent ?? (hasImage ? WAVE_CONTENT : LATE_CONTENT),
    // AI 이야기는 원래 내용을 바탕으로 만든 것이라, 내용을 고치면 빼고 원문만 보여준다
    // TODO: 내용 수정 시 AI 이야기를 다시 만들지 백엔드와 협의
    aiStory: hasImage && editedContent === undefined ? WAVE_STORY : undefined,
    imageUrl: dream.thumbnailUrl,
    emotions: ['불안함', '당황스러움', '긴장감'],
    keywords: dream.keywords,
  };
};

// 꿈 제목 · 내용 수정
// 제목은 캘린더 Mock에도 반영해서 캘린더 카드에도 바뀐 제목이 보이게 한다
export const updateDreamDetailMock = (dreamId: number, update: DreamDetailUpdate) => {
  const dream = calendarMockDreams.find((item) => item.id === dreamId);
  if (!dream) return undefined;

  const current = getDreamDetailMock(dreamId);
  dream.title = update.title;
  if (current && current.content !== update.content) {
    editedContents.set(dreamId, update.content);
  }

  return getDreamDetailMock(dreamId);
};
