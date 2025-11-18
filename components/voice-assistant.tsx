'use client';

import { useEffect, createElement } from 'react';

export function VoiceAssistant() {
  useEffect(() => {
    // Load ElevenLabs ConvAI widget script
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Use createElement to avoid TypeScript errors with custom elements
  return createElement('elevenlabs-convai', {
    'agent-id': process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'your_agent_id_here',
  });
}
