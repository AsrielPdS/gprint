import { div, empty, g, S } from "galho";
import { arr, assign, def, fmt, isA, isN, isS, l } from "galho/util.js";
import { numbInFull } from "./scalar.js";
const hasProp = (obj) => Object.keys(obj).length;
const $mapIndex = Symbol();
const minBoxSize = 40;
const border = (b) => `${b.width || 1}px ${b.style || 'solid'} ${b.color || "#000"}`;
function borders(css, bord) {
    if (isA(bord)) {
        if (bord[0] && hasProp(bord[0]))
            css.borderTop = border(bord[0]);
        if (bord[1] && hasProp(bord[1]))
            css.borderRight = border(bord[1]);
        if (bord[bord.length - 2] && hasProp(bord[bord.length - 2]))
            css.borderBottom = border(bord[bord.length - 2]);
        if (bord[bord.length - 1] && hasProp(bord[bord.length - 1]))
            css.borderLeft = border(bord[bord.length - 1]);
    }
    else
        css.border = border(bord);
}
const space = (p) => p.map(p => p + 'px').join(' ');
const buildShadow = (shadow) => shadow.map(sh => `${sh.inset ? 'inset' : ''} ${sh.x}px ${sh.y}px ${sh.blur}px ${sh.spread}px ${sh.color}`).join(',');
function styleImg(style, size, css) {
    if (style) {
        if (style.border)
            if ('length' in style.border)
                assign(css, {
                    borderTop: border(style.border[0]),
                    borderRight: border(style.border[1]),
                    borderBottom: border(style.border[2]),
                    borderLeft: border(style.border[3]),
                });
            else
                css.border = border(style.border);
        if (style.radius)
            css.borderRadius = `${style.radius}px`;
        if (style.shadow)
            css.boxShadow = buildShadow(style.shadow);
        if (style.efect) {
            let fx = style.efect;
            css.filter = fx.contrast ? `contrast(${fx.contrast}) ` : '' +
                fx.grayscale ? `gray8scale(${fx.grayscale}) ` : '' +
                fx.opacity ? `opacity(${fx.opacity}) ` : '' +
                fx.invert ? `invert(${fx.invert}) ` : '' +
                fx.sepia ? `sepia(${fx.sepia}) ` : '' +
                fx.blur ? `blur(${fx.blur}px)` : '' +
                fx.brightness ? `brightness(${fx.blur}px)` : '' +
                fx['hue-rotate'] ? `hue-rotate(${fx.blur}px)` : '' +
                fx.saturate ? `saturate(${fx.blur}px)` : '';
        }
        if (style.clip)
            css.clip = `rect(${style.clip[0]}px, ${style.clip[1]}px, ${style.clip[2]}px, ${style.clip[3]}px)`;
    }
    if (isS(size)) {
        css[size == "w" ? "width" : "height"] = '100%';
    }
    else {
        let [w, h] = arr(size);
        css.width = w + 'px';
        css.height = (h || w) + 'px';
    }
    return css;
}
function styleBox(s, css) {
    if (s.bg) {
        css.background = s.bg.dt;
    }
    if (s.br)
        borders(css, s.br);
    if (s.pd)
        css.padding = space(s.pd);
    if (s.rd)
        css.borderRadius = isN(s.rd) ?
            `${s.rd}px` :
            s.rd.join('px ') + 'px';
    return css;
}
function styleParagraph(style, css) {
    if (style.shadow)
        css.textShadow = style.shadow.map(s => `${s.x}px ${s.y}px ${s.blur || 0}px ${s.color}`).join();
    if (style.indent)
        css.textIndent = `${style.indent}px`;
    if (style.lh)
        css.lineHeight = style.lh;
    style.al && (css.textAlign = align(style.al));
    if (style.noWrap) {
        css.whiteSpace = 'nowrap';
        css.textOverflow = style.overflow;
    }
    return css;
}
function styleText(style, css) {
    if (style.ff)
        css.fontFamily = style.ff;
    if (style.fs)
        css.fontSize = `${style.fs}px`;
    if ('b' in style)
        css.fontWeight = style.b ? 'bold' : 'normal';
    if ('i' in style)
        css.fontStyle = style.i ? 'italic' : 'normal';
    if (style.u)
        css.textDecorationLine = 'underline';
    if (style.st)
        css.textDecorationLine = (css.textDecorationLine || '') + ' line-through';
    if (style.va)
        css.verticalAlign = style.va;
    if (style.cl)
        css.color = style.cl;
    if (style.bg)
        css.background = style.bg;
    return css;
}
function getCtx(exp, scp, pag) {
    let ctx = scp.ctx;
    if (exp) {
        while (exp.startsWith('../')) {
            exp = exp.slice(3);
            let oldP;
            do {
                oldP = scp;
                scp = oldP.p;
            } while (oldP.dt == scp.dt);
        }
        if (exp[0] == '.') {
            while (scp.p)
                scp = scp.p;
            exp = exp.slice(1);
        }
        var data;
        if (exp[0] == '=') {
            data = ctx.calc(exp.slice(1), scp, pag);
            if (data == null)
                data = {};
        }
        else {
            let split = exp.split('.');
            data = scp.dt;
            for (let i = 0; i < split.length; i++) {
                if (data == null)
                    return {};
                data = data[split[i]];
            }
        }
        return data || {};
    }
    else
        return scp.dt;
}
export function cpu(fn, extraFn) {
    let funcs = {
        numbInFull,
        id() { return this.s.dt[$mapIndex]; },
        set(key, value) { return this.s.dt[key] = value; },
        get(src, field) { return src[field]; },
        temp(k, v) { return (this.s.ctx.temp ||= {})[k] = def(v, this.s.ctx.temp[k]); },
        delay(data) {
            let r = g('span').html(empty);
            (this.s.ctx.wait ||= []).push(() => r.replace(data()));
            return r;
        },
        pags() { return this.s.ctx.pagCount; },
        pag() { return this.p; },
        fmt,
        sum(v, fn = v => v) { return v.reduce((p, c) => p + fn(c), 0); },
        ...extraFn
    };
    return (v, s, p) => fn(v, {
        funcs: (key, args) => key in funcs ? def(funcs[key].call({ p, s }, ...args), null) : void 0,
        vars(key, obj) {
            if (key == "@")
                return s.dt;
            let t = s;
            do
                if (key in t.dt)
                    return t.dt[key];
            while (t = t.p);
            console.warn('not_found', { key: key, ctx: s });
            return obj ? {} : null;
        }
    });
}
export const create = (i, p, id) => Reflect.construct(boxes[i.tp || 'p'], [i, p, id]);
export function write(box, pag, id, parent) {
    if (isS(box)) {
        box = { bd: box };
    }
    return (box.$ ? (box.$.id = id, box.$) : create(box, parent, id)).view(pag);
}
export const spans = {
    t: (({ is, bd }) => {
        let t = g('span');
        is && t.css(styleText(is, {}));
        return bd ? t.text(bd) : t.html(empty);
    }),
    e: (({ bd, is }, p, pag) => {
        let v = p.ctx.calc(bd, p, pag);
        if (v || v === 0) {
            let t = g('span', 0, v);
            is && t.css(styleText(is, {}));
            return t;
        }
    }),
    img: (({ sz, bd, calc, is }, p, pag) => {
        let css = styleImg(is, sz, {});
        if (calc) {
            let t = p.ctx.calc(bd, p, pag);
            if (isS(t))
                return g('img', { src: t }).css(css);
            else if (t = g(t))
                return t.css(css);
            return null;
        }
        else
            return g('img', {
                src: def(p.ctx.img?.(bd), bd)
            }).css(css);
    })
};
class Box {
    i;
    id;
    start;
    end;
    _d;
    get dt() {
        let { i, p, start } = this;
        return this._d ||= getCtx(i.sc, p, start);
    }
    ctx;
    p;
    constructor(i, p, id) {
        this.i = i;
        this.id = id;
        i.$ = this;
        this.ctx = (this.p = p).ctx;
    }
    css(e) {
        let css = {}, { p, id, i } = this;
        this.ss(css);
        p.fitIn?.(css, i.ly || {}, e, id);
        e.css(css);
    }
    valid(pag) {
        return !this.i.vl || this.ctx.calc(this.i.vl, this, pag);
    }
    update() {
        throw "not implemented";
    }
    clear() { delete this.i.$; }
    clearData() { delete this._d; }
}
class SBox extends Box {
    e;
    part() { return this.e; }
    transport() { this.start++; this.end++; }
    view(pag) {
        if (this.valid(pag)) {
            this.css(this.e ||= this.data(pag));
            let { p, i } = this;
            p.append(this, pag);
            p.overflow(i, pag) && p.append(this, ++pag);
        }
        return this.start = this.end = pag;
    }
    clearData() {
        delete this.e;
        super.clearData();
    }
}
class MBox extends Box {
    parts = {};
    view(pag) {
        this.start = this.end = pag;
        if (this.valid(pag))
            this.data(pag);
        return this.end;
    }
    addBox(s, pag) {
        this.css(this.parts[this.end = pag] = s);
        return s;
    }
    transport() {
        let { parts: p, end: e } = this;
        this.parts = { [e + 1]: p[e] };
    }
    clearData() {
        this.parts = {};
        super.clearData();
    }
    part(pag) { return this.parts[pag]; }
}
export const span = (v) => v ? arr(v).map(v => isS(v) ? v[0] == '=' ? { tp: "e", bd: v.slice(1) } : { bd: v } : v) : [];
class P extends MBox {
    ss(css) {
        let i = this.i, th = theme.p[i.s], props = {};
        css.margin = 0;
        if (th) {
            styleText(th, css);
            assign(props, th);
        }
        i.is && assign(props, i.is);
        styleParagraph(props, css);
    }
    data(pag) {
        let i = this.i, p = this.addBox(g(this.p.pTag || "p"), pag), items = i.li ? [this.p.listItem(i)] : [];
        for (let j of span(i.bd)) {
            let data = spans[j.tp || 't'](j, this, pag);
            if (data) {
                items.push(data);
            }
        }
        if (items.length)
            p.add(items);
        else
            p.html(empty);
        this.p.append(this, pag);
        return this.check(p, pag);
    }
    check(e, pag) {
        let i = this.i, p = this.p, o, bd = span(i.bd);
        while (o = p.overflow(i, pag)) {
            if (o == -1)
                pag++;
            else if (!l(bd) || o < 40) {
                p.append(this, ++pag);
            }
            else {
                let childs = e.childs(), newE = g("p"), j = childs.length - 1;
                while (j >= 0) {
                    newE.prepend(childs[j]);
                    j--;
                    if (!p.overflow(i, pag))
                        break;
                }
                let last = childs.e(j + 1);
                if (l(last.text()) > 2) {
                    e.add(last);
                    let newSpan = last.clone(), lastSpanText = last.e.firstChild, split = lastSpanText.textContent.split(' '), newSpanText = [];
                    do {
                        newSpanText.unshift(split.pop());
                        lastSpanText.textContent = split.join(' ');
                    } while (p.overflow(i, pag));
                    newSpan.add(newSpanText.join(" "));
                    newE.prepend(newSpan);
                }
                pag++;
                this.addBox(e = newE, pag);
                p.append(this, pag);
            }
        }
        return pag;
    }
}
const bparse = (v, k) => isA(v[k]) ? v[k] = { tp: "d", bd: v[k] } : v[k];
class Parent extends MBox {
    ss(v) {
        let i = this.i, box = theme.box[i.s], txtStyle = theme.p[i.is?.tx || box && box.tx];
        styleBox({ ...box, ...i.is }, v);
        txtStyle && styleText(txtStyle, v);
    }
    data(pag) {
        let { bd, map, empty } = this.i;
        if (map) {
            let dt = this.dt, range = [], bds = bd.map(i => create(i, this));
            dt.pd = { [pag]: range };
            if (l(dt))
                for (let i = 0; i < l(dt); i++) {
                    let row = dt[i];
                    for (let t of bds) {
                        if (i)
                            t.clearData();
                        if (row)
                            row[$mapIndex] = i;
                        range.push(t._d = row);
                        t.id = i;
                        let newPag = t.view(pag);
                        if (newPag != pag) {
                            range.pop();
                            dt.pd[pag = newPag] = range = [row];
                        }
                    }
                }
            else if (empty)
                pag = write(empty, pag, 0, this);
        }
        else
            for (let i = 0; i < l(bd); i++)
                pag = write(bd[i], pag, i, this);
        return pag;
    }
    append(ch, pag) {
        let e = this.part(pag), cpart = ch.part(pag);
        ch.id >= 0 && this.i.ft?.$.part(pag) ? e.place(-2, cpart) : e.add(cpart);
    }
    part(pag) {
        let i = this.i, part = this.parts[pag];
        if (!part) {
            part = this.createPart(pag);
            this.p.append(this, pag);
            bparse(i, "hd") && write(i.hd, pag, -1, this);
            bparse(i, "ft") && write(i.ft, pag, -2, this);
        }
        return part;
    }
    transport() {
        let { hd, bd, ft } = this.i;
        super.transport();
        hd?.$.transport();
        ft?.$.transport();
        for (let i of bd)
            i?.$.transport();
    }
    overflow(child, pag) {
        let result = this.p.overflow(this.i, pag);
        if (result) {
            if (!this.break(child, pag)) {
                this.transport();
                this.p.append(this, pag + 1);
                return -1;
            }
        }
        return result;
    }
    break(child, index) {
        let i = this.i;
        if (isN(child.$.id) && !i.ub) {
            return true;
        }
        return false;
    }
    _lCss;
    _lItems;
    listItem(p) {
        throw "not implemented yet";
        let l = this.i.l, css = this._lCss || styleText(l, {}), s = g('span', ['li']).css(css);
        if (true) {
            let items = this._lItems || (this._lItems = []);
            items.push({ s: s, p: p });
            s
                .props({ contentEditable: 'false', tabIndex: -1 })
                .on({
                click(e) { e.stopPropagation(); },
                focus() {
                    items.forEach(i => i.s.c('on'));
                },
                blur() {
                    items.forEach(i => i.s.c('on', false));
                }
            });
        }
        return s;
    }
    clear() {
        let { hd, bd, ft } = this.i;
        for (let i of bd)
            i.$?.clear();
        hd?.$?.clear();
        ft?.$?.clear();
        super.clear();
    }
    clearData() {
        let { hd, bd, ft } = this.i;
        for (let i of bd)
            i.$?.clearData();
        hd?.$?.clearData();
        ft?.$?.clearData();
        super.clearData();
    }
}
class Div extends Parent {
    ss(css) {
        let i = this.i;
        super.ss(css);
        if (i.cols) {
            let c = i.cols;
            css.columnWidth = c.width + "px";
            css.columnCount = c.count;
            css.columnGap = c.gap + '%';
            if (c.rule)
                css.columnRule = border(c.rule);
        }
    }
    createPart(index) {
        return this.addBox(div(), index);
    }
    fitIn(css, ly) {
        if (ly.mg) {
            let [t, b] = arr(ly.mg);
            css.marginTop = t + "px";
            css.marginBottom = def(b, t) + "px";
        }
    }
}
function align(v) {
    switch (v) {
        case "e": return "end";
        case "s": return "start";
        case "c": return "center";
        case "j": return "justify";
        case "l": return "left";
        case "r": return "right";
    }
    return v;
}
function fLy(ly, css, v0, v1) {
    if (ly.sz) {
        let [sz, g, s] = arr(ly.sz);
        css.flexGrow = g ||= 0;
        css.flexShrink = s || g;
        sz && (css.flexBasis = sz + "%");
    }
    if (ly.al) {
        if (ly.al) {
            let al;
            switch (ly.al) {
                case 's':
                    al = 'flex-start';
                    break;
                case 'e':
                    al = 'flex-end';
                    break;
                case 'c':
                    al = 'center';
                    break;
                case 'j':
                    al = 'stretch';
                    break;
                default: al = ly.al;
            }
            css.alignSelf = al;
        }
    }
    if (ly.mg) {
        let [t, b] = arr(ly.mg);
        b = def(b, t);
        css[`margin${v0}`] = t === "" ? "auto" : t + "px";
        css[`margin${v1}`] = b === "" ? "auto" : b + "px";
    }
}
class Col extends Parent {
    ss(v) {
        super.ss(v);
        assign(v, {
            display: "flex",
            flexDirection: "column"
        });
        var i = this.i;
        if (i.btt)
            v.flexDirection = 'column-reverse';
        if (i.align)
            switch (i.align) {
                case 'e':
                    v.justifyContent = 'flex-end';
                    break;
                case "s":
                    v.justifyContent = 'flex-start';
                    break;
                case "c":
                    v.justifyContent = 'center';
                    break;
                default:
                    v.justifyContent = i.align;
                    break;
            }
    }
    createPart(pag) {
        return this.addBox(div(), pag);
    }
    fitIn(css, ly) {
        fLy(ly, css, "Top", "Bottom");
        ly.mm && (css.minHeight = ly.mm[0] + "%",
            css.maxHeight = ly.mm[1] + "%");
    }
}
class Row extends Parent {
    ss(css) {
        super.ss(css);
        assign(css, {
            display: "flex",
            flexDirection: "row"
        });
    }
    data(pag) {
        let { bd } = this.i;
        for (let i = 0; i < bd.length; i++)
            pag = write(bd[i], pag, i, this);
        return pag;
    }
    createPart(pag) { return this.addBox(div(), pag); }
    append(ch, pag) {
        let part = this.parts[pag];
        if (!part) {
            part = this.part(pag);
            this.p.append(this, pag);
        }
        part.add(ch.part(pag));
    }
    break(child, index) {
        return super.break(child, index);
    }
    fitIn(css, ly) {
        fLy(ly, css, "Left", "Right");
        ly.mm && (css.minWidth = ly.mm[0] + "%",
            css.maxWidth = ly.mm[1] + "%");
    }
}
class Tb extends Parent {
    _style;
    spans;
    ss(v) {
        v.borderCollapse = "collapse";
    }
    get style() {
        if (!this._style) {
            let i = this.i, th = theme.tables;
            this._style = assign(th[i.s] || th[''] || {}, i.is);
        }
        return this._style;
    }
    createPart(pag) {
        return this.addBox(g("table"), pag);
    }
    fitIn() { }
}
const cs = (c) => isN(c) ? c : c.sz;
class Tr extends SBox {
    ss(v) {
        let i = this.i, props = {}, tableStyle = this.p.style, pS = i.$.id == -1 ?
            tableStyle.hd :
            i.$.id == -2 ?
                tableStyle.ft :
                tableStyle.bd, box = theme.box[i.s], txtStyle = theme.p[i.is?.tx || (box && box.tx) || (pS && pS.tx)];
        styleBox(assign(props, pS, box, i.is), v);
        txtStyle && styleText(txtStyle, v);
    }
    data(pag) {
        this.e = g("tr");
        let bd = this.i.bd;
        for (let i = 0; i < bd.length; i++)
            pag = write(bd[i], pag, i, this);
        return this.e;
    }
    append(ch, pag) {
        this.e.add(ch.part(pag));
    }
    get pTag() { return "td"; }
    fitIn(css, ly, e, id) {
        let { i: { bd }, p } = this, cols = p.i.cols;
        if (cols && id >= 0) {
            let start = id;
            for (let i = 0; i < id; i++)
                start += (bd[i].ly?.span || 1) - 1;
            let w = cs(cols[start]);
            if (ly.span) {
                for (let i = 1; i < ly.span; i++)
                    w += cs(cols[i + start]);
            }
            if (ly.ml)
                w -= ly.ml;
            if (ly.mr)
                w -= ly.mr;
            css.width = w + '%';
        }
        ly.span && (e.e.colSpan = ly.span);
        let tbS = p.style;
        if (tbS.col && id >= 0)
            styleBox(tbS.col, css);
        if (ly.ml)
            css.marginLeft = ly.ml + '%';
        if (ly.mt)
            css.marginTop = ly.mt + '%';
        if (ly.mr)
            css.marginRight = ly.mr + '%';
        if (ly.mb)
            css.marginBottom = ly.mb + '%';
        return css;
    }
    overflow(_, pag) {
        let r = this.p.overflow(this.i, pag);
        if (r) {
            this.transport();
            this.p.append(this, pag + 1);
            return -1;
        }
        return 0;
    }
    clear() {
        for (let i of this.i.bd)
            i.$?.clear();
        super.clear();
    }
    clearData() {
        for (let i of this.i.bd)
            i.$?.clearData();
        super.clearData();
    }
}
class GridBox extends Parent {
    ss(v) {
        super.ss(v);
        let i = this.i, tpt = '';
        for (let row of i.rows)
            tpt += `${row} `;
        tpt += '/';
        for (let col of i.cols)
            tpt += `${col} `;
        v.gridGap = space(i.gap);
        v.gridTemplate = tpt;
    }
    createPart(pag) {
        return this.addBox(div(0, [div(), div(), div()]), pag);
    }
    fitIn(css, ly) {
        return {
            'grid-area': `${ly.r + 1} / ${ly.c + 1} / span ${ly.rspan || 1} / span ${ly.cspan || 1}`,
            margin: (ly.margin || ["auto"]).join('px ') + 'px'
        };
    }
}
class Graphic extends SBox {
    ss() { }
    data(pag) {
        return div();
    }
}
class PH extends MBox {
    ss() { }
    bd;
    valid(pag) {
        let { i, ctx } = this, bd = ctx.calc(i.bd, this);
        isS(bd) && (bd = { bd });
        bd && assign(bd, { ly: i.ly });
        return (this.bd = bd) && super.valid(pag);
    }
    data(pag) {
        let t = write(this.bd, pag, this.id, this.p);
        let $ = this.bd.$;
        for (let i = $.start; i <= $.end; i++)
            this.parts[i] = $.part(i);
        return t;
    }
    transport() {
        this.bd?.$.transport();
        super.transport();
    }
    clear() {
        this.bd?.$.clear();
        super.clear();
    }
    clearData() {
        this.bd?.$.clearData();
        super.clearData();
    }
}
class Hr extends SBox {
    ss(v) {
        let { o, s, is } = this.i;
        v.border = "none";
        v.margin = 0;
        v[o == "v" ? "borderLeft" : "borderTop"] = border({ ...theme.hr[s], ...is });
    }
    data(pag) { return g('hr'); }
}
class NP extends SBox {
    ss() { }
    view(pag) {
        this.valid(pag) && pag++;
        this.e = div();
        this.p.append(this, this.start = pag);
        return this.start;
    }
}
class ImgBox extends SBox {
    ss(v) {
        let { is, sz } = this.i;
        styleImg(is, sz, v);
    }
    data() {
        let { ctx, i } = this;
        return g('img', { src: def(ctx.img?.(i.bd), i.bd) });
    }
}
export function render(bd) {
    if (!bd)
        return null;
    if (isS(bd))
        return g("p", 0, bd);
    let r = S.empty, p = {
        ctx: {
            pagCount: 1
        },
        overflow: () => 0,
        append: (child) => r = child.part(0)
    };
    write(bparse({ bd }, "bd"), 0, 0, p);
    return r;
}
export const sheet = (bd, w) => g('article', "_ sheet", render(bd)).css({
    width: `${w}px`,
    marginTop: `40px`,
    padding: space([0, 6]),
    ...styleText(theme.text, {})
});
export function sheets(ctx, container, bk, w, h) {
    let height, hs = bk.hdSz || theme.hdSize, fs = bk.ftSz || theme.ftSize;
    write(bparse(bk, "bd"), 1, 0, {
        ctx,
        dt: ctx.dt,
        fitIn: (css) => css.minHeight = `calc(100% - ${hs + fs}px)`,
        overflow: (child, pag) => Math.max(Math.floor(child.$.part(pag).e.offsetHeight) - height, 0),
        append(ch, pag) {
            ctx.pagCount = pag;
            let pad = theme.padding, hd = g('header').css("height", `${hs}px`), ft = g('footer').css("height", `${fs}px`), part, p = {
                ctx,
                dt: ctx.dt,
                overflow: () => 0,
                append(ch) { part.add(ch.part(pag)); }
            };
            height = g("article", "_ sheet", [hd, ch.part(pag), ft])
                .addTo(container)
                .css({
                background: "#fff",
                width: `${w}mm`,
                minHeight: !h && "300mm",
                height: `${h}mm`,
                padding: space(pad),
                whiteSpace: 'pre-wrap',
                ...styleText(theme.text, {})
            }).e.clientHeight - (hs + fs + pad[0] * 2);
            if (bk.hd) {
                part = hd;
                write(bk.hd, pag, -1, p);
                bk.hd.$.clear();
            }
            if (bk.ft) {
                part = ft;
                write(bk.ft, pag, -2, p);
                bk.ft.$.clear();
            }
            if (bk.wm) {
                part = div("_ wm");
                write(bk.wm, pag, -4, p);
                bk.wm.$.clear();
            }
        }
    });
    if (ctx.wait)
        for (let w of ctx.wait)
            w();
    clear(bk);
    return container;
}
function clear({ hd, bd, ft }) {
    hd?.$?.clear();
    bd.$.clear();
    ft?.$?.clear();
}
export function dblSheets(container, w) {
    let t = container.childs().remove();
    for (let i = 0; i < t.length; i += 2) {
        let t2 = t.slice(i, i + 2);
        t2.splice(1, 0, g('hr').css({
            borderLeft: '1px dashed #AAA',
            margin: 0
        }));
        container.add(div("_ sheet", t2).css({
            width: (w * 2) + "px",
            display: 'flex',
            flexDirection: 'row'
        }));
    }
    return container;
}
export const medias = {
    A4: [210, 297],
    A5: [148, 210],
    A3: [297, 420],
};
export async function print(container, size, cb) {
    let pags = container.childs().css({ display: "block" }, true), style = g('style', null, `body{background:#fff!important}body>*{display:none!important}@page{size:${size};margin:0}`);
    g(document.body).add(pags);
    style.addTo(document.head);
    await cb();
    style.remove();
    container.add(pags.uncss(["display"]));
}
export const boxes = {
    p: P,
    d: Div,
    graphic: Graphic,
    grid: GridBox,
    col: Col,
    row: Row,
    img: ImgBox,
    new: NP,
    hr: Hr,
    ph: PH,
    tb: Tb,
    tr: Tr,
};
export const theme = {
    padding: [7 * 3.7795275590551176, 10 * 3.7795275590551176],
    hdSize: 12 * 3.7795275590551176,
    ftSize: 12 * 3.7795275590551176,
    text: {
        ff: 'Arial',
        cl: "#000",
        b: false,
        i: false,
        lh: 1.2,
        al: "start",
        fs: 9 * 1.3333333333333333
    },
    p: {
        h1: {
            fs: 11 * 1.3333333333333333,
            b: true
        },
        h2: {
            fs: 10 * 1.3333333333333333,
        },
        h3: {
            fs: 9 * 1.3333333333333333,
        },
        h4: {
            fs: 9 * 1.3333333333333333,
        },
        strong: { b: true },
        b: { b: true },
        white_strong: {
            b: true,
            cl: '#fff'
        },
        white: {
            cl: '#fff'
        },
        min: {
            fs: 7.5 * 1.3333333333333333
        }
    },
    box: {
        box: {
            br: {
                style: 'solid',
                color: "#000",
                width: 1
            },
            pd: [7 * 1.3333333333333333, 5 * 1.3333333333333333],
            rd: 5
        },
        filled: {
            pd: [3 * 1.3333333333333333, 2 * 1.3333333333333333],
            rd: 1,
            tx: 'white',
            bg: {
                tp: 'color',
                dt: "#444"
            }
        },
        blank: {
            pd: [7 * 1.3333333333333333, 5 * 1.3333333333333333],
            rd: 2,
            tx: "black",
            bg: {
                tp: 'color',
                dt: "#FFF"
            }
        }
    },
    hr: {
        '': {
            color: "#000",
            style: 'solid',
            width: 1
        },
        divider: {
            color: "#000",
            style: 'solid',
            width: 2
        },
        cut: {
            color: "#000",
            style: 'dashed',
            width: 1,
        }
    },
    tables: {
        '': {
            hd: {
                tx: 'white_strong',
                bg: { dt: "#444" },
                br: [null, null, {
                        color: "#666"
                    }, null],
            },
            col: { pd: [3, 5] },
            ft: {
                tx: 'white_strong',
                bg: { dt: "#444" },
                pd: [1, 3],
                br: [{
                        color: "#666"
                    }, null, null, null],
            },
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3ByaW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ3ByaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBYyxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFDckQsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQVEsR0FBRyxFQUFjLEdBQUcsRUFBTyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBTyxDQUFDLEVBQXVCLE1BQU0sZUFBZSxDQUFDO0FBQ3pILE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFHekMsTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFXLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBMEN6RCxNQUFNLFNBQVMsR0FBRyxNQUFNLEVBQUUsQ0FBQztBQUUzQixNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7QUEwSXRCLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQyxLQUFLLElBQUksTUFBTSxFQUFFLENBQUM7QUFFN0YsU0FBUyxPQUFPLENBQUMsR0FBZSxFQUFFLElBQWE7SUFDN0MsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDYixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLEdBQUcsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENB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LENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFBLENBQUMsQ0FBQztRQUN0RCxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssSUFBSSxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFdEMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFFLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztRQUMvRSxLQUFLLENBQUMsSUFBZTtZQUNuQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RCxPQUFPLENBQUMsQ0FBQztRQUNYLENBQUM7UUFDRCxJQUFJLEtBQUssT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUEsQ0FBQyxDQUFDO1FBQ3JDLEdBQUcsS0FBSyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLEdBQUc7UUFDSCxHQUFHLENBQUMsQ0FBUSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztR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