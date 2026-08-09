import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Reusable floating chat widget grounded in either a resume or a job match.
 * `historyFn`/`sendFn` are the API calls to use, `title` sets the header,
 * and `suggestions` are quick-start prompts shown when the thread is empty.
 */
export default function ChatWidget({ contextId, historyFn, sendFn, title, suggestions = [] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    if (!open || !contextId) return;
    const load = async () => {
      setLoadingHistory(true);
      try {
        const { data } = await historyFn(contextId);
        setMessages(data.data);
        scrollToBottom();
      } catch {
        toast.error('Could not load chat history');
      } finally {
        setLoadingHistory(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contextId]);

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setMessages((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, role: 'USER', content: trimmed, createdAt: new Date().toISOString() },
    ]);
    setInput('');
    setSending(true);
    scrollToBottom();

    try {
      const { data } = await sendFn(contextId, trimmed);
      setMessages((prev) => [...prev, data.data]);
      scrollToBottom();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Message failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-5 z-50 w-[min(380px,calc(100vw-2.5rem))] h-[520px] max-h-[70vh] flex flex-col rounded-2xl overflow-hidden glass-panel shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-brand-600 to-signal-600 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={16} />
                <span className="font-semibold text-sm">{title}</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {loadingHistory ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={18} className="animate-spin text-brand-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 text-center">Ask anything about this report.</p>
                  <div className="flex flex-col gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-left text-xs px-3 py-2 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === 'USER'
                          ? 'bg-gradient-to-r from-brand-600 to-signal-600 text-white rounded-br-sm'
                          : 'bg-slate-100 dark:bg-ink-700 text-slate-700 dark:text-slate-200 rounded-bl-sm'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))
              )}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-ink-700 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-slate-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 p-3 border-t border-slate-200 dark:border-ink-700 shrink-0"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question…"
                className="flex-1 input-field !py-2 text-sm"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-r from-brand-600 to-signal-600 text-white disabled:opacity-40 transition-opacity shrink-0"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-brand-600 to-signal-600 text-white shadow-lg shadow-brand-600/30"
        aria-label="Toggle chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>
    </>
  );
}
