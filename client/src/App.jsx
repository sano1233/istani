import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:4000';

const tabs = [
  { id: 'chat', label: 'AI Chat & Voice' },
  { id: 'social', label: 'Social Automation' },
  { id: 'booking', label: 'Scheduling' }
];

function App() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="logo">AI Stack</div>
        <div className="header-meta">
          <span className="badge">Full-stack · Free · Local LLM</span>
        </div>
      </header>

      <main className="app-main">
        <section className="shell">
          <nav className="tab-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'tab-btn-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <section className="tab-body">
            {activeTab === 'chat' && <ChatPanel />}
            {activeTab === 'social' && <SocialPanel />}
            {activeTab === 'booking' && <BookingPanel />}
          </section>
        </section>
      </main>
    </div>
  );
}

/**
 * Chat + Voice Panel
 */
function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const hasSTT =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    const hasTTS = typeof window !== 'undefined' && 'speechSynthesis' in window;

    setVoiceSupported(hasSTT && hasTTS);
  }, []);

  async function sendMessage(text, fromVoice = false) {
    const trimmed = (text || input).trim();
    if (!trimmed) return;

    const newUserMessage = { from: 'user', text: trimmed };
    const context = [...messages, newUserMessage].slice(-8);

    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, context })
      });

      const data = await res.json();
      const replyText =
        typeof data.reply === 'string' ? data.reply : 'I could not generate a response.';

      const botMessage = { from: 'assistant', text: replyText };
      setMessages(prev => [...prev, botMessage]);

      if (fromVoice && typeof window !== 'undefined' && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(replyText);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          from: 'assistant',
          text: 'There was an error talking to the AI. Check the backend.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage();
  }

  function startVoice() {
    if (!voiceSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onerror = event => {
      console.error('Voice error:', event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      sendMessage(transcript, true);
    };

    recognition.start();
  }

  return (
    <div className="panel grid-2">
      <div className="card chat-card">
        <div className="card-header">
          <h2>AI Chat</h2>
          <p className="muted">Ask about bookings, social posts, or general questions.</p>
        </div>
        <div className="chat-window">
          {messages.length === 0 && (
            <div className="empty-state">
              <p>Start the conversation. Try:</p>
              <ul>
                <li>"What are my hours today?"</li>
                <li>"Draft a post about a new offer."</li>
                <li>"Book me tomorrow at 3 PM."</li>
              </ul>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`chat-bubble ${m.from === 'user' ? 'bubble-user' : 'bubble-bot'}`}
            >
              <span className="bubble-label">{m.from === 'user' ? 'You' : 'AI'}</span>
              <p>{m.text}</p>
            </div>
          ))}
        </div>
        <form className="chat-input-row" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Type your question…"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'Thinking…' : 'Send'}
          </button>
        </form>
      </div>

      <div className="card voice-card">
        <div className="card-header">
          <h2>Voice Assistant</h2>
          <p className="muted">Talk to the same AI using your microphone.</p>
        </div>
        <div className="voice-body">
          <p className="muted">
            This runs fully in your browser using the Web Speech API. No extra accounts or billing.
          </p>
          <button
            className={`btn voice-btn ${listening ? 'voice-btn-active' : ''}`}
            onClick={startVoice}
            disabled={!voiceSupported}
            type="button"
          >
            {voiceSupported
              ? listening
                ? 'Listening…'
                : 'Tap to Speak'
              : 'Voice not supported in this browser'}
          </button>
          <p className="tips">Tip: Use Chrome on desktop for the best speech recognition.</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Social Automation Panel
 */
function SocialPanel() {
  const [content, setContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`${API_BASE}/api/post-social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmed,
          platform: 'mastodon',
          scheduledAt: scheduledAt || null
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to schedule post.');
      }

      setStatus({
        ok: true,
        message: data.post?.remote?.url
          ? `Scheduled/posted. Link: ${data.post.remote.url}`
          : 'Saved. Mastodon is not configured; stored locally only.'
      });
      setContent('');
      setScheduledAt('');
    } catch (err) {
      console.error('Social error:', err);
      setStatus({ ok: false, message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel single">
      <div className="card">
        <div className="card-header">
          <h2>Social Media Automation</h2>
          <p className="muted">Draft content once, let the backend handle posting or scheduling.</p>
        </div>
        <form className="form-vertical" onSubmit={handleSubmit}>
          <label className="label">
            Post content
            <textarea
              className="textarea"
              rows={5}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Announce a new offer, update, or content drop…"
            />
          </label>
          <label className="label">
            Optional schedule time
            <input
              className="input"
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
            />
          </label>
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'Scheduling…' : 'Schedule / Post'}
          </button>
        </form>
        {status && (
          <div className={`status ${status.ok ? 'status-ok' : 'status-bad'}`}>{status.message}</div>
        )}
        <p className="muted small">
          Note: For real Mastodon posting, set <code>MASTODON_BASE_URL</code> and{' '}
          <code>MASTODON_ACCESS_TOKEN</code> in <code>server/.env</code>.
        </p>
      </div>
    </div>
  );
}

/**
 * Booking Panel
 */
function BookingPanel() {
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bookingStatus, setBookingStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadSlots() {
      setLoadingSlots(true);
      try {
        const res = await fetch(`${API_BASE}/api/availability`);
        const data = await res.json();
        setSlots(data.slots || []);
      } catch (err) {
        console.error('Availability error:', err);
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, []);

  function formatSlot(slot) {
    const start = new Date(slot.start);
    const end = new Date(slot.end);
    const date = start.toLocaleDateString();
    const time = `${start.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return `${date} · ${time}`;
  }

  async function handleBook(e) {
    e.preventDefault();
    if (!selectedSlot || !name.trim()) return;
    setSubmitting(true);
    setBookingStatus(null);

    try {
      const res = await fetch(`${API_BASE}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          slotId: selectedSlot.id
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Booking failed.');
      }

      setBookingStatus({
        ok: true,
        message: `Booked: ${formatSlot(selectedSlot)} for ${name.trim()}`
      });
      setName('');
      setEmail('');
      setSelectedSlot(null);
    } catch (err) {
      console.error('Booking error:', err);
      setBookingStatus({ ok: false, message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="panel grid-2">
      <div className="card">
        <div className="card-header">
          <h2>Available Slots</h2>
          <p className="muted">
            These are sample time slots from the backend. Later you can wire this to Google Calendar
            or a real schedule.
          </p>
        </div>
        <div className="slot-list">
          {loadingSlots && <p className="muted">Loading availability…</p>}
          {!loadingSlots && slots.length === 0 && <p className="muted">No slots available.</p>}
          {slots.map(slot => (
            <button
              key={slot.id}
              type="button"
              className={`slot-item ${
                selectedSlot && selectedSlot.id === slot.id ? 'slot-item-active' : ''
              }`}
              onClick={() => setSelectedSlot(slot)}
            >
              {formatSlot(slot)}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Book a Slot</h2>
          <p className="muted">Pick a time on the left, then confirm the booking here.</p>
        </div>
        <form className="form-vertical" onSubmit={handleBook}>
          <label className="label">
            Name
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
            />
          </label>
          <label className="label">
            Email (optional)
            <input
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <div className="label">
            Selected slot
            <div className="selected-slot">
              {selectedSlot ? (
                <span>{formatSlot(selectedSlot)}</span>
              ) : (
                <span className="muted">No slot selected.</span>
              )}
            </div>
          </div>
          <button
            className="btn primary"
            type="submit"
            disabled={submitting || !selectedSlot || !name.trim()}
          >
            {submitting ? 'Booking…' : 'Confirm Booking'}
          </button>
        </form>
        {bookingStatus && (
          <div className={`status ${bookingStatus.ok ? 'status-ok' : 'status-bad'}`}>
            {bookingStatus.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
