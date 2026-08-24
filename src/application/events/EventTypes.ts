export const EVENT_TYPES = {
  USER_REGISTERED: "user.registered",
  USER_UPDATED: "user.updated",
  USER_DELETED: "user.deleted",

  ROLE_CREATED: "role.created",
  ROLE_UPDATED: "role.updated",
  ROLE_DELETED: "role.deleted",

  USER_ROLE_ASSIGNED: "user.role-assigned",
  USER_ROLE_REMOVED: "user.role-removed",

  ROLE_PERMISSION_ASSIGNED: "role.permission-assigned",
  ROLE_PERMISSION_REMOVED: "role.permission-removed",
} as const;

export type EventType =
  (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];