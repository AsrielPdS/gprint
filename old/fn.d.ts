import { Boxes as Box, CLy, ICol, IImgBox, IPBox, IPHBox, IRow, ISymbolBox, ITableBox, ST, TAlign, TBoxes } from "../book";
declare type num = number;
declare type str = string;
export declare const cut: () => Box;
export declare const sep: () => Box;
/**
 * horizontal rule
 * @param s style
*/
export declare const hr: (s?: str) => Box;
export declare function numbP(data: str, style?: str, fmt?: string, al?: TAlign): Box;
export declare function dateP(data: str): Box;
export declare const tr: (...dt: Box[]) => TBoxes;
export declare const th: (hd: Box, ...dt: Box[]) => TBoxes;
/** book row*/
export declare const r: (...dt: Box[]) => IRow;
/** book column*/
export declare const c: (...dt: (Box | str)[]) => ICol;
/** block of paragraphs*/
export declare const block: (...dt: (Box | str)[]) => ICol;
export declare const symb: <L = any>(dt: str) => ISymbolBox<L>;
export declare function dateTimeP(data: str): Box;
export declare const tbh: <L = any>(cols: num[], hd: TBoxes, ...dt: TBoxes[]) => ITableBox<L>;
export declare const tb: <L = any>(cols: num[], ...dt: TBoxes[]) => ITableBox<L>;
/** full table */
export declare const tbf: (cols: num[], hd: TBoxes, dt: TBoxes | TBoxes[], ft: TBoxes) => ITableBox;
export declare const cs: <T extends Box<any>>(box: T, is: T["is"]) => any;
export declare const l: <T extends Box<any>>(box: T, ly: T["ly"]) => any;
export declare function timerP(data: str): Box;
export declare function p<L = any>(data?: str, style?: str, al?: TAlign): IPBox<L>;
/** scalar */
export declare function s<L = any>(data: str, style?: str, fmt?: str, al?: TAlign): Box<L>;
export declare const st: <L = any>(value: str, tp?: ST, format?: str) => Box<L>;
export declare function currPH(data: str): Box;
export declare function currPF(data: str, format?: string): Box;
export declare const i: (dt: str, w: num, h: num) => IImgBox;
export declare const ph: <L = any>(val: str) => IPHBox<L>;
export declare function end(base: Box<CLy>[], ...ends: Box<CLy>[]): Box;
export {};
