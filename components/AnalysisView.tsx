import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Copy, Check } from 'lucide-react';

interface AnalysisViewProps {
  markdown: string;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ markdown }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-blue-400">
          <Bot size={20} />
          <h2 className="font-semibold text-slate-100">AI Analysis Report</h2>
        </div>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-md transition-all"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Markdown'}
        </button>
      </div>
      
      <div className="p-6 md:p-8 overflow-y-auto max-h-[800px] prose prose-invert prose-slate max-w-none">
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-blue-400 mb-4 pb-2 border-b border-slate-800" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-blue-300 mt-6 mb-3" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-medium text-slate-200 mt-4 mb-2" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 space-y-1 text-slate-300" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-6 space-y-1 text-slate-300" {...props} />,
            strong: ({node, ...props}) => <strong className="font-semibold text-blue-200" {...props} />,
            p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-slate-300" {...props} />,
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default AnalysisView;