"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { ChatMessage } from "@/lib/models";

interface UserData {
  id: string;
  email: string;
}

const POLL_INTERVAL = 5000;

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("adearn_user");
    setUser(stored ? JSON.parse(stored) : null);
    setHydrated(true);
  }, []);

  const loadMessages = async (userId: string) => {
    try {
      const res = await fetch(`/api/chat?userId=${userId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch {
      // ignore transient errors
    }
  };

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    loadMessages(user.id).finally(() => setLoading(false));
  }, [open, user]);

  useEffect(() => {
    if (!open || !user) return;
    const timer = setInterval(() => loadMessages(user.id), POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [open, user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async () => {
    if (!user || !text.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, text: text.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setText("");
        await loadMessages(user.id);
      } else {
        toast.error(data.error || "Не удалось отправить сообщение");
      }
    } catch {
      toast.error("Ошибка сети");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[420px] w-[320px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 sm:w-[360px]">
          <div className="flex items-center justify-between border-b border-border/60 bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">
                  Онлайн-чат
                </p>
                <p className="text-xs text-muted-foreground">
                  Напишите администратору
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Закрыть чат"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {!hydrated ? null : !user ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <MessageCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Войдите в аккаунт, чтобы написать в чат
              </p>
              <Link href="/auth" className="text-sm text-primary font-medium">
                Войти или зарегистрироваться
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {loading && messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-8">
                    Напишите первое сообщение — мы ответим как можно скорее.
                  </p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                          m.sender === "user"
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {m.text}
                        </p>
                        <p
                          className={`mt-0.5 text-[10px] ${m.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                        >
                          {new Date(m.createdAt).toLocaleTimeString("ru", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={endRef} />
              </div>
              <div className="flex gap-2 border-t border-border/60 p-3">
                <Input
                  placeholder="Ваше сообщение..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={sending || !text.trim()}
                  aria-label="Отправить сообщение"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Закрыть чат" : "Открыть чат"}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}

export { ChatWidget };
