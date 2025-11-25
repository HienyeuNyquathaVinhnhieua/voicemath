import React, { useState } from 'react';
import { Sparkles, PlayCircle, FileText, Loader2, ArrowRight } from 'lucide-react';
import VideoUploader from './components/VideoUploader';
import AnalysisView from './components/AnalysisView';
import { analyzeAppVideo } from './services/geminiService';
import { AnalysisStatus } from './types';

const App: React.FC = () => {
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelect = (files: File[]) => {
    setVideoFiles(files);
    // Reset status if user changes files
    if (status === AnalysisStatus.COMPLETED || status === AnalysisStatus.ERROR) {
      setStatus(AnalysisStatus.IDLE);
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (videoFiles.length === 0) return;

    try {
      setStatus(AnalysisStatus.PREPARING);
      setError(null);
      
      // Artificial delay to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStatus(AnalysisStatus.ANALYZING);
      const analysis = await analyzeAppVideo(videoFiles, prompt);
      
      setResult(analysis);
      setStatus(AnalysisStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze video.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const isProcessing = status === AnalysisStatus.PREPARING || status === AnalysisStatus.ANALYZING;

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200">
      <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              AppFeature AI
            </h1>
          </div>
          <div className="text-xs font-medium px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      <main className="pt-28 pb-20 px-6 max-w-6xl mx-auto">
        <div className="mb-12 text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Turn App Demos into <br />
            <span className="text-blue-500">Structured Specs</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Upload one or more video parts of an application. Our AI watches the user flow, listens to the narration, and writes the feature documentation for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Step 1: Upload */}
            <div className={`space-y-3 transition-opacity duration-300 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-blue-400 text-xs border border-slate-700">1</span>
                Upload Video(s)
              </div>
              <VideoUploader 
                onFilesSelect={handleFilesSelect} 
                selectedFiles={videoFiles}
                disabled={isProcessing}
              />
            </div>

            {/* Step 2: Context */}
            <div className={`space-y-3 transition-opacity duration-300 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-blue-400 text-xs border border-slate-700">2</span>
                Context / Instructions
              </div>
              <div className="relative">
                <FileText className="absolute top-3 left-3 text-slate-500" size={18} />
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to focus on (e.g. 'Analyze the checkout flow' or 'List all user roles'). If you uploaded split videos, mention that here."
                  className="w-full h-32 pl-10 pr-4 py-3 bg-slate-800/30 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-slate-200 placeholder-slate-500 resize-none transition-all"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleAnalyze}
              disabled={videoFiles.length === 0 || isProcessing}
              className={`
                group w-full py-4 px-6 rounded-xl flex items-center justify-center gap-3 font-semibold text-lg transition-all duration-300 shadow-lg shadow-blue-900/20
                ${videoFiles.length === 0 || isProcessing 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transform hover:-translate-y-1'
                }
              `}
            >
              {status === AnalysisStatus.PREPARING ? (
                <>
                  <Loader2 className="animate-spin" /> Preparing Video(s)...
                </>
              ) : status === AnalysisStatus.ANALYZING ? (
                <>
                  <Loader2 className="animate-spin" /> Analyzing (Gemini is watching)...
                </>
              ) : (
                <>
                  <PlayCircle size={22} className={videoFiles.length === 0 ? 'opacity-50' : 'group-hover:scale-110 transition-transform'} />
                  Analyze App Features
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-shake">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>

          {/* Right Column: Output / Preview */}
          <div className="lg:col-span-7">
            {status === AnalysisStatus.IDLE || status === AnalysisStatus.PREPARING ? (
               <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50 text-slate-500 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                    <Sparkles className="text-slate-600" />
                  </div>
                  <p className="text-center px-4">Upload your app demo videos to generate specs.<br/>Supports multiple parts.</p>
               </div>
            ) : status === AnalysisStatus.ANALYZING ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center rounded-xl bg-slate-900/50 border border-slate-800 relative overflow-hidden">
                 <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
                 <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4 relative z-10" />
                 <h3 className="text-xl font-semibold text-white relative z-10">AI is analyzing the footage...</h3>
                 <p className="text-slate-400 mt-2 max-w-xs text-center relative z-10">
                   Processing {videoFiles.length} video file(s). Detecting UI elements, listening to audio, and mapping user flows.
                 </p>
              </div>
            ) : result ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <AnalysisView markdown={result} />
                 <div className="mt-4 text-center">
                    <button 
                      onClick={() => {
                        setVideoFiles([]);
                        setPrompt('');
                        setResult(null);
                        setStatus(AnalysisStatus.IDLE);
                      }}
                      className="text-slate-400 hover:text-white text-sm flex items-center justify-center gap-1 mx-auto transition-colors"
                    >
                      Start New Analysis <ArrowRight size={14} />
                    </button>
                 </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;