import { BaseError } from "./base";

export class UnknownError extends BaseError {
    static statusCode = 500;
    name="UnknownError";
}
