import { NextRequest } from "next/server";
import { analyzeTextWithLLM } from "@/lib/llmAnalyze";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const text: string = typeof body?.text === "string" ? body.text : "";
  // Optional system overrides to tweak feedback style/requirements.
  const systemOverrides: string | undefined =
    typeof body?.systemOverrides === "string" ? body.systemOverrides : undefined;
  const currentItems = Array.isArray(body?.currentItems) ? body.currentItems : undefined;

  const result = await analyzeTextWithLLM(text, { systemOverrides, currentItems });
  return Response.json(result);
}
