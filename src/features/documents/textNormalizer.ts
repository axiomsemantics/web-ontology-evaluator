import { STOPWORDS } from "./stopwords";

export function tokenizeText(text: string, removeStopwords = true): string[] {
  const normalized = text
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .replace(/https?:\/\/\S+|www\.\S+/gu, " ")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ");

  return normalized
    .split(/\s+/u)
    .map((token) => token.replace(/^[-']+|[-']+$/g, ""))
    .filter((token) => token.length >= 3 && !/^\d+$/u.test(token))
    .filter((token) => !removeStopwords || !STOPWORDS.has(token));
}

export function countTerms(text: string): Map<string, number> {
  const frequencies = new Map<string, number>();
  for (const token of tokenizeText(text)) {
    frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
  }
  return frequencies;
}
