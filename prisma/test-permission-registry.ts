import {
  PermissionAction,
  PermissionRegistry,
} from "../src/application/modules/authorization/PermissionRegistry.js";

const registry = new PermissionRegistry();

registry.register({
  resource: "products",
  actions: [
    PermissionAction.CREATE,
    PermissionAction.READ,
    PermissionAction.UPDATE,
    PermissionAction.DELETE,
  ],
});

registry.register({
  resource: "orders",
  actions: [
    PermissionAction.CREATE,
    PermissionAction.READ,
  ],
});

console.log(registry.getPermissions());

console.log(
  registry.getPermissionsForResource("products"),
);