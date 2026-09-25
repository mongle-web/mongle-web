function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
      <span className="text-sm text-[#aaa1b7]">MONGLE</span>

      <h1 className="text-3xl font-bold">몽글</h1>

      <p className="text-center text-sm leading-6 text-[#aaa1b7]">
        꿈을 기록하고 나만의 Dream World를 만들어보세요.
      </p>

      <button type="button" className="rounded-2xl bg-[#9b63ff] px-6 py-3 font-semibold text-white">
        꿈 기록하기
      </button>
    </div>
  );
}

export default HomePage;
