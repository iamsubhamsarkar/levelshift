/**
 * LevelShift — Code Execution Client
 * 
 * Uses Wandbox API (free, no auth, no rate limit) for Java code execution.
 * Falls back to self-rating mode when offline.
 */

const WANDBOX_URL = 'https://wandbox.org/api/compile.json';
const JAVA_COMPILER = 'openjdk-jdk-22+36';
const TIMEOUT_MS = 20000; // 20 second timeout
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

let lastRequestTime = 0;

/**
 * Execute Java code via Wandbox API.
 * @param {string} code - User's Java code
 * @param {string} [stdin] - Optional standard input
 * @returns {Promise<{success: boolean, output: string, error: string, time: number}>}
 */
export async function executeJava(code, stdin = '') {
  const wrappedCode = wrapInMainClass(code);

  // Rate limiting: wait if too soon since last request
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await new Promise(r => setTimeout(r, MIN_REQUEST_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const startTime = Date.now();

    const response = await fetch(WANDBOX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        compiler: JAVA_COMPILER,
        code: wrappedCode,
        stdin: stdin,
        save: false
      })
    });

    clearTimeout(timeout);
    const execTime = ((Date.now() - startTime) / 1000).toFixed(2);

    if (!response.ok) {
      return { success: false, output: '', error: `API error: ${response.status}`, time: 0 };
    }

    const result = await response.json();

    // Wandbox response structure:
    // status: "0" = success, non-zero = error
    // program_output: stdout from execution
    // program_error: stderr from execution
    // compiler_error: compilation errors
    const compileError = (result.compiler_error || '').trim();
    const programOutput = (result.program_output || '').trim();
    const programError = (result.program_error || '').trim();

    if (compileError) {
      return {
        success: false,
        output: '',
        error: formatCompileError(compileError),
        time: parseFloat(execTime)
      };
    }

    if (result.status !== '0' && result.status !== 0) {
      return {
        success: false,
        output: programOutput,
        error: programError || `Runtime error (exit code: ${result.status})`,
        time: parseFloat(execTime)
      };
    }

    return {
      success: true,
      output: programOutput,
      error: programError,
      time: parseFloat(execTime)
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { success: false, output: '', error: 'Execution timed out (20s)', time: 0 };
    }
    return { success: false, output: '', error: `Network error: ${err.message}`, time: 0 };
  }
}

/**
 * Check if code execution API is reachable.
 * @returns {Promise<boolean>}
 */
export async function isApiAvailable() {
  try {
    const response = await fetch('https://wandbox.org/api/list.json', {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Validate code output against expected output.
 * @param {string} actual - Code execution output
 * @param {string} expected - Expected output
 * @param {boolean} exactMatch - Require exact string match (default: trimmed comparison)
 * @returns {boolean}
 */
export function validateOutput(actual, expected, exactMatch = false) {
  if (exactMatch) return actual === expected;

  // Normalize whitespace for comparison
  const normalizeOutput = (s) => s.trim().replace(/\r\n/g, '\n');
  const normalizedActual = normalizeOutput(actual);
  const normalizedExpected = normalizeOutput(expected);

  // Check exact trimmed match first
  if (normalizedActual === normalizedExpected) return true;

  // Check if actual contains expected (for partial matching)
  if (normalizedActual.includes(normalizedExpected)) return true;

  return false;
}

/**
 * Format compilation errors to be more readable.
 */
function formatCompileError(error) {
  // Remove file path prefix (Wandbox uses prog.java)
  return error
    .replace(/prog\.java:/g, 'Line ')
    .replace(/\^[\s]*$/gm, '')
    .split('\n')
    .filter(line => line.trim())
    .slice(0, 5) // Show first 5 lines only
    .join('\n');
}

/**
 * Wrap user code in a Main class if not already present.
 * Handles common patterns:
 * - Code that's just a method body
 * - Code that has class definition but no main
 * - Complete code with main method
 * 
 * NOTE: For Wandbox, we use non-public class since file is named prog.java
 */
function wrapInMainClass(code) {
  const trimmed = code.trim();

  // Already has a class with main method
  if (trimmed.includes('static void main') && trimmed.match(/class\s+\w+/)) {
    // Remove 'public' from class declaration since Wandbox uses prog.java
    return trimmed.replace(/public\s+class\s+Main/, 'class Main');
  }

  // Has a class definition but no main method — add a test harness
  if (trimmed.match(/^(public\s+)?class\s+\w+/m) && !trimmed.includes('static void main')) {
    // Remove public from user's class
    const cleanedCode = trimmed.replace(/^public\s+class/, 'class');
    return `${cleanedCode}

class Main {
    public static void main(String[] args) {
        System.out.println("Code compiled successfully.");
    }
}`;
  }

  // Just statements/expressions — wrap in main
  return `class Main {
    public static void main(String[] args) {
        ${trimmed}
    }
}`;
}
