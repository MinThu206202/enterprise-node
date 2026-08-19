import type { PermissionModule } from "./PermissionRegistry.js";

export const PermissionDefinitions: PermissionModule[] = [
  {
    resource: "users",
    actions: ["create", "read", "update", "delete"],
  },

  {
    resource: "roles",
    actions: ["create", "update"],
  },
  {
    resource: "transfer",
    actions: ["create", "update"],
  },

  {
    resource: "permissions",
    actions: ["read", "assign"],
  },
];
