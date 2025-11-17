'use client';

import { useEffect } from 'react';

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

  return (
    <elevenlabs-convai
      agent-id={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'your_agent_id_here'}
    />
  );
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'agent-id': string;
        },
        HTMLElement
      >;
    }
  }
}
