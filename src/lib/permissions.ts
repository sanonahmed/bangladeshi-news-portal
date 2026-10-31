/**
 * Role-Based Access Control (RBAC) helpers for the Bangladeshi News Portal.
 *
 * Roles (least → most privileged):
 *   reader → journalist → editor → admin → super_admin
 */

export type UserRole =
  | "super_admin"
  | "admin"
  | "editor"
  | "journalist"
  | "reader";

/**
 * Permission map: permission key → roles that hold it.
 * Kept as `as const` so Permission is a union of the literal keys.
 */
export const PERMISSIONS = {
  // Articles
  "article:create": ["super_admin", "admin", "editor", "journalist"],
  "article:edit_own": ["super_admin", "admin", "editor", "journalist"],
  "article:edit_any": ["super_admin", "admin", "editor"],
  "article:delete": ["super_admin", "admin"],
  "article:publish": ["super_admin", "admin", "editor"],
  "article:submit_review": ["journalist", "editor", "admin", "super_admin"],
  "article:approve": ["super_admin", "admin", "editor"],
  "article:reject": ["super_admin", "admin", "editor"],
  "article:schedule": ["super_admin", "admin", "editor"],
  // Categories
  "category:manage": ["super_admin", "admin"],
  // Media
  "media:upload": ["super_admin", "admin", "editor", "journalist"],
  "media:delete_own": ["super_admin", "admin", "editor", "journalist"],
  "media:delete_any": ["super_admin", "admin"],
  // Users
  "user:manage": ["super_admin", "admin"],
  "user:ban": ["super_admin"],
  "user:assign_role": ["super_admin"],
  // Site
  "site:settings": ["super_admin"],
  "site:homepage": ["super_admin", "admin"],
  "site:navigation": ["super_admin", "admin"],
  "site:ads": ["super_admin", "admin"],
  "site:breaking_news": ["super_admin", "admin", "editor"],
  // Audit
  "audit:view": ["super_admin", "admin"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Returns true if `role` holds `permission`.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission] as readonly string[];
  return allowedRoles.includes(role);
}

/**
 * Throws an error if `role` does not hold `permission`.
 * Throws if role is null/undefined (unauthenticated).
 */
export function requirePermission(
  role: UserRole | null | undefined,
  permission: Permission
): void {
  if (!role) {
    throw new Error(
      `Access denied: unauthenticated user cannot perform "${permission}"`
    );
  }
  if (!hasPermission(role, permission)) {
    throw new Error(
      `Access denied: role "${role}" does not have permission "${permission}"`
    );
  }
}

/**
 * Returns all permissions accessible to the given role.
 */
export function getAccessiblePermissions(role: UserRole): Permission[] {
  return (Object.keys(PERMISSIONS) as Permission[]).filter((permission) =>
    hasPermission(role, permission)
  );
}

/**
 * Returns true if roleA is at least as privileged as roleB.
 * Useful for hierarchical checks (e.g. can an admin act on behalf of a journalist?).
 */
export function isRoleAtLeast(roleA: UserRole, roleB: UserRole): boolean {
  const hierarchy: UserRole[] = [
    "reader",
    "journalist",
    "editor",
    "admin",
    "super_admin",
  ];
  return hierarchy.indexOf(roleA) >= hierarchy.indexOf(roleB);
}

/**
 * Returns the human-readable Bengali label for a role.
 */
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    super_admin: "সুপার অ্যাডমিন",
    admin: "অ্যাডমিন",
    editor: "সম্পাদক",
    journalist: "সাংবাদিক",
    reader: "পাঠক",
  };
  return labels[role];
}
