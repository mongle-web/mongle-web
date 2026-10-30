import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { authStorage } from '@/api/authStorage';

import {
  dreamRecordApi as api,
  emotionCodes,
  errorCode,
  errorMessage,
  INITIAL_DREAM_IMAGE_COST,
  type Dream,
} from '../api/dreamRecordApi';

import {
  MAX_EMOTIONS,
  parseRecordDate,
  toDateString,
  type DreamDraft,
  type Emotion,
} from '../utils/dreamDraft';
import { readImageIntent } from '../utils/imageIntent';

type Screen = 'text' | 'emotion' | 'image' | 'complete';

export function useDreamRecord() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [initial] = useState(() => ({
    date: toDateString(parseRecordDate(params.get('date')) ?? new Date()),
    id: Number(params.get('dreamId')) || null,
  }));

  const [draft, setDraft] = useState<DreamDraft>({
    date: initial.date,
    content: '',
    emotions: [],
    imageRequested: false,
    step: 'text',
  });

  const [baseScreen, setScreen] = useState<Screen>('text');
  const [dream, setDream] = useState<Dream | null>(null);
  const recordRef = useRef<Dream | null>(null);

  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const mounted = useRef(false);

  const [message, setMessage] = useState('기록을 확인하고 있어요.');
  const [saveError, setSaveError] = useState(false);
  const [restoreVersion, setRestoreVersion] = useState(0);

  const [modal, setModal] = useState<'tokens' | null>(null);
  const [style, setStyle] = useState('');
  const [waitingImage, setWaitingImage] = useState(false);

  const completed = dream?.recordStatus === 'COMPLETED';
  const id = dream?.dreamId;

  function remember(value: Dream) {
    recordRef.current = value;

    if (!mounted.current) {
      return;
    }

    setDream(value);

    setParams(
      (current) => {
        current.set('date', value.dreamedAt);
        current.set('dreamId', String(value.dreamId));
        return current;
      },
      { replace: true },
    );
  }

  useEffect(() => {
    mounted.current = true;

    const controller = new AbortController();

    async function restore() {
      if (!authStorage.getAccessToken()) {
        throw new Error('꿈을 기록하려면 먼저 로그인해 주세요.');
      }

      // URL의 ID만 신뢰하지 않고 서버에서 소유권·상태·최신 revision을 확인한다.
      const currentId = recordRef.current?.dreamId ?? initial.id;

      const saved = currentId
        ? await api.get(currentId, controller.signal)
        : await api.findByDate(initial.date, controller.signal);

      if (controller.signal.aborted) {
        return;
      }

      if (saved && saved.dreamedAt !== initial.date) {
        throw new Error('기록 날짜와 요청한 날짜가 달라요. 보관함에서 기록을 다시 열어 주세요.');
      }

      recordRef.current = saved;
      setDream(saved);

      if (saved) {
        const step =
          saved.recordStatus === 'COMPLETED'
            ? 'image'
            : saved.recordStatus === 'EMOTION_PENDING'
              ? 'emotion'
              : 'text';

        setDraft({
          date: saved.dreamedAt,
          content: saved.originalText,
          emotions: (Object.keys(emotionCodes) as Emotion[]).filter((key) =>
            saved.emotions.includes(emotionCodes[key]),
          ),
          imageRequested: false,
          step,
        });

        setScreen(step);
      }

      setSaveError(false);
      setReady(true);
      setMessage(saved ? '서버에 저장된 기록을 불러왔어요.' : '');
    }

    void restore().catch((error) => {
      if (!controller.signal.aborted) {
        setMessage(errorMessage(error));
      }
    });

    return () => {
      controller.abort();
      mounted.current = false;
    };
  }, [initial, restoreVersion]);

  // 상태 조회만 반복한다. 실패한 생성 요청은 자동으로 재전송하지 않는다.
  const generation = useQuery({
    queryKey: ['dream-record', id, 'generation'],
    queryFn: ({ signal }) => api.generation(id!, signal),
    enabled: ready && completed,
    retry: false,
    refetchInterval: (query) =>
      !query.state.error && ['QUEUED', 'PROCESSING'].includes(query.state.data?.status ?? '')
        ? 2000
        : false,
  });

  const generated = generation.data?.status === 'COMPLETED' && !generation.data.sourceChanged;

  const analysis = useQuery({
    queryKey: ['dream-record', id, 'analysis', generation.data?.analysisId],
    queryFn: ({ signal }) => api.analysis(generation.data!.analysisId!, signal),
    enabled: ready && generated && !!generation.data?.analysisId,
    retry: false,
  });

  const story = useQuery({
    queryKey: ['dream-record', id, 'story', generation.data?.generationVersion],
    queryFn: ({ signal }) => api.story(id!, signal),
    enabled: ready && generated,
    retry: false,
  });

  const image = useQuery({
    queryKey: ['dream-record', id, 'image'],
    queryFn: ({ signal }) => api.image(id!, signal),
    enabled: ready && completed,
    retry: false,
    refetchInterval: (query) =>
      !query.state.error &&
      (waitingImage || ['PENDING', 'PROCESSING'].includes(query.state.data?.status ?? ''))
        ? 2000
        : false,
  });

  const hasImage = image.data?.status === 'COMPLETED' || image.data?.hasPreviousResult === true;

  const download = useQuery({
    queryKey: ['dream-record', id, 'download', image.data?.imageId, image.data?.imageVersion],
    queryFn: ({ signal }) => api.download(image.data!.imageId, signal),
    enabled: ready && hasImage,
    retry: false,

    // 임시 URL 만료 전에 주소만 갱신한다. 이미지 생성·과금을 다시 요청하지 않는다.
    refetchInterval: (query) => {
      if (query.state.error || !query.state.data) {
        return false;
      }

      const remaining = Date.parse(query.state.data.expiresAt) - Date.now() - 30000;

      return Number.isFinite(remaining) ? Math.max(1000, remaining) : 60000;
    },

    gcTime: 0,
  });

  const options = useQuery({
    queryKey: ['dream-record', 'options'],
    queryFn: ({ signal }) => api.options(signal),
    enabled: ready && completed,
    retry: false,
  });

  const balance = useQuery({
    queryKey: ['dream-record', 'balance'],
    queryFn: ({ signal }) => api.balance(signal),
    enabled: ready && completed,
    retry: false,
  });

  const restoredStyle = id ? (readImageIntent(id)?.style ?? '') : '';
  const selectedStyle = style || restoredStyle || image.data?.resultStyle || image.data?.style || '';

  const imageBusy =
    waitingImage || image.data?.status === 'PENDING' || image.data?.status === 'PROCESSING';

  const screen = baseScreen === 'image' && hasImage ? 'result' : baseScreen;

  const cost = hasImage
    ? (image.data?.nextRegenerationCost ?? null)
    : INITIAL_DREAM_IMAGE_COST;
  const tokens = balance.data?.available ?? null;

  async function run(action: () => Promise<void>, saving = false) {
    if (lock.current || !ready) {
      return;
    }

    lock.current = true;
    setBusy(true);
    setMessage('');

    try {
      await action();
    } catch (error) {
      if (mounted.current) {
        setMessage(errorMessage(error));

        // 저장 응답이 불확실하면 자동저장을 멈추고 명시적으로 복구한다.
        if (saving) {
          setSaveError(true);
        }
      }
    } finally {
      lock.current = false;

      if (mounted.current) {
        setBusy(false);
      }
    }
  }

  async function saveText(content: string) {
    let current = recordRef.current;

    if (current?.recordStatus === 'COMPLETED') {
      throw new Error('이미 저장이 완료된 기록이에요. 보관함에서 수정해 주세요.');
    }

    if (!current || current.originalText !== content) {
      current = await api.saveDraft(initial.date, content, current);
      remember(current);
    }

    return current;
  }

  useEffect(() => {
    if (
      !ready ||
      busy ||
      saveError ||
      completed ||
      baseScreen !== 'text' ||
      draft.content === (dream?.originalText ?? '')
    ) {
      return;
    }

    const timer = setTimeout(() => {
      void run(async () => {
        await saveText(draft.content);
      }, true);
    }, 800);

    return () => clearTimeout(timer);

    // 저장 시점의 원문과 recordRef의 최신 revision을 사용한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.content, ready, busy, saveError, completed, baseScreen, dream?.originalText]);

  function updateDraft(changes: Partial<DreamDraft>) {
    if (completed) {
      return;
    }

    setDraft((current) => ({ ...current, ...changes }));
  }

  function toggleEmotion(emotion: Emotion) {
    if (busy || !ready || completed) {
      return;
    }

    if (!draft.emotions.includes(emotion) && draft.emotions.length >= MAX_EMOTIONS) {
      setMessage(`감정은 최대 ${MAX_EMOTIONS}개까지 선택할 수 있어요.`);
      return;
    }

    setDraft((current) => ({
      ...current,
      emotions: current.emotions.includes(emotion)
        ? current.emotions.filter((item) => item !== emotion)
        : [...current.emotions, emotion],
    }));

    setMessage('');
  }

  function handleNext() {
    if (saveError) {
      setMessage('입력 내용을 복사한 뒤 서버 기록 다시 불러오기를 눌러 주세요.');
      return;
    }

    void run(async () => {
      if (baseScreen === 'text' && draft.content.trim()) {
        const saved = await saveText(draft.content);

        remember(await api.submit(saved));

        if (mounted.current) {
          setScreen('emotion');
        }
      } else if (baseScreen === 'emotion' && draft.emotions.length) {
        const saved = recordRef.current;

        if (!saved) {
          throw new Error('원문을 먼저 저장해 주세요.');
        }

        const result = await api.complete(saved, draft.emotions);
        remember(result);

        if (mounted.current) {
          setScreen('image');
        }

        await queryClient.invalidateQueries({
          queryKey: ['dream-record', result.dreamId],
        });
        await queryClient.invalidateQueries({ queryKey: ['dreams'] });
      }
    }, true);
  }

  function handleBack() {
    if (busy) {
      return;
    }

    if (baseScreen === 'emotion') {
      setScreen('text');
      return;
    }

    navigate('/');
  }

  function selectDate(date: Date) {
    if (dream || busy || draft.content) {
      setMessage('작성 중인 기록의 날짜는 변경할 수 없어요.');
      return;
    }

    setParams({ date: toDateString(date) });
  }

  function retryGeneration() {
    void run(async () => {
      if (!id) {
        return;
      }

      const latest = await api.get(id);

      remember(latest);

      await api.retry(latest);
      await generation.refetch();
    });
  }

  function handleGenerate() {
    void run(async () => {
      if (!id || !generated || !selectedStyle) {
        throw new Error('분석·이야기 생성 완료와 이미지 스타일을 확인해 주세요.');
      }

      // 이전 요청의 응답을 놓쳤을 수 있으므로 POST 전에 상태부터 확인한다.
      const existing = await api.image(id);

      queryClient.setQueryData(['dream-record', id, 'image'], existing);

      if (existing?.status === 'PENDING' || existing?.status === 'PROCESSING') {
        return;
      }

      // 이미 성공한 요청을 실수로 재생성 요청으로 바꾸지 않는다.
      if (!hasImage && (existing?.status === 'COMPLETED' || existing?.hasPreviousResult)) {
        return;
      }

      const currentBalance = await api.balance();

      queryClient.setQueryData(['dream-record', 'balance'], currentBalance);

      if (currentBalance.spendingBlocked) {
        throw new Error('결제 확인 중이라 지금은 이미지를 생성할 수 없어요.');
      }

      const needsRegeneration = existing?.status === 'COMPLETED' || existing?.hasPreviousResult;
      const required = needsRegeneration
        ? existing?.nextRegenerationCost
        : INITIAL_DREAM_IMAGE_COST;

      if (required == null) {
        throw new Error('재생성 비용을 확인할 수 없어요. 잠시 후 다시 조회해 주세요.');
      }

      if (currentBalance.available < required) {
        setModal('tokens');
        return;
      }

      const latest = await api.get(id);

      remember(latest);
      setWaitingImage(true);

      try {
        const result = await api.generate(latest, selectedStyle, existing);

        queryClient.setQueryData(['dream-record', id, 'image'], result);
      } catch (error) {
        // 시간 초과가 생성 실패를 의미하지는 않으므로 GET으로 접수 상태를 확인한다.
        const reconciled = await image.refetch();

        if (
          reconciled.data &&
          ['PENDING', 'PROCESSING', 'COMPLETED'].includes(reconciled.data.status)
        ) {
          return;
        }

        if (errorCode(error).includes('CREDIT')) {
          setModal('tokens');
        }

        throw error;
      } finally {
        if (mounted.current) {
          setWaitingImage(false);
        }

        await balance.refetch();
      }
    });
  }

  useEffect(() => {
    if (image.data?.status === 'COMPLETED' || image.data?.status === 'FAILED') {
      void queryClient.invalidateQueries({
        queryKey: ['dream-record', 'balance'],
      });

      if (image.data.status === 'COMPLETED') {
        void queryClient.invalidateQueries({ queryKey: ['dreams'] });
      }
    }
  }, [image.data?.status, image.data?.imageVersion, queryClient]);

  const queryError =
    generation.error ||
    image.error ||
    download.error ||
    options.error ||
    balance.error ||
    analysis.error ||
    story.error;

  return {
    draft,
    screen,
    dream,
    ready,
    busy,
    message: message || (queryError ? errorMessage(queryError) : ''),
    saveError,
    modal,
    setModal,
    setMessage,
    tokens,
    cost,
    imageBusy,

    dateLocked: !!dream || busy || !!draft.content,

    storageWarning:
      busy && !completed
        ? '서버에 저장하고 있어요…'
        : !ready
          ? '기록 확인이 끝난 뒤 작성할 수 있어요.'
          : '',

    generation,
    analysis,
    story,
    image,
    download,
    options,
    balance,
    selectedStyle,
    setStyle,

    canGenerate:
      ready &&
      !busy &&
      !imageBusy &&
      generated &&
      analysis.data?.status === 'COMPLETED' &&
      !analysis.data.sourceChanged &&
      story.data?.status === 'COMPLETED' &&
      !story.data.sourceChanged &&
      !!selectedStyle &&
      !!options.data?.styles.includes(selectedStyle) &&
      !image.isPending &&
      !image.isError,

    updateDraft,
    toggleEmotion,
    handleNext,
    handleBack,
    selectDate,
    handleGenerate,
    retryGeneration,

    handleSaveWithoutImage: () => {
      if (completed && !busy && !imageBusy) {
        setScreen('complete');
      }
    },

    restore: () => {
      if (!busy) {
        setReady(false);
        setMessage('기록을 확인하고 있어요.');
        setRestoreVersion((value) => value + 1);
      }
    },

    refreshResults: () => {
      void generation.refetch();
      void image.refetch();
      void balance.refetch();
      void options.refetch();

      if (generated) {
        if (generation.data?.analysisId) {
          void analysis.refetch();
        }

        void story.refetch();
      }

      if (hasImage) {
        void download.refetch();
      }
    },
  };
}
