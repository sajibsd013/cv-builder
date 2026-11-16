import type { CVProfile } from "@/types/cv";

const STOP_WORDS = new Set(
  [
    "a", "about", "after", "all", "also", "an", "and", "are", "as", "at",
    "be", "because", "been", "before", "being", "but", "by", "can", "could",
    "for", "from", "had", "has", "have", "he", "her", "his", "how", "i",
    "if", "in", "into", "is", "it", "its", "may", "more", "most", "my",
    "of", "on", "or", "our", "should", "so", "than", "that", "the", "their",
    "them", "they", "this", "to", "us", "was", "we", "were", "what", "when",
    "where", "which", "who", "will", "with", "you", "your",
  ],
);

export interface ATSMatchResult {
  score: number;
  keywords: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#./-]+/g, " ")
    .split(/\s+/)
    .map((word) => word.replace(/^[./-]+|[./-]+$/g, ""))
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\/-]/g, "\\$&");
}

export function extractKeywords(jobDescription: string): string[] {
  const counts = new Map<string, number>();
  tokenize(jobDescription).forEach((word) => {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort(([wordA, countA], [wordB, countB]) => countB - countA || wordA.localeCompare(wordB))
    .map(([word]) => word);
}

function profileText(profile: CVProfile): string {
  return JSON.stringify(profile)
    .replace(/"[^"]+":/g, " ")
    .replace(/["{},[\]]/g, " ");
}

export function matchJobDescription(
  jobDescription: string,
  profile: CVProfile,
): ATSMatchResult {
  const keywords = extractKeywords(jobDescription);
  const cvText = profileText(profile).toLowerCase();
  const matchedKeywords = keywords.filter((keyword) =>
    new RegExp(`(^|[^a-z0-9])${escapeRegex(keyword)}(?=$|[^a-z0-9])`, "i").test(cvText),
  );
  const missingKeywords = keywords.filter((keyword) => !matchedKeywords.includes(keyword));

  return {
    score: keywords.length ? Math.round((matchedKeywords.length / keywords.length) * 100) : 0,
    keywords,
    matchedKeywords,
    missingKeywords,
  };
}
