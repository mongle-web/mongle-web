export type ImageStyleCardId =
  | 'surrealism'
  | 'cubism'
  | 'expressionism'
  | 'illustration';

export interface ImageStyleDefinition {
  id: ImageStyleCardId;
  label: string;
  aliases: readonly string[];
  semanticMarker: string;
}

// 화면에는 이 한국어 이름만 노출한다. 전송 값은 반드시 /image-options가
// 실제로 반환한 원문을 resolveImageStyles에서 찾아 사용한다.
export const IMAGE_STYLE_DEFINITIONS: readonly ImageStyleDefinition[] = [
  {
    id: 'surrealism',
    label: '초현실주의',
    aliases: ['SURREALISM', 'surrealism'],
    semanticMarker: 'surreal',
  },
  {
    id: 'cubism',
    label: '입체주의',
    aliases: ['CUBISM', 'cubism', 'geometric-cubism'],
    semanticMarker: 'cubism',
  },
  {
    id: 'expressionism',
    label: '표현주의',
    aliases: ['EXPRESSIONISM', 'expressionism'],
    semanticMarker: 'expression',
  },
  {
    id: 'illustration',
    label: '일러스트',
    aliases: ['ILLUSTRATION', 'illustration'],
    semanticMarker: 'illustrat',
  },
] as const;

export interface ResolvedImageStyle extends ImageStyleDefinition {
  serverValue: string | null;
}

export function resolveImageStyles(serverStyles: readonly string[]): ResolvedImageStyle[] {
  const unused = new Set(serverStyles);

  return IMAGE_STYLE_DEFINITIONS.map((definition) => {
    const exact = definition.aliases.find((alias) => unused.has(alias));
    const semantic = exact
      ? undefined
      : [...unused].find((value) => value.toLowerCase().includes(definition.semanticMarker));
    const serverValue = exact ?? semantic ?? null;

    if (serverValue) {
      unused.delete(serverValue);
    }

    return { ...definition, serverValue };
  });
}

export function imageStyleLabel(serverValue: string, serverStyles: readonly string[]) {
  return (
    resolveImageStyles(serverStyles).find((style) => style.serverValue === serverValue)?.label ?? null
  );
}
