import calendarCharacter from '@/assets/images/calendar/calendar_character.png';
import calendarGlow from '@/assets/images/calendar/calendar_glow.svg';

interface CalendarHeroProps {
  monthLabel: string; // '이번 달' 또는 '9월'
  dreamDayCount: number;
}

// 상단 문구 + 몽글 캐릭터
function CalendarHero({ monthLabel, dreamDayCount }: CalendarHeroProps) {
  return (
    <section className="relative h-[134px]">
      <h1 className="text-[20px] leading-[1.4] font-semibold text-b-200">
        {monthLabel},
        <br />
        <span className="text-p-300">{dreamDayCount}일</span>의 꿈이 쌓여 있어요
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
