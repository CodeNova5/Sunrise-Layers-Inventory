import { NextResponse } from "next/server";

export interface ErrorSchema {
  name: string;
  message?: string;
}

export class BaseError<S extends ErrorSchema = ErrorSchema> extends Error {
  static statusCode?: number;

  constructor(message: string = "", data: Omit<S, keyof ErrorSchema>) {
    super(message);
    this.name;
    this.message;
    //@ts-ignore
    this.initialize({ ...data, name: this.name, message: this.message });
  }

  serialize() {
    return {
      message: this.message,
      name: this.name,
    } as S;
  }

  toResponse(
    status?: number,
    statusText?: string,
    headers?: HeadersInit
  ): NextResponse<{
    message: S["message"];
    details: { [key in keyof Omit<S, "message">]: S[key] };
  }> {
    const data = this.serialize();
    // @ts-ignore
    const constructor: typeof BaseError = this.constructor;
    // remove message from details
    const details = { ...data };
    delete details.message;

    return NextResponse.json(
      {
        message: data.message,
        details,
      },
      { status: status || constructor.statusCode, statusText, headers }
    );
  }

  initialize(data: S): void {}
}
