"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ClientMessages({ clientId, currentUser, isCoach = false, conversationName = "" }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  const loadMessages = useCallback(async ({ markRead = true } = {}) => {
    if (!clientId || !currentUser?.id) return;
    const { data, error: loadError } = await supabase
      .from("client_messages")
      .select("id, client_id, sender_id, body, created_at, read_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true })
      .limit(300);

    if (loadError) {
      setError("Messages are unavailable right now. Please try again.");
      setLoading(false);
      return;
    }

    const rows = data || [];
    setMessages(rows);
    setError("");
    setLoading(false);

    const unreadIds = rows
      .filter((message) => message.sender_id !== currentUser.id && !message.read_at)
      .map((message) => message.id);

    if (markRead && unreadIds.length) {
      const readAt = new Date().toISOString();
      const { error: readError } = await supabase
        .from("client_messages")
        .update({ read_at: readAt })
        .in("id", unreadIds);
      if (!readError) {
        setMessages((current) => current.map((message) =>
          unreadIds.includes(message.id) ? { ...message, read_at: readAt } : message
        ));
      }
    }
  }, [clientId, currentUser?.id]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    setError("");
    loadMessages();

    if (!clientId) return undefined;

    // Realtime delivers messages immediately; polling keeps the conversation usable
    // if a browser or network does not maintain a Realtime connection.
    const channel = supabase
      .channel(`client-messages-${clientId}-${currentUser?.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "client_messages",
        filter: `client_id=eq.${clientId}`,
      }, () => loadMessages())
      .subscribe();
    const poll = window.setInterval(() => loadMessages(), 12000);

    return () => {
      window.clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [clientId, currentUser?.id, loadMessages]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  async function sendMessage(event) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !currentUser?.id || sending) return;
    setSending(true);
    setError("");
    const { error: sendError } = await supabase.from("client_messages").insert({
      client_id: clientId,
      sender_id: currentUser.id,
      body,
    });
    if (sendError) {
      setError("Your message could not be sent. Please try again.");
    } else {
      setDraft("");
      await loadMessages({ markRead: false });
    }
    setSending(false);
  }

  const title = isCoach
    ? (conversationName ? `Chat with ${conversationName}` : "Client conversation")
    : "Chat with your coach";

  return (
    <section style={styles.card} aria-label="Client messages">
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>PRIVATE COACHING CHAT</p>
          <h2 style={styles.title}>{title}</h2>
          <p style={styles.description}>
            A direct conversation for questions, updates, and coaching support.
          </p>
        </div>
        <span style={styles.liveBadge}><span style={styles.dot} /> PRIVATE</span>
      </div>

      <div ref={listRef} style={styles.messageList} aria-live="polite" aria-relevant="additions">
        {loading ? (
          <p style={styles.empty}>Loading your conversation…</p>
        ) : messages.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>✉</div>
            <strong>{isCoach ? "Start the conversation" : "Your coach is here to help"}</strong>
            <p>{isCoach ? "Send a quick message to this client. Your replies will appear here." : "Send a message about your workouts, progress, or anything you need help with."}</p>
          </div>
        ) : messages.map((message) => {
          const mine = message.sender_id === currentUser?.id;
          return (
            <article key={message.id} style={{ ...styles.messageRow, justifyContent: mine ? "flex-end" : "flex-start" }}>
              <div style={{ ...styles.bubble, ...(mine ? styles.mine : styles.theirs) }}>
                <span style={styles.sender}>{mine ? "You" : isCoach ? "Client" : "Coach"}</span>
                <p style={styles.messageText}>{message.body}</p>
                <time style={styles.time} dateTime={message.created_at}>
                  {new Date(message.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </time>
              </div>
            </article>
          );
        })}
      </div>

      {error && <p role="alert" style={styles.error}>{error}</p>}

      <form onSubmit={sendMessage} style={styles.composer}>
        <label htmlFor="client-message" style={styles.srOnly}>Write a message</label>
        <textarea
          id="client-message"
          value={draft}
          onChange={(event) => setDraft(event.target.value.slice(0, 3000))}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Write a message…"
          rows={2}
          maxLength={3000}
          style={styles.input}
        />
        <button type="submit" disabled={sending || !draft.trim()} style={{ ...styles.sendButton, opacity: sending || !draft.trim() ? 0.55 : 1 }}>
          {sending ? "SENDING…" : "SEND"}
        </button>
      </form>
      <p style={styles.hint}>Press Enter to send · Shift + Enter for a new line</p>
    </section>
  );
}

const styles = {
  card: { background: "#111", border: "1px solid #292929", borderRadius: 18, padding: "clamp(18px, 3vw, 28px)", color: "#f7f7f7", maxWidth: 900, margin: "0 auto" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", paddingBottom: 18, borderBottom: "1px solid #282828" },
  eyebrow: { margin: "0 0 8px", color: "#f4c20d", fontSize: 11, fontWeight: 800, letterSpacing: 1.5 },
  title: { margin: 0, fontSize: "clamp(21px, 3vw, 28px)" },
  description: { color: "#aaa", margin: "8px 0 0", fontSize: 14, lineHeight: 1.5 },
  liveBadge: { border: "1px solid #343434", borderRadius: 999, padding: "7px 10px", color: "#ccc", fontSize: 10, fontWeight: 800, letterSpacing: 1, display: "inline-flex", alignItems: "center", gap: 7 },
  dot: { width: 7, height: 7, borderRadius: "50%", background: "#f4c20d" },
  messageList: { height: "min(52vh, 520px)", minHeight: 250, overflowY: "auto", padding: "18px 2px", display: "flex", flexDirection: "column", gap: 12 },
  empty: { margin: "auto", color: "#aaa" },
  emptyState: { margin: "auto", textAlign: "center", maxWidth: 360, color: "#ddd", lineHeight: 1.5 },
  emptyIcon: { width: 46, height: 46, borderRadius: "50%", display: "grid", placeItems: "center", margin: "0 auto 12px", background: "#202020", color: "#f4c20d", fontSize: 22 },
  messageRow: { display: "flex" },
  bubble: { maxWidth: "min(82%, 560px)", padding: "11px 14px", borderRadius: 15, overflowWrap: "anywhere" },
  mine: { background: "#f4c20d", color: "#151515", borderBottomRightRadius: 4 },
  theirs: { background: "#242424", color: "#f4f4f4", borderBottomLeftRadius: 4 },
  sender: { display: "block", fontSize: 10, fontWeight: 800, opacity: 0.72, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.6 },
  messageText: { margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.5, fontSize: 14 },
  time: { display: "block", marginTop: 7, fontSize: 10, opacity: 0.68, textAlign: "right" },
  composer: { display: "flex", alignItems: "flex-end", gap: 10, borderTop: "1px solid #282828", paddingTop: 16 },
  input: { flex: 1, minWidth: 0, resize: "vertical", minHeight: 48, maxHeight: 150, borderRadius: 12, border: "1px solid #383838", background: "#191919", color: "#fff", padding: "12px 14px", font: "inherit", outlineColor: "#f4c20d" },
  sendButton: { minHeight: 46, border: 0, borderRadius: 10, padding: "0 18px", background: "#f4c20d", color: "#111", fontWeight: 900, letterSpacing: 0.5, cursor: "pointer" },
  hint: { margin: "8px 0 0", color: "#858585", fontSize: 11 },
  error: { color: "#ffb4a9", background: "#321c1a", padding: 10, borderRadius: 8, fontSize: 13 },
  srOnly: { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 },
};
