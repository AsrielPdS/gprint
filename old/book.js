const { div, g, S } = require("galho");
const { height, isS, rect } = require("galho/s");
const hasProp = (obj) => Object.keys(obj).length;
//#region util
exports.empty = '&#8203;';
const
  $mapIndex = Symbol(),
  minBoxSize = 40,
  units = {
    cm: 96 / 2.54,
    mm: (96 / 2.54) / 10,
    in: 96,
    pt: 96 / 72,
    px: 1
  };
exports.units = units;
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
  return div(["empty" /* empty */]).css(ly).html(empty);
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
exports.cpu = () => {
  let delay = function (data) {
    let r = g('span').html(empty);
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
  return (v, s, p) => $.calc(v, {
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
//#endregion
function cloneBox(box) {
  return JSON.parse(JSON.stringify(box));
  //return <T>acceptBoxes.get(box.tp).clone(box);
}
function emptyBox() {
  return PBox.normalize({ tp: "p" });
}
exports.createBox = (box, id, parent) => {
  let t = boxes[box.tp];
  if (!t)
    throw 'tp not found';
  return Reflect.construct(t, [box, parent, id]);
}
exports.write = (box, pag, id, parent) => {
  if (box.$) {
    box.$.id = id;
    box.$.render(pag);
  }
  else {
    createBox(box, id, parent).render(pag);
  }
  return box.$.end;
}
/** normalize box */
const normBox = (box) => boxes[box.tp].normalize(box);
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
    let t = this.parts[index] = g('span').css(this.css);
    if (this.model.dt)
      t.text(this.model.dt);
    else
      t.html(empty);
    return t;
  }
  break(index) {
    let model = this.model, part = g('span', null, model.dt).css(this.css);
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
    return v == null ? null : this.parts[index] = g('exp', { css: this.css }, v);
  }
  break(index) {
    return this.parts[index] = g('exp').css(this.css);
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
      return this.parts[index] = g('img', {
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
  static replace(_model, _key, _newValue) {
    return false;
  }
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
    return theme.p[this.model.s] || null;
  }
  get css() {
    if (!this._css) {
      let md = this.model, th = theme.p, props = {}, css = {};
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
      p.html(empty);
    return this.writeCheck(p, index);
  }
  part(index) {
    let t = this.parts[index];
    if (!t) {
      t = this.parts[index] = this.addBox(g("p"), index).css(this.css);
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
        let childs = p.childs(), newE = g("p").css(this.css), i = childs.length - 1;
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
      let md = this.model, p = this.p, box = theme.box[md.s], txtStyle = theme.p[md.is.tx || box && box.tx];
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
      (md.s ? theme.box[md.s].tx : null) ||
      this.p.getTextTheme();
  }
  _lCss;
  _lItems;
  listItem(p) {
    let l = this.model.l, css = this._lCss || styleText(l, {}), s = g('span', ['li'], $.scalar(p.li, l.fmt)).css(css);
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
      normBox(isS(t) ? md.dt[i] = { tp: "p", dt: [{ dt: t }] } : t);
    }
    if (md.hd)
      normBox(md.hd);
    if (md.ft)
      normBox(md.ft);
    return md;
  }
  static symbs({ dt, hd, ft }, list) {
    let t = (dt) => boxes[dt.tp].symbs(dt, list);
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
      if (!boxes[child.tp].isEmpty(child))
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
    return this.addBox(div("block" /* block */).css(this.css), index);
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
    return this.addBox(div(["book-col" /* col */]), index)
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
      .addBox(div("book-row" /* row */), index)
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
      let md = this.model, th = theme.tables;
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
      let md = this.model, p = this.p, style = this.style, txtStyle = theme.p[md.is.tx || style && style.tx];
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
      .addBox(div("book-table" /* table */), index)
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
          tableStyle.dt, box = theme.box[md.s], txtStyle = theme.p[md.is.tx || (box && box.tx) || (pS && pS.tx)];
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
      .addBox(div("book-tr" /* tr */), index)
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
      .addBox(div("book-th" /* th */, div(["body" /* body */])), pag)
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
        .addBox(div(["box" /* box */, "book-table-group" /* tableGroup */], div(["body" /* body */])), index)
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
      .addBox(div("grid" /* grid */, [div(), div(), div()]), index)
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
        this.data = data = isS(t) ?
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
      var bd = border(Object.assign({}, theme.hr[md.s], md.is));
      this._css = p.fitIn(md, {});
      this._css[md.o == "v" ?
        'border-left' :
        'border-bottom'] = bd;
    }
    return this._css;
  }
  write(index) {
    var model = this.model, parent = this.p;
    this.addBox(g('hr', ["hr" /* hr */]).css(this.css), index);
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
    this.addBox(g('div'), ++index);
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
    this.addBox(g('img', ["box" /* box */, "img" /* img */])
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
exports.render = (box) => {
  if (!box)
    return null;
  if (isS(box))
    return g("p", 0, box);
  let r = S.empty, p = {
    ctx: {
      fmt(value, exp) {
        return $.fmt(value, exp, {
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
exports.sheet = (bk, w) => g('article', "sheet" /* sheet */, render(bk.dt)).css({
  background: "#fff",
  width: `${w}px`,
  marginTop: `40px`,
  padding: space([0, 6]),
  whiteSpace: "pre-wrap"
});
//function pag(ctx: Context, bk: Book, w: number, h: number, index: number) {
//  return [div, bd];
//}
exports.sheets = async (ctx, container, bk, w, h) => {
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
      let cRect = child.$.part(index).rect(), pRect = rect(bd);
      return Math.floor(cRect.bottom) > Math.ceil(pRect.bottom) ? 1 /* out */ : 0 /* in */;
    },
    justALittle(child, index) {
      let cRect = child.$.part(index).rect(), pRect = rect(bd);
      return (pRect.bottom - cRect.top) < minBoxSize;
    },
    append(dt, index) {
      if (index != currentPag) {
        let pad = bk.pad || theme.padding, hd = g('header').css("height", `${bk.hdSize || theme.hdSize}px`), ft = g('footer').css("height", `${bk.ftSize || theme.ftSize}px`), p = {
          ctx,
          dt: ctx.dt,
          getTextTheme: () => null,
          fitIn: (_, css) => css,
          overflow: () => 0 /* in */,
          append(dt) { part.add(dt.$.part(index)); }
        };
        bd = g('section', "body" /* body */);
        content = g('article', "sheet" /* sheet */, hd)
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
          h -= height(bk.top.$.part(index));
        }
        content.add(bd);
        if (bk.bottom) {
          write(bk.bottom, index, -4 /* b */, p);
          h -= height(bk.bottom.$.parts[index]);
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
        h -= (bk.hdSize || theme.hdSize) + (bk.ftSize || theme.ftSize) + pad[0] * 2;
        if (h <= 0)
          throw "error";
        if (bk.wm) {
          part = div("wm" /* watermark */);
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
/**
 * @param container{S}
 * @param w{number}
 */
exports.dblSheets = (container, w) => {
  let t = container.childs().remove();
  for (let i = 0; i < t.length; i += 2) {
    let t2 = t.slice(i, i + 2);
    t2.splice(1, 0, g('hr').css({
      borderLeft: '1px dashed #AAA',
      margin: 0
    }));
    container.add(div("sheet" /* sheet */, t2).css({
      width: (w * 2) + "px",
      display: 'flex',
      flexDirection: 'row'
    }));
  }
  return container;
}
exports.medias = {
  A4: [210 * units.mm, 297 * units.mm],
  A5: [148 * units.mm, 210 * units.mm],
  A3: [297 * units.mm, 420 * units.mm]
};
exports.print = async (container, o, media, cb) => {
  let pags = container.childs(), style = g('style', null, `@page{size:${media} ${(o == "h" ? 'landscape' : 'portrait')};}`);
  g(document.body).add(pags);
  style.addTo(document.head);
  await cb();
  style.remove();
  container.add(pags);
}
exports.normalize = (dt) => {
  let symbs = dt.symbs ||= [], t = (dt) => boxes[dt.tp].symbs(dt, symbs);
  t(normBox(dt.dt));
  dt.hd && t(normBox(dt.hd));
  dt.top && t(normBox(dt.top));
  dt.bottom && t(normBox(dt.bottom));
  dt.ft && t(normBox(dt.ft));
  return dt;
}
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
