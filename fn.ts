import type { bool, falsy, str, unk } from "galho/util.js";
import { arr, assign, filter, isA, isN, isS } from "galho/util.js";
import type { Align, ASpan, CLy, DivLy, iBox, iBoxes, iCol, iDiv, iHr, IImg, iImgBox, ImgSize, iP, iPH, iRow, iTb, iTr, RLy, TbColInfo, TrLy } from "./gprint.js";

/**
 * Creates a horizontal rule box component.
 * @param s - Optional style key name defined in the theme.
 * @returns A horizontal rule box component structure.
 */
export const hr = <L = unk>(s?: str): iHr<L> => ({ tp: "hr", s });

/**
 * Creates a table row box component.
 * @param bd - Children elements or raw strings representing cell content.
 * @returns A table row box component structure.
 */
export const tr = (...bd: (iBoxes<TrLy> | str)[]): iTr<void> => ({ tp: "tr", bd: bd.map(v => isS(v) ? { bd: v } : v) });

/**
 * Creates a row box component representing a horizontal list/layout.
 * @param bd - Children elements or strings representing row cells.
 * @returns A row box component structure.
 */
export const r = <L = unknown>(...bd: (iBoxes<RLy> | str)[]): iRow<L> => ({ tp: "row", bd: bd.map(v => isS(v) ? { bd: v } : v) });

/**
 * Creates a column box component representing a vertical list/layout.
 * @param bd - Children elements or strings representing column cells.
 * @returns A column box component structure.
 */
export const c = <L = unknown>(...bd: (iBoxes<CLy> | str)[]): iCol<L> => ({ tp: "col", bd: bd.map(v => isS(v) ? { bd: v } : v) });

/**
 * Creates a generic block container box component (div).
 * @param bd - Children elements or strings representing div body.
 * @returns A div block box component structure.
 */
export const d = <L = unknown>(...bd: (iBoxes<DivLy> | str)[]): iDiv<L> => ({ tp: "d", bd: bd.map(v => isS(v) ? { bd: v } : v) });

/**
 * Creates a placeholder box component whose content will be resolved from an expression.
 * @param bd - The dynamic template expression string.
 * @returns A placeholder box component structure.
 */
export const ph = <L = any>(bd: str): iPH<L> => ({ tp: "ph", bd });

/**
 * Creates a table box component with a defined header row.
 * @param cols - Columns configuration structure.
 * @param hd - The table header row element.
 * @param bd - Array of body table rows.
 * @returns A table box component structure.
 */
export const tbh = <L = any>(cols: TbColInfo[], hd: iTr, ...bd: iTr[]): iTb<L> => ({ tp: "tb", cols, hd, bd });

/**
 * Creates a table box component without a header row.
 * @param cols - Columns configuration structure.
 * @param bd - Array of table rows or grid definitions.
 * @returns A table box component structure.
 */
export const tb = <L = any>(cols: TbColInfo[], ...bd: (iTr | iBoxes<TrLy>[])[]): iTb<L> => ({ tp: "tb", cols, bd: filter(bd).map(i => isA(i) ? tr(...i) : i) });

/**
 * Creates a full table box component specifying header, body, footer, empty row, and styles.
 * @param cols - Columns configuration structure.
 * @param hd - The table header row element.
 * @param bd - The table body rows.
 * @param ft - The optional table footer row element.
 * @param empty - The optional row element to display when table body is empty.
 * @param sc - Optional context scope expression.
 * @param map - Optional flag specifying if body should map over dataset context.
 * @returns A table box component structure.
 */
export const tbf = (cols: TbColInfo[], hd: iTr, bd: iTr | iTr[], ft?: iTr, empty?: iTr, sc?: str, map?: bool): iTb =>
  ({ tp: "tb", cols, hd, bd: arr(bd), ft, empty, sc, map });

/**
 * Creates an image span component.
 * @param bd - Source path/URI of the image.
 * @param sz - Image dimension configuration.
 * @param al - Image alignment position.
 * @returns An image element representation.
 */
export const img = <L = any>(bd: str, sz: ImgSize, al?: iImgBox["al"]): IImg => <any>({ tp: "img", bd, sz, al });

/**
 * Creates a paragraph box component.
 * @param bd - Span text content or child span elements.
 * @param style - Optional style class name.
 * @param al - Horizontal alignment option.
 * @returns A paragraph box component structure.
 */
export const p = <L = any>(bd?: ASpan, style?: str | falsy, al?: Align): iP<L> =>
  ({ s: style || void 0, is: al ? { al } : void 0, bd });

/**
 * Creates an expression-based paragraph box component.
 * @deprecated Use standard p with template expressions instead.
 * @param bd - The formula expression string.
 * @param fmt - Optional display format specifier.
 * @param style - Optional style class name.
 * @param al - Horizontal alignment option.
 * @returns A paragraph box component structure.
 */
export const e = <L = any>(bd?: str, fmt?: str | 0, style?: str, al?: Align): iP<L> =>
  ({ s: style || undefined, is: al && { al }, bd: [{ tp: "e", bd: fmt ? `fmt(${bd},${fmt.split(';').reverse()})` : bd }] });

/**
 * Creates a cut-line horizontal rule separator.
 * @returns A horizontal rule component configured with a "cut" style.
 */
export const cut = <L = any>(): iHr<L> => ({ tp: "hr", s: "cut" });

/**
 * Creates a standard divider horizontal rule separator.
 * @returns A horizontal rule component configured with a "divider" style.
 */
export const sep = <L = any>(): iHr<L> => ({ tp: "hr", s: 'divider' });

/**
 * Creates a paragraph box component pre-formatted for display of a formatted datetime.
 * @param bd - The datetime expression/source.
 * @returns A paragraph box component structure.
 */
export const dtP = (bd: str): iP => ({ bd: [{ tp: "e", bd: `fmt(${bd},D)` }] });

/**
 * Defines and sets inline styles directly onto a target box component.
 * @param box - The target box component.
 * @param is - The styling properties to apply.
 * @returns The updated box component with the styling applied.
 */
export const is = <T extends iBox>(box: T, is: T["is"]): T => assign(box, { is });

/**
 * Defines structural layout onto a target box component.
 * @deprecated Use `ly` instead.
 * @param box - The target box component.
 * @param ly - The layout properties to apply.
 * @returns The updated box component with the layout applied.
 */
export const l = <T extends iBox>(box: T, ly: T["ly"]): T => assign(box, { ly });

/**
 * Defines structural layout onto a target box component.
 * @param box - The target box component.
 * @param ly - The layout properties to apply.
 * @returns The updated box component with the layout applied.
 */
export const ly = <T extends iBox>(box: T, ly: T["ly"]): T => assign(box, { ly });

/**
 * Places suffix/end layouts/elements alongside base column containers.
 * @param base - Array of base column containers.
 * @param ends - Suffix/end column elements.
 * @returns Combined column container structure.
 */
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