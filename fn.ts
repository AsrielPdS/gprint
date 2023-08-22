import { arr, assign, falsy, isA, isN, isS, str, unk } from "galho/util.js";
import { Align, ASpan, CLy, DivLy, iBox, iBoxes, iCol, iDiv, iHr, IImg, ImgSize, iP, iPH, iRow, iTb, iTr, RLy, TbColInfo, TrLy } from "./gprint.js";

/**
 * horizontal rule
 * @param s style
 */
export const hr = <L = unk>(s?: str): iHr<L> => ({ tp: "hr", s });
export const tr = (...bd: (iBoxes<TrLy> | str)[]): iTr<void> => ({ tp: "tr", bd:bd.map(v => isS(v) ? { bd: v } : v) })
// /**table row with head */
// export const th = (hd: iBoxes<void>, ...bd: iBoxes<TrLy>[]): iTr => ({ tp: "tr", hd, bd });
/** row*/
export const r = <L = unknown>(...bd: (iBoxes<RLy> | str)[]): iRow<L> => ({ tp: "row", bd:bd.map(v => isS(v) ? { bd: v } : v) });
/** column*/
export const c = <L = unknown>(...bd: (iBoxes<CLy> | str)[]): iCol<L> => ({ tp: "col", bd: bd.map(v => isS(v) ? { bd: v } : v) });
/** column*/
export const d = <L = unknown>(...bd: (iBoxes<DivLy> | str)[]): iDiv<L> => ({ tp: "d", bd: bd.map(v => isS(v) ? { bd: v } : v) });
/**placeholder */
export const ph = <L = any>(bd: str): iPH<L> => ({ tp: "ph", bd });
/**table with head */
export const tbh = <L = any>(cols: TbColInfo[], hd: iTr, ...bd: iTr[]): iTb<L> => ({ tp: "tb", cols, hd, bd });
/**table */
export const tb = <L = any>(cols: TbColInfo[], ...bd: (iTr | iBoxes<TrLy>[])[]): iTb<L> => ({ tp: "tb", cols, bd: bd.map(i => isA(i) ? tr(...i) : i) });
/** full table(table with head, body and foot) */
export const tbf = (cols: TbColInfo[], hd: iTr, bd: iTr | iTr[], ft?: iTr): iTb =>
  ({ tp: "tb", cols, hd, bd: arr(bd), ft });
/**image */
export const img = (bd: str, sz: ImgSize): IImg => ({ tp: "img", bd, sz });

export const p = <L = any>(bd?: ASpan, style?: str | falsy, al?: Align): iP<L> =>
  /*isS(bd) && !al && !style ? bd :*/({ s: style || void 0, is: al ? { al } : void 0, bd });
/** @deprecated expression */
export const e = <L = any>(bd?: str, fmt?: str | 0, style?: str, al?: Align): iP<L> =>
  ({ s: style || undefined, is: al && { al }, bd: [{ tp: "e", bd: fmt ? `fmt(${bd},${fmt.split(';').reverse()})` : bd }] });
//-----------------extras----------------

// export type DomAlign = "center" | "justify" | "left" | "right" | "start" | "end";
export const cut = <L = any>(): iHr<L> => ({ tp: "hr", s: "cut" });

export const sep = <L = any>(): iHr<L> => ({ tp: "hr", s: 'divider' });

// export const dateP = (data: str): iP =>
//   ({ bd: [{ tp: "e", bd: data, fmt: 'd;d' }] });

// /** block of paragraphs*/
// export const block = (...bd: (iBoxes | str)[]): iCol => ({ tp: "col", bd });
/**datetime paragraph */
export const dtP = (bd: str): iP => ({ bd: [{ tp: "e", bd: `fmt(${bd},D)` }] });

/**define inline style */
export const is = <T extends iBox>(box: T, is: T["is"]): T => assign(box, { is });
/**@deprecated define layout */
export const l = <T extends iBox>(box: T, ly: T["ly"]): T => assign(box, { ly });
/**define layout */
export const ly = <T extends iBox>(box: T, ly: T["ly"]): T => assign(box, { ly });
// /** scalar */
// export function s<L = any>(data: str, style?: str, fmt?: str, al?: Align): iBoxes<L> {
//   return { s: style, is: { al: al || void 0 }, bd: [{ tp: "e", bd: fmt?`fmt(${bd},D)`:bd }] };
// }
// export const st = <L = any>(value: str, tp?: "t" | "s" | "img", fmt?: str) => tp == "s" ? s<L>(value, "strong", fmt) : p<L>(value, "strong");
// export function currPH(data: str): iBoxes {
//   return { bd: [{ bd: data }], is: { al: "e" } }
// }
export function end(base: iBoxes<CLy>[], ...ends: iBoxes<CLy>[]): iBoxes {
  let
    end = <iCol<CLy>>(ends.length == 1 && ends[0].tp == "col" ? ends[0] : {
      tp: "col",
      ub: true,
      dt: ends
    });
  (end.ly || (end.ly = {})).sz = 1;
  end.align = "e";
  base.push(end);
  return {
    tp: "col",
    sc: "data",
    ly: { fill: true },
    bd: base
  };
}


function tbSize(...cols: TbColInfo[]) {
  let l = cols.length;

  var total = 0;
  for (let i = 0; i < l; i++) {
    let s = cols[i] ||= 100 / l;

    total += isN(s) ? s : s.sz;
  }

  for (let i = 0; i < l; i++) {
    let
      c = cols[i],
      v = (isN(c) ? c : c.sz) * 100 / total;

    isN(c) ? (cols[i] = v) : (c.sz = v);
  }
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