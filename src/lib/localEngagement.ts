import { newLocalId, persistBrowserDatabase, runStatement } from './browserDatabase';

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function saveLocalContact(payload: ContactPayload): Promise<void> {
  runStatement(
    `INSERT INTO contact_messages(id, name, email, subject, message, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [newLocalId('contact'), payload.name, payload.email, payload.subject, payload.message,
      new Date().toISOString()]
  );
  await persistBrowserDatabase();
}

export async function saveLocalNewsletter(email: string): Promise<void> {
  runStatement(
    `INSERT OR REPLACE INTO newsletter_subscribers(email, created_at) VALUES (?, ?)`,
    [email.trim().toLowerCase(), new Date().toISOString()]
  );
  await persistBrowserDatabase();
}
