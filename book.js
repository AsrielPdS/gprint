"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = exports.boxes = exports.normalize = exports.print = exports.medias = exports.dblSheets = exports.sheets = exports.sheet = exports.render = exports.BlockBox = exports.PBox = exports.Span = exports.write = exports.createBox = exports.cpu = exports.$ = exports.units = exports.empty = void 0;
const galho_1 = require("galho");
const s_1 = require("galho/s");
const hasProp = (obj) => Object.keys(obj).length;
//#region util
exports.empty = '&#8203;';
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
/* ************************************************************** */
/* ***************************METHODS**************************** */
function border(b) {
    return `${b.width || 1}px ${b.style || 'solid'} ${b.color || "#000"}`;
}
function borders(css, bord) {
    if ('length' in bord) {
        if (bord[0] && hasProp(bord[0]))
            css['border-top'] = border(bord[0]);
        if (bord[1] && hasProp(bord[1]))
            css['border-right'] = border(bord[1]);
        if (bord[bord.length - 2] && hasProp(bord[bord.length - 2]))
            css['border-bottom'] = border(bord[bord.length - 2]);
        if (bord[bord.length - 1] && hasProp(bord[bord.length - 1]))
            css['border-left'] = border(bord[bord.length - 1]);
    }
    else
        css.border = border(bord);
}
const space = (p) => p.map(p => p + 'px').join(' ');
//existe 6 styles do tipo header
//e 6 do tipo paragrafo que definim informação relacionadas a formatação do texto
//tem inline style mas so para algumas propiedades(line,bold,italic,super,sub)
//os table head não tenhem inline style e so podem ser de algum dos 6 tipos de header style
//table cell não tem inline style tambem e so podem ser de um paragraph style
//estilos do documentos (ex:border,padding,round,filter) tambem ficam nos styles globas mas tambem podem estar inlines
function styleText(style, css) {
    if (style.ff)
        css['font-family'] = style.ff;
    if (style.fs)
        css['font-size'] = `${style.fs}px`;
    if ('b' in style)
        css['font-weight'] = style.b ? 'bold' : 'normal';
    if ('i' in style)
        css['font-style'] = style.i ? 'italic' : 'normal';
    if (style.u)
        css['text-decoration-line'] = 'underline';
    if (style.st)
        css['text-decoration-line'] = (css['text-decoration-line'] || '') + ' line-through';
    if (style.va)
        css['vertical-align'] = style.va;
    if (style.cl)
        css.color = style.cl;
    if (style.bg)
        css.background = style.bg;
    return css;
}
function emptyBlock(ly) {
    return (0, galho_1.div)(["empty" /* empty */]).css(ly).html(exports.empty);
}
function buildShadow(shadow) {
    return shadow.map(sh => `${sh.inset ? 'inset' : ''} ${sh.x}px ${sh.y}px ${sh.blur}px ${sh.spread}px ${sh.color}`).join(',');
}
function styleImg(style, css = {}) {
    if (style) {
        if (style.border)
            if ('length' in style.border)
                Object.assign(css, {
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
    if (style.mg)
        css.margin = `${style.mg}px 0`;
    if (style.shadow)
        css.textShadow = style.shadow.map(s => `${s.x}px ${s.y}px ${s.blur || 0}px ${s.color}`).join();
    //paragraph
    if (style.indent)
        css.textIndent = `${style.indent}px`;
    if (style.lh)
        css.lineHeight = style.lh;
    style.al && (css.textAlign = style.al);
    // if () {
    //   let al;
    //   switch (style.al) {
    //     case 'c': al = 'center'; break;
    //     case 'e': al = 'end'; break;
    //     case 'l': al = 'left'; break;
    //     case 'r': al = 'right'; break;
    //     case 'j': al = 'justify'; break;
    //     case 's': al = 'start';
    //   }
    //   ;
    // }
    if (style.noWrap) {
        css.whiteSpace = 'nowrap';
        css.textOverflow = style.overflow;
    }
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
                    return null;
                data = data[split[i]];
            }
        }
        return data;
    }
    else
        return scp.dt;
}
function wait(scp, cb) {
    let w = scp.ctx.wait ||= [];
    w.push(new Promise(rs => {
        setTimeout(() => { cb(); rs(); });
    }));
}
exports.$ = {};
/** central processor unit */
function cpu() {
    let delay = function (data) {
        let r = (0, galho_1.g)('span').html(exports.empty);
        wait(this.s, () => { r.replace(data()); });
        return r;
    }, funcs = {
        //options: (key: string) => system.options[key],
        ctx(item) {
            let t = this.s.dt;
            if (item) {
                if (t)
                    for (let k of item.split('.'))
                        if (!(t = (t[k])))
                            break;
            }
            return t;
        },
        map_index() { return this.s.dt ? (this.s.dt[$mapIndex] + 1) : null; },
        set(key, value) { return this.s.dt[key] = value; },
        //set data to temporary storage
        set_temp(key, value) { return (this.s.ctx.temp ||= {})[key] = value; },
        //get data from temporary storage
        get_temp(key) { return this.s.ctx.temp?.[key]; },
        up(levels) {
            let t = this.s;
            for (let i = 0, j = levels || 1; i < j; i++)
                t = t.p;
            return t.dt;
        },
        index() { return this.s.id; },
        sheet_data() {
            let t = this.s;
            while (!t.ranges)
                t = t.p;
            return t.ranges[this.p];
        },
        sheetData() { return funcs.sheet_data.call(this); },
        span(i, j) { return this.s.table.spans[i][j]; },
        //item(key: string){ return  this.s.ctx.items.get(key) },
        delay,
        pag_sum(name, mapFn, format) {
            return delay.call(this, () => {
                let lastValue = funcs.get_temp.call(this, name) || 0, data = funcs.sheet_data.call(this).map(mapFn).reduce((p, n) => p + (n || 0), lastValue);
                this.s.ctx.temp[name] = data;
                return format ? this.s.ctx.fmt(data, format) : data;
            });
        },
        pags() {
            return this.s.ctx.parts.length;
            //while (t.p)
            //  t = t.p;
            //return (t.parts as m.S[]).length;
        },
        pag() {
            return this.p + 1;
        },
        //exchange(currency: string) {
        //  if (!currency)
        //    currency = (<any>this.s.ctx)._fOpts.currency;
        //  return scalar.currencies().byKey(currency, 'code').value;
        //},
        //currency() {
        //  return (<any>scp.ctx)._fOpts.currency;
        //}
    };
    return (v, s, p) => exports.$.calc(v, {
        // try: true,
        // object: true,
        funcs(name, args) {
            if (name in funcs) {
                let t = funcs[name].call({ p, s }, ...args);
                return t == null ? null : t;
            }
        },
        vars(name, obj) {
            let tempCtx = s;
            while (tempCtx) {
                if ((tempCtx.dt && typeof tempCtx.dt == 'object') && (name in tempCtx.dt))
                    return tempCtx.dt[name];
                tempCtx = tempCtx.p;
            }
            // @if DEBUG
            console.warn('not_found', {
                field: name,
                context: s.dt
            });
            // @endif
            return obj ? {} : null;
        }
    });
}
exports.cpu = cpu;
//#endregion
function cloneBox(box) {
    return JSON.parse(JSON.stringify(box));
    //return <T>acceptBoxes.get(box.tp).clone(box);
}
function emptyBox() {
    return PBox.normalize({ tp: "p" });
}
function createBox(box, id, parent) {
    let t = exports.boxes[box.tp];
    if (!t)
        throw 'tp not found';
    return Reflect.construct(t, [box, parent, id]);
}
exports.createBox = createBox;
function write(box, pag, id, parent) {
    if (box.$) {
        box.$.id = id;
        box.$.render(pag);
    }
    else {
        createBox(box, id, parent).render(pag);
    }
    return box.$.end;
}
exports.write = write;
/** normalize box */
const normBox = (box) => exports.boxes[box.tp].normalize(box);
class Span {
    model;
    p;
    constructor(model, p) {
        this.model = model;
        this.p = p;
    }
    parts = {};
    get css() {
        return styleText(this.model.is, {});
    }
    view(index) {
        let t = this.parts[index] = (0, galho_1.g)('span').css(this.css);
        if (this.model.dt)
            t.text(this.model.dt);
        else
            t.html(exports.empty);
        return t;
    }
    break(index) {
        let model = this.model, part = (0, galho_1.g)('span', null, model.dt).css(this.css);
        this.parts[index] = part;
        return part;
    }
    get bold() {
        let is = this.model.is;
        return is && is.b || false;
    }
    get length() { return this.model.dt.length; }
    static break;
    static isEmpty(model) { return !model.dt; }
    toJSON() { }
}
exports.Span = Span;
class Scalar {
    model;
    p;
    constructor(model, p) {
        this.model = model;
        this.p = p;
    }
    get length() { return this.model.dt.length; }
    parts = {};
    get css() {
        return styleText(this.model.is, {});
    }
    view(index) {
        const model = this.model;
        let p = this.p, v = p.ctx.calc(model.dt, p, index);
        if (model.fmt)
            v = p.ctx.fmt(v, model.fmt);
        return v == null ? null : this.parts[index] = (0, galho_1.g)('exp', { css: this.css }, v);
    }
    break(index) {
        return this.parts[index] = (0, galho_1.g)('exp').css(this.css);
    }
    edit;
    //edit(action: BookBaseAction | string, opts?: unknown): boolean {
    //  if (action.startsWith('t-')) {
    //    editText(this.model, action, opts);
    //    return true;
    //  }
    //  return false;
    //}
    static break;
    static isEmpty(model) { return false; }
    toJSON() { }
}
class Link extends Span {
}
class Img {
    model;
    p;
    parts = {};
    constructor(model, p) {
        this.model = model;
        this.p = p;
    }
    view(index) {
        let model = this.model, css = styleImg(model.is), media = this.p.ctx;
        if (model.base) {
            css[model.base] = '100%';
        }
        else {
            css.width = (model.width || 64) + 'px';
            css.height = (model.height || 64) + 'px';
        }
        if (model.calc) {
            let t = media.calc(model.dt, this.p, index);
            if ((0, s_1.isS)(t))
                return (0, galho_1.g)('img', { src: t }).css(css);
            else {
                t = (0, galho_1.g)(t);
                if (t.valid)
                    return t.css(css);
                return null;
            }
        }
        else
            return this.parts[index] = (0, galho_1.g)('img', {
                src: media.img(model.dt, model.pars)
            }).css(css);
    }
    break() { throw "this clause is unbreakable"; }
    static isEmpty(model) { return false; }
    get length() { return 1; }
    //edit(action: BookBaseAction, opts?: unknown): boolean {
    //  if (action.startsWith('img-')) {
    //    editImg(this.model, action, opts);
    //    return true;
    //  }
    //  return false;
    //}
    static break;
    toJSON() { }
}
class Box {
    model;
    id;
    _css;
    _ly;
    /**@deprecated provavelmento so é util para o edit */
    start;
    /**@deprecated provavelmento so é util para o edit */
    end;
    parts = {};
    //id: number;
    _cd;
    get dt() {
        let { model, p, start } = this;
        return this._cd ||= getCtx(model.sc, p, start);
    }
    ctx;
    p;
    get layout() {
        return this._ly || (this._ly = this.p.fitIn(this.model, {}));
    }
    constructor(model, parent, id) {
        this.model = model;
        this.id = id;
        model.$ = this;
        this.ctx = (this.p = parent).ctx;
    }
    valid(pag) {
        return !this.model.vl || this.ctx.calc(this.model.vl, this, pag);
    }
    render(pag) {
        this.start = this.end = pag;
        if (this.valid(pag))
            this.write(pag);
        else {
            this.addBox(emptyBlock(this.layout), pag);
            this.p.append(this.model, pag);
            this.p.overflow(this.model, pag);
        }
    }
    addBox(s, index) {
        this.parts[this.end = index] = s.cls(["box" /* box */]);
        this.checkPag(index);
        //if (this.edit)
        //  this.setEditPart(s.prop('$', this.model));
        return s;
    }
    /** @deprecated */
    reload(index) {
        const model = this.model;
        for (let k in this.parts)
            this.model[k].remove();
        this.parts = {};
        //this.dt = getCtx(this.model.sc, this.p, index);
        return this.write(0);
    }
    update() {
        throw "not implemented";
    }
    clear() {
        this.parts = {};
        this._cd = this._ly = this._css = null;
    }
    checkPag(index) {
        if (this.model.pag) {
            let pag = this.ctx.calc(this.model.pag, this, index);
            if (pag) {
                wait(this, () => {
                    if (!pag(this.ctx.parts.length, index + 1))
                        this.part(index).css('visibility', 'hidden');
                });
            }
        }
    }
    transport(from, to) {
        let parts = this.parts;
        if (from == this.start)
            this.start = to;
        this.end = to;
        if (parts && from in parts) {
            parts[to] = parts[from];
            delete parts[from];
        }
    }
    static normalize(dt) {
        if (!dt.ly)
            dt.ly = {};
        if (!dt.is)
            dt.is = {};
        return dt;
    }
    static symbs(dt, list) { }
    static clone(m) {
        return {
            tp: m.tp,
            is: m.is,
            s: m.s,
            ub: m.ub,
            vl: m.vl,
            sc: m.sc,
            ly: m.ly,
        };
    }
    static toMin(model) {
        return model;
    }
    static fromMin(model) {
        return model;
    }
    // static replace(_model: IParentBox, _key: string, _newValue: IBox) {
    //   return false;
    // }
    static isEmpty(model) { return false; }
    toJSON() { }
}
class PBox extends Box {
    constructor(model, parent, id) {
        super(model, parent, id);
        for (let i = 0; i < model.dt.length; i++)
            this.createSpan(model.dt[i]);
    }
    get theme() {
        return exports.theme.p[this.model.s] || null;
    }
    get css() {
        if (!this._css) {
            let md = this.model, th = exports.theme.p, props = {}, css = {};
            if (md.s) {
                let s = th[md.s];
                if (s) {
                    styleText(s, css);
                    Object.assign(props, s);
                }
            }
            if (md.is)
                Object.assign(props, md.is);
            this._css = this.p.fitIn(this.model, styleParagraph(props, css));
        }
        return this._css;
    }
    write(index) {
        let md = this.model, p = this.part(index), items = [md.li ? this.p.listItem(md) : null];
        for (let i = 0, l = md.dt.length; i < l; i++) {
            let dtModel = md.dt[i], data = dtModel.$.view(index /*, this.edit*/);
            if (data) {
                //if (this.edit)
                //  data.prop('$', dtModel);
                items.push(data);
            }
        }
        if (items.length)
            p.add(items);
        else
            p.html(exports.empty);
        return this.writeCheck(p, index);
    }
    part(index) {
        let t = this.parts[index];
        if (!t) {
            t = this.parts[index] = this.addBox((0, galho_1.g)("p"), index).css(this.css);
            this.p.append(this.model, index);
        }
        return t;
    }
    createSpan(span) {
        PBox.normalizeSpan(span);
        span.$ = Reflect.construct(spans[span.tp], [span, this]);
    }
    writeCheck(p, index) {
        let md = this.model, parent = this.p, overflow;
        while (overflow = parent.overflow(md, index)) {
            if (overflow == 2 /* jump */) {
                index++;
                continue;
            }
            //se so sobrou um pouco de espaço nesta pagina
            if (!md.dt.length || parent.justALittle(md, index)) {
                parent.append(md, ++index);
            }
            else {
                let childs = p.childs(), newE = (0, galho_1.g)("p").css(this.css), i = childs.length - 1;
                while (i >= 0) {
                    newE.prepend(childs[i]);
                    //usar aqui para que quando fazer o break diminua 
                    i--;
                    if (!parent.overflow(md, index))
                        break;
                }
                let last = childs[i + 1], lastModel = md.dt[i + 1];
                if (spans[lastModel.tp].break) {
                    p.add(last);
                    if (parent.overflow(md, index)) {
                        let newClauseDiv = lastModel.$.break(index), lastClauseDivText = last.firstChild, lcdtSplit = lastClauseDivText.textContent.split(' ');
                        do {
                            lcdtSplit.shift();
                            lastClauseDivText.textContent = lastClauseDivText.textContent.substring(0, lastClauseDivText.textContent.lastIndexOf(' '));
                        } while (parent.overflow(md, index));
                        newClauseDiv.add(lcdtSplit.join(' '));
                        newE.prepend(newClauseDiv);
                    }
                }
                index++;
                this.addBox(p = newE, index);
                parent.append(md, index);
            }
        }
        return index;
    }
    static normalize(model) {
        Box.normalize(model);
        if (!model.dt)
            model.dt = [];
        if (!model.dt.length)
            model.dt.push(this.normalizeSpan({ dt: '' }));
        for (let item of model.dt)
            this.normalizeSpan(item);
        return model;
    }
    static normalizeSpan(span) {
        if (!span.tp)
            span.tp = "t";
        if (!span.is)
            span.is = {};
        return span;
    }
    static isEmpty(model) {
        for (let i = 0; i < model.dt.length; i++) {
            let child = model.dt[i];
            if (!spans[child.tp].isEmpty(child))
                return false;
        }
        return true;
    }
}
exports.PBox = PBox;
class ParentBox extends Box {
    //private _ctx: unknown;
    ranges;
    mode;
    get css() {
        if (!this._css) {
            let md = this.model, p = this.p, box = exports.theme.box[md.s], txtStyle = exports.theme.p[md.is.tx || box && box.tx];
            //if (md.s)
            //  for (let i = 0; i < md.s.length; i++) {
            //    let t = th.box[md.s[i]];
            //    if (t) {
            //      if (!tx)
            //        tx = t.tx;
            //      Object.assign(props, t);
            //    }
            //  }
            //if (md.is) {
            //  if (md.is.tx)
            //    tx.push(...md.is.tx);
            //  Object.assign(props, md.is);
            //}
            this._css = p.fitIn(md, styleBox(Object.assign({}, box, md.is)));
            if (txtStyle)
                styleText(txtStyle, this._css);
            //if (tx.length)
            //  for (let t of tx) {
            //    let t2 = th.p.byKey(t);
            //    if (t2) {
            //      styleText(t2, this._css);
            //      //styleParagraph(t2);
            //    }
            //  }
        }
        return this._css;
    }
    write(pag) {
        let { dt, map, empty, sc } = this.model, l = dt.length;
        if (l) {
            if (map && this.mode != 0 /* editing */) {
                let ctx = /*this._ctx = */ this.dt, 
                //book = this.book,
                range = [];
                if (l != 1)
                    throw "map parent should heve only one child";
                if (ctx == null || !('length' in ctx)) {
                    // @if DEBUG
                    console.warn('invalid fill', { key: sc, data: ctx });
                    // @endif
                    ctx = [];
                }
                this.ranges = { [pag]: range };
                if (ctx.length)
                    for (let i = 0; i < ctx.length; i++) {
                        let row = ctx[i];
                        if (row)
                            row[$mapIndex] = i;
                        range.push(row);
                        let temp = cloneBox(dt[0]);
                        //temp.$.id = j;
                        temp.sc = temp.sc ? i + '.' + temp.sc : i + '';
                        let newPag = write(temp, pag, i, this);
                        if (newPag != pag) {
                            range.pop();
                            this.ranges[pag = newPag] = range = [row];
                        }
                        //for (let j = 0; j < l; j++) 
                        //i++;
                    }
                else if (empty)
                    pag = write(empty, pag, 0 /* d */, this);
            }
            else
                for (let i = 0; i < l; i++) {
                    let temp = dt[i];
                    //temp.$.id = i;
                    pag = write(temp, pag, i, this);
                }
        }
        else
            this.part(pag);
        return pag;
    }
    append(child, index) {
        const md = this.model, part = this.part(index), cpart = child.$.part(index), id = child.$.id;
        switch (id) {
            case 0:
                if (md.hd)
                    part.place(1, cpart);
                else
                    part.prepend(cpart);
                break;
            case -1 /* h */:
                part.prepend(cpart);
                break;
            case -2 /* f */:
                part.add(cpart);
                break;
            //default:
            //  part.place(cpart, id + (hd ? 1 : 0));
            //  break;
            default:
                if (md.map) {
                    if (md.ft)
                        md.ft.$.parts[index].putBefore(cpart);
                    else
                        part.add(cpart);
                }
                else {
                    let prev = md.dt[id - 1].$;
                    if (index in prev.parts)
                        prev.parts[index].putAfter(cpart);
                    else {
                        if (md.hd)
                            part.place(1, cpart);
                        else
                            part.prepend(cpart);
                    }
                }
        }
    }
    part(pag) {
        let md = this.model, part = this.parts[pag];
        if (!part) {
            part = this.createPart(pag);
            this.p.append(md, pag);
            if (md.hd)
                write(md.hd, pag, -1 /* h */, this);
            if (md.ft)
                write(md.ft, pag, -2 /* f */, this);
        }
        return part;
    }
    transport(from, to) {
        let { hd, dt, ft } = this.model;
        super.transport(from, to);
        hd?.$.transport(from, to);
        ft?.$.transport(from, to);
        if (dt)
            for (let i of dt)
                if (i.$)
                    i.$.transport(from, to);
    }
    overflow(child, index) {
        let result = this.p.overflow(this.model, index);
        if (result) {
            if (!this.break(child, index)) {
                this.transport(index, index + 1);
                this.p.append(this.model, index + 1);
                return 2 /* jump */;
            }
        }
        return result;
    }
    justALittle(child, index) {
        return this.p.justALittle(this.model, index);
    }
    //protected abstract part(index: number): m.S;
    break(child, index) {
        const model = this.model;
        //não deve quebrar se for o header ou footer a pedir
        if (typeof child.$.id == "number" && !model.ub) {
            return true;
        }
        return false;
    }
    getTextTheme() {
        let md = this.model;
        return md.is.tx ||
            (md.s ? exports.theme.box[md.s].tx : null) ||
            this.p.getTextTheme();
    }
    _lCss;
    _lItems;
    listItem(p) {
        let l = this.model.l, css = this._lCss || styleText(l, {}), s = (0, galho_1.g)('span', ['li'], exports.$.scalar(p.li, l.fmt)).css(css);
        if (true) {
            let items = this._lItems || (this._lItems = []);
            items.push({ s: s, p: p });
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
    }
    static normalize(md) {
        Box.normalize(md);
        if (md.empty)
            normBox(md.empty);
        if (!md.dt)
            md.dt = [];
        if (!md.dt.length && !md.hd && !md.ft)
            md.dt.push({ tp: "p" });
        for (let i = 0; i < md.dt.length; i++) {
            let t = md.dt[i];
            normBox((0, s_1.isS)(t) ? md.dt[i] = { tp: "p", dt: [{ dt: t }] } : t);
        }
        if (md.hd)
            normBox(md.hd);
        if (md.ft)
            normBox(md.ft);
        return md;
    }
    static symbs({ dt, hd, ft }, list) {
        let t = (dt) => exports.boxes[dt.tp].symbs(dt, list);
        dt.forEach(t);
        hd && t(hd);
        ft && t(ft);
    }
    clear() {
        let { hd, dt, ft } = this.model;
        for (let i of dt)
            if (i.$)
                i.$.clear();
        hd && hd.$ && hd.$.clear();
        ft && ft.$ && ft.$.clear();
        super.clear();
    }
    //static replace(model: IParentBox, key: string, newValue: Boxes) {
    //  if (model.hd && replace(model.hd, key, newValue, () => { model.hd = newValue; }))
    //    return true;
    //  for (let i = 0; i < model.dt.length; i++)
    //    if (replace(model.dt[i], key, newValue, () => { model.dt[i] = newValue; }))
    //      return true;
    //  if (model.ft && replace(model.ft, key, newValue, () => { model.ft = newValue; }))
    //    return true;
    //}
    static isEmpty(model) {
        for (let i = 0; i < model.dt.length; i++) {
            let child = model.dt[i];
            if (!exports.boxes[child.tp].isEmpty(child))
                return false;
        }
        return true;
    }
}
class BlockBox extends ParentBox {
    get css() {
        let css = this._css;
        if (!css) {
            let md = this.model;
            /**faz dessa maneira para o esta parte so ser processada uma vez */
            css = super.css;
            if (md.cols) {
                let c = md.cols;
                css['column-width'] = c.width;
                css['column-count'] = c.count;
                css['column-gap'] = c.gap + '%';
                if (c.rule)
                    css['column-rule'] = border(c.rule);
            }
        }
        return css;
    }
    createPart(index) {
        return this.addBox((0, galho_1.div)("block" /* block */).css(this.css), index);
    }
    fitIn(_, css) {
        //if (child.ly.li) {
        //  let i = 0, dt = this.model.dt;
        //  while (i < dt.length)
        //    if (dt[i] == child)
        //      break;
        //    else i++;
        //  (css[attrs] || (css[attrs] = {})).li = i + 1;
        //}
        return css;
    }
}
exports.BlockBox = BlockBox;
;
class ColBox extends ParentBox {
    get css() {
        var css = this._css;
        if (!css) {
            var md = this.model;
            css = super.css;
            if (md.reverse)
                css['flex-direction'] = 'column-reverse';
            if (md.align)
                switch (md.align) {
                    case 'e':
                        css['justify-content'] = 'flex-end';
                        break;
                    case "s":
                        css['justify-content'] = 'flex-start';
                        break;
                    case "c":
                        css['justify-content'] = 'center';
                        break;
                    default:
                        css['justify-content'] = md.align;
                        break;
                }
        }
        return css;
    }
    createPart(index) {
        return this.addBox((0, galho_1.div)(["book-col" /* col */]), index)
            .css(this.css);
    }
    fitIn(child, css) {
        let ly = child.ly, md = this.model;
        //h = md.ori == Orientation.horizontal;
        //if (md.stretch)
        //  css.flex = '1 1 auto';
        if (ly.sz)
            css['flex-grow'] = ly.sz;
        if (ly.min)
            css['min-height'] = ly.min + '%';
        if (ly.max)
            css['max-height'] = ly.max + '%';
        //if (l.grow != null)
        //  css['flex-grow'] = l.grow;
        //if (l.shrink != null)
        //  css['flex-shrink'] = l.shrink;
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
        if (md.pad) {
            if (!child.$.id)
                css['margin-top'] = (md.pad[0] || (md.pad[0] = 0)) + 'px';
            let id = child.$.id + 1;
            css['margin-bottom'] = (md.pad[id] || (md.pad[id] = 0)) + 'px';
        }
        return css;
    }
}
class RowBox extends ParentBox {
    write(pag) {
        let { dt } = this.model;
        for (let i = 0; i < dt.length; i++)
            pag = write(dt[i], pag, i, this);
        return pag;
    }
    createPart(index) {
        return this
            .addBox((0, galho_1.div)("book-row" /* row */), index)
            .css(this.css);
    }
    append(child, index) {
        const model = this.model;
        let part = this.parts[index];
        if (!part) {
            part = this.part(index);
            this.p.append(model, index);
        }
        part.add(child.$.part(index));
    }
    break(child, index) {
        //todo: corta todos os childs
        return super.break(child, index);
    }
    fitIn(child, css) {
        let l = child.ly, md = this.model;
        if (l.grow)
            css['flex-grow'] = l.grow;
        if (l.sz)
            css['width'] = `${l.sz}%`;
        if (md.pad) {
            if (!child.$.id)
                css['margin-left'] = md.pad[0] + '%';
            let id = child.$.id + 1;
            css['margin-right'] = md.pad[id] + '%';
        }
        return css;
    }
    static normalize(model) {
        if (!model.dt)
            model.dt = [];
        if (!model.dt.length)
            model.dt[0] = { tp: "p" };
        return ParentBox.normalize(model);
        //var size = 0, l = model.dt.length;
        //for (let i = 0; i < l; i++) {
        //  let j = model.dt[i];
        //  if (j.ly.sz)
        //    size += j.ly.sz;
        //}
    }
}
class Tb extends ParentBox {
    _style;
    /**span data */
    spans;
    get style() {
        if (!this._style) {
            let md = this.model, th = exports.theme.tables;
            this._style = Object.assign(th[md.s] || th[''] || {}, md.is);
            //if (md.s)
            //  for (let i = 0; i < md.s.length; i++)
            //    Object.assign(this._style, th.byKey(md.s[i]));
            //else Object.assign(this._style, th.byKey(undefined));
        }
        return this._style;
    }
    get css() {
        if (!this._css) {
            let md = this.model, p = this.p, style = this.style, txtStyle = exports.theme.p[md.is.tx || style && style.tx];
            //props: TableStyle = {},
            //tx: string[] = [];
            //Object.assign(props, );
            //if (md.box)
            //  for (let i = 0; i < md.box.length; i++) {
            //    let t = th.box.byKey(md.box[i]);
            //    if (t) {
            //      if (t.tx)
            //        tx.push(...t.tx);
            //      Object.assign(props, t);
            //    }
            //  }
            //if (md.is)
            //  Object.assign(props, md.is);
            this._css = p.fitIn(md, styleBox(style));
            if (txtStyle)
                styleText(txtStyle, this._css);
            //if (props.tx)
            //  for (let t of props.tx) {
            //    let t2 = th.p.byKey(t);
            //    if (t2)
            //      styleText(t2, this._css);
            //  }
            //if (tx.length)
            //  for (let t of tx) {
            //    let t2 = th.p.byKey(t);
            //    if (t2)
            //      styleText(t2, this._css);
            //  }
            //this._css['flex-direction'] = md.ori == ui.Orientation.horizontal ? 'row' : 'column';
        }
        return this._css;
    }
    createPart(index) {
        return this
            .addBox((0, galho_1.div)("book-table" /* table */), index)
            .css(this.css);
    }
    fitIn(_child, css) {
        return css;
    }
    clear() {
        super.clear();
        this._style = null;
    }
    render(pag) {
        super.render(pag);
        let md = this.model;
        if (md.spans) {
            this.spans = Array(md.spans.length);
            for (let i = 0; i < md.spans.length; i++) {
                let span = md.spans[i], items = this.ctx.calc(span.val, this, pag);
                if (!Array.isArray(items)) {
                    // @if DEBUG
                    console.warn('span value is not iterable', items);
                    // @endif
                    items = [items];
                }
                if (items.length) {
                    md.cols.splice(span.start, 0, ...items.map(_ => ({ sz: span.sz })));
                    Tb.normalizeSize(md.cols);
                }
                this.spans[i] = items;
            }
        }
    }
    static normalizeSize(cols) {
        let length = cols.length;
        var totalSize = 0;
        for (let i = 0; i < length; i++) {
            let s = (cols[i] || (cols[i] = {})).sz;
            if (!s)
                s = 100 / length;
            totalSize += cols[i].sz = s;
        }
        for (let col of cols)
            col.sz = col.sz * 100 / totalSize;
    }
    static normalize(md) {
        ParentBox.normalize(md);
        if (!md.ori)
            md.ori = "v";
        if (md.spans)
            for (let span of md.spans) {
                if (span.hd)
                    normBox(span.hd);
                if (span.dt)
                    normBox(span.dt);
                if (span.ft)
                    normBox(span.ft);
            }
        if (!md.cols)
            if (md.dt && md.dt.length) {
                let t = md.dt[0].dt;
                if (t && t.length)
                    md.cols = t.map(_ => ({ sz: 100 / t.length }));
                else
                    throw "unsetted1";
            }
            else
                throw "unsetted2";
        Tb.normalizeSize(md.cols);
        return md;
    }
}
class Tr extends ParentBox {
    bd;
    get table() { return this.p; }
    constructor(model, parent, id) {
        if (model.ub == null)
            model.ub = true;
        super(model, parent, id);
        let 
        //model = this.model,
        dt = model.dt, spanDatas = parent.spans, spans = parent.model.spans;
        if (spans && spans.length) {
            dt = dt.slice();
            for (let i = 0; i < spans.length; i++) {
                let span = spans[i], sdata = spanDatas[i], sdt = this.model.$.id == -1 /* h */ ? span.hd : this.model.$.id == -2 /* f */ ? span.ft : span.dt;
                // @if DEBUG
                if (!sdt) {
                    console.warn('span part missing');
                }
                // @endif
                if (sdt && sdt.ly.single) {
                }
                else
                    for (let j = 0; j < sdata.length; j++) {
                        let t1 = sdt ? cloneBox(sdt) : emptyBox(), t2 = `span(${i},${j})`;
                        t1.sc = '=' + (t1.sc ? `proccess(${t2},'${t1.sc}')` : t2);
                        dt.splice(span.start + j, 0, t1);
                    }
            }
        }
        this.bd = dt;
    }
    get css() {
        if (!this._css) {
            let md = this.model, p = this.p, props = {}, tableStyle = p.style, pS = md.$.id == -1 /* h */ ?
                tableStyle.hd :
                md.$.id == -2 /* f */ ?
                    tableStyle.ft :
                    tableStyle.dt, box = exports.theme.box[md.s], txtStyle = exports.theme.p[md.is.tx || (box && box.tx) || (pS && pS.tx)];
            //if (md.s)
            //  for (let i = 0; i < md.s.length; i++)
            //    Object.assign(props, th.box.byKey(md.s[i]));
            //if (md.is)
            //  Object.assign(props, md.is);
            this._css = p.fitIn(md, styleBox(Object.assign(props, pS, box, md.is)));
            if (txtStyle)
                styleText(txtStyle, this._css);
            //var tx = props.tx || (st && st.tx);
            //if (tx)
            //  for (let t of tx) {
            //    let t2 = th.p.byKey(t);
            //    if (t2)
            //      styleText(t2, this._css);
            //  }
            //if ()
            //  styleText(th.p.get(props.tx || (st && st.tx)), this._css);
            //this._css['grid-template'] =
            //  (md.hd ? ('"' + ('h ').repeat(p.model.cols.length) + '" auto ') : '') +
            //  (md.dt ? ('"' + p.model.cols.map((e, i) => 'c' + i).join(' ') + '" auto ') : '') +
            //  (md.ft ? ('"' + ('f ').repeat(p.model.cols.length) + '" auto ') : '') +
            //  '/ ' + p.model.cols.map(c => c.sz + '%').join(' ');
        }
        return this._css;
    }
    setSpan(dt) {
        let parent = this.p, spanDatas = parent.spans, spans = parent.model.spans;
        if (spans && spans.length) {
            dt = dt.slice();
            for (let i = 0; i < spans.length; i++) {
                let span = spans[i], sdata = spanDatas[i], sdt = this.model.$.id == -1 /* h */ ? span.hd : this.model.$.id == -2 /* f */ ? span.ft : span.dt;
                // @if DEBUG
                if (!sdt) {
                    console.warn('span part missing');
                }
                // @endif
                if (sdt && sdt.ly.single) {
                }
                else
                    for (let j = 0; j < sdata.length; j++) {
                        let t1 = sdt ? cloneBox(sdt) : emptyBox(), t2 = `span(${i},${j})`;
                        t1.sc = '=' + (t1.sc ? `proccess(${t2},'${t1.sc}')` : t2);
                        dt.splice(span.start + j, 0, t1);
                    }
            }
        }
        return dt;
    }
    write(pag) {
        if (this.bd)
            for (let i = 0; i < this.bd.length; i++) {
                let temp = this.bd[i];
                //temp.$.id = ;
                pag = write(temp, pag, i, this);
            }
        return pag;
    }
    append(child, index) {
        this
            .part(index)
            .add(child.$.part(index));
    }
    part(index) {
        let part = this.parts[index];
        if (!part) {
            this.checkPag(index);
            part = this.createPart(index);
            this.p.append(this.model, index);
        }
        return part;
    }
    createPart(index) {
        return this
            .addBox((0, galho_1.div)("book-tr" /* tr */), index)
            .css(this.css);
    }
    //setup(index: number, parent: TableBox): void {
    //  super.setup(index, parent);
    //}
    fitIn(child, css) {
        let l = child.ly, cols = this.p.model.cols, id = child.$.id;
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
        tableCellStyle(child, css, this.p);
        return css;
    }
    setEditMode() {
    }
    static clone(box) {
        let temp = Box.clone(box);
        return temp;
    }
}
function tableCellStyle(child, css, table) {
    let l = child.ly, pst = table.style;
    if (pst.col && child.$.id >= 0)
        styleBox(pst.col, css);
    if (l.ml)
        css['margin-left'] = l.ml + '%';
    if (l.mt)
        css['margin-top'] = l.mt + '%';
    if (l.mr)
        css['margin-right'] = l.mr + '%';
    if (l.mb)
        css['margin-bottom'] = l.mb + '%';
}
class Th extends Tr {
    constructor(model, parent, id) {
        super(model, parent, id);
        let dt = this.bd;
        //model = this.model,
        if (dt && dt.length) {
            let groups = model.groups;
            if (groups && groups.length) {
                dt = dt.slice();
                let spanData = this.p.spans, spans = this.p.model.spans;
                for (let i = 0; i < groups.length; i++) {
                    let gr = groups[i];
                    if (spans) {
                        //erro: aqui ele vai adicionar o span no group sempre que renderizar
                        for (let j = 0; j < spans.length; j++)
                            if (gr.from <= spans[j].start && gr.to >= spans[j].start)
                                gr.to += spanData[j].length - 1;
                    }
                    let l = gr.to - gr.from + 1;
                    if (l < 1)
                        break;
                    //nos proximo niveis este group vai representar os seus filhos
                    dt.splice(gr.from, l, ...(gr.dt = dt.slice(gr.from, gr.to + 1)).map(_ => gr));
                    gr.ly.span = l;
                }
                dt = dt.filter((f, i) => {
                    return dt.indexOf(f, i + 1) == -1;
                });
            }
            this.bd = dt;
        }
    }
    write(pag) {
        let model = this.model;
        if (model.hd) {
            //model.hd.$.id = ;
            pag = write(model.hd, pag, -1 /* h */, this);
        }
        pag = super.write(pag);
        if (model.ft) {
            //model.ft.$.id = ;
            pag = write(model.ft, pag, -2 /* f */, this);
        }
        return pag;
    }
    //setup(index: number, parent: TableBox): void {
    //  super.setup(index, parent);
    //}
    createPart(pag) {
        return this
            .addBox((0, galho_1.div)("book-th" /* th */, (0, galho_1.div)(["body" /* body */])), pag)
            .css(this.css);
    }
    append(child, pag) {
        let part = this.part(pag), cpart = child.$.part(pag);
        switch (child.$.id) {
            case -1 /* h */:
                part.prepend(cpart);
                break;
            case -2 /* f */:
                part.add(cpart);
                break;
            default:
                part.child('.' + "body" /* body */).add(cpart);
        }
    }
    static normalize(model) {
        super.normalize(model);
        if (model.groups)
            for (let group of model.groups)
                normBox(group);
        return model;
    }
    clear() {
        let groups = this.model.groups;
        if (groups)
            for (let group of groups)
                if (group.$)
                    group.$.clear();
        super.clear();
    }
}
class Tg extends ParentBox {
    size;
    cols;
    _table;
    constructor(model, parent, id) {
        super(model, parent, id);
        let cols = this.cols = this.table.model.cols, 
        //id = model.$.id as number,
        l = model.ly;
        let w = cols[id].sz;
        if (l.span) {
            for (let i = id + 1; i < l.span + id; i++)
                w += cols[i].sz;
        }
        this.size = w;
    }
    get table() {
        if (!this._table) {
            let p = this.p;
            while (!(p instanceof Tb))
                p = p.p;
            this._table = p;
        }
        return this._table;
    }
    fitIn(child, css) {
        let l = child.ly, start = child.$.id;
        //se não for o head
        if (start >= 0) {
            start = getCellStart(start, this.model.dt) + this.model.$.id;
            let w = this.cols[start].sz;
            if (l.span) {
                for (let i = start + 1; i < l.span + start; i++)
                    w += this.cols[i].sz;
            }
            //ajusta para 100 porcentos
            w = w * 100 / this.size;
            if (l.ml)
                w -= l.ml;
            if (l.mr)
                w -= l.mr;
            css['width'] = w + '%';
        }
        tableCellStyle(child, css, this.table);
        return css;
    }
    append(child, index) {
        let part = this.part(index), cpart = child.$.part(index);
        if (child.$.id == -1 /* h */)
            part.prepend(cpart);
        else
            part.child('.' + "body" /* body */).add(cpart);
    }
    //setup(index: number, parent: IBoxParent): void {
    //  super.setup(index, parent);
    //}
    write(pag) {
        let { hd, dt } = this.model;
        pag = write(hd, pag, -1 /* h */, this);
        for (let i = 0; i < dt.length; i++) {
            let t = dt[i];
            pag = write(t, pag, i, this);
        }
        return pag;
    }
    part(index) {
        let part = this.parts[index];
        if (!part) {
            part = this
                .addBox((0, galho_1.div)(["box" /* box */, "book-table-group" /* tableGroup */], (0, galho_1.div)(["body" /* body */])), index)
                .css(this.css);
            this.p.append(this.model, index);
        }
        return part;
    }
    createPart(index) { return null; }
    static normalize(model /*: ITGroupBox*/) {
        super.normalize(model);
        normBox(model.hd);
        return model;
    }
}
function getCellStart(index, dt) {
    let start = index;
    for (let i = 0; i < index; i++)
        if (dt[i].ly.span)
            start += dt[i].ly.span - 1;
    return start;
}
class GridBox extends ParentBox {
    get css() {
        var css = this._css;
        if (!css) {
            var md = this.model, template = '';
            /**faz dessa maneira para o esta parte so ser processada uma vez */
            css = super.css;
            for (let i = 0; i < md.rows.length; i++) {
                template += `${md.rows[i]} `;
            }
            template += '/';
            for (let i = 0; i < md.columns.length; i++) {
                template += `${md.columns[i]} `;
            }
            css['grid-gap'] = space(md.gap);
            css['grid-template'] = template;
        }
        return css;
    }
    createPart(index) {
        return this
            .addBox((0, galho_1.div)("grid" /* grid */, [(0, galho_1.div)(), (0, galho_1.div)(), (0, galho_1.div)()]), index)
            .css(this.css);
    }
    fitIn(child, css) {
        var l = child.ly;
        return {
            'grid-area': `${l.r + 1} / ${l.c + 1} / span ${l.rspan || 1} / span ${l.cspan || 1}`,
            margin: (l.margin || ["auto"]).join('px ') + 'px'
        };
    }
}
class CustomBox extends Box {
    get css() { return this._css || (this._css = this.p.fitIn(this.model, {})); }
    write(pag) {
        let md = this.model, p = this.p;
        md.render(p);
    }
    part(index) {
        return this.parts[index];
    }
}
class GraphicBox extends Box {
    clearStyle() {
        throw new Error("Method not implemented.");
    }
    get css() {
        return this._css || (this._css = {});
    }
    write(index) {
        const model = this.model, parent = this.p;
        //this.addBox(m(new gr.SvgViewer({ })), index);
        parent.append(model, index);
        return index;
    }
    part(index) {
        return this.parts[index];
    }
    static default = {};
}
class SymbolBox extends Box {
    get css() {
        return this.data ? this.data.$.css : this.layout;
    }
    clearStyle() {
        throw new Error("Method not implemented.");
    }
    data;
    valid(index) {
        let model = this.model, data;
        if (this.data !== undefined)
            data = this.data;
        else {
            let src = model.dir ? `${model.dir}.${model.dt}` : model.dt;
            data = this.data = super.valid(index) && this.ctx.symb(src);
            if (data) {
                normBox(data);
                //data.$.id = model.$.id;
                Object.assign(data.ly, model.ly);
            }
            // @if DEBUG
            else {
                console.warn('symbol not found', src);
            }
            // @endif
        }
        return !!data;
    }
    write(index) {
        let t = write(this.data, index, this.id, this.p);
        for (let part in this.data.$.parts)
            this.parts[part] = this.data.$.parts[part];
        return t;
    }
    part(index) {
        //// so não tem data returna o empty-box
        //if (this.data && !(index in this.parts))
        //  this.addBox(this.data.$.part(index), index);
        ////return empty box
        return this.parts[index];
    }
    transport(from, to) {
        if (this.data)
            this.data.$.transport(from, to);
        super.transport(from, to);
    }
    clear() {
        if (this.data && this.data.$)
            this.data.$.clear();
        super.clear();
    }
    static symbs(dt, list) {
        list.push(dt.dt);
    }
}
class PHBox extends Box {
    clearStyle() {
        throw new Error("Method not implemented.");
    }
    get css() {
        return this.data ? this.data.$.css : this.layout;
    }
    data;
    valid(index) {
        let model = this.model, data;
        if (this.data !== undefined)
            data = this.data;
        else {
            let t = super.valid(index) ? this.ctx.calc(model.val, this, index) : null;
            if (t) {
                this.data = data = (0, s_1.isS)(t) ?
                    { tp: 'p', dt: [{ dt: t }] } :
                    cloneBox(t);
                normBox(data);
                Object.assign(data.ly, model.ly);
            }
            // @if DEBUG
            else {
                console.warn('value is not a valid box', model.val);
            }
            // @endif
        }
        return !!data;
    }
    write(index) {
        let t = write(this.data, index, this.id, this.p);
        for (let part in this.data.$.parts)
            this.parts[part] = this.data.$.parts[part];
        return t;
    }
    part(index) {
        //// so não tem data returna o empty-box
        //if (this.data && !(index in this.parts))
        //  this.addBox(this.data.$.part(index), index);
        ////return empty box
        return this.parts[index];
    }
    transport(from, to) {
        if (this.data)
            this.data.$.transport(from, to);
        super.transport(from, to);
    }
    clear() {
        if (this.data && this.data.$)
            this.data.$.clear();
        super.clear();
    }
}
class HrBox extends Box {
    clearStyle() {
        throw new Error("Method not implemented.");
    }
    get css() {
        if (!this._css) {
            let md = this.model, p = this.p;
            //,
            //props = {}
            //if (md.s)
            //  for (let i = 0; i < md.s.length; i++)
            //    Object.assign(props, th.byKey(md.s[i]));
            //else Object.assign(props, th.byKey(void 0));
            //if (md.is)
            //  Object.assign(props, md.is);
            var bd = border(Object.assign({}, exports.theme.hr[md.s], md.is));
            this._css = p.fitIn(md, {});
            this._css[md.o == "v" ?
                'border-left' :
                'border-bottom'] = bd;
        }
        return this._css;
    }
    write(index) {
        var model = this.model, parent = this.p;
        this.addBox((0, galho_1.g)('hr', ["hr" /* hr */]).css(this.css), index);
        //sheet = parent.part(/*model, */index);
        parent.append(model, index);
        if (parent.overflow(model, index))
            parent.append(model, ++index);
        return index;
    }
    part(index) {
        return this.parts[index];
    }
}
class NewBox extends Box {
    clearStyle() {
        throw new Error("Method not implemented.");
    }
    get css() {
        return this._css || (this._css = {});
    }
    write(index) {
        //const model = this.model;
        this.addBox((0, galho_1.g)('div'), ++index);
        this.p.append(this.model, index);
        //.part(/*model, */index).append();
        return this.end = index;
    }
    part(index) {
        return this.parts[index];
    }
}
class ImgBox extends Box {
    clearStyle() {
        throw new Error("Method not implemented.");
    }
    get css() {
        if (!this._css) {
            let md = this.model, p = this.p;
            this._css = p.fitIn(md, styleImg(md.is));
        }
        return this._css;
    }
    write(index) {
        var model = this.model, parent = this.p;
        this.addBox((0, galho_1.g)('img', ["box" /* box */, "img" /* img */])
            .prop("src", parent.ctx.img(model.dt, model.pars))
            .css(this.css), index);
        parent.append(model, index);
        if (parent.overflow(model, index) == 1 /* out */)
            parent.append(model, ++index);
        //.part(model, index)
        //.append();
        return index;
    }
    part(index) {
        return this.parts[index];
    }
    static default = {
        is: {
            w: 64,
            h: 64
        },
        ub: true
    };
}
function render(box) {
    if (!box)
        return null;
    if ((0, s_1.isS)(box))
        return (0, galho_1.g)("p", 0, box);
    let r = galho_1.S.empty, p = {
        ctx: {
            fmt(value, exp) {
                return exports.$.fmt(value, exp, {
                    currency: this.dt.currency,
                    currencySymbol: this.dt.currencySymbol || false,
                    //refCurr:
                });
            },
            //calc(value: Expression, ctx: IBookContext, index?: number) {
            //  return getValue(value, ctx, index);
            //},
            //img() { return ''; }
        },
        getTextTheme: () => null,
        fitIn: (_, css) => css,
        overflow: () => 0 /* in */,
        append(child) {
            r = child.$.part(0);
        }
    };
    write(box, 0, 0, p);
    return r;
}
exports.render = render;
const sheet = (bk, w) => (0, galho_1.g)('article', "sheet" /* sheet */, render(bk.dt)).css({
    background: "#fff",
    width: `${w}px`,
    marginTop: `40px`,
    padding: space([0, 6]),
    whiteSpace: "pre-wrap"
});
exports.sheet = sheet;
//function pag(ctx: Context, bk: Book, w: number, h: number, index: number) {
//  return [div, bd];
//}
async function sheets(ctx, container, bk, w, h) {
    let content, bd, currentPag = -1;
    write(bk.dt, 0, 0 /* d */, {
        ctx,
        dt: ctx.dt,
        getTextTheme: () => null,
        fitIn(child, css) {
            if (child.ly.fill)
                css.minHeight = "100%";
            return Object.assign(css, { marginTop: 0, marginBottom: 0 });
        },
        overflow(child, index) {
            let cRect = child.$.part(index).rect(), pRect = (0, s_1.rect)(bd);
            return Math.floor(cRect.bottom) > Math.ceil(pRect.bottom) ? 1 /* out */ : 0 /* in */;
        },
        justALittle(child, index) {
            let cRect = child.$.part(index).rect(), pRect = (0, s_1.rect)(bd);
            return (pRect.bottom - cRect.top) < minBoxSize;
        },
        append(dt, index) {
            if (index != currentPag) {
                let pad = bk.pad || exports.theme.padding, hd = (0, galho_1.g)('header').css("height", `${bk.hdSize || exports.theme.hdSize}px`), ft = (0, galho_1.g)('footer').css("height", `${bk.ftSize || exports.theme.ftSize}px`), p = {
                    ctx,
                    dt: ctx.dt,
                    getTextTheme: () => null,
                    fitIn: (_, css) => css,
                    overflow: () => 0 /* in */,
                    append(dt) { part.add(dt.$.part(index)); }
                };
                bd = (0, galho_1.g)('section', "body" /* body */);
                content = (0, galho_1.g)('article', "sheet" /* sheet */, hd)
                    .addTo(container)
                    .css({
                    background: '#fff',
                    width: `${w}px`,
                    height: `${h}px`,
                    padding: space(pad),
                    whiteSpace: 'pre-wrap'
                });
                let part = content;
                (ctx.parts ||= [])[index] = content;
                if (bk.top) {
                    write(bk.top, index, -3 /* t */, p);
                    h -= (0, s_1.height)(bk.top.$.part(index));
                }
                content.add(bd);
                if (bk.bottom) {
                    write(bk.bottom, index, -4 /* b */, p);
                    h -= (0, s_1.height)(bk.bottom.$.parts[index]);
                }
                if (bk.hd) {
                    part = hd;
                    write(bk.hd, index, -1 /* h */, p);
                }
                content.add(ft);
                if (bk.ft) {
                    part = ft;
                    write(bk.ft, index, -2 /* f */, p);
                }
                h -= (bk.hdSize || exports.theme.hdSize) + (bk.ftSize || exports.theme.ftSize) + pad[0] * 2;
                if (h <= 0)
                    throw "error";
                if (bk.wm) {
                    part = (0, galho_1.div)("wm" /* watermark */);
                    write(bk.wm, index, -4 /* b */, p);
                }
                bd.css('height', h + 'px');
                //[div, bd] = pag(ctx, bk, w, h, currentPag = index);
            }
            bd.add(dt.$.part(index));
        }
    });
    if (ctx.wait)
        await Promise.all(ctx.wait);
    return container;
}
exports.sheets = sheets;
function dblSheets(container, w) {
    let t = container.childs().remove();
    for (let i = 0; i < t.length; i += 2) {
        let t2 = t.slice(i, i + 2);
        t2.splice(1, 0, (0, galho_1.g)('hr').css({
            borderLeft: '1px dashed #AAA',
            margin: 0
        }));
        container.add((0, galho_1.div)("sheet" /* sheet */, t2).css({
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
    A3: [297 * units.mm, 420 * units.mm]
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
function normalize(dt) {
    let symbs = dt.symbs ||= [], t = (dt) => exports.boxes[dt.tp].symbs(dt, symbs);
    t(normBox(dt.dt));
    dt.hd && t(normBox(dt.hd));
    dt.top && t(normBox(dt.top));
    dt.bottom && t(normBox(dt.bottom));
    dt.ft && t(normBox(dt.ft));
    return dt;
}
exports.normalize = normalize;
/* ************************************************************** */
/* *****************************COLLECTIONS********************** */
/* ************************************************************** */
const spans = {
    ["t"]: Span,
    ["s"]: Scalar,
    ["img"]: Img
};
exports.boxes = {
    ["p"]: PBox,
    ["block"]: BlockBox,
    ["graphic"]: GraphicBox,
    ["symbol"]: SymbolBox,
    ["custom"]: CustomBox,
    ["grid"]: GridBox,
    ["col"]: ColBox,
    ["row"]: RowBox,
    ["img"]: ImgBox,
    ["new"]: NewBox,
    ["hr"]: HrBox,
    ["ph"]: PHBox,
    ["table"]: Tb,
    ["tr"]: Tr,
    ["th"]: Th,
    ["tg"]: Tg
};
exports.theme = {
    padding: [4 * units.mm, 7 * units.mm],
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
            bd: {
                style: 'solid',
                color: "#000",
                width: 1
            },
            pd: [7 * units.pt, 5 * units.pt],
            mg: [4 * units.pt, 2 * units.pt],
            rd: 2
        },
        filled: {
            pd: [3 * units.pt, 2 * units.pt],
            mg: [2 * units.pt, 1 * units.pt],
            rd: 1,
            tx: 'white',
            bg: {
                tp: 'color',
                dt: "#444"
            }
        },
        blank: {
            pd: [7 * units.pt, 5 * units.pt],
            mg: [4 * units.pt, 2 * units.pt],
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
            mg: [2 * units.pt, 1 * units.pt],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJvb2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQWtDO0FBRWxDLCtCQUE0QztBQU01QyxNQUFNLE9BQU8sR0FBRyxDQUFDLEdBQVcsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7QUF5RXpELGNBQWM7QUFDRCxRQUFBLEtBQUssR0FBRyxTQUFTLENBQUM7QUFTL0IsTUFBTSxTQUFTLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFFM0IsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBc0J0QixJQUFZLEtBTVg7QUFORCxXQUFZLEtBQUs7SUFDZiw2Q0FBYyxDQUFBO0lBQ2QsOENBQVksQ0FBQTtJQUNaLDhCQUFPLENBQUE7SUFDUCw4Q0FBWSxDQUFBO0lBQ1osNkJBQU0sQ0FBQTtBQUNSLENBQUMsRUFOVyxLQUFLLEdBQUwsYUFBSyxLQUFMLGFBQUssUUFNaEI7QUEwSEQsb0VBQW9FO0FBQ3BFLG9FQUFvRTtBQUVwRSxTQUFTLE1BQU0sQ0FBQyxDQUFTO0lBRXZCLE9BQU8sR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLE9BQU8sSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLE1BQU0sRUFBRSxDQUFDO0FBQ3hFLENBQUM7QUFFRCxTQUFTLE9BQU8sQ0FBQyxHQUFRLEVBQUUsSUFBYTtJQUN0QyxJQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7UUFDcEIsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixHQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8s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