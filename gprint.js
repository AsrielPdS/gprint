import { div, empty, g, S } from "galho";
import { arr, assign, def, isA, isN, isS, l } from "galho/util.js";
import { numbInFull } from "./scalar.js";
function hasProp(obj) {
    return Object.keys(obj).length;
}
const $mapIndex = Symbol();
const minBoxSize = 40;
/* ************************************************************** */
/* ***************************METHODS**************************** */
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
    //paragraph
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
//existe 6 styles do tipo header
//e 6 do tipo paragrafo que definim informação relacionadas a formatação do texto
//tem inline style mas so para algumas propiedades(line,bold,italic,super,sub)
//os table head não tenhem inline style e so podem ser de algum dos 6 tipos de header style
//table cell não tem inline style tambem e so podem ser de um paragraph style
//estilos do documentos (assign:border,padding,round,filter) tambem ficam nos styles globas mas tambem podem estar inlines
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
        //while (!parent.dt)
        //    parent = parent.p;
        //..
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
            //data[$parent] = parent.dt;
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
/** central processor unit */
export function cpu(fn, extraFn) {
    let funcs = {
        numbInFull,
        id() { return this.s.dt[$mapIndex]; },
        set(key, value) { return this.s.dt[key] = value; },
        get(src, field) { return src[field]; },
        //set and get data to temporary storage
        temp(k, v) { return (this.s.ctx.temp ||= {})[k] = def(v, this.s.ctx.temp[k]); },
        delay(data) {
            let r = g("span").html(empty);
            (this.s.ctx.wait ||= []).push(() => r.replace(data()));
            return r;
        },
        pags() { return this.s.ctx.pagCount; },
        pag() { return this.p; },
        sum(v, fn = v => v) { return v.reduce((p, c) => p + fn(c), 0); },
        ...extraFn
        //exchange(currency: str) {
        //  if (!currency)
        //    currency = (<any>this.s.ctx)._fOpts.currency;
        //  return scalar.currencies().byKey(currency, 'code').value;
        //},
        //currency() {
        //  return (<any>scp.ctx)._fOpts.currency;
        //}
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
            // @if DEBUG
            console.warn('not_found', { key: key, ctx: s });
            // @endif
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
        // fmt && (v = p.ctx.fmt(v, fmt));
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
    /**@deprecated provavelmento so é util para o edit */
    start;
    /**@deprecated provavelmento so é util para o edit */
    end;
    //id: int;
    _d;
    get dt() {
        let { i, p, start } = this;
        return this._d ||= getCtx(i.sc, p, start);
    }
    ctx;
    p;
    /**
     * @param i interface
     * @param p parent
     * @param id
     */
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
// box[0] == '=' ? [{ tp: "e", bd: box.slice(1) }] : 
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
                //if (this.edit)
                //  data.prop('$', dtModel);
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
            if (o == -1 /* OFTp.jump */)
                pag++;
            //se so sobrou um pouco de espaço nesta pagina
            else if (!l(bd) || o < 40) {
                p.append(this, ++pag);
            }
            else {
                let childs = e.childs(), newE = g("p"), j = childs.length - 1;
                while (j >= 0) {
                    newE.prepend(childs[j]);
                    //usar aqui para que quando fazer o break diminua 
                    j--;
                    if (!p.overflow(i, pag))
                        break;
                }
                let last = childs.e(j + 1);
                if (l(last.text()) > 2) {
                    e.add(last);
                    // if (p.overflow(i, pag)) {
                    let newSpan = last.clone(), lastSpanText = last.e.firstChild, split = lastSpanText.textContent.split(' '), newSpanText = [];
                    do {
                        newSpanText.unshift(split.pop());
                        lastSpanText.textContent = split.join(' '); // lastSpanText.textContent.substring(0, lastSpanText.textContent.lastIndexOf(' '));
                    } while (p.overflow(i, pag));
                    newSpan.add(newSpanText.join(" "));
                    newE.prepend(newSpan);
                    // }
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
    //private _ctx: unk;
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
                pag = write(empty, pag, 0 /* DTParts.bd */, this);
        }
        else
            for (let i = 0; i < l(bd); i++)
                pag = write(bd[i], pag, i, this);
        return pag;
    }
    append(ch, pag) {
        let e = this.part(pag);
        let cpart = ch.part(pag);
        ch.id >= 0 && this.i.ft ? e.place(-2, cpart) : e.add(cpart); //(this.i.ft as iBoxes)?.$.part(pag)
    }
    part(pag) {
        let i = this.i, part = this.parts[pag];
        if (!part) {
            part = this.createPart(pag);
            this.p.append(this, pag);
            let hd = bparse(i, "hd"), ft = bparse(i, "ft");
            hd && (write(hd, pag, -1 /* DTParts.h */, this), hd.$.clearData());
            ft && (write(ft, pag, -2 /* DTParts.f */, this), ft.$.clearData());
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
                return -1 /* OFTp.jump */;
            }
        }
        return result;
    }
    //protected abstract part(index: int): m.S;
    break(child, index) {
        let i = this.i;
        //não deve quebrar se for o header ou footer a pedir
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
        /**faz dessa maneira para o esta parte so ser processada uma vez */
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
/**flex layout */
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
        //todo: corta todos os childs
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
    /**span data */
    spans;
    ss(v) {
        v.borderCollapse = "collapse";
    }
    get style() {
        if (!this._style) {
            let i = this.i, th = theme.tables;
            this._style = assign(th[i.s] || th[''] || {}, i.is);
            //if (md.s)
            //  for (let i = 0; i < md.s.length; i++)
            //    Object.assign(this._style, th.byKey(md.s[i]));
            //else Object.assign(this._style, th.byKey(undefined));
        }
        return this._style;
    }
    createPart(pag) {
        return this.addBox(g("table"), pag);
    }
    fitIn() { }
}
/**column size */
const cs = (c) => isN(c) ? c : c.sz;
class Tr extends SBox {
    ss(v) {
        let i = this.i, props = {}, tableStyle = this.p.style, pS = i.$.id == -1 /* DTParts.h */ ?
            tableStyle.hd :
            i.$.id == -2 /* DTParts.f */ ?
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
            return -1 /* OFTp.jump */;
        }
        return 0 /* OFTp.in */;
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
            this.parts[i] = $.part(i); // this.bd.$.parts[part];
        // for (let part in .parts)
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
/**new pag */
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
            // fmt(this: any, value: unk, exp: str) {
            //   return $.fmt(value, exp, {
            //     currency: (<any>this.dt).currency,
            //     currencySymbol: (<any>this.dt).currencySymbol || false,
            //     //refCurr:
            //   });
            // }, 
            pagCount: 1
            //calc(value: Expression, ctx: IBookContext, index?: int) {
            //  return getValue(value, ctx, index);
            //},
            //img() { return ''; }
        },
        overflow: () => 0 /* OFTp.in */,
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
//function pag(ctx: Context, bk: Book, w: int, h: int, index: int) {
//  return [div, bd];
//}
export function sheets(ctx, container, bk, w, h) {
    let height, hs = bk.hdSz || theme.hdSize, fs = bk.ftSz || theme.ftSize;
    write(bparse(bk, "bd"), 1, 0 /* DTParts.bd */, {
        ctx,
        dt: ctx.dt,
        fitIn: (css) => css.minHeight = `calc(100% - ${hs + fs}px)`,
        // assign(css, { marginTop: 0, marginBottom: 0 })
        overflow: (child, pag) => Math.max(Math.floor(child.$.part(pag).e.offsetHeight) - height, 0 /* OFTp.in */),
        append(ch, pag) {
            ctx.pagCount = pag;
            let pad = theme.padding, hd = g('header').css("height", `${hs}px`), ft = g('footer').css("height", `${fs}px`), part, p = {
                ctx,
                dt: ctx.dt,
                overflow: () => 0 /* OFTp.in */,
                append(ch) { part.add(ch.part(pag)); }
            };
            height = g("article", "_ sheet", [hd, ch.part(pag), ft])
                .addTo(container)
                .css({
                background: "#fff",
                width: `${w}mm`,
                // !GAMBIARRA
                minHeight: !h && "300mm",
                height: `${h}mm`,
                padding: space(pad),
                whiteSpace: 'pre-wrap',
                ...styleText(theme.text, {})
            }).e.clientHeight - (hs + fs + pad[0] * 2);
            if (bk.hd) {
                part = hd;
                write(bk.hd, pag, -1 /* DTParts.h */, p);
                bk.hd.$.clear();
            }
            if (bk.ft) {
                part = ft;
                write(bk.ft, pag, -2 /* DTParts.f */, p);
                bk.ft.$.clear();
            }
            if (bk.wm) {
                part = div("_ wm");
                write(bk.wm, pag, -4 /* DTParts.b */, p);
                bk.wm.$.clear();
            }
            //[div, bd] = pag(ctx, bk, w, h, currentPag = index);
        }
    });
    if (ctx.wait)
        for (let w of ctx.wait)
            w();
    bk.bd.$.clear();
    return container;
}
// function clear({ hd, bd, ft }: Book) {
//   hd?.$?.clear();
//   (bd as iBoxes).$.clear();
//   ft?.$?.clear();
// }
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
    let pags = container.childs().css({ display: "block" }, true), //.uncss(["padding"]),
    style = g('style', null, `body{background:#fff!important}body>*{display:none!important}@page{size:${size};margin:0}`); //${space(theme.padding)}
    g(document.body).add(pags);
    style.addTo(document.head);
    await cb();
    style.remove();
    container.add(pags.uncss(["display"])); //.css({ padding: space(theme.padding) })
}
/* ************************************************************** */
/* *****************************COLLECTIONS********************** */
/* ************************************************************** */
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
    padding: [7 * 3.7795275590551176 /* units.mm */, 10 * 3.7795275590551176 /* units.mm */],
    hdSize: 12 * 3.7795275590551176 /* units.mm */,
    ftSize: 12 * 3.7795275590551176 /* units.mm */,
    text: {
        ff: 'Arial',
        cl: "#000",
        b: false,
        i: false,
        lh: 1.2,
        al: "start",
        fs: 9 * 1.3333333333333333 /* units.pt */
    },
    p: {
        h1: {
            fs: 11 * 1.3333333333333333 /* units.pt */,
            b: true
        },
        h2: {
            fs: 10 * 1.3333333333333333 /* units.pt */,
        },
        h3: {
            fs: 9 * 1.3333333333333333 /* units.pt */,
        },
        h4: {
            fs: 9 * 1.3333333333333333 /* units.pt */,
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
            fs: 7.5 * 1.3333333333333333 /* units.pt */
        }
    },
    box: {
        box: {
            br: {
                style: 'solid',
                color: "#000",
                width: 1
            },
            pd: [7 * 1.3333333333333333 /* units.pt */, 5 * 1.3333333333333333 /* units.pt */],
            // mg: [4 * units.pt, 2 * units.pt],
            rd: 5
        },
        filled: {
            pd: [3 * 1.3333333333333333 /* units.pt */, 2 * 1.3333333333333333 /* units.pt */],
            // mg: [2 * units.pt, 1 * units.pt],
            rd: 1,
            tx: 'white',
            bg: {
                tp: 'color',
                dt: "#444"
            }
        },
        blank: {
            pd: [7 * 1.3333333333333333 /* units.pt */, 5 * 1.3333333333333333 /* units.pt */],
            // mg: [4 * units.pt, 2 * units.pt],
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
            // mg: [2 * units.pt, 1 * units.pt],
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
