// 피그마 캐릭터 뒤 빛 번짐 (방사형 그라데이션 3개, 각 30%)
const GLOW_GRADIENT = [
  'radial-gradient(32.86% 32.76% at 50.26% 59.59%, rgba(181, 239, 255, 0.30) 0%, rgba(181, 239, 255, 0.00) 100%)',
  'radial-gradient(24.06% 47.29% at 55.18% 45.6%, rgba(240, 181, 255, 0.30) 0%, rgba(240, 181, 255, 0.00) 100%)',
  'radial-gradient(56.14% 51.61% at 50.26% 50.26%, rgba(190, 181, 255, 0.30) 0%, rgba(190, 181, 255, 0.00) 100%)',
].join(', ');

function GlowBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-1/2 h-[314px] w-[363px] -translate-x-1/2 -translate-y-1/2 rotate-[14.846deg] rounded-full blur-[10px]"
      style={{ background: GLOW_GRADIENT }}
    />
  );
}

export default GlowBackground;
