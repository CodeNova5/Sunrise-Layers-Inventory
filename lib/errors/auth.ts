import { BaseError, ErrorSchema } from "./base";

interface LoginErrorSchema<C extends ErrorSchema> extends ErrorSchema {
  cause?: C;
}

interface UnauthorizedSchema extends ErrorSchema {
  reason: string;
}

interface ForbiddenSchema extends ErrorSchema {
  reason: string;
}



export class LoginError<C extends ErrorSchema> extends BaseError<
  LoginErrorSchema<C>
> {
  static statusCode: 400;
  cause?: C;
  name = "LoginError";

  serialize(): LoginErrorSchema<C> {
    return {
      ...super.serialize(),
      cause: this.cause,
    };
  }

  initialize(data: LoginErrorSchema<C>): void {
    this.cause = data.cause;
  }

  static construct<C extends ErrorSchema>(cause?: C, message?: string) {
    return new this(message || "Login error", {
      cause,
    }).toResponse();
  }

  static throw<C extends ErrorSchema>(cause?: C, message?: string) {
    throw new this(message || "Login error", { cause });
  }
}


export class Unauthorized extends BaseError<UnauthorizedSchema> {
  reason!: string;
  name = "Unauthorized";
  static statusCode = 401;

  initialize(data: UnauthorizedSchema): void {
    this.reason = data.reason;
  }

  serialize(): UnauthorizedSchema {
    return {
      ...super.serialize(),
      reason: this.reason,
    };
  }

  static construct(reason: string, message?: string) {
    return new this(message || "Unauthorized", {
      reason,
    }).toResponse();
  }

  static throw(reason: string, message?: string): never {
    throw new this(message || "Unauthorized", {
      reason,
    });
  }
}

export class Forbidden extends BaseError<ForbiddenSchema> {
  reason!: string;
  name = "Forbidden";
  static statusCode = 403;

  initialize(data: ForbiddenSchema): void {
    this.reason = data.reason;
  }

  serialize(): ForbiddenSchema {
    return {
      ...super.serialize(),
      reason: this.reason,
    };
  }

  static construct(reason: string, message?: string) {
    return new this(message || "Forbidden", {
      reason,
    }).toResponse();
  }

  static throw(reason: string, message?: string): never {
    throw new this(message || "Forbidden", {
      reason,
    });
  }
}