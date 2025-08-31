export interface AdminAuditEntry {
  id: string;
  actorId?: string;
  action: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

const ADMIN_AUDIT_KEY = 'metah-admin-audit-logs';

function readAdminAudit(): AdminAuditEntry[] {
  try {
    const raw = localStorage.getItem(ADMIN_AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Failed to read admin audit logs:', error);
    return [];
  }
}

function writeAdminAudit(entries: AdminAuditEntry[]) {
  try {
    localStorage.setItem(ADMIN_AUDIT_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('Failed to write admin audit logs:', error);
  }
}

export function appendAdminAudit(entry: Omit<AdminAuditEntry, 'id'|'timestamp'>) {
  const list = readAdminAudit();
  const withId: AdminAuditEntry = {
    id: `ADM${  Math.random().toString(36).slice(2, 10)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  list.push(withId);
  writeAdminAudit(list);
}

export function getAdminAudit(limit = 100): AdminAuditEntry[] {
  return readAdminAudit()
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}


