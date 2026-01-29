
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import { Language, AnalysisResult, AudioFile } from './types';
import { analyzeVoiceSample } from './services/geminiService';
import AnalysisResultView from './components/AnalysisResultView';

const App: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.ENGLISH);
  const [hackathonApiKey, setHackathonApiKey] = useState('sk_voxguard_2025'); // Default for demo
  const [file, setFile] = useState<AudioFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showApiDocs, setShowApiDocs] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    setError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          setFile({
            name: `recorded-sample-${new Date().getTime()}.webm`,
            base64: base64,
            mimeType: 'audio/webm',
            size: audioBlob.size,
          });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('audio/')) {
      setError('Invalid file type. Please upload an audio file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setFile({
        name: selectedFile.name,
        base64: base64,
        mimeType: selectedFile.type,
        size: selectedFile.size,
      });
      setError(null);
      setResult(null);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    if (!hackathonApiKey) {
      setError('A valid x-api-key is required for authentication.');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeVoiceSample(file.base64, 'mp3', selectedLanguage, hackathonApiKey);
      if (analysis.status === 'error') {
        throw new Error(analysis.explanation);
      }
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Check your API Key.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setIsRecording(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
              Voice Authenticity <span className="text-indigo-600">Check</span>
            </h2>
            <p className="text-slate-500 text-base max-w-md mx-auto leading-relaxed">
              Strictly compliant with hackathon API specifications, including header-based authentication.
            </p>
          </div>

          {/* Controls Container */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
            
            {/* API Key Auth Field */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authentication</label>
                {hackathonApiKey && <span className="text-[9px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">x-api-key: ACTIVE</span>}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fas fa-key text-slate-300 text-xs"></i>
                </div>
                <input
                  type="password"
                  value={hackathonApiKey}
                  onChange={(e) => setHackathonApiKey(e.target.value)}
                  placeholder="Enter Hackathon API Key..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Language Picker */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Select Language</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(Language).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                      selectedLanguage === lang
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Choose Input Mode</label>
              
              {!file && !isRecording ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                  >
                    <div className="bg-slate-100 group-hover:bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors">
                      <i className="fas fa-file-arrow-up text-slate-500 group-hover:text-indigo-600"></i>
                    </div>
                    <span className="font-semibold text-sm text-slate-700">Upload File</span>
                    <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" onChange={handleFileChange} />
                  </button>

                  <button
                    onClick={startRecording}
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-rose-200 hover:bg-rose-50/30 transition-all group"
                  >
                    <div className="bg-slate-100 group-hover:bg-rose-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors">
                      <i className="fas fa-microphone text-slate-500 group-hover:text-rose-600"></i>
                    </div>
                    <span className="font-semibold text-sm text-slate-700">Record Live</span>
                  </button>
                </div>
              ) : isRecording ? (
                <div className="p-8 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col items-center justify-center space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-rose-600 rounded-full animate-pulse"></div>
                    <span className="text-rose-600 font-bold font-mono text-xl">{formatTime(recordingTime)}</span>
                  </div>
                  <button 
                    onClick={stopRecording}
                    className="px-6 py-2 bg-rose-600 text-white rounded-full font-bold text-sm hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all"
                  >
                    Stop Recording
                  </button>
                </div>
              ) : (
                <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex justify-between items-center group">
                  <div className="flex items-center space-x-4 overflow-hidden">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-music text-white text-xs"></i>
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold text-slate-900 truncate">{file?.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase text-indigo-400">Ready for MP3 Analysis</p>
                    </div>
                  </div>
                  <button onClick={reset} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                    <i className="fas fa-circle-xmark text-lg"></i>
                  </button>
                </div>
              )}
            </div>

            {file && !result && (
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center space-x-3"
              >
                {isAnalyzing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>Verify Authenticity</span>
                )}
              </button>
            )}
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium rounded-2xl flex items-center space-x-3">
              <i className="fas fa-triangle-exclamation"></i>
              <span>{error}</span>
            </div>
          )}

          {(isAnalyzing || result) && (
            <AnalysisResultView result={result!} isLoading={isAnalyzing} />
          )}

          {/* Hackathon API Documentation Card */}
          <div className="bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            <button 
              onClick={() => setShowApiDocs(!showApiDocs)}
              className="w-full p-4 flex items-center justify-between text-slate-600 hover:bg-slate-200/50 transition-colors"
            >
              <span className="text-xs font-bold uppercase tracking-widest flex items-center">
                <i className="fas fa-code mr-2"></i> Hackathon API Specification
              </span>
              <i className={`fas fa-chevron-${showApiDocs ? 'up' : 'down'} text-[10px]`}></i>
            </button>
            {showApiDocs && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 font-mono text-[11px] space-y-4">
                <div>
                  <p className="text-slate-400 mb-1 font-bold uppercase tracking-tighter">Auth Header Required:</p>
                  <p className="text-emerald-600 bg-white p-2 rounded border border-slate-200 font-bold">
                    x-api-key: {hackathonApiKey || 'YOUR_SECRET_KEY'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1 font-bold uppercase tracking-tighter">Required Request Body:</p>
                  <pre className="bg-slate-900 text-slate-300 p-3 rounded overflow-x-auto">
{`{
  "language": "${selectedLanguage}",
  "audioFormat": "mp3",
  "audioBase64": "SUQzBAAAAAAA..."
}`}
                  </pre>
                </div>
                <div>
                  <p className="text-slate-400 mb-1 font-bold uppercase tracking-tighter">Success Response:</p>
                  <pre className="bg-slate-900 text-slate-300 p-3 rounded overflow-x-auto">
{`{
  "status": "success",
  "language": "${selectedLanguage}",
  "classification": "${result?.classification || 'AI_GENERATED'}",
  "confidenceScore": ${result?.confidenceScore || 0.95},
  "explanation": "..."
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-[10px] text-slate-300 font-medium tracking-widest uppercase">&copy; {new Date().getFullYear()} VoxGuard Hackathon Edition</p>
      </footer>
    </div>
  );
};

export default App;
