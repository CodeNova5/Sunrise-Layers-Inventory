type ObjectWithPermissions = {
    permissions: {
        [key: string]: string[] | boolean;
    };
    [key: string]: any;
}

/**
 * 
 * @param permission the permission to check for
 * @param this the object to check the permission against
 * @returns true if the this has the permission, false otherwise
 * @example hasPermission('user:read', user) // true
 */
function hasPermission(this: ObjectWithPermissions, permission: string): boolean {
  // example: 'user:read,write'
  if (permission.includes(':')) {
    const [scope, action] = permission.split(':', 2);
    const actions = action.split(',');
    if (actions.length > 1) {
      return actions.every(action => hasPermission.call(this, `${scope}:${action}`));
    }
    if (action === '*' || action === 'all' || action === '') {
      return this.permissions[scope] === true;
    }
    if (!this.permissions[scope]) {
      return false;
    }
    return (this.permissions[scope] === true || (this.permissions[scope] as string[]).includes(action));
  }
  return this.permissions[permission] === true;
}

function setPermission(this: ObjectWithPermissions, scope: string, action: string[] | boolean): void {
  if (Array.isArray(action)) {
    this.permissions[scope] = action;
  } else {
    this.permissions[scope] = action;
  }
}

export {
  hasPermission,
  setPermission
}