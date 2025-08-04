import mongoose, { mongo } from "mongoose";
import { IBaseDocument } from "../common/models/base";

/**
 * @summary Extracts 'this' parameter from a function, if it exists. Otherwise, returns fallback.
 * @param {T} T Function type to extract 'this' parameter from.
 * @param {F} F Fallback type to return if 'this' parameter does not exist.
 */
export type ThisParameter<T, F> = T extends { (this: infer This): void } ? This : F;

/**
 * @summary Decorates all functions in an object with 'this' parameter.
 * @param {T} T Object with functions as values to add 'D' parameter to as 'this'. {@link D}
 * @param {D} D The type to be added as 'this' parameter to all functions in {@link T}.
 */
export type AddThisParameter<T, D> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer R
        ? ThisParameter<T[K], unknown> extends unknown
            ? (this: D, ...args: A) => R
            : T[K]
        : T[K];
};


export type DocumentOrId<D extends IBaseDocument> = D | mongoose.Types.ObjectId | string;