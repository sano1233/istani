'use client';
import { useState, useEffect } from 'react';

/**
 * Client-side React component providing a chat-like interface for sending prompts, viewing streamed AI responses, and managing API keys.
 *
 * Renders a header with a keys modal, a scrollable message history (user and AI messages), an input form to submit prompts, and a "Thinking..." indicator while awaiting responses. Persists API keys in localStorage under `istani_keys`.
 *
 * @returns The component's JSX element.
 */
export default function Builder() {
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [keys, setKeys] = useState({ or: '', gem: '' });
  const [showSet, setShowSet] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('istani_keys');
    if (s) setKeys(JSON.parse(s));
  }, []);

  const save = () => {
    localStorage.setItem('istani_keys', JSON.stringify(keys));
    setShowSet(false);
  };

  const send = async (e: any) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const txt = input; setInput('');
    setMsgs(p => [...p, {r: 'user', t: txt}]);
    setLoading(true);

    try {
      const res = await fetch('/api/swarm', {
        method: 'POST',
        headers: {'X-OpenRouter-Key': keys.or, 'X-Gemini-Key': keys.gem},
        body: JSON.stringify({ prompt: txt })
      });
      const reader = res.body?.getReader();
      const dec = new TextDecoder();
      let reply = '';
      while (true) {
        const {done, value} = await reader!.read();
        if (done) break;
        const chunk = dec.decode(value);
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));
        for (const l of lines) {
          try {
            const json = JSON.parse(l.replace('data: ', ''));
            if (json.text) reply += json.text;
          } catch {}
        }
      }
      setMsgs(p => [...p, {r: 'ai', t: reply}]);
    } catch (e) { setMsgs(p => [...p, {r: 'ai', t: 'Error connecting.'}]); }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white text-sm sm:text-base">
      <div className="flex justify-between p-4 border-b border-gray-800 bg-black/20">
        <span className="font-bold text-green-400">ISTANI</span>
        <button onClick={() => setShowSet(true)} className="bg-gray-800 px-3 py-1 rounded">⚙️ Keys</button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {msgs.length === 0 && <div className="text-center text-gray-500 mt-10">Ready to build...</div>}
        {msgs.map((m, i) => (
          <div key={i} className={`p-3 rounded-lg max-w-[90%] ${m.r === 'user' ? 'bg-blue-900 ml-auto' : 'bg-gray-800'}`}>
            <pre className="whitespace-pre-wrap break-words font-mono text-xs sm:text-sm">{m.t}</pre>
          </div>
        ))}
        {loading && <div className="text-green-400 animate-pulse">Thinking...</div>}
      </div>

      <form onSubmit={send} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input className="flex-1 bg-gray-800 rounded p-3 focus:outline-none" value={input} onChange={e => setInput(e.target.value)} placeholder="Describe app..." />
          <button type="submit" disabled={loading} className="bg-green-600 px-6 rounded font-bold">Go</button>
        </div>
      </form>

      {showSet && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-gray-900 p-6 rounded w-full max-w-sm border border-gray-700 space-y-4">
            <h3 className="font-bold">API Keys</h3>
            <input type="password" className="w-full bg-black p-2 rounded border border-gray-700" placeholder="OpenRouter Key" value={keys.or} onChange={e => setKeys({...keys, or: e.target.value})} />
            <input type="password" className="w-full bg-black p-2 rounded border border-gray-700" placeholder="Gemini Key (Opt)" value={keys.gem} onChange={e => setKeys({...keys, gem: e.target.value})} />
            <button onClick={save} className="w-full bg-green-600 py-2 rounded font-bold">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}