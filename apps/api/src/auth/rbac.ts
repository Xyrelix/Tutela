import { RequestHandler } from 'express';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  user: ['wallet:read', 'wallet:write', 'alert:read'],
  admin: ['wallet:read', 'wallet:write', 'alert:read', 'user:manage', 'onboarding:override'],
};

export function getPermissionsForUser(role: string, extra: string[] = []): string[] {
  const base = ROLE_PERMISSIONS[role] ?? [];
  return Array.from(new Set([...base, ...extra]));
}

export function requirePermission(permission: string): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const permissions = getPermissionsForUser(req.user.role, req.user.permissions);
    if (!permissions.includes(permission)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    next();
  };
}
