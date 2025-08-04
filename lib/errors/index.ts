import { BaseError, ErrorSchema } from "./base";
import { EntityNotFound, PageNotFound } from "./notfound";
import { UnknownError } from "./unknown";
import { PasswordError } from "./password";
import { LoginError, Forbidden, Unauthorized } from "./auth";
import { ValidationError } from "./validation";
import { ValueError } from "./value";
import { IntegrityError } from "./integrity";
import { NextResponse } from "next/server";

const registery: Record<string, typeof BaseError<ErrorSchema>> = {};

export function registerError<S extends ErrorSchema>(
  name: string,
  error: typeof BaseError<S>
) {
  if (registery[name]) {
    if (registery[name] === error) {
      return registery[name];
    }
    throw new Error(`Error ${name} already exists`);
  }
  registery[name] = error;
  return registery[name];
}

export function getError(name: string) {
  return registery[name];
}

export function serializeError(error: any) {
  if (error instanceof BaseError) {
    return error.serialize();
  } else if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }
  return new UnknownError(error.toString(), {}).serialize();
}

export function buildErrorResponse(
  error: any,
  status?: number,
  statusText?: string,
  headers?: HeadersInit
) {
  if (error instanceof BaseError) {
    return error.toResponse(status, statusText, headers);
  } else if (error instanceof Error) {
    return NextResponse.json(
      {
        message: error.message,
        details: {
          name: error.name,
        },
      },
      { status: status || 500, statusText, headers }
    );
  }
  return new UnknownError(error.toString(), {}).toResponse(
    status,
    statusText,
    headers
  );
}

export function toError(error: any) {
  if (error instanceof BaseError) {
    return error;
  } else if (error instanceof Error) {
    return new UnknownError(error.message, {});
  }
  return new UnknownError(error.toString(), {});
}

export function deserializeError(data: ErrorSchema) {
  const error = getError(data.name);
  if (error) {
    return new error(data.message, {});
  }
  return new UnknownError(data.message, {});
}

export function fromResponse(data: any) {
  if (data.details) {
    return deserializeError({ ...data.details, message: data.message });
  }
  return new UnknownError(data.message, {});
}

registerError("Forbidden", Forbidden);
registerError("LoginError", LoginError);
registerError("ValueError", ValueError);
registerError("UnknownError", UnknownError);
registerError("PageNotFound", PageNotFound);
registerError("Unauthorized", Unauthorized);
registerError("PasswordError", PasswordError);
registerError("IntegrityError", IntegrityError);
registerError("EntityNotFound", EntityNotFound);
registerError("ValidationError", ValidationError);

export {
  Forbidden,
  LoginError,
  ValueError,
  UnknownError,
  PageNotFound,
  Unauthorized,
  PasswordError,
  IntegrityError,
  EntityNotFound,
  ValidationError,
};
