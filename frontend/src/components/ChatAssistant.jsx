import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Bot, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";

/**
 * A lightweight, rule-based dining assistant.
 *
 * It intentionally runs fully offline (no external AI API key needed) and keeps
 * every reply to roughly 3-4 short lines, as a real host would. It reads the
 * live cart/table context so answers like "how long will my food take?" reflect
 * the actual dishes the guest ordered.
 */

const GREETING = {
  from: "bot",
  text: "Hello! 👋 I'm your dining assistant.\nAsk me about your food, the wait time, or the menu.\nYour food is on the way — please wait, it won't be long!"
};

function pickReply(input, ctx) {
  const q = input.toLowerCase().trim();
  const { currentTable, cart, settings } = ctx;

  const has = (...words) => words.some((w) => q.includes(w));

  // --- Greetings ---
  if (has("hi", "hii", "hey", "hello", "namaste", "helo")) {
    return "Hello! 👋 Welcome in — lovely to have you.\nI can help with the menu, wait times, or your bill.\nWhat would you like to know?";
  }

  // --- Thanks / bye ---
  if (has("thank", "thanks", "shukriya", "dhanyavad")) {
    return "You're most welcome! 🙏\nEnjoy your meal — it's been a pleasure serving you.\nJust call if you need anything else.";
  }
  if (has("bye", "goodbye", "see you")) {
    return "Goodbye, and thank you for dining with us! 🙏\nWe hope to see you again very soon.\nHave a wonderful day!";
  }

  // --- Time / how long ---
  if (has("how long", "time", "kitna", "kitni der", "wait", "late", "delay", "when will", "ready")) {
    if (cart && cart.length > 0) {
      const maxPrep = cart.reduce(
        (max, i) => Math.max(max, Number(i.food?.preparationTimeMinutes) || 15),
        0
      );
      return `Your food is being prepared right now. 👨‍🍳\nIt should take around ${maxPrep} minutes from when the kitchen starts.\nYour food is on the way — please wait, it's worth it!`;
    }
    return "Most of our dishes are freshly made in about 15–20 minutes. ⏱️\nOnce you order, you'll see a live countdown on your screen.\nYour food is on the way — please wait, we're on it!";
  }

  // --- Where is my order / status ---
  if (has("where", "status", "track", "order kaha", "my order")) {
    return "You can track your order live on this screen. 📍\nTap the tracking card to see each kitchen stage.\nYour food is on the way — please wait, it won't be long!";
  }

  // --- Recommendations / food questions ---
  if (has("recommend", "suggest", "best", "famous", "special", "popular", "what should")) {
    return "Great question! Our tandoori dishes and biryanis are guest favourites. ⭐\nThe 'Popular' tag on the menu marks our most-loved plates.\nEverything is cooked fresh to order.";
  }
  if (has("veg", "vegetarian", "vegan", "jain")) {
    return "Yes, we have a wide vegetarian selection. 🌱\nUse the 'Veg' filter on the menu to see them all.\nEach dish is clearly marked veg or non-veg.";
  }
  if (has("spicy", "spice", "mild", "hot")) {
    return "We can adjust the spice level for you. 🌶️\nJust add a note like 'less spicy' when you place the order.\nThe kitchen will take care of it.";
  }
  if (has("menu", "food", "dish", "eat", "khana", "order")) {
    return "Our full menu is right here on this page. 🍽️\nBrowse by category, or search for any dish you like.\nTap 'Add' to put it in your cart.";
  }

  // --- Payment / bill ---
  if (has("pay", "payment", "bill", "invoice", "upi", "cash", "gst")) {
    return "You can pay online by scanning our UPI QR, or cash at the table. 💳\nYour GST invoice appears instantly after you order.\nYou can print or save it any time.";
  }

  // --- Table ---
  if (has("table", "seat", "kaunsa table")) {
    return currentTable
      ? `You're seated at Table ${currentTable}. 🪑\nYour order goes straight to the kitchen from here.\nAnything else I can help with?`
      : "Please scan the QR code on your table to get started. 🪑\nThat links your order to the right table.\nThen you can browse and order right away.";
  }

  // --- Waiter / help ---
  if (has("waiter", "help", "call", "service", "staff")) {
    return "Of course — tap the 'Assistance' button up top. 🔔\nA waiter will be with you shortly.\nWe're always happy to help!";
  }

  // --- Timings / open hours ---
  if (has("open", "close", "timing", "hours")) {
    return settings
      ? `We're open from ${settings.openingHours} to ${settings.closingHours} daily. 🕐\nKitchen orders stop shortly before closing.\nDo come and visit us!`
      : "We're open daily for lunch and dinner. 🕐\nPlease check with our staff for exact timings.\nWe'd love to have you!";
  }

  // --- Complaint ---
  if (has("cold", "bad", "wrong", "complaint", "problem", "issue")) {
    return "I'm really sorry to hear that. 😔\nPlease use the 'Assistance' button and tell us what happened.\nOur team will make it right straight away.";
  }

  // --- Fallback ---
  return "I'm here to help with the menu, wait times, or your bill. 🙂\nTry asking 'how long will my food take?'\nYour food is on the way — please wait!";
}

/**
 * The assistant is now opened from the "Ask Us" button in the navbar, so it is
 * fully controlled: the parent owns `isOpen` and passes `onClose`. The old
 * floating launcher that sat at the very bottom of the menu page is gone.
 */
export const ChatAssistant = ({ isOpen = false, onClose }) => {
  const { currentTable, cart, settings } = useCart();
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setIsTyping(true);

    // Small delay so it reads like a person replying rather than an instant echo
    const reply = pickReply(text, { currentTable, cart, settings });
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    }, 550);
  };

  const quickAsk = (text) => {
    setMessages((prev) => [...prev, { from: "user", text }]);
    setIsTyping(true);
    const reply = pickReply(text, { currentTable, cart, settings });
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    }, 550);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[22rem] z-50 bg-zinc-900 border border-sky-500/20 rounded-3xl shadow-premium overflow-hidden flex flex-col max-h-[75vh]"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-sky-500/12 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                    Dining Assistant
                    <Sparkles className="w-3 h-3 text-sky-400" />
                  </div>
                  <div className="text-[10px] text-emerald-500 flex items-center gap-1 tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online now
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="icon-btn p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                aria-label="Close assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
                      m.from === "user"
                        ? "bg-sky-600 text-white font-medium rounded-br-md"
                        : "bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-bl-md"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800 border border-zinc-700 px-4 py-3.5 rounded-2xl rounded-bl-md flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Quick suggestion chips */}
            <div className="px-3 pb-2 flex gap-2 overflow-x-auto shrink-0">
              {["How long will my food take?", "What's popular?", "How do I pay?"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => quickAsk(chip)}
                  className="whitespace-nowrap px-3.5 py-2 rounded-full bg-zinc-800 hover:bg-sky-500/15 hover:text-sky-400 hover:border-sky-500/30 text-zinc-300 text-[11px] font-medium transition-all border border-zinc-700"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2.5 shrink-0">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder="Ask about your food..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-700 text-[13px] text-zinc-100 focus:outline-none focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/15 placeholder:text-zinc-500 transition-all"
              />
              <button
                onClick={send}
                disabled={!input.trim()}
                aria-label="Send message"
                className="p-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
