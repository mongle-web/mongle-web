import calendarCharacter from '@/assets/images/calendar/calendar_character.png';
import calendarGlow from '@/assets/images/calendar/calendar_glow.svg';

interface CalendarHeroProps {
  monthLabel: string; // '이번 달' 또는 '9월'
  dreamDayCount: number;
  isLoaded: boolean; // 그 달 꿈 목록을 받았는지 (받기 전에는 빈 달 문구를 띄우지 않음)
}

// 상단 문구 + 몽글 캐릭터
// 기록이 없는 달은 "잊기 전에 / 꿈을 기록해 보세요" (피그마: iPhone 16 - 223, 문구 스타일은 같음)
function CalendarHero({ monthLabel, dreamDayCount, isLoaded }: CalendarHeroProps) {
  const isEmptyMonth = isLoaded && dreamDayCount === 0;

  return (
    <section className="relative h-[134px]">
      <h1 className="text-[20px] leading-[1.4] font-semibold text-b-200">
        {isEmptyMonth ? (
          <>
            잊기 전에
            <br />
            꿈을 기록해 보세요
          </>
        ) : (
          <>
            {monthLabel},
            <br />
            <span className="text-p-300">{dreamDayCount}일</span>의 꿈이 쌓여 있어요
          </>
        )}
      </h1>

      <div aria-hidden="true" className="absolute top-[5px] right-2 h-[112px] w-[125px]">
        {/* 캐릭터 뒤 빛 번짐 (피그마 기준 캐릭터 중심에서 왼쪽 3px, 아래 9.5px) */}
        <img
          src={calendarGlow}
          alt=""
          className="pointer-events-none absolute top-[calc(50%+9.5px)] left-[calc(50%-3px)] size-[233px] max-w-none! -translate-x-1/2 -translate-y-1/2"
        />
        <img
          src={calendarCharacter}
          alt=""
          className="pointer-events-none relative size-full object-cover"
        />
      </div>
    </section>
  );
}

export default CalendarHero;
