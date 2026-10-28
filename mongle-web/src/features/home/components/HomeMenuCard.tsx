import { useNavigate } from 'react-router-dom';

import dreamArchiveImage from '@/assets/images/home/dream_archive.svg';
import dreamLinkImage from '@/assets/images/home/dream_link.svg';
import { LOGIN_PATH } from '@/hooks/useAuth';

type HomeMenuCardType = 'link' | 'archive';

// TODO: 각 페이지가 생기면 path만 바꾸기
const MENU_CONTENT = {
  link: {
    title: '꿈의 연결고리',
    image: dreamLinkImage,
    path: '/connect',
    // 카드 오른쪽 아래 모서리에 붙임 (SVG가 카드 밖으로 나가는 부분은 이미 잘라둠)
    imageClassName: 'right-0 bottom-0',
  },
  archive: {
    title: '지난 꿈 보관함',
    image: dreamArchiveImage,
    path: '/archive',
    // 피그마: 카드 위에서 약 62px, 카드가 넓어져도 가로 가운데 유지
    // 양쪽 끝이 점점 흐려짐
    imageClassName:
      'top-[62px] left-1/2 -translate-x-1/2 [mask-image:linear-gradient(to_right,transparent,black_40%,black_75%,transparent)]',
  },
} satisfies Record<
  HomeMenuCardType,
  { title: string; image: string; path: string; imageClassName: string }
>;

interface HomeMenuCardProps {
  type: HomeMenuCardType;
  isLoggedIn: boolean;
}

// 홈 2열 메뉴 카드 (꿈의 연결고리 / 지난 꿈 보관함)
function HomeMenuCard({ type, isLoggedIn }: HomeMenuCardProps) {
  const navigate = useNavigate();
  const { title, image, path, imageClassName } = MENU_CONTENT[type];

  const handleClick = () => {
    navigate(isLoggedIn ? path : LOGIN_PATH);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative flex h-[184px] w-full cursor-pointer flex-col overflow-hidden rounded-[24px] bg-n-900 pt-5 pl-5 text-left"
    >
      <p className="text-[16px] leading-[1.5] font-medium text-b-200">{title}</p>

      <img
        src={image}
        alt=""
        className={`pointer-events-none absolute max-w-none select-none ${imageClassName}`}
      />
    </button>
  );
}

export default HomeMenuCard;
