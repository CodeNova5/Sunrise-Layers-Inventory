import { BaseError, ErrorSchema } from "./base";

interface ValueErrorSchema extends ErrorSchema {
  value: any;
  type?: string;
}

export class ValueError extends BaseError<ValueErrorSchema> {
  value!: any;
  type?: string;
  name = "ValueError";
  static statusCode = 400;

  initialize(data: ValueErrorSchema): void {
    this.value = data.value;
    this.type = data.type;
  }

  serialize(): ValueErrorSchema {
    return {
      ...super.serialize(),
      value: this.value,
      type: this.type,
    };
  }

  static construct(value: any, type?: string, message?: string) {
    return new this(message || `Value error on ${value}`, {
      value: value,
      type: type,
    }).toResponse();
  }

  static throw(value: any, type?: string, message?: string): never {
    throw new this(message || `Value error on ${value}`, {
      value: value,
      type: type,
    });
  }
}
