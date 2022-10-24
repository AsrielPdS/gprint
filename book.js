"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = exports.boxes = exports.print = exports.medias = exports.dblSheets = exports.sheets = exports.sheet = exports.render = exports.span = exports.spans = exports.write = exports.create = exports.cpu = exports.units = void 0;
const galho_1 = require("galho");
const util_js_1 = require("galho/util.js");
const scalar_js_1 = require("./scalar.js");
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
function cpu(fn, extraFn) {
    let funcs = {
        numbInFull: scalar_js_1.numbInFull,
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
        fmt: util_js_1.fmt,
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
    t: (({ is, bd }) => {
        let t = (0, galho_1.g)('span');
        is && t.css(styleText(is, {}));
        return bd ? t.text(bd) : t.html(galho_1.empty);
    }),
    e: (({ bd, is }, p, pag) => {
        let v = p.ctx.calc(bd, p, pag);
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
        throw "not implemented yet";
        let l = this.i.l, css = this._lCss || styleText(l, {}), s = (0, galho_1.g)('span', ['li']).css(css);
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
        return this.addBox((0, galho_1.div)(), index);
    }
    fitIn(css, ly) {
        if (ly.mg) {
            let [t, b] = (0, util_js_1.arr)(ly.mg);
            css.marginTop = t + "px";
            css.marginBottom = (0, util_js_1.def)(b, t) + "px";
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
            pagCount: 1
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
            rd: 5
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJvb2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQXFEO0FBQ3JELDJDQUF5SDtBQUN6SCwyQ0FBeUM7QUFHekMsTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFXLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBMEN6RCxNQUFNLFNBQVMsR0FBRyxNQUFNLEVBQUUsQ0FBQztBQUUzQixNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFzQnRCLElBQVksS0FNWDtBQU5ELFdBQVksS0FBSztJQUNmLDZDQUFjLENBQUE7SUFDZCw4Q0FBWSxDQUFBO0lBQ1osOEJBQU8sQ0FBQTtJQUNQLDhDQUFZLENBQUE7SUFDWiw2QkFBTSxDQUFBO0FBQ1IsQ0FBQyxFQU5XLEtBQUssR0FBTCxhQUFLLEtBQUwsYUFBSyxRQU1oQjtBQWdIRCxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLE9BQU8sSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLE1BQU0sRUFBRSxDQUFDO0FBRTdGLFNBQVMsT0FBTyxDQUFDLEdBQWUsRUFBRSxJQUFhO0lBQzdDLElBQUksSUFBQSxhQUFHLEVBQUMsSUFBSSxDQUFDLEVBQUU7UUFDYixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLEdBQUcsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0IsR0FBRyxDQUFDLFdBQVcs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