import type { int, str } from "galho/util.js";
export declare const inFull: InFullUnit[];
export declare function numbInFull(value: number, opts: Partial<InFullOptions>): string;
export declare function transform(value: int, format: "i" | "I" | "a" | "A"): void;
export interface InFullOptions {
    /**gender */
    g: 'f' | 'm';
    /**next */
    n?: str;
    c(value: number, opts: InFullOptions, i?: number): str;
    /**single unit */
    s?: str;
    /**single unit */
    p?: str;
    /**decimal single unit*/
    ds?: str;
    /**decimal plural unit*/
    dp?: str;
}
export interface InFullUnit {
    v: number;
    exp(value?: number, opts?: InFullOptions, i?: number): str;
}
