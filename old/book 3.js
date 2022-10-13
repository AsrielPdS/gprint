"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = exports.print = exports.medias = exports.css = exports.MBook = exports.SBook = exports.P = exports.boxes = exports.cpu = exports.$ = void 0;
const galho_1 = require("galho");
const util_js_1 = require("galho/util.js");
function hasProp(obj) {
    for (let _ in obj)
        if (_ != null)
            return true;
    return false;
}
const fall = (v) => v && hasProp(v) ? v : void 0;
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
function border(b) {
    return `${b.width || 1}px ${b.style || 'solid'} ${b.color || "#000"}`;
}
function borders(css, bord) {
    if ('length' in bord) {
        let b = bord[0];
        (b) && (css['border-top'] = border(bord[0]));
        (b = bord[1]) && (css['border-right'] = border(b));
        (b = bord[bord.length - 2]) && (css['border-bottom'] = border(b));
        (b = bord[bord.length - 1]) && (css['border-left'] = border(b));
    }
    else
        css.border = border(bord);
}
const space = (p) => p.map(p => p + 'px').join(' ');
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
const emptyDiv = (ly) => (0, galho_1.div)().css(ly).html(galho_1.empty);
function buildShadow(shadow) {
    return shadow.map(sh => `${sh.inset ? 'inset' : ''} ${sh.x}px ${sh.y}px ${sh.blur}px ${sh.spread}px ${sh.color}`).join(',');
}
function styleImg(style, css = {}) {
    if (style) {
        if (style.border)
            if ((0, util_js_1.isA)(style.border))
                (0, util_js_1.assign)(css, {
                    'border-top': border(style.border[0]),
                    'border-right': border(style.border[1]),
                    'border-bottom': border(style.border[2]),
                    'border-left': border(style.border[3]),
                });
            else
                css.border = border(style.border);
        if (style.radius)
            css['border-radius'] = `${style.radius}px`;
        if (style.shadow)
            css['box-shadow'] = buildShadow(style.shadow);
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
function styleBox(s, css = {}) {
    if (s.bg) {
        css.background = s.bg.dt;
    }
    if (s.bd)
        borders(css, s.bd);
    if (s.pd)
        css.padding = space(s.pd);
    if (s.mg)
        css.margin = space(s.mg);
    if (s.rd)
        css['border-radius'] = typeof s.rd == "number" ?
            `${s.rd}px` :
            s.rd.join('px ') + 'px';
    return css;
}
function styleParagraph(style, css) {
    css.margin = `${style.mg || 0}px 0`;
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
exports.$ = {};
function cpu(ctx) {
    let funcs = {
        index() { return this.dt?.[$i]; },
        set(key, value) { return this.dt[key] = value; },
        temp: (k, v) => (ctx.temp ||= {})[k] = (0, util_js_1.def)(v, ctx.temp[k]),
        delay: (data) => {
            let r = (0, galho_1.g)('span').html(galho_1.empty);
            (ctx.wait ||= []).push(() => r.replace(data()));
            return r;
        },
        pags() { return ctx.pagCount; },
        pag() { return this.p; },
    };
    return (v, dt, p) => exports.$.calc(v, {
        funcs: (name, args) => name in funcs ? (0, util_js_1.def)(funcs[name].call({ p, s: dt }, ...args), null) : void 0,
        vars(key, obj) {
            if (key == "@")
                return dt;
            let dt1 = dt;
            do {
                if (key in dt1)
                    return dt1[key];
            } while (dt1 = dt1[$p]);
            console.warn('not_found', { key: key, ctx: dt });
            return obj ? {} : null;
        }
    });
}
exports.cpu = cpu;
const spans = {
    t: {
        len(i) { return i.dt.length; },
        bold(i) {
            return i.is?.b || false;
        },
        view({ is, dt }) {
            let t = (0, galho_1.g)('span');
            is && t.css(styleText(is, {}));
            return t.html(dt);
        },
        isEmpty(i) { return !i.dt; },
        json(i) { i.is = fall(i.is); },
    },
    e: {
        view({ fmt, dt, is }, p, ctx) {
            let v = ctx.calc(dt, p);
            fmt && (v = ctx.fmt(v, fmt));
            if (v == null)
                return null;
            let t = (0, galho_1.g)('code', 0, v);
            is && t.css(styleText(is, {}));
            return t;
        },
        json(i) { i.is = fall(i.is); },
        isEmpty() { return false; },
    },
    img: {
        view({ width: w, height: h, dt, base, calc, is }, p, ctx) {
            let css = styleImg(is);
            if (base) {
                css[base] = '100%';
            }
            else {
                css.width = (w || 64) + 'px';
                css.height = (h || 64) + 'px';
            }
            if (calc) {
                let t = ctx.calc(dt, p);
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
                    src: ctx.img(dt)
                }).css(css);
        },
        isEmpty() { return false; },
        json(i) { i.is = fall(i.is); },
    }
};
const $i = Symbol(), $p = Symbol(), boxData = (me, ctx) => {
    let t = (ctx.cache ||= new Map()).get(me);
    if ((0, util_js_1.isU)(t)) {
        let p = me[$p], pDt = p ? boxData(p, ctx) : ctx.dt;
        if (me.sc != null) {
            let exp = me.sc + "";
            if (exp[0] == '=') {
                pDt = ctx.calc(exp.slice(1), p) || {};
            }
            else {
                if (exp[0] == '#') {
                    pDt = ctx.dt;
                    exp = exp.slice(1);
                }
                for (let part of exp.split('/'))
                    pDt = (part == '..' ? pDt[$p] : pDt[part]) || {};
            }
        }
        ctx.cache.set(me, t);
    }
    return t;
}, n = (e, p = box) => (0, util_js_1.assign)({}, p, e), parse = (v) => (0, util_js_1.isS)(v) ? { bd: v } : (0, util_js_1.isA)(v) ? { tp: "block", bd: v } : v, view = (i, ctx, pctx, p) => (!(i = parse(i)).vl || ctx.calc(i.vl, i)) && exports.boxes[i.tp].render(i, ctx, pctx, i[$p] = p), box = {
    json(i) {
        i.ly = fall(i.ly);
        i.is = fall(i.is);
    },
    view(i, ctx, pctx, p) {
        this.render(i, ctx, pctx, p);
    },
    toJSON() { },
    isEmpty: () => false,
}, parent = n({
    render(i, ctx, pctx, p) {
        return {
            css: (v) => {
                let box = exports.theme.box[i.s], txtStyle = exports.theme.p[i.is?.tx || (box && box.tx)];
                styleBox((0, util_js_1.assign)(v, box, i.is));
                if (txtStyle)
                    styleText(txtStyle, v);
            },
            new() {
                i.e = (0, galho_1.div)("_");
                i.hd && view(i.hd, ctx, this, i);
                i.ft && view(i.ft, ctx, this, i);
            },
            draw(check) {
                if (i.map) {
                    let dt = boxData(i, ctx), range = [], bd = parse(i.bd[0]), pag = ctx.pag;
                    dt.pags = { [pag]: range };
                    if ((0, util_js_1.l)(dt))
                        for (let j = 0; j < (0, util_js_1.l)(dt); j++) {
                            let item = dt[j];
                            item && (item[$i] = j);
                            range.push(item);
                            bd.sc = j;
                            view(bd, ctx, this, i);
                            if (ctx.pag != pag) {
                                range.pop();
                                dt.pags[pag = ctx.pag] = range = [item];
                            }
                        }
                    else
                        i.empty && view(i.empty, ctx, this, i);
                }
                else
                    for (let j of i.bd)
                        view(j, ctx, this, i);
            }
        };
    },
    append: (child, { hd, e }) => child[$i] >= 0 && hd ? e.place(1, child.e) : e.add(child.e),
    part(i, ctx, pctx, p) {
    },
    overflow(child, p) {
        if (child[$i] >= 0) {
            let result = this.p.overflow(this, pag);
            if (result && this.bb == 1) {
                this.transport(pag, pag + 1);
                this.p.append(this, pag + 1);
                return -1;
            }
            return result;
        }
        return 0;
    },
    transport(from, to) {
        let { hd, bd, ft } = this;
        super.transport(from, to);
        hd?.transport(from, to);
        ft?.transport(from, to);
        for (let i of bd)
            i.transport(from, to);
    },
    getTextTheme() { return txtTheme(this.is, this.s, this.p); },
    listItem(p) {
        let l = this.l, css = this._lCss || styleText(l, {}), s = (0, galho_1.g)('span', ['li'], exports.$.scalar(p.li, l.fmt)).css(css);
        if (true) {
            let items = this._lItems || (this._lItems = []);
            items.push({ s, p });
            s
                .props({ contentEditable: 'false', tabIndex: -1 })
                .on({
                click(e) { e.stopPropagation(); },
                focus() {
                    items.forEach(i => i.s.cls('on'));
                },
                blur() {
                    items.forEach(i => i.s.cls('on', false));
                }
            });
        }
        return s;
    },
    isEmpty() {
        let { hd, bd, ft } = this;
        for (let child of bd)
            if (!child.isEmpty())
                return false;
        return hd?.isEmpty() && ft?.isEmpty();
    },
    json(tp) {
        let { hd, bd, ft, map } = this;
        return (0, util_js_1.extend)(this.json(tp), {
            hd: hd?.toJSON(),
            bd: bd.map(child => child.toJSON()),
            ft: ft?.toJSON(), map: !!map
        });
    },
});
exports.boxes = {
    p: n({
        render(i, p, ctx) {
            return {
                css(v) {
                    let props = (0, util_js_1.assign)({}, is), th = exports.theme.p[s];
                    if (th) {
                        styleText(th, v);
                        (0, util_js_1.assign)(props, th);
                    }
                    styleParagraph(props, v);
                },
            };
            let { li, bd } = this, p = this.part(pag), items = [li ? this.p.listItem(this) : null];
            for (let i = 0, l = bd.length; i < l; i++) {
                let data = bd[i].view(pag);
                if (data) {
                    items.push(data);
                }
            }
            if (items.length)
                p.add(items);
            else
                p.html(galho_1.empty);
            return this.writeCheck(p, pag);
        },
        part(index) {
            let t = this.parts[index];
            if (!t) {
                t = this.parts[index] = this.addBox((0, galho_1.g)("p", "_"), index).css(this.css);
                this.p.append(this, index);
            }
            return t;
        },
        newSpan(span) {
            (0, util_js_1.isS)(span) && (span = { dt: span });
            let t = Reflect.construct(spans[span.tp || "t"], [span, this]);
            t.is ||= {};
            return t;
        },
        writeCheck(i, div, pag) {
            let overflow;
            while (overflow = p.overflow(i, pag)) {
                if (overflow == -1) {
                    pag++;
                }
                else if (!bd.length || overflow < 40) {
                    p.append(this, ++pag);
                }
                else {
                    let childs = div.childs(), newE = (0, galho_1.g)("p").css(this.css), i = childs.length - 1;
                    while (i >= 0) {
                        newE.prepend(childs[i]);
                        i--;
                        if (!p.overflow(this, pag))
                            break;
                    }
                    let lastE = childs[i + 1], last = bd[i + 1];
                    if (last.break) {
                        div.add(lastE);
                        let newSpan = lastE.cloneNode(), lastSpanText = lastE.firstChild, split = lastSpanText.textContent.split(' '), newSpanText = [];
                        do {
                            newSpanText.unshift(split.pop());
                            lastSpanText.textContent = split.join(' ');
                        } while (p.overflow(this, pag));
                        newSpan.add(newSpanText.join(" "));
                        newE.prepend(newSpan);
                    }
                    pag++;
                    this.addBox(div = newE, pag);
                    p.append(this, pag);
                }
            }
            return pag;
        },
        isEmpty({ bd }) {
            return true;
        },
    }),
    block: n({
        css(v) {
            super._css(v);
            let c = this.cols;
            if (c) {
                v['column-width'] = c.width;
                v['column-count'] = c.count;
                v['column-gap'] = c.gap + '%';
                if (c.rule)
                    v['column-rule'] = border(c.rule);
            }
        },
        fitIn(_, css) {
        },
    }, parent),
    col: n({
        css(i, v) {
            super._css(v);
            if (this.reverse)
                v['flex-direction'] = 'column-reverse';
            if (this.align)
                switch (this.align) {
                    case 'e':
                        v['justify-content'] = 'flex-end';
                        break;
                    case "s":
                        v['justify-content'] = 'flex-start';
                        break;
                    case "c":
                        v['justify-content'] = 'center';
                        break;
                    default:
                        v['justify-content'] = this.align;
                        break;
                }
        },
        fitIn(child, css) {
            let ly = child.ly;
            if (ly.sz)
                css['flex-grow'] = ly.sz;
            if (ly.min)
                css['min-height'] = ly.min + '%';
            if (ly.max)
                css['max-height'] = ly.max + '%';
            if (ly.lgn) {
                let al;
                switch (ly.lgn) {
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
                }
                css['align-self'] = al;
            }
            if (this.pad) {
                if (!child.id)
                    css['margin-top'] = (this.pad[0] || (this.pad[0] = 0)) + 'px';
                let id = child.id + 1;
                css['margin-bottom'] = (this.pad[id] || (this.pad[id] = 0)) + 'px';
            }
        },
    }, parent),
    row: n({
        append(child, index) {
            let part = this.parts[index];
            if (!part) {
                part = this.part(index);
                this.p.append(this, index);
            }
            part.add(child.part(index));
        },
        fitIn(child, css) {
            let l = child.ly;
            if (l.grow)
                css['flex-grow'] = l.grow;
            if (l.sz)
                css['width'] = `${l.sz}%`;
            if (this.pad) {
                if (!child.id)
                    css['margin-left'] = this.pad[0] + '%';
                let id = child.id + 1;
                css['margin-right'] = this.pad[id] + '%';
            }
        },
    }, parent),
    tb: n({
        fitIn() { },
        get style() {
            if (!this._style) {
                let th = exports.theme.tables;
                this._style = (0, util_js_1.assign)(th[this.s] || th[''] || {}, this.is);
            }
            return this._style;
        },
        css(i, v) {
            let { style, is } = this, txtStyle = exports.theme.p[is.tx || style && style.tx];
            styleBox(style);
            if (txtStyle)
                styleText(txtStyle, v);
        },
    }, parent),
    tr: n({
        _css(v) {
            let tb = this.tb, props = {}, tableStyle = tb.style, pS = this.id == -1 ?
                tableStyle.hd :
                this.id == -2 ?
                    tableStyle.ft :
                    tableStyle.dt, box = exports.theme.box[this.s], txtStyle = exports.theme.p[this.is.tx || (box && box.tx) || (pS && pS.tx)];
            styleBox((0, util_js_1.assign)(props, pS, box, this.is), v);
            if (txtStyle)
                styleText(txtStyle, v);
        },
        render(pag) {
            let { hd, bd, ft } = this, r = (0, galho_1.div)();
            this.body = hd || ft ? (0, galho_1.div)().addTo(r) : r;
            hd?.view(pag);
            for (let i = 0; i < bd.length; i++)
                pag = bd[i].view(pag);
            ft?.view(pag);
            return r;
        },
        append(child, pag) {
            (child.id >= 0 ? this.body : this.e).add(child.part(pag));
        },
        fitIn(child, css) {
            let l = child.ly, cols = this.tb.cols, id = child.id;
            if (id >= 0) {
                let start = getCellStart(id, this.bd);
                let w = cols[start].sz;
                if (l.span) {
                    for (let i = 1; i < l.span; i++)
                        w += cols[i + start].sz;
                }
                if (l.ml)
                    w -= l.ml;
                if (l.mr)
                    w -= l.mr;
                css['width'] = w + '%';
            }
            tableCellStyle(child, css, this.tb);
        },
        getTextTheme() { return txtTheme(this.is, this.s, this.p); },
        transport(from, to) {
            let { hd, bd, ft } = this;
            super.transport();
            hd?.transport(from, to);
            ft?.transport(from, to);
            for (let i of bd)
                i.transport(from, to);
        },
    }),
    img: n({
        css(v) {
            styleImg(this.is, v);
        },
        render() {
            return (0, galho_1.g)('img', { src: this.ctx.img(this.bd) });
        },
    }),
    np: n({
        css() { },
        view(pag) {
            this.valid(pag) && pag++;
            this.e = (0, galho_1.div)();
            this.p.append(this, this.start = pag);
            return this.start;
        }
    }),
    hr: n({
        _css(v) {
            v[this.o == "v" ?
                'border-left' :
                'border-bottom'] = border((0, util_js_1.assign)({}, exports.theme.hr[this.s], this.is));
        },
        render() { return (0, galho_1.g)("hr"); },
    }),
    ph: n({
        valid(pag) {
            let { ly, p, src, id, bb } = this, b = p.ctx.calc(src, this);
            if (b)
                (this.#bd = createBox((0, util_js_1.assign)(b, { ly }), id, p, bb))._css(this.css);
            else
                this.#bd = null;
            return b && super.valid(pag);
        },
        render(pag) {
            return this.#bd.view(pag);
        },
        part(pag) {
            return this.#bd?.part(pag) || this.parts[pag];
        },
        transport(from, to) {
            this.#bd?.transport(from, to);
            super.transport(from, to);
            super.transport(from, to);
        }
    }),
    graphic: n({
        css() { },
        render(pag) {
            return (0, galho_1.div)();
        }
    }),
};
class P extends MBox {
    bd;
    li;
}
exports.P = P;
class Parent extends MBox {
    ranges;
    mode;
    hd;
    bd;
    ft;
    empty;
    map;
    _lCss;
    _lItems;
    l;
    clear() {
        let { hd, bd, ft } = this;
        for (let i of bd)
            i.clear();
        hd?.clear();
        ft?.clear();
        super.clear();
    }
}
const txtTheme = (is, s, p) => is.tx ||
    (s ? exports.theme.box[s].tx : null) ||
    p.getTextTheme();
class Tr extends SBox {
    hd;
    bd;
    ft;
    tb;
    col;
    _i(i, bb) {
        super._i(i, bb);
        while (!((this.tb = this.p) instanceof Tb))
            ;
        (0, util_js_1.extend)(this, {
            hd: i.hd && createBox(i.hd, -1, this),
            bd: i.bd?.map((e, i) => createBox(e, i, this)),
            ft: i.ft && createBox(i.ft, -2, this),
        });
    }
    body;
    setEditMode() {
    }
    toJSON() { return this.json("tr"); }
    static clone(box) {
        let temp = MBox.clone(box);
        return temp;
    }
}
function tableCellStyle(child, css, table) {
    let l = child.ly, pst = table.style, m = "margin-";
    if (pst.col && child.id >= 0)
        styleBox(pst.col, css);
    if (l.ml)
        css[m + 'left'] = l.ml + '%';
    if (l.mt)
        css[m + 'top'] = l.mt + '%';
    if (l.mr)
        css[m + 'right'] = l.mr + '%';
    if (l.mb)
        css[m + 'bottom'] = l.mb + '%';
}
function getCellStart(index, dt) {
    let start = index;
    for (let i = 0; i < index; i++)
        if (dt[i].ly.span)
            start += dt[i].ly.span - 1;
    return start;
}
class Ph extends MBox {
    #bd;
    parts = null;
    src;
    _i(i, bb) {
        super._i(i, bb);
        this.src = i.bd;
    }
    clearStyle() {
        throw new Error("Method not implemented.");
    }
    _css() { }
    data;
    clear() {
        this.#bd?.clear();
        super.clear();
    }
    toJSON() {
        return null;
    }
}
class SBook {
    ctx;
    bd;
    constructor(bd) {
        this.ctx = this;
        this.set(bd);
    }
    set(bd) {
        return this.bd = bd instanceof Box ? bd :
            createBox((0, util_js_1.isA)(bd) ? { tp: "block", bd } : bd, 0, this);
    }
    getTextTheme() { }
    fitIn() { }
    overflow() { return 0; }
    e;
    append(child) { this.e = child.part(0); }
    bb;
    view() {
        this.bd.view(0);
        return this.e;
    }
    fmt(value, exp) {
        return exports.$.fmt(value, exp, {
            currency: this.dt.currency,
            currencySymbol: this.dt.currencySymbol || false,
        });
    }
    pagCount;
}
exports.SBook = SBook;
class MBook {
    bb;
    hdSz;
    ftSz;
    pad;
    hd;
    bd;
    ft;
    wm;
    top;
    bottom;
    rsc;
    constructor({ hdSz, ftSz, pad, top, bottom, hd, ft, bd, rscs: rsc }) {
        (0, util_js_1.extend)(this, {
            hdSz, ftSz, pad, rsc,
            top: createBox(top, -3, this, 0),
            hd: createBox(hd, -1, this, 0),
            bd: createBox(bd, 0, this),
            bottom: createBox(bottom, -4, this, 0),
            ft: createBox(ft, -2, this, 0),
        });
    }
    getTextTheme() { }
    fitIn(child, css) {
        if (child.ly.fill)
            css.minHeight = "100%";
        return (0, util_js_1.assign)(css, { marginTop: 0, marginBottom: 0 });
    }
    bdE;
    overflow(e, pag) {
        let cRect = e.part(pag).rect(), pRect = this.bdE.rect(), dif = Math.floor(cRect.bottom) - Math.ceil(pRect.bottom);
        return Math.max(dif, 0);
    }
    append(e, pag) {
        if (e.id == 0) {
            this.pagCount = pag;
            let { hdSz, ftSz, pad, top, h, hd, bottom, ft, wm } = this, hdE = (0, galho_1.g)('header').css("height", `${hdSz || exports.theme.hdSz}px`), ftE = (0, galho_1.g)('footer').css("height", `${ftSz || exports.theme.ftSz}px`), bdE = this.bdE = (0, galho_1.g)('section'), content = this.pag = (0, galho_1.g)('article', 0, hdE)
                .addTo(this.container)
                .css({
                background: '#fff',
                width: `${this.w}px`,
                height: `${this.h}px`,
                padding: space(pad ||= exports.theme.padding),
                whiteSpace: 'pre-wrap'
            });
            if (top) {
                top.view(pag);
                h -= top.part(pag).e.offsetHeight;
            }
            content.add(bdE);
            if (bottom) {
                bottom.view(pag);
                h -= bottom.part(pag).e.offsetHeight;
            }
            if (hd) {
                this.pag = hdE;
                hd.view(pag);
            }
            content.add(ftE);
            if (ft) {
                this.pag = ftE;
                ft.view(pag);
            }
            h -= (hdSz || exports.theme.hdSz) + (ftSz || exports.theme.ftSz) + pad[0] * 2;
            if (h <= 0)
                throw "error";
            if (wm) {
                this.pag = (0, galho_1.div)("_ wm");
                wm.view(pag);
            }
            bdE.css('height', h + 'px');
            bdE.add(e.part(pag));
        }
        else
            this.pag.add(e.part(pag));
    }
    container;
    w;
    h;
    ctx;
    dt;
    pag;
    pagCount;
    view(ctx, container, w, h) {
        (0, util_js_1.assign)(this, { ctx, container, w, h, dt: ctx.dt });
        this.bd.view(0);
        return ctx.wait ? Promise.all(ctx.wait).then(() => container) : container;
    }
    clear() {
        (0, util_js_1.assign)(this, { bdE: null, container: null, ctx: null, dt: null, pag: null });
    }
}
exports.MBook = MBook;
function render(box) {
    if (!box)
        return null;
    if ((0, util_js_1.isS)(box))
        return (0, galho_1.g)("p", 0, box);
    return new SBook(box).view();
}
const sheet = (bk, w) => (0, galho_1.g)('article', "_ sheet", bk.view()).css({
    background: "#fff",
    width: `${w}px`,
    marginTop: `40px`,
    padding: space([0, 6]),
    whiteSpace: "pre-wrap"
});
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
const css = () => ({
    "._.sheet": {
        overflow: "hidden",
        position: "relative",
        breakInside: "avoid",
        cursor: "text",
        color: "#000",
        userSelect: "text",
        ":not(:first-child)": { breakBefore: "page" },
    },
    "._.wm": {
        userSelect: "none",
        position: "absolute",
        fontSize: "120pt",
        margin: "auto",
        transform: "translate(-50%, -50%)rotate(-45deg)",
        top: "50%",
        left: "50%",
        whiteSpace: "nowrap",
        opacity: 0.3,
        "&.v": { transform: "translate(-50%, -50%)rotate(-65deg)" },
        "&.h": { transform: "translate(-50%, -50%)rotate(-30deg)" },
    },
    "@media screen": {},
    "@media print": {
        ":not(._.sheet)": {
            display: "none"
        },
    }
});
exports.css = css;
exports.medias = {
    A4: [210 * 3.7795275590551176, 297 * 3.7795275590551176],
    A5: [148 * 3.7795275590551176, 210 * 3.7795275590551176],
    A3: [297 * 3.7795275590551176, 420 * 3.7795275590551176],
};
async function print(container, o, media, cb) {
    let pags = container.childs(), style = (0, galho_1.g)('style', null, `@page{size:${media} ${(o == "h" ? 'landscape' : 'portrait')};}`);
    (0, galho_1.g)(document.body).add(pags);
    style.addTo(document.head);
    await cb();
    style.remove();
    container.add(pags);
}
exports.print = print;
exports.theme = {
    padding: [4 * 3.7795275590551176, 7 * 3.7795275590551176],
    hdSz: 12 * 3.7795275590551176,
    ftSz: 12 * 3.7795275590551176,
    text: {
        ff: 'Arial',
        cl: "#000",
        b: false,
        i: false,
        lh: 1.2,
        al: "s",
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
            bd: {
                style: 'solid',
                color: "#000",
                width: 1
            },
            pd: [7 * 1.3333333333333333, 5 * 1.3333333333333333],
            mg: [4 * 1.3333333333333333, 2 * 1.3333333333333333],
            rd: 2
        },
        filled: {
            pd: [3 * 1.3333333333333333, 2 * 1.3333333333333333],
            mg: [2 * 1.3333333333333333, 1 * 1.3333333333333333],
            rd: 1,
            tx: 'white',
            bg: {
                tp: 'color',
                dt: "#444"
            }
        },
        blank: {
            pd: [7 * 1.3333333333333333, 5 * 1.3333333333333333],
            mg: [4 * 1.3333333333333333, 2 * 1.3333333333333333],
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
            mg: [2 * 1.3333333333333333, 1 * 1.3333333333333333],
            hd: {
                tx: 'white_strong',
                bg: { dt: "#444" },
                bd: [null, null, {
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
                bd: [{
                        color: "#666"
                    }, null, null, null],
            },
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vayAzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYm9vayAzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUF5QztBQUV6QywyQ0FBaUk7QUFFakksU0FBUyxPQUFPLENBQUMsR0FBVztJQUMxQixLQUFLLElBQUksQ0FBQyxJQUFJLEdBQUc7UUFDZixJQUFJLENBQUMsSUFBSSxJQUFJO1lBQUUsT0FBTyxJQUFJLENBQUM7SUFDN0IsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBQ0QsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7QUF3SnpELFNBQVMsS0FBSyxDQUFDLENBQVE7SUFDckIsUUFBUSxDQUFDLEVBQUU7UUFDVCxLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDO1FBQ3ZCLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxPQUFPLENBQUM7UUFDekIsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLFFBQVEsQ0FBQztRQUMxQixLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sU0FBUyxDQUFDO1FBQzNCLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxNQUFNLENBQUM7UUFDeEIsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLE9BQU8sQ0FBQztLQUMxQjtJQUNELE9BQU8sQ0FBQyxDQUFDO0FBQ1gsQ0FBQztBQXVCRCxTQUFTLE1BQU0sQ0FBQyxDQUFTO0lBRXZCLE9BQU8sR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLE9BQU8sSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLE1BQU0sRUFBRSxDQUFDO0FBQ3hFLENBQUM7QUFFRCxTQUFTLE9BQU8sQ0FBQyxHQUFRLEVBQUUsSUFBYTtJQUN0QyxJ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LENBQUMsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUVwRyxHQUFHLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQzNCLEdBQUcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7S0FDN0I7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFDRCxTQUFTLFFBQVEsQ0FBQyxDQUFXLEVBQUUsTUFBVyxFQUFFO0lBQzFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUNSLEdBQUcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7S0FDMUI7SUFDRCxJQUFJLENBQUMsQ0FBQyxFQUFFO1FBQ04sT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFckIsSUFBSSxDQUFDLENBQUMsRUFBRTtRQUNOLEdBQUcsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUU1QixJQUFJLENBQUMsQ0FBQyxFQUFFO1FBQ04sR0FBRyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRTNCLElBQUksQ0FBQyxDQUFDLEVBQUU7UUFDTixHQUFHLENBQUMsZUFBZSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLFFBQVEsQ0FBQyxDQUFDO1lBQzlDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUM7SUFFNUIsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDO0FBQ0QsU0FBUyxjQUFjLENBQUMsS0FBYSxFQUFFLEdBQWU7SUFDcEQsR0FBRyxDQUFDLE1BQU0sR0FB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QztTQUNyRSxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0QsSUFBSSxDQUFJO0lBRVIsV0FBVztJQUVYLENBQUM7SUFDRCxNQUFNLEtBQUssT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBVyxDQUFDLENBQUMsQ0FBQztJQUU5QyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQVE7UUFDbkIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUUzQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7Q0FDRjtBQUNELFNBQVMsY0FBYyxDQUFDLEtBQWdCLEVBQUUsR0FBUSxFQUFFLEtBQVM7SUFDM0QsSUFDRSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFDWixHQUFHLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRW5DLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUM7UUFDMUIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFekIsSUFBSSxDQUFDLENBQUMsRUFBRTtRQUNOLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7SUFDL0IsSUFBSSxDQUFDLENBQUMsRUFBRTtRQUNOLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7SUFDOUIsSUFBSSxDQUFDLENBQUMsRUFBRTtRQUNOLEdBQUcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7SUFDaEMsSUFBSSxDQUFDLENBQUMsRUFBRTtRQUNOLEdBQUcsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7QUFDbkMsQ0FBQztBQUVELFNBQVMs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