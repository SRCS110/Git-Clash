import { createClient } from '@supabase/supabase-js';

// Environment Variable Fallbacks
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const SANDBOX_WORKER_URL = import.meta.env.VITE_SANDBOX_WORKER_URL || 'https://your-lambda.on.aws/execute';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SandboxExecutionResponse {
  passed: boolean;
  cpuTimeMs: number;
  memoryUsageMb?: number;
  error?: string;
  logs?: string[];
}

/**
 * Sends compiled player script to the isolated AWS Lambda Sandbox
 */
export async function executeRaidInSandbox(
  playerScript: string,
  defenderTestSuite: string
): Promise<SandboxExecutionResponse> {
  try {
    const response = await fetch(SANDBOX_WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playerScript,
        defenderTestSuite,
        options: { timeoutMs: 1000 },
      }),
    });

    if (!response.ok) {
      throw new Error(`Sandbox Worker HTTP Error: ${response.status}`);
    }

    const json = await response.json();
    if (!json.success) {
      throw new Error(json.message || 'Sandbox execution failed');
    }

    return json.data;
  } catch (error: any) {
    console.error('[API Service] Sandbox Raid Error:', error);
    throw error;
  }
}

/**
 * Sends telemetry to the ROOT_BOT Supabase Edge Function to get AI guidance
 */
export async function getRootBotHint(telemetryPayload: Record<string, any>) {
  try {
    const { data, error } = await supabase.functions.invoke('root-bot-hint', {
      body: telemetryPayload,
    });

    if (error) {
      throw new Error(`Edge Function Error: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error('[API Service] ROOT_BOT Fetch Error:', error);
    // Fallback response if AI service is unreachable
    return {
      thought_process: 'Fallback triggered due to network timeout.',
      ui_action: 'SHOW_HINT',
      message: 'My diagnostics scanner picked up a connection glitch! Double check your logic sequence while I re-establish telemetry.',
      suggested_quick_replies: ['Try again'],
    };
  }
}