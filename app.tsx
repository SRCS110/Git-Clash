import React, { useState } from 'react';
import { VisualCanvas } from './components/VisualCanvas';
import { RootBotOverlay, RootBotResponse } from './components/RootBotOverlay';
import { executeRaidInSandbox, getRootBotHint } from './services/apiService';
import { STARTER_DEFENSE_MODULES } from './data/starterContent';

export const App: React.FC = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isBotLoading, setIsBotLoading] = useState(false);
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [botResponse, setBotResponse] = useState<RootBotResponse | null>(null);
  const [raidResult, setRaidResult] = useState<any>(null);

  const activeModule = STARTER_DEFENSE_MODULES[0];

  const handleExecuteRaid = async (compiledCode: string) => {
    setIsExecuting(true);
    setRaidResult(null);
    try {
      const res = await executeRaidInSandbox(compiledCode, activeModule.unitTestCode);
      setRaidResult(res);
    } catch (err: any) {
      alert(`Raid Execution Failed: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleTriggerBot = async (customQuery?: string) => {
    setIsBotOpen(true);
    setIsBotLoading(true);
    try {
      const hint = await getRootBotHint({
        system_context: { active_interface: 'VISUAL_BLOCKS', node_id: 'NODE_1.1' },
        player_profile: { experience_tier: 'BEGINNER', stuck_protection_level: 1 },
        puzzle_environment: {
          objective: activeModule.description,
          expected_logic: 'FILTER AUTH_TOKEN',
          current_player_ast: {},
          telemetry: { failed_attempts: 1, idle_time_seconds: 20 },
        },
        user_prompt: customQuery || 'How do I bypass this sanitizer firewall?',
      });
      setBotResponse(hint);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col gap-6 font-sans">
      <header className="flex justify-between items-center border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black font-mono tracking-tight text-emerald-400">
          GIT CLASH <span className="text-xs text-slate-500 font-normal">v0.1 Alpha</span>
        </h1>
        <div className="flex gap-4 text-xs font-mono">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            Target: <span className="text-purple-400">{activeModule.name}</span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2">
          <VisualCanvas
            onExecuteRaid={handleExecuteRaid}
            onRequestRootBotHelp={() => handleTriggerBot()}
            isExecuting={isExecuting}
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 font-mono text-xs">
          <h2 className="text-slate-400 font-bold border-b border-slate-800 pb-2">
            RAID TELEMETRY CONSOLE
          </h2>
          {raidResult ? (
            <div
              className={`p-4 rounded-lg border ${
                raidResult.passed
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
              }`}
            >
              <div className="font-bold text-sm mb-1">
                {raidResult.passed ? 'PULL REQUEST MERGED' : 'PULL REQUEST REJECTED'}
              </div>
              <div>CPU Execution: {raidResult.cpuTimeMs}ms</div>
              {raidResult.error && (
                <div className="mt-2 text-rose-400 font-sans">{raidResult.error}</div>
              )}
            </div>
          ) : (
            <div className="text-slate-600 italic">
              No PRs pushed yet. Build logic and click "Push Pull Request".
            </div>
          )}
        </div>
      </main>

      <RootBotOverlay
        isOpen={isBotOpen}
        onClose={() => setIsBotOpen(false)}
        response={botResponse}
        isLoading={isBotLoading}
        onSelectQuickReply={(q) => handleTriggerBot(q)}
      />
    </div>
  );
};