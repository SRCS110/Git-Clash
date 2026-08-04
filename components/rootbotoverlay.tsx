import React from 'react';

export interface RootBotResponse {
  thought_process: string;
  ui_action: 'HIGHLIGHT_BLOCK' | 'SHOW_HINT' | 'EXPLAIN_CONCEPT' | 'CELEBRATE';
  target_element_id?: string;
  message: string;
  suggested_quick_replies?: string[];
}

interface RootBotOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  response: RootBotResponse | null;
  isLoading: boolean;
  onSelectQuickReply: (query: string) => void;
}

export const RootBotOverlay: React.FC<RootBotOverlayProps> = ({
  isOpen,
  onClose,
  response,
  isLoading,
  onSelectQuickReply,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-slate-900/95 border border-indigo-500/40 rounded-2xl shadow-2xl backdrop-blur-md z-50 overflow-hidden flex flex-col transition-all">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-slate-900 p-3 px-4 border-b border-indigo-500/30 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-lg">
            🤖
          </div>
          <div>
            <h3 className="font-mono font-bold text-sm text-indigo-200">ROOT_BOT Assistant</h3>
            <span className="text-[10px] text-emerald-400 font-mono">v2.5 System Online</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-lg font-bold px-1 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Dialogue Content */}
      <div className="p-4 space-y-3 min-h-[120px] flex flex-col justify-center">
        {isLoading ? (
          <div className="flex items-center gap-3 text-indigo-300 font-mono text-xs animate-pulse">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping"></span>
            Analyzing AST execution telemetry...
          </div>
        ) : response ? (
          <p className="text-sm text-slate-200 leading-relaxed font-sans">
            {response.message}
          </p>
        ) : (
          <p className="text-sm text-slate-400 italic font-sans">
            "Systems nominal. How can I assist with your pull request?"
          </p>
        )}
      </div>

      {/* Suggested Quick Replies */}
      {response?.suggested_quick_replies && response.suggested_quick_replies.length > 0 && (
        <div className="p-3 pt-0 flex flex-wrap gap-2 border-t border-slate-800/80 mt-2">
          {response.suggested_quick_replies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => onSelectQuickReply(reply)}
              className="text-xs font-mono bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-300 px-2.5 py-1 rounded-md transition-all text-left"
            >
              {reply}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};