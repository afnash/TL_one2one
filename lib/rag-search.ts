import { StudyMaterial } from "@/types";
import { supabaseConfigured, supabaseRequest } from "./supabase";

export interface MaterialMatch {
  material: StudyMaterial;
  score: number;
  matchedKeywords: string[];
  matchReasons: string[];
}

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but",
  "by", "can", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for",
  "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself",
  "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just",
  "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once",
  "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "please", "s", "same",
  "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them",
  "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too",
  "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which",
  "while", "who", "whom", "why", "will", "with", "would", "you", "your", "yours", "yourself",
  "yourselves", "tell", "give", "show", "find", "notes", "material", "materials", "doc", "docs",
  "pdf", "video", "videos", "document", "documents", "content", "explain", "help"
]);

/**
 * Extract meaningful keywords from a natural language query
 */
export function extractKeywords(query: string): string[] {
  if (!query) return [];
  const tokens = query
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

  return Array.from(new Set(tokens));
}

/**
 * Search and rank study materials strictly by keywords, topic, subject, and metadata
 */
export async function searchStudyMaterials(
  query: string,
  allMaterials: StudyMaterial[]
): Promise<MaterialMatch[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const queryKeywords = extractKeywords(trimmed);
  const normalizedQuery = trimmed.toLowerCase();

  // Try fetching directly from Supabase RPC first if configured
  let rpcResults: StudyMaterial[] = [];
  if (supabaseConfigured) {
    try {
      const data = await supabaseRequest<StudyMaterial[]>("/rest/v1/rpc/search_materials", {
        method: "POST",
        body: JSON.stringify({ p_query: trimmed }),
      });
      if (Array.isArray(data)) {
        rpcResults = data;
      }
    } catch {
      // Fallback to in-memory list from store
    }
  }

  // Combine and deduplicate materials
  const materialMap = new Map<string, StudyMaterial>();
  for (const m of allMaterials) {
    if (m && m.id) materialMap.set(m.id, m);
  }
  for (const m of rpcResults) {
    if (m && m.id) materialMap.set(m.id, m);
  }

  const candidateList = Array.from(materialMap.values());
  const matches: MaterialMatch[] = [];

  for (const mat of candidateList) {
    let score = 0;
    const matchedKeywords: string[] = [];
    const matchReasons: string[] = [];

    const matKeywords = (mat.keywords || []).map((k) => k.toLowerCase().trim());
    const matTopic = (mat.topic || "").toLowerCase().trim();
    const matSubject = (mat.subject || "").toLowerCase().trim();
    const matTitle = (mat.title || "").toLowerCase().trim();
    const matDesc = (mat.description || "").toLowerCase().trim();

    // 1. Direct whole-query phrase match
    if (matTopic && normalizedQuery.includes(matTopic)) {
      score += 20;
      matchReasons.push(`Exact topic match: "${mat.topic}"`);
    } else if (matTopic && matTopic.includes(normalizedQuery)) {
      score += 15;
      matchReasons.push(`Topic contains query: "${mat.topic}"`);
    }

    if (matSubject && normalizedQuery.includes(matSubject)) {
      score += 10;
      matchReasons.push(`Subject match: "${mat.subject}"`);
    }

    if (matTitle && (matTitle.includes(normalizedQuery) || normalizedQuery.includes(matTitle))) {
      score += 12;
      matchReasons.push(`Title match: "${mat.title}"`);
    }

    // 2. Keyword matching
    for (const kw of matKeywords) {
      if (!kw) continue;
      if (normalizedQuery.includes(kw)) {
        score += 15;
        matchedKeywords.push(kw);
      } else {
        // Check individual tokens
        for (const token of queryKeywords) {
          if (kw === token || kw.includes(token) || token.includes(kw)) {
            score += 10;
            matchedKeywords.push(kw);
            break;
          }
        }
      }
    }

    // 3. Check token matches on topic, subject, and description
    for (const token of queryKeywords) {
      if (matTopic.includes(token)) {
        score += 8;
        if (!matchReasons.some((r) => r.includes("topic"))) {
          matchReasons.push(`Topic match: "${mat.topic}"`);
        }
      }
      if (matSubject.includes(token)) {
        score += 5;
        if (!matchReasons.some((r) => r.includes("subject"))) {
          matchReasons.push(`Subject: "${mat.subject}"`);
        }
      }
      if (matTitle.includes(token)) {
        score += 6;
      }
      if (matDesc.includes(token)) {
        score += 4;
      }
    }

    // RPC match bonus if returned from Supabase directly
    if (rpcResults.some((r) => r.id === mat.id)) {
      score += 8;
    }

    if (score > 0) {
      matches.push({
        material: mat,
        score,
        matchedKeywords: Array.from(new Set(matchedKeywords)),
        matchReasons: Array.from(new Set(matchReasons)),
      });
    }
  }

  // Sort descending by score
  matches.sort((a, b) => b.score - a.score);
  return matches;
}

/**
 * Generate a strictly grounded answer based exclusively on matched documents
 */
export function buildGroundedAnswer(
  query: string,
  matches: MaterialMatch[]
): {
  reply: string;
  matchedDocs: StudyMaterial[];
  hasResults: boolean;
} {
  if (!matches.length) {
    return {
      reply: `I could not find any study materials or documents matching "${query}" in our repository.\n\nAs a context-grounded assistant, I answer strictly using your uploaded materials. Please try asking about a specific subject, topic, or keyword that has been uploaded.`,
      matchedDocs: [],
      hasResults: false,
    };
  }

  const topMatches = matches.slice(0, 3);
  const matchedDocs = topMatches.map((m) => m.material);

  let reply = `Found **${topMatches.length} relevant document${topMatches.length > 1 ? "s" : ""}** in the study library matching your inquiry:\n\n`;

  topMatches.forEach((m, idx) => {
    const doc = m.material;
    const typeLabel = doc.type === "VIDEO" ? "🎥 Video Lecture" : "📄 " + doc.type + " Document";
    reply += `### ${idx + 1}. ${doc.title} (${typeLabel})\n`;
    reply += `- **Subject**: ${doc.subject}\n`;
    if (doc.topic) {
      reply += `- **Topic**: ${doc.topic}\n`;
    }
    if (doc.keywords && doc.keywords.length > 0) {
      reply += `- **Keywords**: ${doc.keywords.map((k) => `\`${k}\``).join(", ")}\n`;
    }
    if (doc.description) {
      reply += `- **Content Overview**: ${doc.description}\n`;
    }
    reply += `\n`;
  });

  reply += `> **Context Reference**: This response is retrieved strictly from the verified Supabase study materials repository. You can view or stream the documents below.`;

  return {
    reply,
    matchedDocs,
    hasResults: true,
  };
}
