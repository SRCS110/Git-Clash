const ivm = require('isolated-vm');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'ok' };
  }

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { playerScript, defenderTestSuite, options = {} } = body;

    if (!playerScript || !defenderTestSuite) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'MISSING_PAYLOAD' }) };
    }

    const timeoutMs = Math.min(options.timeoutMs || 1000, 2000);
    const result = await runInIsolatedVm(playerScript, defenderTestSuite, timeoutMs, 128);

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, data: result }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: error.message }) };
  }
};

async function runInIsolatedVm(playerScript, testSuite, timeoutMs, memoryLimitMb) {
  const startTime = performance.now();
  const logs = [];
  const isolate = new ivm.Isolate({ memoryLimit: memoryLimitMb });
  const context = await isolate.createContext();
  const jail = context.global;

  await jail.set('global', jail.derefInto());
  await jail.set('_log', new ivm.Reference((...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))));
  await jail.set('_assert', new ivm.Reference((condition, message) => { if (!condition) throw new Error(`Assertion Failed: ${message}`); }));

  const bootstrapScript = await isolate.compileScript(`
    const console = { log: (...args) => _log.applySync(undefined, args) };
    const assert = (cond, msg) => _assert.applySync(undefined, [Boolean(cond), String(msg)]);
  `);
  await bootstrapScript.run(context);

  try {
    const script = await isolate.compileScript(`${playerScript}\n${testSuite}`);
    await script.run(context, { timeout: timeoutMs });
    return { passed: true, cpuTimeMs: Number((performance.now() - startTime).toFixed(2)), logs };
  } catch (err) {
    let msg = err.message || 'Execution Error';
    if (msg.includes('Script execution timed out')) msg = `Execution Limit Exceeded (${timeoutMs}ms)`;
    return { passed: false, cpuTimeMs: Number((performance.now() - startTime).toFixed(2)), error: msg, logs };
  } finally {
    isolate.dispose();
  }
}