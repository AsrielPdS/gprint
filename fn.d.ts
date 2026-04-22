import type { bool, falsy, str, unk } from "galho/util.js";
import type { Align, ASpan, CLy, DivLy, iBox, iBoxes, iCol, iDiv, iHr, IImg, iImgBox, ImgSize, iP, iPH, iRow, iTb, iTr, RLy, TbColInfo, TrLy } from "./gprint.js";
/**
 * horizontal rule
 * @param s style
 */
export declare const hr: <L = unk>(s?: str) => iHr<L>;
export declare const tr: (...bd: (iBoxes<TrLy> | str)[]) => iTr<void>;
/** row*/
export declare const r: <L = unknown>(...bd: (iBoxes<RLy> | str)[]) => iRow<L>;
/** column*/
export declare const c: <L = unknown>(...bd: (iBoxes<CLy> | str)[]) => iCol<L>;
/** column*/
export declare const d: <L = unknown>(...bd: (iBoxes<DivLy> | str)[]) => iDiv<L>;
/**placeholder */
export declare const ph: <L = any>(bd: str) => iPH<L>;
/**table with head */
export declare const tbh: <L = any>(cols: TbColInfo[], hd: iTr, ...bd: iTr[]) => iTb<L>;
/**table */
export declare const tb: <L = any>(cols: TbColInfo[], ...bd: (iTr | iBoxes<TrLy>[])[]) => iTb<L>;
/** full table(table with head, body and foot) */
export declare const tbf: (cols: TbColInfo[], hd: iTr, bd: iTr | iTr[], ft?: iTr, empty?: iTr, sc?: str, map?: bool) => iTb;
/**image */
export declare const img: <L = any>(bd: str, sz: ImgSize, al?: iImgBox["al"]) => IImg;
export declare const p: <L = any>(bd?: ASpan, style?: str | falsy, al?: Align) => iP<L>;
/** @deprecated expression */
export declare const e: <L = any>(bd?: str, fmt?: str | 0, style?: str, al?: Align) => iP<L>;
export declare const cut: <L = any>() => iHr<L>;
export declare const sep: <L = any>() => iHr<L>;
/**datetime paragraph */
export declare const dtP: (bd: str) => iP;
/**define inline style */
export declare const is: <T extends iBox>(box: T, is: T["is"]) => T;
/**@deprecated define layout */
export declare const l: <T extends iBox>(box: T, ly: T["ly"]) => T;
/**define layout */
export declare const ly: <T extends iBox>(box: T, ly: T["ly"]) => T;
export declare function end(base: iBoxes<CLy>[], ...ends: iBoxes<CLy>[]): iBoxes;
