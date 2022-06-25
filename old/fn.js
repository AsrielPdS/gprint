// export type DomAlign = "center" | "justify" | "left" | "right" | "start" | "end";
const
  /**paragraph */
  p = (data, style, al) => {
    return { tp: "p", s: style, is: { al: al || undefined }, dt: data && [{ dt: data }] };
  },
  /** scalar */
  s = (data, style, fmt, al) => {
    return { tp: "p", s: style, is: { al: al || void 0 }, dt: [{ tp: "s", dt: data, fmt: fmt, }] };
  };
exports.p = p;
exports.s = s;
exports.cut = () => ({ tp: "hr", s: "cut" });
exports.sep = () => ({ tp: "hr", s: 'divider' });
/**
 * horizontal rule
 * @param s style
 */
exports.hr = (s) => ({ tp: "hr", s });
exports.numbP = (data, style, fmt = 'n;$', al = "end") => {
  return { tp: "p", s: style || undefined, is: { al: al || undefined }, dt: [{ tp: "s", dt: data, fmt: fmt }] };
}
exports.dateP = (data) => {
  return { tp: "p", dt: [{ tp: "s", dt: data, fmt: 'd;d' }] };
}
exports.tr = (...dt) => ({ tp: "tr", dt });
exports.th = (hd, ...dt) => ({ tp: "th", hd, dt });
/** book row*/
exports.r = (...dt) => ({ tp: "row", dt });
/** book column*/
exports.c = (...dt) => ({ tp: "col", dt });
/** block of paragraphs*/
exports.block = (...dt) => ({ tp: "col", dt });
exports.symb = (dt) => ({ tp: "symbol", dt });
exports.dateTimeP = (data) => {
  return { tp: "p", dt: [{ tp: "s", dt: data, fmt: 'd;f' }] };
}
exports.tbh = (cols, hd, ...dt) => ({ tp: "table", cols: cols?.map(c => ({ sz: c })), hd, dt });
exports.tb = (cols, ...dt) => ({ tp: "table", cols: cols?.map(c => ({ sz: c })), dt });
/** full table */
exports.tbf = (cols, hd, dt, ft) => ({ tp: "table", cols: cols?.map(c => ({ sz: c })), hd, dt: Array.isArray(dt) ? dt : [dt], ft });
exports.cs = (box, is) => Object.assign(box, { is });
exports.l = (box, ly) => Object.assign(box, { ly });
exports.timerP = (data) => {
  return { tp: "p", s: 'number', dt: [{ tp: "s", dt: data, fmt: 'n;t' }] };
}
exports.st = (value, tp, format) => tp == "s" ? s(value, "strong", format) : p(value, "strong");
exports.currPH = (data) => {
  return { tp: "p", dt: [{ dt: data }], is: { al: "end" } };
}
exports.currPF = (data, format = 'n;$') => {
  return { tp: "p", s: 'number', is: { al: "end" }, dt: [{ tp: "s", dt: `pag_sum('${data}', (i)=>i.${data},'${format}')` }] };
}
exports.i = (dt, w, h) => ({ tp: "img", dt, is: { w, h } });
exports.ph = (val) => ({ tp: "ph", val });
exports.end = (base, ...ends) => {
  let end = (ends.length == 1 && ends[0].tp == "col" ? ends[0] : {
    tp: "col",
    ub: true,
    dt: ends
  });
  (end.ly || (end.ly = {})).sz = 1;
  end.align = "e" /* e */;
  base.push(end);
  return {
    tp: "col",
    sc: "data",
    ly: { fill: true },
    dt: base
  };
}
// exports.align=(align: DomAlign): TAlign =>{
//   switch (align) {
//     case 'center': return "c";
//     case 'end': return "e";
//     case 'left': return "l";
//     case 'right': return "r";
//     case 'justify': return "j";
//     default: return "s";
//   }
// }
