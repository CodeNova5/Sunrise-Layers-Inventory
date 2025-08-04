import { BaseError, ErrorSchema } from "./base";

interface IntegrityErrorSchema extends ErrorSchema {
  field: string;
  value?: any;
}

export class IntegrityError extends BaseError<IntegrityErrorSchema> {
  field!: string;
  value!: any;
  name = "IntegrityError";
  static statusCode = 400;
  

  initialize(data: IntegrityErrorSchema): void {
    this.field = data.field;
    this.value = data.value;
  }

  serialize(): IntegrityErrorSchema {
    return {
      ...super.serialize(),
      field: this.field,
      value: this.value,
    };
  }

  static construct(field: string, value?: any, message?: string) {
    return new this(message || `Integrity error on ${field}`, {
      field: field,
      value: value,
    }).toResponse();
  }

  static throw(field: string, value?: any, message?: string): never {
    throw new this(message || `Integrity error on ${field}`, {
      field: field,
      value: value,
    });
  }
}
