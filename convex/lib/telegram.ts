"use node";

/** Optional side feature: Telegram relay when audit.telegramChatId is set. Web report is primary. */
const TELEGRAM_API = "https://api.telegram.org";

export async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: "TELEGRAM_BOT_TOKEN not set" };

  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!res.ok) {
    return { ok: false, error: `Telegram sendMessage ${res.status}` };
  }
  return { ok: true };
}

export async function sendTelegramVoice(
  chatId: string,
  audio: ArrayBuffer,
  caption?: string
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: "TELEGRAM_BOT_TOKEN not set" };

  const form = new FormData();
  form.append("chat_id", chatId);
  if (caption) form.append("caption", caption.slice(0, 1024));
  form.append("voice", new Blob([audio], { type: "audio/mpeg" }), "ruler-brief.mp3");

  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendVoice`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, error: `Telegram sendVoice ${res.status}: ${body.slice(0, 200)}` };
  }
  return { ok: true };
}
