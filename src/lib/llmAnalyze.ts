import type { HighlightItem } from "@/lib/highlighter";
import { getSystemPrompt } from "@/lib/analyzePrompt";

export type AnalyzeOptions = {
    systemOverrides?: string;
    model?: string; // default moonshotai/kimi-k2-instruct
    currentItems?: HighlightItem[]; // existing highlights to maintain stability
    currentScore?: number; // existing writing score to maintain stability
};

export async function analyzeTextWithLLM(text: string, opts: AnalyzeOptions = {}, currentScore?: number) {
    if (!text || !text.trim()) return { items: [] as HighlightItem[] };

    const system = getSystemPrompt(opts.systemOverrides);
    const model = opts.model ?? "moonshotai/kimi-k2-instruct";

    // Runtime import to keep client bundles small and only load on server.
    const [{ z }, { StructuredOutputParser }]: any = await Promise.all([
        import("zod"),
        import("@langchain/core/output_parsers"),
    ]);

    const HighlightTypeEnum = z.enum(["typo", "vague", "wording", "error", "boring"] as const);
    const HighlightItemSchema = z.object({
        fragment: z.string().min(1),
        context: z.string().min(1),
        type: HighlightTypeEnum,
        hoverTip: z.string().max(200),
    });
    const OutputSchema = z.object({ items: z.array(HighlightItemSchema), score: z.number().min(0).max(1) });

    const parser = StructuredOutputParser.fromZodSchema(OutputSchema);
    const formatInstructions = parser.getFormatInstructions();

    if (!process.env.GROQ_API_KEY) {
        console.warn("GROQ_API_KEY is not set; returning empty analysis.");
        return { items: [] as HighlightItem[] };
    }
    const { ChatGroq } = await import("@langchain/groq");
    const llm = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model,
        temperature: 0.2,
        maxTokens: 1024,
    });

    const prompt = [
        {
            role: "system",
            content: `
                ${system}

                Stability policy:
                - The text may change frequently as the user types. Maintain stable highlights across small edits.
                - Treat the CURRENT_HIGHLIGHTS (below) as a baseline. Preserve an item if its fragment still appears and remains applicable.
                - Avoid random churn: do not change type/hoverTip/context unless the text change justifies it.
                - If a fragment disappears, remove that item. Do not keep items for inexistent fragments of text. If context shifts slightly, keep the same fragment and update context.
                - You may add new items only when clearly warranted by new content.
                - Focusing on small and insignificant details is discouraged. Do not overwhelm with tiny subjective feedback.
                - Prefer keeping identical fragment text when still valid.

                CURRENT_HIGHLIGHTS (JSON):
                ${JSON.stringify(opts.currentItems ?? [])}

                CURRENT_WRITING_SCORE (JSON):
                ${JSON.stringify(currentScore ?? 0)}

                You MUST return only valid JSON matching the schema below.
                ${formatInstructions}
                `,
        },
        { role: "user", content: text },
    ];

    try {
        const res = await llm.invoke(prompt as any);
        const rc: any = res?.content as any;
        let content = "";
        if (typeof rc === "string") content = rc;
        else if (Array.isArray(rc)) {
            const firstText = rc.find((p: any) => p?.type === "text" && typeof p.text === "string");
            if (firstText) content = firstText.text as string;
        }
        const parsed = await parser.parse(content);
        return parsed as { items: HighlightItem[], score: number };
    } catch (err) {
        console.error("LLM analyze error:", err);
        return { items: [] as HighlightItem[], score: 0 };
    }
}
