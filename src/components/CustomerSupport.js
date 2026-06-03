import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MessageCircle, X, Minus, Send, RotateCcw, ChevronRight, Wallet, Phone, Wifi, Tv, KeyRound, XCircle, Lock, DollarSign, HelpCircle } from 'lucide-react';
import './CustomerSupport.css';

// ─────────────────────────────────────────
// Small Talk / Identity Responses
// ─────────────────────────────────────────
const SMALL_TALK = [
  {
    id: 'greeting',
    patterns: ['hi', 'hello', 'hey', 'helo', 'howdy', 'good morning', 'good afternoon', 'good evening', 'sup', 'whatsup', 'hi there', 'hello there', 'hey there', 'morning', 'afternoon', 'evening'],
    respond: () => {
      const opts = [
        "Hello! Welcome to QuickTopUp.ng. How can I help you today?",
        "Hey there! I'm here to help. What do you need?",
        "Hi! Happy to help. Ask me anything about our services!",
      ];
      return opts[Math.floor(Math.random() * opts.length)];
    },
  },
  {
    id: 'who_are_you',
    patterns: ['who are you', 'what are you', 'who is this', 'what is this', 'are you a bot', 'are you human', 'are you ai', 'are you real', 'are you a robot', 'talk to human', 'speak to human', 'talk to agent', 'speak to agent', 'real person', 'live agent', 'who am i talking to', 'what kind of bot'],
    respond: () => "I'm QuickBot — QuickTopUp.ng's virtual support assistant. I can answer questions about funding your wallet, buying airtime, data, cable TV, electricity, and more.\n\nFor issues I can't resolve, I'll connect you to our team at quicktopup.it.com@gmail.com.",
  },
  {
    id: 'how_are_you',
    patterns: ['how are you', 'how are you doing', 'how do you do', 'you good', 'you okay', 'hows it going', 'how r u'],
    respond: () => "I'm doing great, thanks for asking! Ready to help you with all your VTU needs. What can I do for you?",
  },
  {
    id: 'thank_you',
    patterns: ['thank you', 'thanks', 'thank u', 'thx', 'thnks', 'thnx', 'appreciate it', 'appreciated', 'helpful', 'that helped', 'got it', 'okay thanks', 'ok thanks', 'alright thanks', 'perfect thanks'],
    respond: () => {
      const opts = [
        "You're welcome! Is there anything else I can help you with?",
        "Happy to help! Let me know if you need anything else.",
        "Anytime! Feel free to ask if you have more questions!",
      ];
      return opts[Math.floor(Math.random() * opts.length)];
    },
  },
  {
    id: 'goodbye',
    patterns: ['bye', 'goodbye', 'see you', 'later', 'take care', 'good night', 'goodnight', 'cya', 'ok bye', 'okay bye', 'alright bye', 'done', 'nothing else', 'no thanks', 'no thank you', 'thats all'],
    respond: () => "Goodbye! Thanks for using QuickTopUp.ng. Have a great day!",
  },
  {
    id: 'name_question',
    patterns: ['your name', 'whats your name', 'what is your name', 'what do i call you', 'do you have a name', 'name please'],
    respond: () => "I'm QuickBot — your QuickTopUp.ng support assistant! How can I help you?",
  },
  {
    id: 'compliment',
    patterns: ['you are great', 'you are good', 'you are helpful', 'nice bot', 'good bot', 'love you', 'awesome', 'amazing', 'brilliant', 'excellent', 'well done'],
    respond: () => "Aww, thank you! That means a lot. Let me know if you ever need help!",
  },
  {
    id: 'complaint',
    patterns: ['bad bot', 'useless', 'not helpful', 'you suck', 'terrible', 'not working', 'broken', 'dumb bot', 'stupid bot'],
    respond: () => "I'm sorry I couldn't help! Please email us at quicktopup.it.com@gmail.com and our team will assist you directly.",
  },
];

function findSmallTalk(rawInput) {
  const lower = rawInput.toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').trim();
  for (const entry of SMALL_TALK) {
    for (const pattern of entry.patterns) {
      if (lower === pattern || lower.includes(pattern)) {
        return typeof entry.respond === 'function' ? entry.respond() : entry.respond;
      }
    }
  }
  return null;
}

// ─────────────────────────────────────────
// FAQ Knowledge Base
// ─────────────────────────────────────────
const FAQ = [
  {
    id: 'wallet_fund',
    patterns: ['fund', 'add money', 'top up wallet', 'deposit', 'flutterwave', 'payment link', 'add funds', 'load wallet', 'fund my wallet', 'how to fund', 'card payment', 'bank transfer', 'ussd payment'],
    q: 'How do I fund my wallet?',
    a: 'Go to Wallet → tap "Fund Wallet" → choose a payment method (Card, Bank Transfer, USSD, or Mobile Money) → you\'ll be redirected to Flutterwave to complete payment. Your wallet is credited automatically once payment is confirmed.',
  },
  {
    id: 'airtime_buy',
    patterns: ['buy airtime', 'recharge', 'airtime', 'top up phone', 'mtn airtime', 'airtel airtime', 'glo airtime', 'credit phone', 'phone credit', 'send airtime', 'airtime purchase', 'buy credit'],
    q: 'How do I buy airtime?',
    a: 'Click "Airtime" in the sidebar → select your country (Nigeria or Ghana) → pick your network → enter the phone number and amount → enter your transaction PIN. The airtime is sent instantly.',
  },
  {
    id: 'data_buy',
    patterns: ['buy data', 'data bundle', 'internet', 'data plan', 'gb', 'mb', 'browse', 'get data', 'data subscription', 'monthly data', 'data not loading', 'data purchase', '1gb', '2gb', '5gb'],
    q: 'How do I buy data?',
    a: 'Click "Data" → select your network → enter phone number → pick a data plan from the list → enter your PIN. Plans are fetched live from our servers so you always see current prices.',
  },
  {
    id: 'cable_sub',
    patterns: ['cable', 'dstv', 'gotv', 'startimes', 'showmax', 'decoder', 'subscription', 'smart card', 'cable tv', 'tv subscription', 'renew dstv', 'renew gotv', 'smartcard number', 'iuc number'],
    q: 'How do I pay for cable TV?',
    a: 'Go to "Cable TV" → select your provider (DSTV, GOtv, Startimes, Showmax) → enter your 10–11 digit smart card / decoder number → choose a package → enter your PIN.',
  },
  {
    id: 'electricity',
    patterns: ['electricity', 'prepaid', 'postpaid', 'meter', 'disco', 'ekedc', 'ikedc', 'power', 'token', 'unit', 'nepa', 'phcn', 'light bill', 'electric bill', 'pay electricity', 'buy unit', 'meter number', 'eko electric', 'ikeja electric'],
    q: 'How do I pay my electricity bill?',
    a: 'Go to "Electricity" → select your DISCO (distribution company) → choose Prepaid or Postpaid → enter your 11–13 digit meter number → enter the amount → confirm with your PIN.',
  },
  {
    id: 'pin_set',
    patterns: ['pin', 'set pin', 'transaction pin', 'forgot pin', 'no pin', 'pin required', 'change pin', 'create pin', 'enter pin', 'wrong pin', 'pin setup', 'security pin', '4 digit', 'passcode'],
    q: 'How do I set my transaction PIN?',
    a: 'Go to Profile → Security tab → "Transaction PIN" section → enter a 4-digit PIN and confirm it → tap "Set Transaction PIN". You must set a PIN before making any purchases.',
  },
  {
    id: 'pin_forgot',
    patterns: ['forgot pin', 'lost pin', 'reset pin', 'cant remember pin', 'lost my pin', 'pin reset', 'forgot my pin', 'pin not working'],
    q: 'I forgot my transaction PIN — what do I do?',
    a: 'Currently you can reset your PIN from Profile → Security → Set Transaction PIN (setting a new one overwrites the old one). If you\'re locked out, contact support at quicktopup.it.com@gmail.com.',
  },
  {
    id: 'failed_txn',
    patterns: ['failed', 'transaction failed', 'purchase failed', 'not working', 'error', 'unsuccessful', 'didnt work', 'not received', 'no airtime', 'no data', 'transaction not successful', 'pending transaction', 'stuck on pending', 'declined'],
    q: 'My transaction failed — what happened?',
    a: 'Common reasons: (1) Insufficient wallet balance, (2) Wrong transaction PIN, (3) Invalid phone / meter / smart card number, (4) The service provider is temporarily down. Check your transaction history for the exact error. Your wallet is only debited on successful transactions.',
  },
  {
    id: 'balance',
    patterns: ['balance', 'wallet balance', 'how much', 'check balance', 'available', 'my balance', 'current balance', 'see balance', 'wallet amount', 'how much do i have', 'remaining balance'],
    q: 'How do I check my wallet balance?',
    a: 'Your balance is shown on the Dashboard and at the top of the Wallet page. You can also see it at the bottom of every service form. Tap "Refresh" on the wallet page to get the latest balance.',
  },
  {
    id: 'ledger',
    patterns: ['ledger', 'history', 'transactions', 'statement', 'receipt', 'record', 'transaction history', 'past transactions', 'my transactions', 'view history', 'transaction list', 'old transactions'],
    q: 'Where can I see my transaction history?',
    a: 'Go to "Transactions" in the sidebar. You can filter by status (success/failed/pending), service type, and date range. The Wallet page also has a "Ledger" tab showing all credits and debits.',
  },
  {
    id: 'ghana',
    patterns: ['ghana', 'ghanaian', 'ghs', 'cedis', 'momo', 'vodafone ghana', 'airteltigo', '+233', 'ghanaian number', 'ghana airtime', 'ghana data', 'mobile money', 'mtn ghana'],
    q: 'Do you support Ghana?',
    a: 'Yes! We support Ghana via Hubtel. You can buy airtime and data for MTN Ghana, Vodafone Ghana, and AirtelTigo. Just select Ghana as your country on the Airtime or Data page and enter a +233 number.',
  },
  {
    id: 'security',
    patterns: ['safe', 'security', 'secure', 'scam', 'trust', 'verified', 'kyc', 'is it safe', 'trustworthy', 'legit', 'legitimate', 'my account safe', 'data safe', 'hacked'],
    q: 'Is QuickTopUp.ng safe to use?',
    a: 'Yes. We use token-based authentication, 4-digit transaction PINs, Flutterwave\'s secure payment gateway, idempotency keys to prevent duplicate charges, and KYC verification. Your card details are never stored on our servers.',
  },
  {
    id: 'contact',
    patterns: ['contact', 'email', 'support', 'help', 'call', 'reach', 'human', 'agent', 'speak to someone', 'talk to human', 'customer care', 'customer service', 'live support', 'how do i contact', 'reach out'],
    q: 'How do I contact support?',
    a: 'Email us at quicktopup.it.com@gmail.com — we typically respond within a few hours. For urgent issues, include your transaction reference number so we can resolve it faster.',
  },
  {
    id: 'refund',
    patterns: ['refund', 'money back', 'reversed', 'reverse', 'chargeback', 'wrong number', 'sent to wrong number', 'wrong phone', 'incorrect number', 'get my money back', 'reversal', 'dispute'],
    q: 'Can I get a refund for a wrong transaction?',
    a: 'If you entered the wrong number and the transaction was successful, we\'ll try our best to help. Contact us at quicktopup.it.com@gmail.com within 24 hours with your transaction reference. Note: refunds depend on the service provider\'s policy.',
  },
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
  }
];

const QUICK_TOPICS = [
  { label: 'Fund Wallet', id: 'wallet_fund', icon: Wallet },
  { label: 'Buy Airtime', id: 'airtime_buy', icon: Phone },
  { label: 'Buy Data', id: 'data_buy', icon: Wifi },
  { label: 'Cable TV', id: 'cable_sub', icon: Tv },
  { label: 'Transaction PIN', id: 'pin_set', icon: KeyRound },
  { label: 'Transaction Failed', id: 'failed_txn', icon: XCircle },
  { label: 'Wallet Locked', id: 'wallet_locked', icon: Lock },
  { label: 'Processing Fee', id: 'fund_fee', icon: DollarSign },
  { label: 'Fetch Failed', id: 'fetch_failed', icon: HelpCircle }
];

// ─────────────────────────────────────────
// Smart multi-strategy matcher
// ─────────────────────────────────────────
const SYNONYMS = {
  'recharge': ['airtime', 'top up'],
  'credit':   ['airtime', 'fund', 'wallet'],
  'internet': ['data', 'browsing', 'gb'],
  'browse':   ['data', 'internet'],
  'subscribe': ['cable', 'dstv', 'gotv'],
  'tv':       ['cable', 'dstv', 'gotv', 'startimes'],
  'light':    ['electricity', 'power', 'meter'],
  'nepa':     ['electricity', 'disco', 'power'],
  'phcn':     ['electricity', 'disco', 'power'],
  'prepaid meter': ['electricity', 'meter'],
  'postpaid meter': ['electricity', 'postpaid'],
  'token':    ['electricity'],
  'pw':       ['password', 'pin'],
  'passcode': ['pin'],
  'code':     ['pin'],
  'cant login': ['password', 'login'],
  'login':    ['password'],
  'sign in':  ['login'],
  'register': ['sign up', 'account'],
  'sign up':  ['register', 'account'],
  'add funds': ['fund', 'wallet', 'deposit'],
  'deposit':  ['fund', 'wallet'],
  'pay':      ['fund', 'purchase', 'buy'],
  'purchase': ['buy'],
  'didnt receive': ['failed', 'not delivered'],
  'not delivered': ['failed', 'pending'],
  'pending':  ['failed', 'transaction'],
  'stuck':    ['failed', 'pending'],
  'wrong':    ['refund', 'failed'],
  'mistake':  ['refund'],
  'charged':  ['balance', 'deducted', 'fee'],
  'deducted': ['balance', 'charged'],
  'how much': ['balance'],
  'statement': ['ledger', 'history'],
  'invoice':  ['ledger', 'receipt'],
  'receipt':  ['ledger', 'history'],
  'locked':   ['wallet locked'],
  'freeze':   ['wallet locked'],
  'frozen':   ['wallet locked'],
  'blocked':  ['wallet locked'],
  'extra charge': ['fee', 'processing fee'],
  'more than': ['fee', 'total amount'],
  'expensive': ['fee'],
  'provider down': ['fetch failed', 'not loading'],
  'not loading': ['fetch failed', 'networks'],
  'cant see': ['fetch failed', 'not loading'],
  'empty':    ['fetch failed', 'not loading'],
  'nigeria':  ['ng', 'naira'],
  'ghana':    ['gh', 'cedis', '+233'],
  'mtn':      ['network', 'airtime', 'data'],
  'airtel':   ['network', 'airtime', 'data'],
  'glo':      ['network', 'airtime', 'data'],
  '9mobile':  ['network', 'airtime', 'data'],
  'etisalat': ['network', '9mobile'],
  'flutterwave': ['payment', 'fund'],
  'card':     ['fund', 'payment'],
  'ussd':     ['fund', 'payment'],
  'transfer': ['fund', 'bank transfer'],
  'safe':     ['security'],
  'scam':     ['security', 'trust'],
  'hack':     ['security'],
  'human':    ['contact', 'agent', 'support'],
  'talk to':  ['contact', 'agent'],
  'speak to': ['contact', 'agent'],
  'email':    ['contact'],
};

function levenshtein(a, b) {
  if (Math.abs(a.length - b.length) > 3) return 99;
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (__, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function expandInput(lower) {
  const words = lower.split(/\s+/);
  const extras = new Set();
  for (const w of words) {
    if (SYNONYMS[w]) SYNONYMS[w].forEach(s => extras.add(s));
    for (const [key, vals] of Object.entries(SYNONYMS)) {
      if (w.length >= 4 && (key.startsWith(w) || w.startsWith(key.slice(0, 4)))) {
        vals.forEach(s => extras.add(s));
      }
    }
  }
  for (const [key, vals] of Object.entries(SYNONYMS)) {
    if (key.includes(' ') && lower.includes(key)) {
      vals.forEach(s => extras.add(s));
    }
  }
  return lower + ' ' + Array.from(extras).join(' ');
}

function findAnswer(rawInput) {
  const lower = rawInput.toLowerCase().replace(/[^a-z0-9+\s]/g, ' ').trim();
  const expanded = expandInput(lower);
  const words = lower.split(/\s+/).filter(w => w.length >= 3);

  let best = null;
  let bestScore = 0;

  for (const faq of FAQ) {
    if (!faq.patterns) continue;
    let score = 0;

    for (const pattern of faq.patterns) {
      const pat = pattern.toLowerCase();

      if (expanded.includes(pat)) {
        score += pat.split(' ').length * 3;
        continue;
      }

      const patWords = pat.split(' ');
      if (patWords.length > 1 && patWords.every(pw => expanded.includes(pw))) {
        score += patWords.length * 2;
        continue;
      }

      for (const w of words) {
        if (w.length >= 5 && pat.length >= 5) {
          const dist = levenshtein(w, pat);
          if (dist <= 1) { score += 2; break; }
          if (dist <= 2 && Math.max(w.length, pat.length) > 6) { score += 1; break; }
        }
        if (w.length >= 5 && pat.length >= 5 && (pat.startsWith(w) || w.startsWith(pat.slice(0,5)))) {
          score += 1; break;
        }
      }
    }

    if (score > bestScore) { bestScore = score; best = faq; }
  }

  return bestScore >= 2 ? best : null;
}

// ─────────────────────────────────────────
// Component Definition
// ─────────────────────────────────────────
export default function CustomerSupport() {
  const [open, setOpen] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I\'m QuickTopUp support. How can I help you today?', id: 0 },
  ]);
  const [input, setInput] = useState('');
  const [pos, setPos] = useState({ x: null, y: null }); 
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const widgetRef = useRef(null);
  const messagesEndRef = useRef(null);
  const msgId = useRef(1);

  useEffect(() => {
    if (open && !minimised) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, minimised]);

  const onMouseDown = useCallback((e) => {
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
      const maxX = window.innerWidth - (widgetRef.current?.offsetWidth || 340);
      const maxY = window.innerHeight - (widgetRef.current?.offsetHeight || 60);
      setPos({ x: Math.max(0, Math.min(x, maxX)), y: Math.max(0, Math.min(y, maxY)) });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    
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
      const smallTalk = findSmallTalk(text);
      if (smallTalk) {
        addMsg('bot', smallTalk);
        return;
      }
      const match = findAnswer(text);
      if (match) {
        addMsg('bot', `**${match.q}**\n\n${match.a}`);
      } else {
        addMsg('bot',
          "Hmm, I'm not sure about that one. Here are some things I can help with:\n\n" +
          QUICK_TOPICS.slice(0, 6).map(t => `• ${t.label}`).join('\n') +
          '\n\nOr email us at quicktopup.it.com@gmail.com'
        );
      }
    }, 380);
  }, [input]);

  const handleTopic = (id) => {
    const faq = FAQ.find(f => f.id === id);
    if (!faq) return;
    addMsg('user', faq.q);
    setTimeout(() => addMsg('bot', faq.a), 400);
  };

  const reset = () => setMessages([
    { from: 'bot', text: 'Hi! I\'m QuickTopUp support. How can I help you today?', id: msgId.current++ },
  ]);

  const widgetStyle = pos.x !== null
    ? { position: 'fixed', left: pos.x, top: pos.y, bottom: 'auto', right: 'auto', cursor: dragging ? 'grabbing' : 'auto' }
    : {};

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
          <div className="cs-avatar"><HelpCircle size={20} /></div>
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
          <div className="cs-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`cs-msg cs-msg-${msg.from}`}>
                {msg.from === 'bot' && <div className="cs-bot-avatar"><HelpCircle size={16} /></div>}
                <div className={`cs-bubble cs-bubble-${msg.from}`}>
                  {msg.text.split('\n').map((line, i) => {
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

          {messages.length <= 1 && (
            <div className="cs-quick-topics">
              <div className="cs-quick-label">Quick topics:</div>
              <div className="cs-topics-grid">
                {QUICK_TOPICS.map(t => (
                  <button key={t.id} className="cs-topic-btn" onClick={() => handleTopic(t.id)}>
                    <t.icon size={14} /> {t.label} <ChevronRight size={12} />
                  </button>
                ))}
              </div>
            </div>
          )}

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