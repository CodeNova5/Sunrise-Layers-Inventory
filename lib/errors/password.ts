import { BaseError, ErrorSchema } from "./base";

interface PasswordErrorSchema extends ErrorSchema {
  password: string;
  userId: string | { [key: string]: string };
}

export class PasswordError extends BaseError<PasswordErrorSchema> {
  password!: string;
  userId!: string | { [key: string]: string };
  name = "PasswordError";
  static statusCode = 400;

  initialize(data: PasswordErrorSchema): void {
    this.password = data.password;
    this.userId = data.userId;
  }

  serialize(): PasswordErrorSchema {
    const userId = this.userId;

    return {
      ...super.serialize(),
      password: this.password,
    };
  }

  static construct(
    password: string,
    userId: string | { [key: string]: string },
    message?: string
  ) {
    return new this(message || `Password error`, {
      password: password,
      userId: userId,
    }).toResponse();
  }

  static throw(
    password: string,
    userId: string | { [key: string]: string },
    message?: string
  ): never {
    throw new this(message || `Password error`, {
      password: password,
      userId: userId,
    });
  }
}
