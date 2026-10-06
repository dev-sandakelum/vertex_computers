/**
 * Server-side logger — writes to MongoDB logs collection when MONGODB_URI is set,
 * otherwise falls back to console output.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'success';

interface LogEntry {
  level: LogLevel;
  category: string;
  message: string;
  meta?: Record<string, unknown>;
}

export async function log(entry: LogEntry): Promise<void> {
  const timestamp = new Date().toISOString();

  // Always console output
  const prefix = `[${entry.level.toUpperCase()}] [${entry.category}]`;
  if (entry.level === 'error') console.error(prefix, entry.message, entry.meta ?? '');
  else if (entry.level === 'warn') console.warn(prefix, entry.message, entry.meta ?? '');
  else console.log(prefix, entry.message, entry.meta ?? '');

  if (!process.env.MONGODB_URI) return;

  try {
    const { connectDB } = await import('./mongodb');
    const { default: LogModel } = await import('./models/Log');
    await connectDB();
    await LogModel.create({ ...entry, timestamp });
  } catch (e) {
    console.error('[logger] Failed to write log to DB:', e);
  }
}
