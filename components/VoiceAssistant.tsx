
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { decode, encode, decodeAudioData } from '../utils';

const VoiceAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleStop = useCallback(() => {
    setIsActive(false);
    setIsConnecting(false);
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    sourcesRef.current.forEach(source => {
        try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
  }, []);

  const handleStart = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      if (!audioContextRef.current) {
        audioContextRef.current = {
          input: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 }),
          output: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }),
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const source = audioContextRef.current!.input.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.input.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.input.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const outCtx = audioContextRef.current!.output;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
              const sourceNode = outCtx.createBufferSource();
              sourceNode.buffer = audioBuffer;
              sourceNode.connect(outCtx.destination);
              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(sourceNode);
              sourceNode.onended = () => sourcesRef.current.delete(sourceNode);
            }

            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscription(prev => [...prev.slice(-15), `Heritage AI: ${text}`]);
            }
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscription(prev => [...prev.slice(-15), `You: ${text}`]);
            }
          },
          onerror: (e) => {
            console.error("Live API Error:", e);
            handleStop();
          },
          onclose: () => handleStop(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are a warm, wise family historian. Help the user reflect on their ancestry, share historical context about surnames, and preserve oral family traditions through conversation. Keep responses focused on family legacy.",
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } }
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcription]);

  useEffect(() => {
    return () => handleStop();
  }, [handleStop]);

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4 sm:p-8 animate-fadeIn">
      <div className="text-center mb-6 sm:mb-8 shrink-0 pt-4">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-2 tracking-tight">Ancestral Voices</h2>
        <p className="text-slate-500 text-sm font-medium">A lineage-focused Heritage AI conversation.</p>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 min-h-0 bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-indigo-50/50 p-6 sm:p-8 flex flex-col space-y-4 overflow-y-auto custom-scrollbar border border-slate-100 relative mb-6"
      >
        {transcription.length === 0 && !isActive && !isConnecting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <i className="fas fa-microphone-lines text-indigo-300 text-xl"></i>
            </div>
            <p className="text-slate-400 text-sm font-medium">Tap the button to start reflecting on your family history.</p>
          </div>
        )}
        
        {transcription.map((t, i) => (
          <div key={i} className={`p-4 rounded-2xl text-[13px] sm:text-sm font-bold leading-relaxed animate-fadeIn ${t.startsWith('You:') ? 'bg-indigo-600 self-end text-white ml-8 shadow-md' : 'bg-slate-50 self-start text-slate-700 mr-8 border border-slate-200'}`}>
            {t}
          </div>
        ))}
        
        {isConnecting && (
          <div className="flex flex-col justify-center items-center h-full space-y-4 py-12">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-indigo-600 font-black uppercase tracking-widest text-[10px]">Calling Historian...</p>
          </div>
        )}
      </div>

      <div className="shrink-0 flex flex-col items-center space-y-4 pb-8 sm:pb-0">
        <div className="relative">
          {isActive && (
            <div className="absolute -inset-6 bg-indigo-400 rounded-full animate-ping opacity-20"></div>
          )}
          <button
            onClick={isActive ? handleStop : handleStart}
            disabled={isConnecting}
            className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-90 ${
              isActive 
              ? 'bg-rose-500 shadow-rose-200' 
              : 'bg-indigo-600 shadow-indigo-200'
            } text-white`}
          >
            {isActive ? (
              <i className="fas fa-stop text-3xl"></i>
            ) : (
              <i className="fas fa-microphone text-4xl"></i>
            )}
          </button>
        </div>
        
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`}>
          {isActive ? 'Listening to your story...' : 'Connect to LineageTalk'}
        </p>
      </div>
    </div>
  );
};

export default VoiceAssistant;
