import { Boxes as Box,  CAlign, CLy, ICol, IImgBox, IPBox, IPHBox, IRow, ISymbolBox, ITableBox, ST, TAlign, TbCell, TBoxes } from "./book";

type num = number;
type str = string;

// export type DomAlign = "center" | "justify" | "left" | "right" | "start" | "end";
export const cut = (): Box => ({ tp: "hr", s: "cut" });

export const sep = (): Box => ({ tp: "hr", s: 'divider' });
/**
 * horizontal rule
 * @param s style
 */
export const hr = (s?: str): Box => ({ tp: "hr", s });

export function numbP(data: str, style?: str, fmt = 'n;$', al: TAlign = "end"): Box {
  return { tp: "p", s: style || undefined, is: { al: al || undefined }, dt: [{ tp: "s", dt: data, fmt: fmt }] };
}
export function dateP(data: str): Box {
  return { tp: "p", dt: [{ tp: "s", dt: data, fmt: 'd;d' }] };
}
export const tr = (...dt: Box[]) => <TBoxes>{ tp: "tr", dt }
export const th = (hd: Box, ...dt: Box[]) => <TBoxes>{ tp: "th", hd, dt };
/** book row*/
export const r = (...dt: Box[]): IRow => ({ tp: "row", dt });
/** book column*/
export const c = <L=unknown>(...dt: (Box | str)[]): ICol<L> => ({ tp: "col", dt });
/** block of paragraphs*/
export const block = (...dt: (Box | str)[]): ICol => ({ tp: "col", dt });

export const symb = <L = any>(dt: str) => <ISymbolBox<L>>{ tp: "symbol", dt };

export function dateTimeP(data: str): Box {
  return { tp: "p", dt: [{ tp: "s", dt: data, fmt: 'd;f' }] };
}
export const tbh = <L = any>(cols: num[], hd: TBoxes, ...dt: TBoxes[]): ITableBox<L> => ({ tp: "table", cols: cols?.map<TbCell>(c => ({ sz: c })), hd, dt });
export const tb = <L = any>(cols: num[], ...dt: TBoxes[]): ITableBox<L> => ({ tp: "table", cols: cols?.map<TbCell>(c => ({ sz: c })), dt });

/** full table */
export const tbf = (cols: num[], hd: TBoxes, dt: TBoxes | TBoxes[], ft?: TBoxes): ITableBox =>
  ({ tp: "table", cols: cols?.map<TbCell>(c => ({ sz: c })), hd, dt: Array.isArray(dt) ? dt : [dt], ft });

export const cs = <T extends Box>(box: T, is: T["is"]) => Object.assign(box, <any>{ is });
export const l = <T extends Box>(box: T, ly: T["ly"]) => Object.assign(box, <any>{ ly });
export function timerP(data: str): Box {
  return { tp: "p", s: 'number', dt: [{ tp: "s", dt: data, fmt: 'n;t' }] };
}
export function p<L = any>(data?: str, style?: str, al?: TAlign): IPBox<L> {
  return { tp: "p", s: style, is: { al: al || undefined }, dt: data && [{ dt: data }] };
}
/** scalar */
export function s<L = any>(data: str, style?: str, fmt?: str, al?: TAlign): Box<L> {
  return { tp: "p", s: style, is: { al: al || void 0 }, dt: [{ tp: "s", dt: data, fmt: fmt, }] };
}
export const st = <L = any>(value: str, tp?: ST, format?: str) => tp == "s" ? s<L>(value, "strong", format) : p<L>(value, "strong");
export function currPH(data: str): Box {
  return { tp: "p", dt: [{ dt: data }], is: { al: "end" } }
}
export function currPF(data: str, format = 'n;$'): Box {
  return { tp: "p", s: 'number', is: { al: "end" }, dt: [{ tp: "s", dt: `pag_sum('${data}', (i)=>i.${data},'${format}')` }] };
}
export const i = (dt: str, w: num, h: num): IImgBox => ({ tp: "img", dt, is: { w, h } });
export const ph = <L = any>(val: str): IPHBox<L> => ({ tp: "ph", val });
export function end(base: Box<CLy>[], ...ends: Box<CLy>[]): Box {
  let
    end = <ICol<CLy>>(ends.length == 1 && ends[0].tp == "col" ? ends[0] : {
      tp: "col",
      ub: true,
      dt: ends
    });
  (end.ly || (end.ly = {})).sz = 1;
  end.align = CAlign.e;
  base.push(end);
  return {
    tp: "col",
    sc: "data",
    ly: { fill: true },
    dt: base
  };
}


// export function align(align: DomAlign): TAlign {
//   switch (align) {
//     case 'center': return "c";
//     case 'end': return "e";
//     case 'left': return "l";
//     case 'right': return "r";
//     case 'justify': return "j";
//     default: return "s";
//   }
// }