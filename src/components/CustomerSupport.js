import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MessageCircle, X, Minus, Send, RotateCcw, ChevronRight } from 'lucide-react';
import './CustomerSupport.css';

// ─────────────────────────────────────────
// FAQ Knowledge Base
// ─────────────────────────────────────────
const FAQ = [
  {
    id: 'wallet_fund',
    patterns: ['fund', 'add money', 'top up wallet', 'deposit', 'flutterwave', 'payment link'],
    q: 'How do I fund my wallet?',
    a: 'Go to Wallet → tap "Fund Wallet" → choose a payment method (Card, Bank Transfer, USSD, or Mobile Money) → you\'ll be redirected to Flutterwave to complete payment. Your wallet is credited automatically once payment is confirmed.',
  },
  {
    id: 'airtime_buy',
    patterns: ['buy airtime', 'recharge', 'airtime', 'top up phone', 'mtn airtime', 'airtel airtime', 'glo airtime'],
    q: 'How do I buy airtime?',
    a: 'Click "Airtime" in the sidebar → select your country (Nigeria or Ghana) → pick your network → enter the phone number and amount → enter your transaction PIN. The airtime is sent instantly.',
  },
  {
    id: 'data_buy',
    patterns: ['buy data', 'data bundle', 'internet', 'data plan', 'gb', 'mb', 'browse'],
    q: 'How do I buy data?',
    a: 'Click "Data" → select your network → enter phone number → pick a data plan from the list → enter your PIN. Plans are fetched live from our servers so you always see current prices.',
  },
  {
    id: 'cable_sub',
    patterns: ['cable', 'dstv', 'gotv', 'startimes', 'showmax', 'decoder', 'subscription', 'smart card'],
    q: 'How do I pay for cable TV?',
    a: 'Go to "Cable TV" → select your provider (DSTV, GOtv, Startimes, Showmax) → enter your 10–11 digit smart card / decoder number → choose a package → enter your PIN.',
  },
  {
    id: 'electricity',
    patterns: ['electricity', 'prepaid', 'postpaid', 'meter', 'disco', 'ekedc', 'ikedc', 'power', 'token', 'unit'],
    q: 'How do I pay my electricity bill?',
    a: 'Go to "Electricity" → select your DISCO (distribution company) → choose Prepaid or Postpaid → enter your 11–13 digit meter number → enter the amount → confirm with your PIN.',
  },
  {
    id: 'pin_set',
    patterns: ['pin', 'set pin', 'transaction pin', 'forgot pin', 'no pin', 'pin required', 'change pin'],
    q: 'How do I set my transaction PIN?',
    a: 'Go to Profile → Security tab → "Transaction PIN" section → enter a 4-digit PIN and confirm it → tap "Set Transaction PIN". You must set a PIN before making any purchases.',
  },
  {
    id: 'pin_forgot',
    patterns: ['forgot pin', 'lost pin', 'reset pin', 'cant remember pin'],
    q: 'I forgot my transaction PIN — what do I do?',
    a: 'Currently you can reset your PIN from Profile → Security → Set Transaction PIN (setting a new one overwrites the old one). If you\'re locked out, contact support at quicktopup.it.com@gmail.com.',
  },
  {
    id: 'failed_txn',
    patterns: ['failed', 'transaction failed', 'purchase failed', 'not working', 'error', 'unsuccessful'],
    q: 'My transaction failed — what happened?',
    a: 'Common reasons: (1) Insufficient wallet balance, (2) Wrong transaction PIN, (3) Invalid phone / meter / smart card number, (4) The service provider is temporarily down. Check your transaction history for the exact error. Your wallet is only debited on successful transactions.',
  },
  {
    id: 'balance',
    patterns: ['balance', 'wallet balance', 'how much', 'check balance', 'available'],
    q: 'How do I check my wallet balance?',
    a: 'Your balance is shown on the Dashboard and at the top of the Wallet page. You can also see it at the bottom of every service form. Tap "Refresh" on the wallet page to get the latest balance.',
  },
  {
    id: 'ledger',
    patterns: ['ledger', 'history', 'transactions', 'statement', 'receipt', 'record'],
    q: 'Where can I see my transaction history?',
    a: 'Go to "Transactions" in the sidebar. You can filter by status (success/failed/pending), service type, and date range. The Wallet page also has a "Ledger" tab showing all credits and debits.',
  },
  {
    id: 'ghana',
    patterns: ['ghana', 'ghanaian', 'ghs', 'cedis', 'momo', 'vodafone ghana', 'airteltigo', '+233'],
    q: 'Do you support Ghana?',
    a: 'Yes! We support Ghana via Hubtel. You can buy airtime and data for MTN Ghana, Vodafone Ghana, and AirtelTigo. Just select Ghana as your country on the Airtime or Data page and enter a +233 number.',
  },
  {
    id: 'security',
    patterns: ['safe', 'security', 'secure', 'scam', 'trust', 'verified', 'kyc'],
    q: 'Is QuickTopUp.ng safe to use?',
    a: 'Yes. We use token-based authentication, 4-digit transaction PINs, Flutterwave\'s secure payment gateway, idempotency keys to prevent duplicate charges, and KYC verification. Your card details are never stored on our servers.',
  },
  {
    id: 'contact',
    patterns: ['contact', 'email', 'support', 'help', 'call', 'reach', 'human', 'agent'],
    q: 'How do I contact support?',
    a: 'Email us at quicktopup.it.com@gmail.com — we typically respond within a few hours. For urgent issues, include your transaction reference number so we can resolve it faster.',
  },
  {
    id: 'refund',
    patterns: ['refund', 'money back', 'reversed', 'reverse', 'chargeback', 'wrong number'],
    q: 'Can I get a refund for a wrong transaction?',
    a: 'If you entered the wrong number and the transaction was successful, we\'ll try our best to help. Contact us at quicktopup.it.com@gmail.com within 24 hours with your transaction reference. Note: refunds depend on the service provider\'s policy.',
  },
];

const QUICK_TOPICS = [
  { label: '💰 Fund Wallet', id: 'wallet_fund' },
  { label: '📱 Buy Airtime', id: 'airtime_buy' },
  { label: '📶 Buy Data', id: 'data_buy' },
  { label: '📺 Cable TV', id: 'cable_sub' },
  { label: '🔑 Transaction PIN', id: 'pin_set' },
  { label: '❌ Transaction Failed', id: 'failed_txn' },
  { label: '🔒 Wallet Locked', id: 'wallet_locked' },
  { label: '💸 Processing Fee', id: 'fund_fee' },
  {
    id: 'fetch_failed',
    patterns: ['plans not loading', 'networks not showing', 'cant see plans', 'empty list', 'no networks', 'no billers', 'fetch failed', 'service unavailable', 'provider down'],
    q: 'Why are networks / data plans / cable plans not loading?',
    a: "Our service catalog is fetched live from VTpass. If you see an error or empty lists, the provider API may be temporarily unavailable. Tap the Retry button on the page. If it persists, check back in a few minutes.",
  },
  {
    id: 'wallet_locked',
    patterns: ['wallet locked', 'locked', 'account locked', 'cant transact', 'locked out'],
    q: 'My wallet is locked — what do I do?',
    a: 'A locked wallet prevents all transactions. Contact us at quicktopup.it.com@gmail.com with your registered email and we will review and unlock it.',
  },
  {
    id: 'fund_fee',
    patterns: ['fee', 'processing fee', 'charge', 'extra charge', '3 percent', 'why am i paying more', 'total amount'],
    q: 'Why is the total amount higher than what I entered?',
    a: "A 3% processing fee is added to all wallet funding by Flutterwave (our payment processor). Your wallet is credited with the original amount you entered — only the Flutterwave checkout total includes the fee.",
  },
];

// ─────────────────────────────────────────
// Simple keyword matcher
// ─────────────────────────────────────────
function findAnswer(input) {
  const lower = input.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const faq of FAQ) {
    let score = 0;
    for (const pattern of faq.patterns) {
      if (lower.includes(pattern)) score += pattern.split(' ').length; // longer phrase = higher score
    }
    if (score > bestScore) { bestScore = score; best = faq; }
  }
  return bestScore > 0 ? best : null;
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────
export default function CustomerSupport() {
  const [open, setOpen] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! 👋 I\'m QuickTopUp support. How can I help you today?', id: 0 },
  ]);
  const [input, setInput] = useState('');
  const [pos, setPos] = useState({ x: null, y: null }); // null = default CSS position
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const widgetRef = useRef(null);
  const messagesEndRef = useRef(null);
  const msgId = useRef(1);

  // Auto-scroll to bottom
  useEffect(() => {
    if (open && !minimised) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, minimised]);

  // ── Dragging ──────────────────────────────
  const onMouseDown = useCallback((e) => {
    // Only drag on header
    setDragging(true);
    const rect = widgetRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const x = e.clientX - dragOffset.current.x;
      const y = e.clientY - dragOffset.current.y;
      // Clamp to viewport
      const maxX = window.innerWidth - (widgetRef.current?.offsetWidth || 340);
      const maxY = window.innerHeight - (widgetRef.current?.offsetHeight || 60);
      setPos({ x: Math.max(0, Math.min(x, maxX)), y: Math.max(0, Math.min(y, maxY)) });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    // Touch support
    const onTouchMove = (e) => onMove(e.touches[0]);
    const onTouchEnd = () => setDragging(false);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [dragging]);

  // ── Messaging ─────────────────────────────
  const addMsg = (from, text) => {
    const id = msgId.current++;
    setMessages(p => [...p, { from, text, id }]);
    return id;
  };

  const handleSend = useCallback((rawInput) => {
    const text = (rawInput || input).trim();
    if (!text) return;
    setInput('');
    addMsg('user', text);

    setTimeout(() => {
      const match = findAnswer(text);
      if (match) {
        addMsg('bot', `**${match.q}**\n\n${match.a}`);
      } else {
        addMsg('bot',
          "I'm not sure about that one. Here are some things I can help with:\n\n" +
          QUICK_TOPICS.map(t => `• ${t.label}`).join('\n') +
          '\n\nOr email us at quicktopup.it.com@gmail.com 🙂'
        );
      }
    }, 400);
  }, [input]);

  const handleTopic = (id) => {
    const faq = FAQ.find(f => f.id === id);
    if (!faq) return;
    addMsg('user', faq.q);
    setTimeout(() => addMsg('bot', faq.a), 400);
  };

  const reset = () => setMessages([
    { from: 'bot', text: 'Hi! 👋 I\'m QuickTopUp support. How can I help you today?', id: msgId.current++ },
  ]);

  // ── Rendering ─────────────────────────────
  const widgetStyle = pos.x !== null
    ? { position: 'fixed', left: pos.x, top: pos.y, bottom: 'auto', right: 'auto', cursor: dragging ? 'grabbing' : 'auto' }
    : {};

  // FAB (chat bubble) — always visible
  if (!open) {
    return (
      <button className="cs-fab" onClick={() => setOpen(true)} aria-label="Open support chat">
        <MessageCircle size={26} />
        <span className="cs-fab-label">Help</span>
      </button>
    );
  }

  return (
    <div className="cs-widget" ref={widgetRef} style={widgetStyle}>
      {/* Header — drag handle */}
      <div
        className="cs-header"
        onMouseDown={onMouseDown}
        onTouchStart={(e) => {
          const t = e.touches[0];
          setDragging(true);
          const rect = widgetRef.current.getBoundingClientRect();
          dragOffset.current = { x: t.clientX - rect.left, y: t.clientY - rect.top };
        }}
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      >
        <div className="cs-header-info">
          <div className="cs-avatar">🤝</div>
          <div>
            <div className="cs-title">QuickTopUp Support</div>
            <div className="cs-status">● Online · Instant replies</div>
          </div>
        </div>
        <div className="cs-header-actions">
          <button className="cs-icon-btn" onClick={reset} title="Start over"><RotateCcw size={14} /></button>
          <button className="cs-icon-btn" onClick={() => setMinimised(p => !p)} title={minimised ? 'Expand' : 'Minimise'}>
            <Minus size={14} />
          </button>
          <button className="cs-icon-btn cs-close-btn" onClick={() => setOpen(false)} title="Close">
            <X size={14} />
          </button>
        </div>
      </div>

      {!minimised && (
        <>
          {/* Messages */}
          <div className="cs-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`cs-msg cs-msg-${msg.from}`}>
                {msg.from === 'bot' && <div className="cs-bot-avatar">🤝</div>}
                <div className={`cs-bubble cs-bubble-${msg.from}`}>
                  {msg.text.split('\n').map((line, i) => {
                    // Bold **text**
                    const parts = line.split(/\*\*(.*?)\*\*/g);
                    return (
                      <p key={i} style={{ margin: i === 0 ? 0 : '4px 0 0' }}>
                        {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick topics — shown when only the greeting exists */}
          {messages.length <= 1 && (
            <div className="cs-quick-topics">
              <div className="cs-quick-label">Quick topics:</div>
              <div className="cs-topics-grid">
                {QUICK_TOPICS.map(t => (
                  <button key={t.id} className="cs-topic-btn" onClick={() => handleTopic(t.id)}>
                    {t.label} <ChevronRight size={12} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="cs-input-row">
            <input
              className="cs-input"
              placeholder="Type your question…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button className="cs-send-btn" onClick={() => handleSend()} disabled={!input.trim()}>
              <Send size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
