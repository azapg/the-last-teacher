import { NextRequest } from "next/server";
import type { HighlightItem } from "@/lib/highlighter";

// Minimal demo highlights for now (stand-in for future LLM response)
const demoHighlights: HighlightItem[] = [
  {
    fragment: "literally",
    context: "I literally held my breath",
    type: "error",
    hoverTip: "Unless you mean it literally, avoid intensifiers that can be misused.",
  },
  {
    fragment: "basically",
    context: "said the path was basically safe",
    type: "wording",
    hoverTip: "Filler. If it's safe, say 'safe'. If not, be precise.",
  },
  {
    fragment: "kind of",
    context: "felt kind of impressive",
    type: "vague",
    hoverTip: "Be specific—what quality did you perceive?",
  },
  {
    fragment: "kinda",
    context: "looked kinda tired",
    type: "typo",
    hoverTip: "Prefer a more precise, standard phrasing.",
  },
];

export async function POST(req: NextRequest) {
  // Read the raw text but ignore it for now (demo behavior).
  // const { text } = await req.json().catch(() => ({ text: "" }));
  await req.json().catch(() => ({}));
  return Response.json({ items: demoHighlights });
}
