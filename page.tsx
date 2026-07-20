"use client";

import { useState, useRef, useEffect } from "react";

type Correction = {
  original: string;
  issue: string;
  native: string;
  tip: string;
} | null;

type Message = {
  role: "user" | "assistant";
  content: string;
  correction?: Correction;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function callApi(history: Message[]) {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠️ ${data.error}` },
        ]);
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          correction: data.correction ?? null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function startChat() {
    setStarted(true);
    callApi([]);
  }

  function send() {
    if (!input.trim() || loading) return;
    const next: Message[] = [...messages, { role: "user", content: input }];
    setMessages(next);
    setInput("");
    callApi(next);
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8">
      <header className="w-full max-w-2xl mb-6">
        <h1 className="font-display italic text-3xl text-ink">друг</h1>
        <p className="text-muted text-sm mt-1">
          매일 러시아어로 수다 떠는 연습 페이지
        </p>
      </header>

      <div className="w-full max-w-2xl flex-1 flex flex-col gap-4">
        {!started && (
          <button
            onClick={startChat}
            className="self-start bg-ai/90 hover:bg-ai text-base font-medium px-5 py-2.5 rounded-full transition-colors"
          >
            대화 시작하기 →
          </button>
        )}

        {messages.map((m, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl leading-relaxed ${
                m.role === "user"
                  ? "self-end bg-user/90 text-base rounded-br-sm"
                  : "self-start bg-surface2 text-ink rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>

            {m.correction && (
              <div className="note-card self-start max-w-[85%] px-4 py-3 rounded-md text-sm font-mono text-ink/90 mt-1">
                <div className="mb-1">
                  <span className="text-muted">내 문장:</span> {m.correction.original}
                </div>
                <div className="mb-1">
                  <span className="text-muted">어색한 이유:</span> {m.correction.issue}
                </div>
                <div className="mb-1">
                  <span className="text-ai">원어민 표현:</span> {m.correction.native}
                </div>
                {m.correction.tip && (
                  <div>
                    <span className="text-muted">팁:</span> {m.correction.tip}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="self-start text-muted text-sm px-4">
            친구가 생각 중...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {started && (
        <div className="w-full max-w-2xl flex gap-2 mt-6 sticky bottom-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="러시아어로 답해봐 (Привет처럼)"
            className="flex-1 bg-surface border border-surface2 rounded-full px-5 py-3 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ai"
          />
          <button
            onClick={send}
            disabled={loading}
            className="bg-ai hover:bg-ai/90 disabled:opacity-50 px-5 py-3 rounded-full font-medium transition-colors"
          >
            보내기
          </button>
        </div>
      )}
    </main>
  );
}
