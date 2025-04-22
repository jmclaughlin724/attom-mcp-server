import fs from 'fs';
import path from 'path';

// Determine log file path relative to project root using process.cwd()
// const projectRoot = path.resolve(__dirname, '..', '..'); // Old method
const logFilePath = path.join(process.cwd(), 'debug.log'); // Use current working directory

// Initialize log file (optional, creates if not exists)
try {
  if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, `${new Date().toISOString()} - --- Log file initialized at: ${logFilePath} ---\n`);
  } else {
     // Optionally add a restart marker
     fs.appendFileSync(logFilePath, `${new Date().toISOString()} - --- Logger Initialized ---\n`);
  }
} catch (err) {
  console.error("Failed to initialize log file:", err);
}

/**
 * Writes a message to the debug log file.
 * @param message The message to log.
 * @param level Optional log level (e.g., 'error', 'warn', 'info')
 */
export function writeLog(message: string, level?: string) {
  const logLine = `${new Date().toISOString()} - ${message}\n`;

  // 1. Attempt to write directly to stderr
  try {
    process.stderr.write(logLine); 
  } catch (stderrErr) {
    // If stderr fails (unlikely), log that failure to console.error
    console.error("Failed to write log to stderr:", stderrErr);
    console.error('Original log message:', message);
  }

  // 2. Attempt to write to file (keep as secondary)
  try {
    fs.appendFileSync(logFilePath, logLine);
  } catch (fileErr) {
    // If file writing fails, log *that specific* failure to stderr (or console.error if stderr failed)
    const fileErrMsg = `Failed to write log to file ${logFilePath}: ${fileErr instanceof Error ? fileErr.message : String(fileErr)}\n`;
    try {
      process.stderr.write(fileErrMsg);
    } catch {
      console.error(fileErrMsg); // Final fallback
    }
  }
}
