import { BaseError, ErrorSchema } from "./base";

interface ValidationErrorSchema extends ErrorSchema {
  field: string;
  value: any;
}

export class ValidationError extends BaseError<ValidationErrorSchema> {
  field!: string;
  value!: any;
  name = "ValidationError";
  static statusCode = 400;

  initialize(data: ValidationErrorSchema): void {
    this.field = data.field;
    this.value = data.value;
  }

  serialize(): ValidationErrorSchema {
    return {
      ...super.serialize(),
      field: this.field,
      value: this.value,
    };
  }

  static construct(field: string, value: any, message?: string) {
    return new this(message || `Validation error on ${field}`, {
      field: field,
      value: value,
    }).toResponse();
  }

  static throw(field: string, value: any, message?: string): never {
    throw new this(message || `Validation error on ${field}`, {
      field: field,
      value: value,
    });
  }
}
