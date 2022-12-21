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
        temp(k, v) { return (this.s.ctx.temp ||= {})[k] = def(v, this.s.ctx.temp[k]); },
        delay(data) {
            let r = g('span').html(empty);
            (this.s.ctx.wait ||= []).push(() => r.replace(data()));
            return r;
        },
        pags() { return this.s.ctx.pagCount; },
        pag() { return this.p; },
        fmt,
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
            let t = g('code', 0, v);
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
            else {
                t = g(t);
                if (t.valid)
                    return t.css(css);
                return null;
            }
        }
        else
            return g('img', {
                src: p.ctx.img(bd)
            }).css(css);
    })
};
class Box {
    i;
    id;
    start;
    parts = {};
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
    transport() { this.start++; }
    view(pag) {
        if (this.valid(pag)) {
            this.css(this.e = this.data(pag));
            let { p, i } = this;
            p.append(this, pag);
            p.overflow(i, pag) && p.append(this, ++pag);
        }
        return this.start = pag;
    }
}
class MBox extends Box {
    end;
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
        let i = this.i, p = this.addBox(g(this.p.pTag || "p"), pag), items = [i.li ? this.p.listItem(i) : null];
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
                        t.parts = {};
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
        for (let part in this.bd.$.parts)
            this.parts[part] = this.bd.$.parts[part];
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
        return g('img', { src: this.ctx.img(this.i.bd) });
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
        fitIn: (css) => (bk.fill && (css.minHeight = `calc(100% - ${hs + fs}px)`)),
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
            }
            if (bk.ft) {
                part = ft;
                write(bk.ft, pag, -2, p);
            }
            if (bk.wm) {
                part = div("_ wm");
                write(bk.wm, pag, -4, p);
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
    let pags = container.childs().css({ display: "block" }, true).uncss(["padding"]), style = g('style', null, `body{background:#fff!important}body>*{display:none!important}@page{size:${size};margin:${space(theme.padding)}}`);
    g(document.body).add(pags);
    style.addTo(document.head);
    await cb();
    style.remove();
    container.add(pags.css({ padding: space(theme.padding) }).uncss(["display"]));
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
        strong: {
            b: true
        },
        white_strong: {
            b: true,
            cl: '#fff'
        },
        white: {
            cl: '#fff'
        },
        min: {
            fs: 6 * 1.3333333333333333
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
                pd: [1, 3],
            },
            col: {
                pd: [1, 3]
            },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJvb2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFjLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUNyRCxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBUSxHQUFHLEVBQWMsR0FBRyxFQUFPLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFPLENBQUMsRUFBdUIsTUFBTSxlQUFlLENBQUM7QUFDekgsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUd6QyxNQUFNLE9BQU8sR0FBRyxDQUFDLEdBQVcsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7QUEwQ3pELE1BQU0sU0FBUyxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBRTNCLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztBQTBJdEIsTUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssSUFBSSxPQUFPLElBQUksQ0FBQyxDQUFDLEtBQUssSUFBSSxNQUFNLEVBQUUsQ0FBQztBQUU3RixTQUFTLE9BQU8sQ0FBQyxHQUFlLEVBQUUsSUFBYTtJQUM3QyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNiLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0IsR0FBRyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixHQUFHLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVwQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN6RCxHQUFHLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25ELElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3pELEdBQUcsQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbEQ7O1FBQU0sR0FBRyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUVELE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUU3RCxNQUFNLFdBQVcsR0FBRyxDQUFDLE1BQWdCLEVBQUUsRUFBRSxDQUN2QyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsTUFBTSxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2SCxTQUFTLFFBQVEsQ0FBQyxLQUFlLEVBQUUsSUFBYSxFQUFFLEdBQWU7SUFDL0QsSUFBSSxLQUFLLEVBQUU7UUFDVCxJQUFJLEtBQUssQ0FBQyxNQUFNO1lBQ2QsSUFBSSxRQUFRLElBQUksS0FBSyxDQUFDLE1BQU07Z0JBQzFCLE1BQU0sQ0FBQyxHQUFHLEVBQWM7b0JBQ3RCLFNBQVMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbEMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNwQyxZQUFZLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3JDLFVBQVUsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDcEMsQ0FBQyxDQUFDOztnQkFDQSxHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFekMsSUFBSSxLQUFLLENBQUMsTUFBTTtZQUNkLEdBQUcsQ0FBQyxZQUFZLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUM7UUFFekMsSUFBSSxLQUFLLENBQUMsTUFBTTtZQUNkLEdBQUcsQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUU1QyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUU7WUFDZixJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQ3JCLEdBQUcsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3pELEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNoRCxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDekMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3RDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNuQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDakMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzdDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hELEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDN0Q7UUFFRCxJQUFJLEtBQUssQ0FBQyxJQUFJO1lBQ1osR0FBRyxDQUFDLElBQUksR0FBRyxRQUFRLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztLQUNyRztJQUNELElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2IsR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFBO0tBQy9DO1NBQU07UUFDTCxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QixHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDckIsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7S0FDOUI7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFDRCxTQUFTLFFBQVEsQ0FBQyxDQUFXLEVBQUUsR0FBZTtJQUM1QyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDUixHQUFHLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0tBQzFCO0lBQ0QsSUFBSSxDQUFDLENBQUMsRUFBRTtRQUNOLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRXJCLElBQUksQ0FBQyxDQUFDLEVBQUU7UUFDTixHQUFHLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFNUIsSUFBSSxDQUFDLENBQUMsRUFBRTtRQUNOLEdBQUcsQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVCLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUM7SUFFNUIsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBQ0QsU0FBUyxjQUFjLENBQUMsS0FBYSxFQUFFLEdBQWU7SUFDcEQsSUFBSSxLQUFLLENBQUMsTUFBTTtRQUNkLEdBQUcsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUdqRyxJQUFJLEtBQUssQ0FBQyxNQUFNO1FBQ2QsR0FBRyxDQUFDLFVBQVUsR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQztJQUV2QyxJQUFJLEtBQUssQ0FBQyxFQUFFO1FBQ1YsR0FBRyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDO0lBRTVCLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUM3QyxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUU7UUFDaEIsR0FBRyxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7UUFDMUIsR0FBRyxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO0tBQ25DO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBT0QsU0FBUyxTQUFTLENBQUMsS0FBZ0IsRUFBRSxHQUFlO0lBQ2xELElBQUksS0FBSyxDQUFDLEVBQUU7UUFDVixHQUFHLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUM7SUFFNUIsSUFBSSxLQUFLLENBQUMsRUFBRTtRQUNWLEdBQUcsQ0FBQyxRQUFRLEdBQUcsR0FBRyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUM7SUFFakMsSUFBSSxHQUFHLElBQUksS0FBSztRQUNkLEdBQUcsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7SUFFL0MsSUFBSSxHQUFHLElBQUksS0FBSztRQUNkLEdBQUcsQ0FBQyxTQUFT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Q0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUNELFNBQVM7UUFDUCxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBQ0QsSUFBSSxDQUFDLEdBQVEsSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBRTNDO0FBR0QsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFPLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQVVySSxNQUFNLENBQVcsU0FBUSxJQUFjO0lBQ3JDLEVBQUUsQ0FBQyxHQUFlO1FBQ2hCLElBQ0UsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQ1YsRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNqQixLQUFLLEdBQVEsRUFBRSxDQUFDO1FBQ2xCLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxFQUFFLEVBQUU7WUFDTixTQUFTLENBQUMsRUFBRSxFQUFFLEdB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