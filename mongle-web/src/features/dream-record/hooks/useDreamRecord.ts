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
  toggleEmotionSelection,
  type DreamDraft,
  type Emotion,
} from '../utils/dreamDraft';
import { readImageIntent, writeImageIntent } from '../utils/imageIntent';
import { getImageCost } from '../utils/imageCost';
import { runImageWorkflow } from '../utils/imageWorkflow';

type Screen = 'text' | 'emotion' | 'image' | 'complete';

export function useDreamRecord() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [initial] = useState(() => ({
    date: toDateString(parseRecordDate(params.get('date')) ?? new Date()),
    id: Number(params.get('dreamId')) || null,
    paymentReturn: Boolean(params.get('orderId')),
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
  const sourceChangedDuringEdit = useRef(false);

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
      sourceChangedDuringEdit.current = Boolean(
        saved?.analysisSourceChanged || saved?.generation?.sourceChanged,
      );
      setDream(saved);

      if (saved) {
        // A normal /dreams/new entry always resumes at text, even if the
        // server record is already completed. Only an explicit payment return
        // may restore the image flow automatically.
        const step: Screen = initial.paymentReturn ? 'image' : 'text';

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

  const selectedStyle =
    style || restoredStyle || image.data?.resultStyle || image.data?.style || '';

  const imageBusy =
    waitingImage || image.data?.status === 'PENDING' || image.data?.status === 'PROCESSING';

  const screen = baseScreen === 'image' && hasImage ? 'result' : baseScreen;

  const cost = hasImage ? getImageCost(image.data ?? null) : INITIAL_DREAM_IMAGE_COST;

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
      if (current.originalText === content) {
        return current;
      }

      const previousSourceRevision = current.sourceRevision;
      current = await api.updateCompleted(current, { originalText: content });
      remember(current);
      await invalidateDreamData(current.dreamId);
      if (current.sourceRevision !== previousSourceRevision) {
        sourceChangedDuringEdit.current = true;
      }
      return current;
    }

    if (!current || current.originalText !== content) {
      current = await api.saveDraft(initial.date, content, current);
      remember(current);
    }

    return current;
  }

  async function invalidateDreamData(dreamId: number) {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['dream-record', dreamId] }),
      queryClient.invalidateQueries({ queryKey: ['dreams'] }),
    ]);
  }

  async function regenerateChangedInputs(updated: Dream) {
    const currentGeneration = await api.generation(updated.dreamId);
    if (currentGeneration.status === 'QUEUED' || currentGeneration.status === 'PROCESSING') {
      queryClient.setQueryData(['dream-record', updated.dreamId, 'generation'], currentGeneration);
      return;
    }

    const regenerated = await api.regenerateAnalysisStory(
      updated,
      currentGeneration.generationVersion,
    );
    queryClient.setQueryData(['dream-record', updated.dreamId, 'generation'], regenerated);
    await queryClient.invalidateQueries({
      queryKey: ['dream-record', updated.dreamId, 'analysis'],
    });
    await queryClient.invalidateQueries({
      queryKey: ['dream-record', updated.dreamId, 'story'],
    });
    await queryClient.invalidateQueries({
      queryKey: ['dream-record', updated.dreamId, 'generation'],
    });
  }

  // 자동 저장 타이머가 항상 최신 run · saveText 를 쓰도록 ref 에 담아 둠
  // (함수를 의존성에 직접 넣으면 렌더마다 새로 만들어져서 800ms 타이머가 계속 초기화됨)
  const autoSaveRef = useRef<(content: string) => void>(() => {});

  useEffect(() => {
    autoSaveRef.current = (content) => {
      void run(async () => {
        await saveText(content);
      }, true);
    };
  });

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
      autoSaveRef.current(draft.content);
    }, 800);

    return () => clearTimeout(timer);
  }, [draft.content, ready, busy, saveError, completed, baseScreen, dream?.originalText]);

  function updateDraft(changes: Partial<DreamDraft>) {
    if (completed && baseScreen !== 'text') {
      return;
    }

    setDraft((current) => ({
      ...current,
      ...changes,
    }));
    setSaveError(false);
  }

  function toggleEmotion(emotion: Emotion) {
    if (busy || !ready || (completed && baseScreen !== 'emotion')) {
      return;
    }

    const selection = toggleEmotionSelection(draft.emotions, emotion);
    if (selection.limitReached) {
      setMessage(`감정은 최대 ${MAX_EMOTIONS}개까지 선택할 수 있어요.`);
      return;
    }

    setDraft((current) => ({ ...current, emotions: selection.emotions }));
    setSaveError(false);

    setMessage('');
  }

  function handleNext() {
    if (saveError) {
      setSaveError(false);
    }

    void run(async () => {
      if (baseScreen === 'text' && draft.content.trim()) {
        const saved = await saveText(draft.content);

        const nextDream = saved.recordStatus === 'COMPLETED' ? saved : await api.submit(saved);
        remember(nextDream);

        if (mounted.current) {
          setScreen('emotion');
        }
      } else if (
        baseScreen === 'emotion' &&
        draft.emotions.length > 0 &&
        draft.emotions.length <= MAX_EMOTIONS
      ) {
        const saved = recordRef.current;

        if (!saved) {
          throw new Error('원문을 먼저 저장해 주세요.');
        }

        const emotionsUnchanged =
          (Object.keys(emotionCodes) as Emotion[])
            .filter((emotion) => draft.emotions.includes(emotion))
            .map((emotion) => emotionCodes[emotion])
            .sort()
            .join(',') === [...saved.emotions].sort().join(',');

        const previousSourceRevision = saved.sourceRevision;
        const result =
          saved.recordStatus === 'COMPLETED'
            ? emotionsUnchanged
              ? saved
              : await api.updateCompleted(saved, { emotions: draft.emotions })
            : await api.complete(saved, draft.emotions);
        remember(result);

        if (result.sourceRevision !== previousSourceRevision) {
          sourceChangedDuringEdit.current = true;
        }
        if (
          sourceChangedDuringEdit.current ||
          result.analysisSourceChanged ||
          result.generation?.sourceChanged
        ) {
          await regenerateChangedInputs(result);
          sourceChangedDuringEdit.current = false;
        }

        if (mounted.current) {
          setScreen('image');
        }

        await invalidateDreamData(result.dreamId);
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

    setParams({
      date: toDateString(date),
    });
  }

  function retryGeneration() {
    void run(async () => {
      if (!id) {
        return;
      }

      const latest = await api.get(id);

      remember(latest);

      const retried = await api.retry(latest);
      queryClient.setQueryData(['dream-record', id, 'generation'], retried);

      // The retry endpoint restarts the failed analysis/story pipeline.
      // Refresh dependent reads after the generation job reaches a terminal
      // state; generation itself polls QUEUED/PROCESSING in its query.
      await queryClient.invalidateQueries({
        queryKey: ['dream-record', id, 'analysis'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['dream-record', id, 'story'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['dream-record', id, 'generation'],
      });
    });
  }

  function handleGenerate() {
    void run(async () => {
      if (!id || !generated || !selectedStyle) {
        throw new Error('분석·이야기 생성 완료와 이미지 스타일을 확인해 주세요.');
      }

      try {
        const result = await runImageWorkflow({
          fetchImage: () => api.image(id),
          fetchBalance: () => api.balance(),
          fetchDream: async () => {
            const latest = await api.get(id);
            remember(latest);
            return latest;
          },
          generate: (latest, style, previous) => api.generate(latest, style, previous),
          style: selectedStyle,
          errorCode,
          allowRegeneration: hasImage,
          onImage: (value) => {
            queryClient.setQueryData(['dream-record', id, 'image'], value);
          },
          onBalance: (value) => {
            queryClient.setQueryData(['dream-record', 'balance'], value);
          },
          onStart: () => setWaitingImage(true),
        });

        if (result.kind === 'blocked') {
          throw new Error('결제 확인 중이라 지금은 이미지를 생성할 수 없어요.');
        }

        if (result.kind === 'insufficient') {
          const needsRegeneration =
            result.image?.status === 'COMPLETED' || result.image?.hasPreviousResult === true;

          writeImageIntent({
            dreamId: id,
            style: selectedStyle,
            view: 'offer',
            action: needsRegeneration ? 'regenerate' : 'create',
            ...(needsRegeneration && result.image?.imageVersion !== undefined
              ? { imageVersion: result.image.imageVersion }
              : {}),
          });
          setModal('tokens');
        }
      } catch (error) {
        if (errorCode(error) === 'CREDIT_409_5') {
          await balance.refetch();
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
        void queryClient.invalidateQueries({
          queryKey: ['dreams'],
        });
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
      (!hasImage || cost !== null) &&
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
