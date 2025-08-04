// Permissions for users.
import { IBaseDocument } from "../common/models/base";
import { IUserDocument } from "../common/models/user";
import { NextRequest, NextResponse } from "next/server";
import { AddThisParameter } from "../@types";

interface IPermission<T extends IBaseDocument=IBaseDocument> {
    hasPermission?: (
        user: IUserDocument,
        request: NextRequest
    ) => Promise<boolean>;
    hasObjectPermission?: (
        user: IUserDocument,
        object: T,
        request?: NextRequest
    ) => Promise<boolean>;
}

export class Permission<T extends IBaseDocument = IBaseDocument>
    implements IPermission
{
    async hasPermission(
        user: IUserDocument,
        request?: NextRequest
    ): Promise<boolean> {
        return true;
    }

    async hasObjectPermission<T extends IBaseDocument = IBaseDocument>(
        user: IUserDocument,
        object: T,
        request?: NextRequest
    ): Promise<boolean> {
        return await this.hasPermission(user, request);
    }

    not() {
        return new Not<T>(this);
    }

    and(...permissions: Permission<T>[]) {
        return new And<T>(this, ...permissions);
    }

    or(...permissions: Permission<T>[]) {
        return new Or<T>(this, ...permissions);
    }

    static AllowAny() {
        return new Permission();
    }

    static create<T extends IBaseDocument = IBaseDocument>(
        permission: AddThisParameter<IPermission<T>, Permission<T>>
    ): Permission<T> {
        const newPermission = new Permission<T>();
        if (permission.hasPermission) {
            newPermission.hasPermission =
                permission.hasPermission.bind(newPermission);
        }
        if (permission.hasObjectPermission) {
            // @ts-ignore
            newPermission.hasObjectPermission =
                permission.hasObjectPermission.bind(newPermission);
        }
        return newPermission;
    }
}

class Not<T extends IBaseDocument=IBaseDocument> extends Permission<T> {
    permission: Permission<T>;

    constructor(permission: Permission) {
        super();
        this.permission = permission;
    }

    async hasPermission(
        user: IUserDocument,
        request: NextRequest
    ): Promise<boolean> {
        return !(await this.permission.hasPermission(user, request));
    }

    async hasObjectPermission<T extends IBaseDocument=IBaseDocument>(
        user: IUserDocument,
        object: T,
        request?: NextRequest
    ): Promise<boolean> {
        return !(await this.permission.hasObjectPermission(
            user,
            object,
            request
        ));
    }
}

class And<T extends IBaseDocument=IBaseDocument> extends Permission<T> {
    permissions: Permission<T>[];

    constructor(...permissions: Permission[]) {
        super();
        this.permissions = permissions;
    }

    async hasPermission(
        user: IUserDocument,
        request: NextRequest
    ): Promise<boolean> {
        for (const permission of this.permissions) {
            if (!(await permission.hasPermission(user, request))) {
                return false;
            }
        }
        return true;
    }

    async hasObjectPermission<T extends IBaseDocument=IBaseDocument>(
        user: IUserDocument,
        object: T,
        request?: NextRequest
    ): Promise<boolean> {
        for (const permission of this.permissions) {
            if (
                !(await permission.hasObjectPermission(user, object, request))
            ) {
                return false;
            }
        }
        return true;
    }
}

class Or<T extends IBaseDocument=IBaseDocument> extends Permission<T> {
    permissions: Permission<T>[];

    constructor(...permissions: Permission[]) {
        super();
        this.permissions = permissions;
    }

    async hasPermission(
        user: IUserDocument,
        request: NextRequest
    ): Promise<boolean> {
        for (const permission of this.permissions) {
            if (await permission.hasPermission(user, request)) {
                return true;
            }
        }
        return false;
    }

    async hasObjectPermission<T extends IBaseDocument=IBaseDocument>(
        user: IUserDocument,
        object: T,
        request?: NextRequest
    ): Promise<boolean> {
        for (const permission of this.permissions) {
            if (await permission.hasObjectPermission(user, object, request)) {
                return true;
            }
        }
        return false;
    }
}

export type PermissionT = Permission | IPermission;
