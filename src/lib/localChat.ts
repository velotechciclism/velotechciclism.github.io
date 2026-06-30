import { newLocalId, persistBrowserDatabase, queryOne, queryRows, runStatement } from './browserDatabase';

export type LocalChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export function readLocalConversation(conversationId: string): LocalChatMessage[] {
  return queryRows<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
  }>(
    `SELECT id, role, content, created_at FROM chat_messages
     WHERE conversation_id = ? ORDER BY created_at`,
    [conversationId]
  ).map((row) => ({
    id: row.id,
    role: row.role,
    content: row.content,
    timestamp: new Date(row.created_at),
  }));
}

export async function saveLocalChatMessage(
  conversationId: string,
  message: LocalChatMessage
): Promise<void> {
  runStatement(
    `INSERT OR REPLACE INTO chat_messages(id, conversation_id, role, content, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [message.id, conversationId, message.role, message.content, message.timestamp.toISOString()]
  );
  await persistBrowserDatabase();
}

export function createConversationId(): string {
  const current = queryOne<{ value: string }>(
    "SELECT value FROM app_meta WHERE key = 'active_conversation_id'"
  );
  if (current?.value) return current.value;

  const id = newLocalId('conversation');
  runStatement("INSERT OR REPLACE INTO app_meta(key, value) VALUES ('active_conversation_id', ?)", [id]);
  void persistBrowserDatabase();
  return id;
}
