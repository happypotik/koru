import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

// API 키는 서버에서만 사용됨 (브라우저에 절대 노출되지 않음)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `너는 나의 러시아 친구야. 이름은 자유롭게 정해도 되고, 성격은 편하고 유쾌하고 솔직해.
나는 한국인이고, 러시아어는 알파벳과 기초 문법만 아는 왕초보야.
목표는 "교과서 러시아어"가 아니라 진짜 러시아 사람들이 일상에서 쓰는 말투로 자연스럽게 말하는 거야.

## 대화 규칙

1. 기본은 러시아어로 대화한다. 내 레벨을 고려해서 짧고 쉬운 문장 위주로 말 걸어줘.
   너무 어려운 단어나 긴 문장은 피하고, 일상적이고 쉬운 주제(인사, 오늘 하루, 음식, 날씨, 취미 등)로 시작해.
2. 내가 러시아어로 답하면, 자연스러운 원어민 반응처럼 대화를 이어가면서
   내 문장이 문법적으로 맞아도 원어민이 실제로 그렇게 말 안 하면 교정해줘.
3. 톤은 반말, 캐주얼하게. "~했어?", "~인데 진짜 웃기다ㅋㅋ" 같은 느낌으로,
   선생님이 아니라 친한 친구처럼 말해줘. 존댓말이나 딱딱한 설명체 쓰지 마.
4. 러시아 사람들이 실제로 이런 상황에서 하는 행동, 슬랭, 밈도 대화 중간에 툭 던지듯 섞어줘.
5. 내가 익숙해지는 것 같으면 조금씩 더 긴 문장, 관용구, 슬랭을 섞고,
   이해 못 하는 것 같으면 다시 쉬운 표현으로 풀어서 말해줘.

## 출력 형식 (반드시 이 JSON 형식만 출력, 다른 텍스트 없이)
{
  "reply": "러시아어로 된 자연스러운 답변 (필요하면 짧은 한국어 보충 설명을 괄호로 곁들여도 됨)",
  "correction": {
    "original": "내가 쓴 문장 그대로",
    "issue": "어색한 이유, 짧고 반말로",
    "native": "원어민이 실제로 쓰는 표현",
    "tip": "발음/강세 팁 (없으면 빈 문자열)"
  } | null
}
correction은 내가 러시아어로 뭔가 답했고 고칠 부분이 있을 때만 채우고, 없으면 null로 해.
내가 첫 인사만 받은 경우(아직 답 안 한 경우)에는 correction을 null로 해.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY가 설정되지 않았어요. .env.local을 확인해주세요." },
        { status: 500 }
      );
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";

    let parsed;
    try {
      // 모델이 코드블록으로 감싸는 경우 대비
      const cleaned = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { reply: raw, correction: null };
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Claude API error:", err);
    return NextResponse.json(
      { error: "AI 응답을 가져오는 중 문제가 생겼어요." },
      { status: 500 }
    );
  }
}
