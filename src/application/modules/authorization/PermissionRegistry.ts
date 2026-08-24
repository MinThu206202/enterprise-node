export interface PermissionModule {
  resource: string;
  actions: string[];
}

export class PermissionRegistry {
  private readonly modules = new Map<string, PermissionModule>();

  register(module: PermissionModule): void {
    if (this.modules.has(module.resource)) {
      throw new Error(
        `Permission module "${module.resource}" is already registered.`,
      );
    }

    this.modules.set(module.resource, module);
  }

  get(resource: string): PermissionModule | undefined {
    return this.modules.get(resource);
  }

  getAll(): PermissionModule[] {
    return Array.from(this.modules.values());
  }

  getPermissionNames(resource: string): string[] {
    const module = this.modules.get(resource);

    if (!module) {
      return [];
    }

    return module.actions.map((action) => `${resource}:${action}`);
  }

  getAllPermissionNames(): string[] {
    return this.getAll().flatMap((module) =>
      this.getPermissionNames(module.resource),
    );
  }

  hasPermission(resource: string, action: string): boolean {
    const module = this.modules.get(resource);

    if (!module) {
      return false;
    }

    return module.actions.includes(action);
  }
}
export const permissionRegistry = new PermissionRegistry();
