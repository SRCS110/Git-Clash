import React, { useState } from 'react';

export interface VisualBlock {
  id: string;
  type: 'LOGIC_IF' | 'ACTION_ALLOW' | 'ACTION_DROP';
  operator?: '==' | '!=' | '>';
  leftOperand?: string;
  rightOperand?: string;
}

interface VisualCanvasProps {
  onExecuteRaid: (compiledCode: string) => void;
  onRequestRootBotHelp: () => void;
  isExecuting: boolean;
}

export const VisualCanvas: React.FC<VisualCanvasProps> = ({
  onExecuteRaid,
  onRequestRootBotHelp,
  isExecuting,
}) => {
  const [blocks, setBlocks] = useState<VisualBlock[]>([
    {
      id: 'block_1',
      type: 'LOGIC_IF',
      operator: '==',
      leftOperand: 'packet.type',
      rightOperand: '"AUTH_TOKEN"',
    },
    { id: 'block_2', type: 'ACTION_ALLOW' },
  ]);

  // Real-time Visual-to-Code Compiler
  const compileBlocksToJS = (): string => {
    let script = 'function processPacket(packet) {\n';

    blocks.forEach((b) => {
      if (b.type === 'LOGIC_IF') {
        script += `  if (${b.leftOperand} ${b.operator} ${b.rightOperand}) {\n`;
      } else if (b.type === 'ACTION_ALLOW') {
        script += '    return "ALLOWED";\n  }\n';
      } else if (b.type === 'ACTION_DROP') {
        script += '    return "DROPPED";\n  }\n';
      }
    });

    script += '  return "DROPPED";\n}';
    return script;
  };

  const handleRunRaid = () => {
    const compiled = compileBlocksToJS();
    onExecuteRaid(compiled);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white rounded-xl p-4 border border-slate-800 shadow-2xl">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <h2 className="font-mono font-bold text-lg text-emerald-400">Visual Logic Canvas</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRequestRootBotHelp}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 rounded-lg text-indigo-300 text-sm font-medium transition-all"
          >
            <span>🤖</span> Ask ROOT_BOT
          </button>

          <button
            onClick={handleRunRaid}
            disabled={isExecuting}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-50 text-slate-950 font-bold rounded-lg shadow-lg shadow-emerald-500/20 transition-all"
          >
            {isExecuting ? 'Deploying PR...' : 'Push Pull Request 🚀'}
          </button>
        </div>
      </div>

      {/* Grid Layout: Canvas & Live Compiled Code Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Visual Drag/Drop Assembly Area */}
        <div className="bg-slate-950/60 rounded-lg border border-dashed border-slate-800 p-4 space-y-3 overflow-y-auto">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
            Logic Sequence Assembly
          </p>

          {blocks.map((block, idx) => (
            <div
              key={block.id}
              className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg flex items-center justify-between shadow-md"
            >
              <div className="flex items-center gap-3 font-mono text-sm">
                <span className="text-slate-500 text-xs">#{idx + 1}</span>

                {block.type === 'LOGIC_IF' && (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30 font-bold">
                      IF
                    </span>
                    <span className="text-slate-300">{block.leftOperand}</span>
                    <span className="text-emerald-400 font-bold">{block.operator}</span>
                    <span className="text-amber-300">{block.rightOperand}</span>
                  </div>
                )}

                {block.type === 'ACTION_ALLOW' && (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 font-bold">
                      ACTION
                    </span>
                    <span className="text-slate-300">ALLOW PACKET</span>
                  </div>
                )}

                {block.type === 'ACTION_DROP' && (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded border border-rose-500/30 font-bold">
                      ACTION
                    </span>
                    <span className="text-slate-300">DROP PACKET</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Live AST/Code Compilation Preview */}
        <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-xs text-slate-300 flex flex-col">
          <div className="flex justify-between items-center text-slate-500 pb-2 mb-2 border-b border-slate-900">
            <span>COMPILED AST OUTPUT</span>
            <span className="text-emerald-500">Target: JavaScript</span>
          </div>
          <pre className="flex-1 overflow-x-auto text-emerald-400/90 leading-relaxed font-mono">
            {compileBlocksToJS()}
          </pre>
        </div>
      </div>
    </div>
  );
};