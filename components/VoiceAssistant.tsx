
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
              setTranscription(prev => [...prev.slice(-10), `Heritage AI: ${text}`]);
            }
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscription(prev => [...prev.slice(-10), `You: ${text}`]);
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
          systemInstruction: "You are a warm, wise family historian. Help the user reflect on their ancestry, share historical context about surnames, and preserve oral family traditions through conversation.",
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
    return () => handleStop();
  }, [handleStop]);

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] p-6 space-y-10 max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Ancestral Voices</h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto">A natural, voice-first conversation about your lineage and family stories.</p>
      </div>

      <div className="w-full h-80 bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-50 p-8 flex flex-col justify-end space-y-3 overflow-hidden border border-slate-100 relative group custom-scrollbar overflow-y-auto">
        {transcription.length === 0 && !isActive && !isConnecting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-microphone-lines text-slate-300 text-2xl"></i>
            </div>
            <p className="text-slate-400 font-medium">Tap the button below to start a voice conversation with your lineage historian.</p>
          </div>
        )}
        
        {transcription.map((t, i) => (
          <div key={i} className={`p-4 rounded-2xl text-sm font-medium animate-fadeIn ${t.startsWith('You:') ? 'bg-indigo-600 self-end text-white ml-12 shadow-md' : 'bg-slate-100 self-start text-slate-700 mr-12 border border-slate-200'}`}>
            {t}
          </div>
        ))}
        
        {isConnecting && (
          <div className="flex flex-col justify-center items-center h-full space-y-4">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Summoning Historian...</p>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          {isActive && (
            <div className="absolute -inset-8 bg-indigo-400 rounded-full animate-ping opacity-20"></div>
          )}
          <button
            onClick={isActive ? handleStop : handleStart}
            disabled={isConnecting}
            className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl active:scale-90 ${
              isActive 
              ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            } text-white`}
          >
            {isActive ? (
              <i className="fas fa-square text-4xl"></i>
            ) : (
              <i className="fas fa-microphone text-4xl"></i>
            )}
          </button>
        </div>
        
        <p className={`text-sm font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`}>
          {isActive ? 'Historian is Listening...' : 'Start Lineage Talk'}
        </p>
      </div>
    </div>
  );
};

export default VoiceAssistant;
