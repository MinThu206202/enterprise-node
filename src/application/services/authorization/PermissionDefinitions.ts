import type { PermissionModule } from "./PermissionRegistry.js";

export const PermissionDefinitions: PermissionModule[] = [
  {
    resource: "users",
    actions: ["create", "read", "update", "delete"],
  },

  {
    resource: "roles",
    actions: ["create", "read", "update", "delete"],
  },
  {
    resource: "transfer",
    actions: ["create", "update"],
  },
  {
    resource: "user-roles",
    actions: ["read", "assign", "delete"],
  },

  {
    resource: "permissions",
    actions: ["read", "assign"],
  },
];
