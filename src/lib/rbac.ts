export type Role = 'owner' | 'manager' | 'reception' | 'admin' | 'guest';

export type Permission =
  | 'booking:create'
  | 'booking:read'
  | 'booking:update'
  | 'booking:checkin'
  | 'booking:checkout'
  | 'room:read'
  | 'room:update-status'
  | 'rate:update'
  | 'expense:create'
  | 'expense:approve'
  | 'payment:collect'
  | 'report:view'
  | 'report:export'
  | 'staff:manage'
  | 'shift:manage'
  | 'finance:view'
  | 'admin:tenant-manage'
  | 'admin:request-access';

export const roleToPermissions: Record<Role, Permission[]> = {
  guest: ['booking:create', 'booking:read'],
  reception: [
    'booking:create', 'booking:read', 'booking:update', 'booking:checkin', 'booking:checkout',
    'room:read', 'room:update-status',
    'payment:collect', 'expense:create'
  ],
  manager: [
    'booking:create','booking:read','booking:update','booking:checkin','booking:checkout',
    'room:read','room:update-status','rate:update',
    'payment:collect','expense:create','expense:approve',
    'report:view','report:export','staff:manage','shift:manage','finance:view'
  ],
  owner: [
    'booking:create','booking:read','booking:update','booking:checkin','booking:checkout',
    'room:read','room:update-status','rate:update',
    'payment:collect','expense:create','expense:approve',
    'report:view','report:export','staff:manage','shift:manage','finance:view'
  ],
  admin: [ 'admin:tenant-manage', 'admin:request-access' ]
};

export function can(role: Role, permission: Permission): boolean {
  return roleToPermissions[role]?.includes(permission) ?? false;
}


