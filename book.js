"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = exports.boxes = exports.print = exports.medias = exports.dblSheets = exports.sheets = exports.sheet = exports.render = exports.span = exports.spans = exports.write = exports.create = exports.cpu = exports.$ = exports.units = void 0;
const galho_1 = require("galho");
const util_js_1 = require("galho/util.js");
const hasProp = (obj) => Object.keys(obj).length;
const $mapIndex = Symbol();
const minBoxSize = 40;
var units;
(function (units) {
    units[units["cm"] = 37.79527559055118] = "cm";
    units[units["mm"] = 3.7795275590551176] = "mm";
    units[units["in"] = 96] = "in";
    units[units["pt"] = 1.3333333333333333] = "pt";
    units[units["px"] = 1] = "px";
})(units = exports.units || (exports.units = {}));
const border = (b) => `${b.width || 1}px ${b.style || 'solid'} ${b.color || "#000"}`;
function borders(css, bord) {
    if ((0, util_js_1.isA)(bord)) {
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
function styleImg(style, css) {
    if (style) {
        if (style.border)
            if ('length' in style.border)
                Object.assign(css, {
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
        css.width = style.w + 'px';
        css.height = style.h + 'px';
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
        css.borderRadius = (0, util_js_1.isN)(s.rd) ?
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
exports.$ = {};
function cpu(fn, extraFn) {
    let funcs = {
        id() { return this.s.id; },
        set(key, value) { return this.s.dt[key] = value; },
        temp(k, v) { return (this.s.ctx.temp ||= {})[k] = (0, util_js_1.def)(v, this.s.ctx.temp[k]); },
        delay(data) {
            let r = (0, galho_1.g)('span').html(galho_1.empty);
            (this.s.ctx.wait ||= []).push(() => r.replace(data()));
            return r;
        },
        pags() { return this.s.ctx.pagCount; },
        pag() { return this.p; },
        ...extraFn
    };
    return (v, s, p) => fn(v, {
        funcs: (key, args) => key in funcs ? (0, util_js_1.def)(funcs[key].call({ p, s }, ...args), null) : void 0,
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
exports.cpu = cpu;
const create = (i, p, id) => Reflect.construct(exports.boxes[i.tp || 'p'], [i, p, id]);
exports.create = create;
function write(box, pag, id, parent) {
    if ((0, util_js_1.isS)(box)) {
        box = { bd: box };
    }
    return (box.$ ? (box.$.id = id, box.$) : (0, exports.create)(box, parent, id)).view(pag);
}
exports.write = write;
exports.spans = {
    t: (({ is, bd: dt }) => {
        let t = (0, galho_1.g)('span');
        is && t.css(styleText(is, {}));
        return dt ? t.text(dt) : t.html(galho_1.empty);
    }),
    e: (({ fmt, bd: dt, is }, p, pag) => {
        let v = p.ctx.calc(dt, p, pag);
        fmt && (v = p.ctx.fmt(v, fmt));
        if (v || v === 0) {
            let t = (0, galho_1.g)('code', 0, v);
            is && t.css(styleText(is, {}));
            return t;
        }
    }),
    img: (({ width: w, height: h, bd: dt, base, calc, is }, p, pag) => {
        let css = styleImg(is, {});
        if (base) {
            css[base] = '100%';
        }
        else {
            css.width = (w || 64) + 'px';
            css.height = (h || 64) + 'px';
        }
        if (calc) {
            let t = p.ctx.calc(dt, p, pag);
            if ((0, util_js_1.isS)(t))
                return (0, galho_1.g)('img', { src: t }).css(css);
            else {
                t = (0, galho_1.g)(t);
                if (t.valid)
                    return t.css(css);
                return null;
            }
        }
        else
            return (0, galho_1.g)('img', {
                src: p.ctx.img(dt)
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
const span = (v) => v ? (0, util_js_1.arr)(v).map(v => (0, util_js_1.isS)(v) ? v[0] == '=' ? { tp: "e", bd: v.slice(1) } : { bd: v } : v) : [];
exports.span = span;
class P extends MBox {
    ss(css) {
        let i = this.i, th = exports.theme.p[i.s], props = {};
        css.margin = 0;
        if (th) {
            styleText(th, css);
            (0, util_js_1.assign)(props, th);
        }
        i.is && (0, util_js_1.assign)(props, i.is);
        styleParagraph(props, css);
    }
    data(pag) {
        let i = this.i, p = this.addBox((0, galho_1.g)(this.p.pTag || "p"), pag), items = [i.li ? this.p.listItem(i) : null];
        for (let j of (0, exports.span)(i.bd)) {
            let data = exports.spans[j.tp || 't'](j, this, pag);
            if (data) {
                items.push(data);
            }
        }
        if (items.length)
            p.add(items);
        else
            p.html(galho_1.empty);
        this.p.append(this, pag);
        return this.check(p, pag);
    }
    check(e, pag) {
        let i = this.i, p = this.p, o, bd = (0, exports.span)(i.bd);
        while (o = p.overflow(i, pag)) {
            if (o == -1)
                pag++;
            else if (!(0, util_js_1.l)(bd) || o < 40) {
                p.append(this, ++pag);
            }
            else {
                let childs = e.childs(), newE = (0, galho_1.g)("p"), j = childs.length - 1;
                while (j >= 0) {
                    newE.prepend(childs[j]);
                    j--;
                    if (!p.overflow(i, pag))
                        break;
                }
                let last = childs.e(j + 1);
                if ((0, util_js_1.l)(last.text()) > 2) {
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
const bparse = (v, k) => (0, util_js_1.isA)(v[k]) ? v[k] = { tp: "d", bd: v[k] } : v[k];
class Parent extends MBox {
    ss(v) {
        let i = this.i, box = exports.theme.box[i.s], txtStyle = exports.theme.p[i.is?.tx || box && box.tx];
        styleBox({ ...box, ...i.is }, v);
        txtStyle && styleText(txtStyle, v);
    }
    data(pag) {
        let { bd, map, empty } = this.i;
        if (map) {
            let dt = this.dt, range = [], t = (0, exports.create)(bd[0], this);
            console.log(this);
            dt.pd = { [pag]: range };
            if ((0, util_js_1.l)(dt))
                for (let i = 0; i < (0, util_js_1.l)(dt); i++) {
                    let row = dt[i];
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
            else if (empty)
                pag = write(empty, pag, 0, this);
        }
        else
            for (let i = 0; i < (0, util_js_1.l)(bd); i++)
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
        if ((0, util_js_1.isN)(child.$.id) && !i.ub) {
            return true;
        }
        return false;
    }
    _lCss;
    _lItems;
    listItem(p) {
        let l = this.i.l, css = this._lCss || styleText(l, {}), s = (0, galho_1.g)('span', ['li'], exports.$.scalar(p.li, l.fmt)).css(css);
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
}
class Div extends Parent {
    ss(css) {
        let md = this.i;
        super.ss(css);
        if (md.cols) {
            let c = md.cols;
            css.columnWidth = c.width + "px";
            css.columnCount = c.count;
            css.columnGap = c.gap + '%';
            if (c.rule)
                css.columnRule = border(c.rule);
        }
    }
    createPart(index) {
        return this.addBox((0, galho_1.div)(), index);
    }
    fitIn() {
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
        let [sz, g, s] = (0, util_js_1.arr)(ly.sz);
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
        let [t, b] = (0, util_js_1.arr)(ly.mg);
        b = (0, util_js_1.def)(b, t);
        css[`margin${v0}`] = t === "" ? "auto" : t + "px";
        css[`margin${v1}`] = b === "" ? "auto" : b + "px";
    }
}
class Col extends Parent {
    ss(v) {
        super.ss(v);
        (0, util_js_1.assign)(v, {
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
        return this.addBox((0, galho_1.div)(), pag);
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
        (0, util_js_1.assign)(css, {
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
    createPart(pag) {
        return this.addBox((0, galho_1.div)(), pag);
    }
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
            let i = this.i, th = exports.theme.tables;
            this._style = (0, util_js_1.assign)(th[i.s] || th[''] || {}, i.is);
        }
        return this._style;
    }
    createPart(pag) {
        return this.addBox((0, galho_1.g)("table"), pag);
    }
    fitIn() { }
}
const cs = (c) => (0, util_js_1.isN)(c) ? c : c.sz;
class Tr extends SBox {
    ss(v) {
        let i = this.i, props = {}, tableStyle = this.p.style, pS = i.$.id == -1 ?
            tableStyle.hd :
            i.$.id == -2 ?
                tableStyle.ft :
                tableStyle.bd, box = exports.theme.box[i.s], txtStyle = exports.theme.p[i.is?.tx || (box && box.tx) || (pS && pS.tx)];
        styleBox((0, util_js_1.assign)(props, pS, box, i.is), v);
        txtStyle && styleText(txtStyle, v);
    }
    data(pag) {
        this.e = (0, galho_1.g)("tr");
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
        return this.addBox((0, galho_1.div)(0, [(0, galho_1.div)(), (0, galho_1.div)(), (0, galho_1.div)()]), pag);
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
        return (0, galho_1.div)();
    }
}
class PH extends MBox {
    ss() { }
    bd;
    valid(pag) {
        let { i, ctx } = this, bd = ctx.calc(i.bd, this);
        (0, util_js_1.isS)(bd) && (bd = { bd });
        bd && (0, util_js_1.assign)(bd, { ly: i.ly });
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
}
class Hr extends SBox {
    ss(v) {
        let { o, s, is } = this.i;
        v.border = "none";
        v[o == "v" ? "borderLeft" : "borderTop"] = border({ ...exports.theme.hr[s], ...is });
    }
    data(pag) { return (0, galho_1.g)('hr'); }
}
class NP extends SBox {
    ss() { }
    view(pag) {
        this.valid(pag) && pag++;
        this.e = (0, galho_1.div)();
        this.p.append(this, this.start = pag);
        return this.start;
    }
}
class ImgBox extends SBox {
    ss(v) {
        this.i.is && styleImg(this.i.is, v);
    }
    data() {
        return (0, galho_1.g)('img', { src: this.ctx.img(this.i.bd) });
    }
}
function render(bd) {
    if (!bd)
        return null;
    if ((0, util_js_1.isS)(bd))
        return (0, galho_1.g)("p", 0, bd);
    let r = galho_1.S.empty, p = {
        ctx: {
            fmt(value, exp) {
                return exports.$.fmt(value, exp, {
                    currency: this.dt.currency,
                    currencySymbol: this.dt.currencySymbol || false,
                });
            }, pagCount: 1
        },
        overflow: () => 0,
        append: (child) => r = child.part(0)
    };
    write(bparse({ bd }, "bd"), 0, 0, p);
    return r;
}
exports.render = render;
const sheet = (bd, w) => (0, galho_1.g)('article', "_ sheet", render(bd)).css({
    width: `${w}px`,
    marginTop: `40px`,
    padding: space([0, 6]),
    ...styleText(exports.theme.text, {})
});
exports.sheet = sheet;
function sheets(ctx, container, bk, w, h) {
    let height, hs = bk.hdSz || exports.theme.hdSize, fs = bk.ftSz || exports.theme.ftSize;
    write(bparse(bk, "bd"), 1, 0, {
        ctx,
        dt: ctx.dt,
        fitIn: (css) => (bk.fill && (css.minHeight = `calc(100% - ${hs + fs}px)`)),
        overflow: (child, pag) => Math.max(Math.floor(child.$.part(pag).e.offsetHeight) - height, 0),
        append(ch, pag) {
            ctx.pagCount = pag;
            let pad = exports.theme.padding, hd = (0, galho_1.g)('header').css("height", `${hs}px`), ft = (0, galho_1.g)('footer').css("height", `${fs}px`), part, p = {
                ctx,
                dt: ctx.dt,
                overflow: () => 0,
                append(ch) { part.add(ch.part(pag)); }
            };
            height = (0, galho_1.g)("article", "_ sheet", [hd, ch.part(pag), ft])
                .addTo(container)
                .css({
                background: "#fff",
                width: `${w}px`,
                height: `${h}px`,
                padding: space(pad),
                whiteSpace: 'pre-wrap',
                ...styleText(exports.theme.text, {})
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
                part = (0, galho_1.div)("_ wm");
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
exports.sheets = sheets;
function clear({ hd, bd, ft }) {
    hd?.$.clear();
    bd.$.clear();
    ft?.$.clear();
}
function dblSheets(container, w) {
    let t = container.childs().remove();
    for (let i = 0; i < t.length; i += 2) {
        let t2 = t.slice(i, i + 2);
        t2.splice(1, 0, (0, galho_1.g)('hr').css({
            borderLeft: '1px dashed #AAA',
            margin: 0
        }));
        container.add((0, galho_1.div)("_ sheet", t2).css({
            width: (w * 2) + "px",
            display: 'flex',
            flexDirection: 'row'
        }));
    }
    return container;
}
exports.dblSheets = dblSheets;
exports.medias = {
    A4: [210 * units.mm, 297 * units.mm],
    A5: [148 * units.mm, 210 * units.mm],
    A3: [297 * units.mm, 420 * units.mm],
};
async function print(container, o, media, cb) {
    let pags = container.childs().css({ display: "block" }, true).uncss(["padding"]), style = (0, galho_1.g)('style', null, `body{background:#fff!important}body>*{display:none!important}@page{size:${media} ${(o == "h" ? 'landscape' : 'portrait')};margin:${space(exports.theme.padding)}}`);
    (0, galho_1.g)(document.body).add(pags);
    style.addTo(document.head);
    await cb();
    style.remove();
    container.add(pags.css({ padding: space(exports.theme.padding) }).uncss(["display"]));
}
exports.print = print;
exports.boxes = {
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
exports.theme = {
    padding: [7 * units.mm, 10 * units.mm],
    hdSize: 12 * units.mm,
    ftSize: 12 * units.mm,
    text: {
        ff: 'Arial',
        cl: "#000",
        b: false,
        i: false,
        lh: 1.2,
        al: "start",
        fs: 9 * units.pt
    },
    p: {
        h1: {
            fs: 11 * units.pt,
            b: true
        },
        h2: {
            fs: 10 * units.pt,
        },
        h3: {
            fs: 9 * units.pt,
        },
        h4: {
            fs: 9 * units.pt,
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
            fs: 6 * units.pt
        }
    },
    box: {
        box: {
            br: {
                style: 'solid',
                color: "#000",
                width: 1
            },
            pd: [7 * units.pt, 5 * units.pt],
            rd: 2
        },
        filled: {
            pd: [3 * units.pt, 2 * units.pt],
            rd: 1,
            tx: 'white',
            bg: {
                tp: 'color',
                dt: "#444"
            }
        },
        blank: {
            pd: [7 * units.pt, 5 * units.pt],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJvb2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQXlDO0FBRXpDLDJDQUFvSDtBQUdwSCxNQUFNLE9BQU8sR0FBRyxDQUFDLEdBQVcsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7QUEyQ3pELE1BQU0sU0FBUyxHQUFHLE1BQU0sRUFBRSxDQUFDO0FBRTNCLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztBQXNCdEIsSUFBWSxLQU1YO0FBTkQsV0FBWSxLQUFLO0lBQ2YsNkNBQWMsQ0FBQTtJQUNkLDhDQUFZLENBQUE7SUFDWiw4QkFBTyxDQUFBO0lBQ1AsOENBQVksQ0FBQTtJQUNaLDZCQUFNLENBQUE7QUFDUixDQUFDLEVBTlcsS0FBSyxHQUFMLGFBQUssS0FBTCxhQUFLLFFBTWhCO0FBa0hELE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQyxLQUFLLElBQUksTUFBTSxFQUFFLENBQUM7QUFFN0YsU0FBUyxPQUFPLENBQUMsR0FBZSxFQUFFLElBQWE7SUFDN0MsSUFBSSxJQUFBLGFBQUcsRUFBQyxJQUFJLENBQUMsRUFBRTtRQUNiLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0IsR0FBRyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixHQUFHLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FB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