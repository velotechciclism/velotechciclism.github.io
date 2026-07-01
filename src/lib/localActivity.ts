import { newLocalId, persistBrowserDatabase, runStatement } from './browserDatabase';

export async function recordLocalActivity(
  eventType: string,
  options: { userId?: number | null; productId?: string | null; details?: Record<string, unknown> | string | null } = {}
): Promise<void> {
  runStatement(
    `INSERT INTO user_activity_events(id, user_id, event_type, product_id, details, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      newLocalId('activity'),
      options.userId || null,
      eventType,
      options.productId || null,
      typeof options.details === 'string' ? options.details : options.details ? JSON.stringify(options.details) : null,
      new Date().toISOString(),
    ]
  );
  await persistBrowserDatabase();
}
