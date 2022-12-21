import { arr, assign, isA, isN, isS } from "galho/util.js";
export const hr = (s) => ({ tp: "hr", s });
export const tr = (...bd) => ({ tp: "tr", bd });
export const r = (...bd) => ({ tp: "row", bd: bd.map(v => isS(v) ? { bd: v } : v) });
export const c = (...bd) => ({ tp: "col", bd: bd.map(v => isS(v) ? { bd: v } : v) });
export const d = (...bd) => ({ tp: "d", bd: bd.map(v => isS(v) ? { bd: v } : v) });
export const ph = (bd) => ({ tp: "ph", bd });
export const tbh = (cols, hd, ...bd) => ({ tp: "tb", cols, hd, bd });
export const tb = (cols, ...bd) => ({ tp: "tb", cols, bd: bd.map(i => isA(i) ? tr(...i) : i) });
export const tbf = (cols, hd, bd, ft) => ({ tp: "tb", cols, hd, bd: arr(bd), ft });
export const img = (bd, sz) => ({ tp: "img", bd, sz });
export const p = (bd, style, al) => ({ s: style || void 0, is: al ? { al } : void 0, bd });
export const e = (bd, fmt, style, al) => ({ s: style || undefined, is: al && { al }, bd: [{ tp: "e", bd: fmt ? `fmt(${bd},${fmt.split(';').reverse()})` : bd }] });
export const cut = () => ({ tp: "hr", s: "cut" });
export const sep = () => ({ tp: "hr", s: 'divider' });
export const dtP = (bd) => ({ bd: [{ tp: "e", bd: `fmt(${bd},D)` }] });
export const is = (box, is) => assign(box, { is });
export const l = (box, ly) => assign(box, { ly });
export const ly = (box, ly) => assign(box, { ly });
export function end(base, ...ends) {
    let end = (ends.length == 1 && ends[0].tp == "col" ? ends[0] : {
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
function tbSize(...cols) {
    let l = cols.length;
    var total = 0;
    for (let i = 0; i < l; i++) {
        let s = cols[i] ||= 100 / l;
        total += isN(s) ? s : s.sz;
    }
    for (let i = 0; i < l; i++) {
        let c = cols[i], v = (isN(c) ? c : c.sz) * 100 / total;
        isN(c) ? (cols[i] = v) : (c.sz = v);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJmbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBVSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBWSxNQUFNLGVBQWUsQ0FBQztBQU83RSxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBVSxDQUFPLEVBQVUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbEUsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFrQixFQUFhLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBSTFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFjLEdBQUcsRUFBeUIsRUFBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFakksTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQWMsR0FBRyxFQUF5QixFQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUVsSSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBYyxHQUFHLEVBQTJCLEVBQVcsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRWxJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFVLEVBQU8sRUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUVuRSxNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBVSxJQUFpQixFQUFFLEVBQU8sRUFBRSxHQUFHLEVBQVMsRUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBRS9HLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFVLElBQWlCLEVBQUUsR0FBRyxFQUE0QixFQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFeEosTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsSUFBaUIsRUFBRSxFQUFPLEVBQUUsRUFBZSxFQUFFLEVBQVEsRUFBTyxFQUFFLENBQ2hGLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBRTVDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLEVBQU8sRUFBRSxFQUFXLEVBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBRTNFLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFVLEVBQVUsRUFBRSxLQUFvQixFQUFFLEVBQVUsRUFBUyxFQUFFLENBQzdDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFFNUYsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQVUsRUFBUSxFQUFFLEdBQWEsRUFBRSxLQUFXLEVBQUUsRUFBVSxFQUFTLEVBQUUsQ0FDcEYsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLElBQUksU0FBUyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUk1SCxNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsR0FBb0IsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRW5FLE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxHQUFvQixFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUs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