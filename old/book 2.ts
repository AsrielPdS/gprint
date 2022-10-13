import { div, empty, g, S } from "galho";
import { Properties, Styles } from "galho/css";
import { extend, bool, Dic, float, int, isA, isN, isS, Key, str, Task, unk, assign } from "galho/util.js";

function hasProp(obj: object) {
  for (let _ in obj)
    if (_ != null) return true;
  return false;
}
const fall = (v: Object) => v && hasProp(v) ? v : void 0;

/**book item type */
type BT = "p" | "row" | "col" | "tr" | "th" | "block" | "ph" | "hr" | "table" | "tg" | "img" | "symbol" | "grid" | "custom" | "graphic" | "new";

export type Ori = "h" | "v";
/**book span type */
type ST = "t" | "e" | "img";
/* ************************************************************** */
/* *********************MAIN INTERFACE*************************** */
/* ************************************************************** */
//#region main_interface
interface Context {
  dt?: unknown;
  temp?: Dic<unknown>;
  fmt?(value: unknown, exp: str, opts?: Dic): str;
  calc?(value: Expression, ctx: Scope, pag?: int): unknown;
  img?(path: str): str;
  rsc?(src: str): Task<unknown>
  wait?: Promise<any>[];
  pagCount?: int;
}
export interface Scope<L = unk> {
  readonly p?: BoxParent<L>;
  id?: int;
  dt?: unknown;
  readonly ctx: Context;
  /**@deprecated */
  ranges?: { [index: int]: Object[]; };
}
type OFR = OFTp.in | OFTp.jump | float;
export interface BoxParent<CL> extends Scope<unk> {
  fitIn(box: Box<CL>, css: Properties): void;
  append(child: Box<CL>, pag: int): void;
  remove?(child: Box<CL>, pag: int): void;
  overflow?(child: Box<CL>, pag: int): OFR;

  insertAfter?(child: Box<CL>, newE: iSBox);
  posWrite?(pag?: int);
  //checkStyle?<K extends keyof TextStyle>(key: K): TextStyle[K];
  getTextTheme(): str | void;
  listItem?(p: P<CL>): S;
  removeLI?(p: P<CL>): void;
  bb?: BB;
  //readonly edit?: bool;
}

type BorderType = "none" | "hidden" | "dotted" | "dashed" | "solid" | "double" | "groove" | "ridge" | "inset" | "outset";

interface Border {
  style?: BorderType;
  width?: int;
  color?: str;
}

const $mapIndex = Symbol();

interface NDic<T> {
  [n: int]: T;
  start?: int;
  end?: int;
}
export const enum DTParts {
  /**head */
  h = -1,
  /**foot */
  f = -2,
  /**data (body) */
  bd = 0,
  /**top */
  t = -3,
  /**bottom */
  b = -4,
  /** water mark */
  w = -5,

}
const enum units {
  cm = 96 / 2.54,
  mm = cm / 10,
  in = 96,
  pt = 96 / 72,
  px = 1
}

//#endregion
/* ************************************************************** */
/* **************************INTERFACE*************************** */
/* ************************************************************** */
//#region  interface
type Borders = [Border, Border, Border, Border] | Border;
type BoxSpace = [int, int?, int?, int?];
type TextVAlign = "baseline" | "sub" | "super"
type Margin = [int | null, int | null, int | null, int | null];

export interface SpanStyle {
  /**font family */
  ff?: str;
  /**font size */
  fs?: int;
  /**bold */
  b?: bool;
  /**italic */
  i?: bool;
  /**underline */
  u?: bool;
  /**strikethrough */
  st?: bool;

  sub?: bool;
  sup?: bool;

  transform?: 'capitalize' | 'uppercase';
  /**vertical align */
  va?: TextVAlign;
  /**color */
  cl?: str;
  /**background */
  bg?: str;
}
interface Shadow {
  inset?: bool;
  x: int;
  y: int;
  blur: int;
  spread: int;
  color: str;
}
interface Efect {
  blur: int,
  brightness: int,
  contrast: int,
  grayscale: int,
  'hue-rotate': int,
  invert: int,
  opacity: int,
  saturate: int;
  sepia: int;
}
interface ImgStyle {
  radius?: int;
  shadow?: Shadow[];
  border?: Border | [Border, Border, Border, Border];
  efect?: Efect;
  clip?: [int, int, int, int];
  h?: int,
  w?: int;
}
interface Background {
  tp?: 'img' | 'color';
  dt: str;
}
interface BoxStyle {
  bg?: Background;
  /**border */
  bd?: Borders;
  /**Padding */
  pd?: BoxSpace;
  /**Margin */
  mg?: BoxSpace;
  /**border radius */
  rd?: int | [int, int, int?, int?];
  /**@deprecated */
  al?
  /**text style */
  tx?: str;
}
interface TextShadow {
  x: int;
  y: int;
  blur?: int;
  color?: str;
}
export interface PStyle {

  shadow?: TextShadow[];
  mg?: int;
  //paragraph properties
  indent?: int;
  /**line height */
  lh?: int;
  /**align */
  al?: Align;
  noWrap?: bool
  overflow?: 'ellipsis' | 'clip';
}
export type Align = "e" | "s" | "c" | "j" | "l" | "r" | "end" | "start" | "center" | "justify" | "left" | "right";
function align(v: Align) {
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
// {
//   l = "l",//left
//   r = "r",//right
//   e = "e",//end
//   end = "e",
//   s = "s",//start
//   j = "j",//justify
//   c = "c" //center
// }
export type TextStyle = PStyle & SpanStyle;

interface divisor<T> {
  base?: T;
  odd?: T;
  first?: T;
  last?: T;
}

//#endregion
/* ************************************************************** */
/* ***************************METHODS**************************** */
//#region methods
function border(b: Border) {

  return `${b.width || 1}px ${b.style || 'solid'} ${b.color || "#000"}`;
}

function borders(css: Dic, bord: Borders) {
  if ('length' in bord) {
    let b = bord[0];
    (b) && (css['border-top'] = border(bord[0]));
    (b = bord[1]) && (css['border-right'] = border(b));

    (b = bord[bord.length - 2]) && (css['border-bottom'] = border(b));
    (b = bord[bord.length - 1]) && (css['border-left'] = border(b));

  } else css.border = border(bord);
}

const space = (p: BoxSpace) => p.map(p => p + 'px').join(' ')


//existe 6 styles do tipo header
//e 6 do tipo paragrafo que definim informação relacionadas a formatação do texto
//tem inline style mas so para algumas propiedades(line,bold,italic,super,sub)
//os table head não tenhem inline style e so podem ser de algum dos 6 tipos de header style
//table cell não tem inline style tambem e so podem ser de um paragraph style
//estilos do documentos (extend:border,padding,round,filter) tambem ficam nos styles globas mas tambem podem estar inlines
function styleText(style: SpanStyle, css: Properties) {

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

const emptyDiv = (ly: Dic) => div().css(ly).html(empty);

function buildShadow(shadow: Shadow[]) {
  return shadow.map(sh => `${sh.inset ? 'inset' : ''} ${sh.x}px ${sh.y}px ${sh.blur}px ${sh.spread}px ${sh.color}`).join(',');
}
function styleImg(style: ImgStyle, css: Dic<Key> = {}) {

  if (style) {
    if (style.border)
      if (isA(style.border))
        assign(css, {
          'border-top': border(style.border[0]),
          'border-right': border(style.border[1]),
          'border-bottom': border(style.border[2]),
          'border-left': border(style.border[3]),
        });
      else css.border = border(style.border);

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
function styleBox(s: BoxStyle, css: Dic = {}) {
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
function styleParagraph(style: PStyle, css: Properties) {
  css.margin = `${style.mg || 0}px 0`
  if (style.shadow)
    css.textShadow = style.shadow.map(s => `${s.x}px ${s.y}px ${s.blur || 0}px ${s.color}`).join();

  //paragraph
  if (style.indent)
    css.textIndent = `${style.indent}px`;

  if (style.lh)
    css.lineHeight = style.lh;

  style.al && (css.textAlign = align(style.al))
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

function getCtx(exp: str, scp: Scope, pag: int) {
  let ctx = scp.ctx;
  if (exp) {
    //while (!parent.dt)
    //    parent = parent.p;
    //..
    while (exp.startsWith('../')) {
      exp = exp.slice(3);
      let oldP: Scope;
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
    var data: unknown;
    if (exp[0] == '=') {
      data = ctx.calc(exp.slice(1), scp, pag);
      if (data == null)
        data = {};
      //data[$parent] = parent.dt;
    } else {
      let split = exp.split('.');
      data = scp.dt;
      for (let i = 0; i < split.length; i++) {
        if (data == null) return null;
        data = data[split[i]];
      }
    }

    return data;
  } else return scp.dt;
}
function wait(scp: Scope, cb: () => any) {
  (scp.ctx.wait ||= []).push(new Promise<void>(rs => {
    setTimeout(() => { cb(); rs(); });
  }));
}
interface CalcOpts {
  funcs(name: str, args: any[]): any;
  vars(name: str, obj?: bool): any;
}
interface Settings {
  fmt?(value: unknown, exp: str, opts: Dic): str;
  scalar?(value: int, fmt: str): any;
  calc?(expression: Expression, opts: CalcOpts): any;
}
export const $: Settings = {}


// function emptyBox() {
//   return new PBox({} as IPBox);
// }


interface Theme {
  key?: str;
  base?: Key;
  /**espacamento padrão das paginas */
  padding?: BoxSpace;
  /**header size */
  hdSz?: int;

  /**footer size */
  ftSz?: int;

  text?: TextStyle;

  /**paragraph style, include default style for text in paragraph */
  p?: Dic<TextStyle & { title?: str }>;
  box?: Dic<BoxStyle & { title?: str }>;
  title?: str;
  info?: str;

  //#region extensions
  hr?: Dic<HrStyle>;
  /**table style, include text in table */
  tables?: Dic<TableStyle>;
  //#endregion
}

function createBox<L>(box: iBox<L> | str, id: int, p: BoxParent<L>, bb?: BB) {
  isS(box) && (box = <iP<L>>{ bd: box });
  let t = new boxes[box.tp || 'p']() as Box<L>;
  t.init(box, p, id, bb == null ? p.bb : bb)
  return t;
}



interface SideLayout {

}


/** overflow type */
const enum OFTp {
  in = 0,
  out = 1,
  jump = -1
}
/**break behavier */
export const enum BB {
  stay = 0,
  transport,
  break,
}

interface IBookContext {
  readonly parent?: IBookContext;
  dt?: unknown;
  ctx?: BoxRoot;
  parts?: NDic<S>;
}
interface BoxRoot extends IBookContext {
  items: Dic;
  warning(message: str, data?: unknown): void;
  //context: RootContext


}


const enum BoxMode {
  editing,

  preview
}


type Expression = str;
type CPU = (expression: Expression, scp: Scope, pag?: int) => any;
type CPUExp = (this: { p: int, s: Scope }, ...args: any[]) => any;
/** central processor unit */
export function cpu(): CPU {
  let
    delay = <CPUExp>function (data: () => any) {
      let r = g('span').html(empty);
      wait(this.s, () => { r.replace(data()); });
      return r;
    },
    funcs = <Dic<CPUExp>>{
      //options: (key: str) => system.options[key],
      ctx(item?: str) {
        let t = this.s.dt;
        if (item) {
          if (t)
            for (let k of item.split('.'))
              if (!(t = (t[k])))
                break;
        }
        return t;
      },
      mapIndex() { return this.s.dt ? (this.s.dt[$mapIndex] + 1) : null },
      set(key: str, value) { return this.s.dt[key] = value },
      //set data to temporary storage
      setTemp(key: str, value) { return (this.s.ctx.temp ||= {})[key] = value },
      //get data from temporary storage
      getTemp(key: str) { return this.s.ctx.temp?.[key] },
      up(levels: int) {
        let t = this.s;
        for (let i = 0, j = levels || 1; i < j; i++)
          t = t.p;
        return t.dt;
      },
      index() { return this.s.id },
      sheetData() {
        let t = this.s;
        while (!t.ranges)
          t = t.p;
        return t.ranges[this.p];
      },
      //item(key: str){ return  this.s.ctx.items.get(key) },
      delay,
      pag_sum(name: str, mapFn: (item: int) => int, format?: str) {
        return delay.call(this, () => {
          let
            lastValue = <int>funcs.get_temp.call(this, name) || 0,
            data = funcs.sheet_data.call(this).map(mapFn).reduce((p, n) => p + (n || 0), lastValue);

          this.s.ctx.temp[name] = data;
          return format ? this.s.ctx.fmt(data, format) : data;
        });
      },
      pags() {
        return this.s.ctx.pagCount;
        //while (t.p)
        //  t = t.p;
        //return (t.parts as m.S[]).length;
      },
      pag() {
        return this.p + 1;
      },
      //exchange(currency: str) {
      //  if (!currency)
      //    currency = (<any>this.s.ctx)._fOpts.currency;
      //  return scalar.currencies().byKey(currency, 'code').value;
      //},
      //currency() {
      //  return (<any>scp.ctx)._fOpts.currency;
      //}
    };

  return (v: Expression, s: Scope, p?: int) => $.calc(v, {
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
/** ************************************************************* */
/** ****************************SPAN***************************** */
/** ************************************************************* */
//#region span
export interface iSpan<S = any> {
  tp?: ST;

  /**@deprecated */
  s?;
  /**data */
  dt?: str;
  /**style */
  is?: S;
}
export interface Span extends NoType<iSpan> {
  //new?(model: T, parent: IBookContext): SpanBase;

  p: P;
  /**cria um novo box para esta clause */
  break?(pag: int): S;
  view(pag: int/*, edit: bool*/): S;
  isEmpty(): bool;
  //edit(action: str, opts: unknown)
  parts: NDic<S>;

  readonly length: int;
  toJSON(): iSpans;
}
type NoType<T, U = { tp: str }> = Pick<T, Exclude<keyof T, keyof U>>;
export interface iText extends iSpan<SpanStyle> {
  tp?: "t";
}
export class Text implements NoType<iText>, Span {
  dt: str;
  is?: SpanStyle;
  constructor(i: iText, public p: P) {
    extend(this, i);
  }

  parts: NDic<S> = {};

  get css() {
    return styleText(this.is, {});
  }


  get bold(): bool {
    let is = this.is;
    return this.is?.b || false;
  }
  get length() { return this.dt.length; }

  toJSON(): iText {
    let { dt, is } = this;
    return { dt, is: fall(is) }
  }
}
interface iExp extends iSpan<SpanStyle> {
  tp: "e";
  /**input type */
  it?: str;
  /**format */
  fmt?: str;
}

/**expression */
class Exp implements Span, NoType<iExp> {
  it?: str;
  fmt?: str;
  dt: str;
  is: SpanStyle;
  constructor(i: iExp, public p: P) {
    extend(this, i);
  }
  get

    parts: NDic<S> = { };

  get css() {
  return;
}
edit
//edit(action: BookBaseAction | str, opts?: unknown): bool {
//  if (action.startsWith('t-')) {
//    editText(this, action, opts);
//    return true;
//  }
//  return false;
//}

toJSON(): iExp {
  let { dt, is } = this;
  return { tp: "e", dt, is: fall(is) }
}
}

interface iImgSpan extends iSpan<ImgStyle> {
  tp: "img";
  width?: float;
  height?: float;
  base?: 'width' | 'height';
  calc?: bool
}
class ImgSpan implements Span, NoType<iImgSpan> {
  it?: str;
  fmt?: str;
  dt: str;
  is: ImgStyle;
  pars?: Dic<str>;
  parts: NDic<S> = {};
  base: 'width' | 'height';
  width?: float;
  height?: float;
  calc?: bool
  constructor(i: iImgSpan, public p: P) {
    extend(this, i);
  }
  get length() { return 1; }

  //edit(action: BookBaseAction, opts?: unknown): bool {
  //  if (action.startsWith('img-')) {
  //    editImg(this, action, opts);
  //    return true;
  //  }
  //  return false;
  //}

  toJSON(): iImgSpan {
    let { dt, is } = this;
    return { tp: "img", dt, is: fall(is) }
  }
}
const spans: Dic<Span> = {
  t: {
    init() { },
    len() { return this.dt.length; },
    view(pag: int) {
      let t = this.parts[pag] = g('span');
      this.is && t.css(styleText(this.is, {}));
      if (this.dt)
        t.text(this.dt);
      else t.html(empty);
      return t;
    },
    break(pag: int) {
      let
        part = g('span', null, this.dt).css(this.css);
      this.parts[pag] = part;
      return part;
    },
    isEmpty() { return !this.dt; }
  },
  e: {
    init() { },
    len() { return this.dt.length; },
    isEmpty() { return false; },
    view(pag: int) {
      let
        { p, fmt, dt } = this,
        v: any = p.ctx.calc(dt, p, pag);

      fmt && (v = p.ctx.fmt(v, fmt));

      return v == null ? null : this.parts[pag] = g('exp' as any, { css: this.css }, v);
    },
    break(pag: int) {
      return this.parts[pag] = g('exp' as any).css(this.css);
    }
  },
  img: {
    init() { },
    len() { return 1; },
    view(pag: int) {
      let css = styleImg(this.is), media = this.p.ctx;
      if (this.base) {
        css[this.base] = '100%'
      } else {
        css.width = (this.width || 64) + 'px';
        css.height = (this.height || 64) + 'px';
      }
      if (this.calc) {
        let t = media.calc(this.dt, this.p, pag);
        if (isS(t))
          return g('img', { src: t }).css(css);
        else {
          t = g(<any>t);
          if ((t as S).valid)
            return (t as S).css(css)

          return null;
        }
      }
      else return this.parts[pag] = g('img', {
        src: media.img(this.dt)
      }).css(css);
    },
    isEmpty() { return false; }
  }
};
export type Spans = Text | Exp | ImgSpan;
export type iSpans = iText | iExp | iImgSpan;

type BoxFilter = (v: iSBox) => any;
//#endregion
/** ************************************************************* */
/** *************************** BOX ***************************** */
/** ************************************************************* */
//#region box
export interface iBox<L = unknown> {
  /**@deprecated */
  box?
  /**inline style: Estilo interno */
  is?: unknown;
  /**style: nome do estilo no theme que este item usara */
  s?: str;

  tp?: str;
  /**layout : informação que este elemento passa para o seu parent para ele definir no css */
  ly?: L;

  /**Closure: o escopo é usado pela formula para saber o objecto base de onde tirar as variaveis */
  sc?: str;
  ///**key:identificador unico */
  //key?: str;
  /**validator: if this return false element is not renderized */
  vl?: str;
  /**validação por pagina deve ser processado no mesmo momento que
   o footer e o header*/
  pag?: Expression;
}
abstract class Box<L = unk> implements NoType<iSBox>{
  // protected _ly: object;
  protected _cd: Dic;
  p: BoxParent<L>;
  /**@deprecated provavelmento so é util para o edit */
  start: int;
  ctx: Context;
  ly: L;
  is: unknown;
  s: str;
  pag: Expression;
  vl: str;
  sc: str;
  bb?: BB;
  css: Dic;
  id: int;
  get dt() {
    let { sc, p, start } = this;
    return this._cd ||= getCtx(sc, p, start);
  }
  init(i: iBox<L>, p: BoxParent<L>, id: int, bb: BB) {
    let css: Dic = {};
    extend(this, {
      id,
      ly: i.ly || {} as L,
      is: i.is || {},
      s: i.s, pag: i.pag,
      vl: i.vl, sc: i.sc,
      ctx: (this.p = p).ctx,
      css
    });
    this._i(i, bb);
    this._css(css);
    p.fitIn(this, css);
  }
  /**internal init */
  protected abstract _i(i: iBox<L>, bb: BB): void;
  find?(filter: (v: iSBox) => any): iSBox[];
  /**if this element should be rendered */
  valid(pag: int) {
    return !this.vl || this.ctx.calc(this.vl, this, pag);
  }
  checkPag(pag: int) {
    if (this.pag) {
      let valid = this.ctx.calc(this.pag, this, pag) as (pag: int, pagCount: int) => bool;
      if (valid) {
        wait(this, () => {
          if (!valid(pag, this.ctx.pagCount))
            this.part(pag).css('visibility', 'hidden');
        });
      }
    }
  }
  json<TP extends str>(tp: TP): iBox {
    let { ly, is, s, pag, vl, sc } = this;
    return { tp, ly: fall(ly), is: fall(is), s, pag, vl, sc }
  }
  isEmpty() { return false; }
  abstract transport(from: int, to: int): void
  abstract part(pag: int): S;
  abstract view(pag: int): int;
  abstract clear(): void;
  abstract toJSON(): IMBox;
  abstract _css(v: Dic): void;

}
export type BoxT<L = unknown> = Box<L>;
interface iSBox<L = unknown> extends iBox<L> {
}
abstract class SBox<L = unk> extends Box<L> implements Scope<L>, NoType<iSBox> {
  e: S;

  protected _i(_i: iSBox<L>, bb?: BB): void {
    this.bb = bb && BB.transport;
  }
  part() { return this.e; }

  transport(): void;
  transport(from: int, to: int): void;
  transport() { this.start++; }
  view(pag: int) {
    this.e = this.valid(pag) ? this.render(pag) : emptyDiv(this.css);
    let p = this.p;
    p.append(this, pag);
    if (this.bb && p.overflow(this, pag))
      p.append(this, ++pag);
    return this.start = pag;
  }
  clear() { this._cd = null; }
  protected render?(pag: int): S;
}
interface IMBox<L = unknown> extends iBox<L> {
  /**unbreakeble se false caso não sobre espaço para por toda linha põe o que chegar na proxima pagina
   * por defualt é false*/
  ub?: bool;
}
/**Multple pag Box */
abstract class MBox<L = unknown> extends Box implements Scope, NoType<IMBox> {
  //id: int;
  /**@deprecated provavelmento so é util para o edit */
  end: int;
  parts: NDic<S> = {};
  protected _i(i: IMBox<L>, bb?: BB) {
    this.bb = bb && (i.ub ? BB.transport : BB.break);
  }

  view(pag: int) {
    this.start = this.end = pag;
    if (this.valid(pag))
      this.render(pag);

    else {
      this.addBox(emptyDiv(this.css), pag);
      this.p.append(this, pag);
      this.p.overflow(this, pag);
    }
    return this.end;
  }

  addBox(s: S, index: int) {
    this.parts[this.end = index] = s;

    this.checkPag(index);
    //if (this.edit)
    //  this.setEditPart(s.prop('$', this));
    return s;
  }
  update() {
    throw "not implemented";
  }
  clear() {
    this.parts = {};
    this._cd = null;
  }
  transport(from: int, to: int) {
    let parts = this.parts;
    if (from == this.start)
      this.start = to;

    this.end = to;

    if (parts && from in parts) {
      parts[to] = parts[from];
      delete parts[from];
    }
  }
  abstract part(pag: int): S;
  protected abstract render(pag: int): any;
  static clone(m: IMBox) {
    return <IMBox>{
      tp: m.tp,
      is: m.is,
      s: m.s,
      ub: m.ub,
      vl: m.vl,
      sc: m.sc,
      ly: m.ly,
    };
  }
  // static replace(_model: IParentBox, _key: str, _newValue: IBox) {
  //   return false;
  // }
  json<TP extends str>(tp: TP): IMBox<L> {
    let r = super.json(tp) as IMBox<L>;
    r.ub = this.bb != BB.break;
    //TODO simplificar "ub"
    return r;
  }
}
/**iParagraph */
export interface iP<L = unknown> extends iSBox<L> {
  tp?: "p",
  is?: PStyle;
  /**list index */
  li?: int;
  /**body */
  bd?: (iSpans | str)[] | str;
}
export class P<L = unknown> extends MBox<L> implements NoType<iP, { tp, bd }> {
  bd: Span[];
  declare is: PStyle;

  protected _i(i: iP<L>, bb?: BB): void {
    super._i(i, bb);
    let bd = this.bd = []
    isS(i.bd) && (i.bd = [i.bd]);
    if (i.bd?.length)
      for (let j = 0; j < i.bd.length; j++)
        bd[j] = this.newSpan(i.bd[j]);
    else bd[0] = new Text({}, this);
    this.li = i.li;
    this.bd = bd;
  }

  get theme() {
    return theme.p[this.s];
  }
  _css(v: Dic) {
    let props = assign({}, this.is), s = this.theme;
    if (s) {
      styleText(s, v);
      assign(props, s);
    }
    styleParagraph(props, v)
  }
  li: int;
  render(pag: int) {
    let
      { li, bd } = this,
      p = this.part(pag),
      items: S[] = [li ? this.p.listItem(this) : null];

    for (let i = 0, l = bd.length; i < l; i++) {
      let data = bd[i].view(pag/*, this.edit*/);

      if (data) {
        //if (this.edit)
        //  data.prop('$', dtModel);
        items.push(data);
      }
    }

    if (items.length)
      p.add(items);
    else p.html(empty);

    return this.writeCheck(p, pag);
  }
  part(index: int) {
    let t = this.parts[index];
    if (!t) {
      t = this.parts[index] = this.addBox(g("p", "_"), index).css(this.css);
      this.p.append(this, index)
    }
    return t;
  }
  newSpan(span: iSpans | str) {
    isS(span) && (span = { dt: span });
    let t = Reflect.construct(spans[span.tp || "t"], [span, this]) as Spans;
    t.is ||= {};
    return t;
  }
  writeCheck(div: S, pag: int) {
    let
      { bd, p } = this,
      overflow: OFR;

    while (overflow = p.overflow(this, pag)) {

      if (overflow == OFTp.jump) {

        pag++;
      }
      //se so sobrou um pouco de espaço nesta pagina
      else if (!bd.length || overflow < 40) {
        p.append(this, ++pag);

      } else {
        let
          childs = div.childs(),
          newE = g("p").css(this.css),
          i = childs.length - 1;

        while (i >= 0) {
          newE.prepend(childs[i]);
          //usar aqui para que quando fazer o break diminua 
          i--;
          if (!p.overflow(this, pag))
            break;
        }


        let
          lastE = childs[i + 1],
          last = bd[i + 1];

        if (last.break) {
          div.add(lastE);

          // if (p.overflow(this, pag)) {
          let
            newSpan = last.break(pag),
            lastSpanText = lastE.firstChild,
            split = lastSpanText.textContent.split(' '),
            newSpanText: str[] = [];

          do {
            newSpanText.unshift(split.pop());
            lastSpanText.textContent = split.join(' ');// lastSpanText.textContent.substring(0, lastSpanText.textContent.lastIndexOf(' '));
          } while (p.overflow(this, pag));

          newSpan.add(newSpanText.join(" "));
          newE.prepend(newSpan);
          // }
        }

        pag++;

        this.addBox(div = newE, pag);
        p.append(this, pag);

      }
    }
    return pag;

  }
  toJSON(): iP<L> {
    let r = this.json("p") as iP<L>;
    r.bd = this.bd.map(s => s.toJSON());
    return r;
  }
  isEmpty() {
    for (let span of this.bd)
      if (!span.isEmpty())
        return false;
    return true;
  }
}
interface BlockList extends SpanStyle {
  /**@deprecated */
  indent?: int;
  /**format */
  fmt?: str;
}
interface iParentBase<L = unknown> extends IMBox<L> {
  l?: BlockList;
  is?: BoxStyle;
  /**map: deve repetir a data usando o context */
  map?: bool;
  /**header */
  hd?: iBox<any> | str;

  /**body */
  bd?: (iBox<any> | str)[];

  /**footer */
  ft?: iBox<any> | str;
  /**usado so quando tiver map e não tiver nenhum item */
  empty?: iBox<any> | str;
}
interface iParent<L = unknown, CL = unknown> extends iParentBase<L> {
  hd?: iBoxes<CL> | str;
  bd?: (iBoxes<CL> | str)[];
  ft?: iBoxes<CL> | str;
  empty?: iBoxes<CL> | str;
}
abstract class Parent<L = unknown, CL = unknown> extends MBox<L> implements BoxParent<CL>, NoType<iParent, { tp, bd, ft, hd, map, empty }> {
  //private _ctx: unknown;
  ranges: { [index: int]: Object[]; };
  mode: BoxMode;
  hd: Box<CL>;
  bd?: Box<CL>[];
  ft: Box<CL>;
  empty: Box<CL>;
  map?: iBox<CL>;
  declare is: BoxStyle;

  protected _i(i: iParentBase<L>, bb?: BB): void {
    super._i(i, bb);
    extend(this, {
      empty: i.empty && createBox<CL>(i.empty, DTParts.bd, this),
      hd: i.hd && createBox<CL>(i.hd, DTParts.h, this, BB.stay),
      ft: i.ft && createBox<CL>(i.ft, DTParts.f, this, BB.stay),
    });
    let b = i.bd;
    i.map ?
      (this.map = isS(b[0]) ? <iP<CL>>{ dt: b[0] } : b[0]) :
      (this.bd = (b?.length ? b : [""]).map((e, i) => createBox<CL>(e, i, this)));
  }
  _css(v: Properties) {
    let
      box = theme.box[this.s],
      txtStyle = theme.p[this.is.tx || (box && box.tx)];
    styleBox(assign(v, box, this.is));

    if (txtStyle)
      styleText(txtStyle, v);
  }

  render(pag: int) {
    let
      { bd, dt, map, empty, sc } = this,
      l = bd.length;

    if (l) {
      if (map) {
        let range: Object[] = [], l = (dt as ArrayLike<any>)?.length;
        this.ranges = { [pag]: range };

        if (l)
          for (let i = 0; i < l; i++) {
            let row = dt[i];
            row && (row[$mapIndex] = i);
            range.push(row);

            let temp = createBox(map, i, this);
            //temp.id = j;
            temp.sc = temp.sc ? i + '.' + temp.sc : i + '';
            let newPag = temp.view(pag);
            if (newPag != pag) {
              range.pop();
              this.ranges[pag = newPag] = range = [row];
            }
            //for (let j = 0; j < l; j++) 
            //i++;
          }
        else if (empty)
          pag = empty.view(pag);

      } else for (let i = 0; i < l; i++)
        pag = bd[i].view(pag);

    } else this.part(pag);

    return pag;
  }

  append(child: Box<CL>, pag: int) {
    let
      hd = this.hd,
      part = this.part(pag),
      cpart = child.part(pag),
      id = child.id;


    switch (id) {
      case DTParts.h:
        part.prepend(cpart);
        break;
      case DTParts.f:
        part.add(cpart);
        break;
      //default:
      //  part.place(cpart, id + (hd ? 1 : 0));
      //  break;
      default:
        part.place(id + (hd ? 1 : 0), cpart);
    }
  }
  part(pag: int) {

    let { parts, hd, ft, p } = this, part = parts[pag];

    if (!part) {
      part = this.addBox(div("_").css(this.css), pag);
      p.append(this, pag);

      hd?.view(pag);
      ft?.view(pag);
    }
    return part;
  }
  transport(from: int, to: int) {
    let { hd, bd, ft } = this;
    super.transport(from, to);

    hd?.transport(from, to);
    ft?.transport(from, to);

    for (let i of bd)
      i.transport(from, to);
  }
  overflow(child: Box<CL>, pag: int) {
    let result = this.p.overflow(this, pag);

    if (result && this.bb == BB.transport) {
      this.transport(pag, pag + 1);
      this.p.append(this, pag + 1);
      return OFTp.jump;
    }
    return result;
  }
  getTextTheme() { return txtTheme(this.is, this.s, this.p); }

  private _lCss: Dic;
  private _lItems: Array<{ s: S, p: P }>;
  l?: BlockList;
  listItem(p: P) {
    let
      l = this.l,
      css = this._lCss || styleText(l, {}),
      s = g('span', ['li'], $.scalar(p.li, l.fmt)).css(css);
    if (true) {
      let items = this._lItems || (this._lItems = []);
      items.push({ s, p });
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

  abstract fitIn(box: Box<CL>, css: Properties): void;

  clear() {
    let { hd, bd, ft } = this;

    for (let i of bd)
      i.clear();

    hd?.clear();
    ft?.clear();

    super.clear();
  }

  //static replace(model: IParentBox, key: str, newValue: Boxes) {
  //  if (this.hd && replace(this.hd, key, newValue, () => { this.hd = newValue; }))
  //    return true;

  //  for (let i = 0; i < this.dt.length; i++)
  //    if (replace(this.dt[i], key, newValue, () => { this.dt[i] = newValue; }))
  //      return true;

  //  if (this.ft && replace(this.ft, key, newValue, () => { this.ft = newValue; }))
  //    return true;
  //}

  isEmpty() {
    let { hd, bd, ft } = this;
    for (let child of bd)
      if (!child.isEmpty())
        return false;

    return hd?.isEmpty() && ft?.isEmpty();
  }
  json<TP extends str>(tp: TP): iParentBase<L> {
    let { hd, bd, ft, map } = this;
    return extend(this.json(tp) as iParent<L>, {
      hd: hd?.toJSON(),
      bd: bd.map(child => child.toJSON()),
      ft: ft?.toJSON(), map: !!map
    });
  }
}
const txtTheme = (is: BoxStyle, s: str, p: BoxParent<any>) => is.tx ||
  (s ? theme.box[s].tx : null) ||
  p.getTextTheme()
export type ParentT = Parent;

interface BlockColumn {
  width?: int;
  rule?: Border;
  count?: int;
  gap?: int;
}
interface BlockLy {
  /**is list item */
  li?: bool;
}

export interface iBlock<L = unknown> extends iParent<L, BlockLy> {
  tp: "block";
  cols?: BlockColumn;
}
export class Block<L = unknown> extends Parent<L, BlockLy> {
  cols?: BlockColumn;

  protected _i(i: iBlock<L>, bb?: BB): void {
    super._i(i, bb);
    this.cols = i.cols;
  }
  _css(v: Dic) {
    super._css(v);
    let c = this.cols;
    if (c) {
      v['column-width'] = c.width;
      v['column-count'] = c.count;
      v['column-gap'] = c.gap + '%';
      if (c.rule)
        v['column-rule'] = border(c.rule);
    }
  }

  fitIn(_: iSBox<BlockLy>, css: Dic) {
    //if (child.ly.li) {
    //  let i = 0, dt = this.dt;
    //  while (i < dt.length)
    //    if (dt[i] == child)
    //      break;
    //    else i++;

    //  (css[attrs] || (css[attrs] = {})).li = i + 1;
    //}

  }
  toJSON() { return this.json("block") as iBlock<L>; }
}
export type BlockT = Block;

/* ****************************COL******************************* */
export interface CLy {
  /**size defined in percent */
  sz?: int;
  max?: int;
  min?: int;
  /**align */
  lgn?: Align;
  /**@deprecated */
  start?
  /**@deprecated */
  span?
  /**@deprecated */
  grow?
}
export interface iCol<L = unknown> extends iParent<L, CLy> {
  tp: "col",
  /**padding */
  pad?: int[];
  reverse?: bool;
  align?: Align;
}
class Col<L = unknown> extends Parent<L, CLy> {
  /**padding */
  pad?: int[];
  reverse?: bool;
  align?: Align;
  protected _i(i: iCol<L>, bb?: BB): void {
    super._i(i, bb);
    extend(this, { pad: i.pad, reverse: i.reverse, align: i.align });
  }
  _css(v: Dic) {
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
  }
  fitIn(child: Box<CLy>, css: Dic) {
    let ly = child.ly;

    //h = this.ori == Orientation.horizontal;
    //if (this.stretch)
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
      let al: str;
      switch (ly.lgn) {
        case 's': al = 'flex-start'; break;
        case 'e': al = 'flex-end'; break;
        case 'c': al = 'center'; break;
        case 'j': al = 'stretch'; break;
      }
      css['align-self'] = al;
    }
    if (this.pad) {
      if (!child.id)
        css['margin-top'] = (this.pad[0] || (this.pad[0] = 0)) + 'px';

      let id = <int>child.id + 1;
      css['margin-bottom'] = (this.pad[id] || (this.pad[id] = 0)) + 'px';
    }
  }
  toJSON() { return this.json("col") as iCol<L>; }
}
export type ColT = Col;

/* ****************************ROW******************************* */
export interface RLy {
  /**size defined in percent */
  sz?: int;
  grow?: int;
  fl?: never;
  hd?: never;
  ft?: never;
}
export interface iRow<L = unknown> extends iParent<L, RLy> {
  tp: "row";
  /**@deprecated */
  justifty?
  /**padding */
  pad?: int[];
}
class Row<L = unknown> extends Parent<L, RLy> {
  //TODO: overflow costumizado para cortar todas as colunas de maneira correta
  /**padding */
  pad?: int[];

  _i(i: iRow<L>, bb?: BB): void {
    super._i(i, bb);
    extend(this, { pad: i.pad });
  }
  append(child: Box<RLy>, index: int) {
    let part = this.parts[index];
    if (!part) {
      part = this.part(index);
      this.p.append(this, index);
    }

    part.add(child.part(index));
  }
  fitIn(child: Box<RLy>, css: Dic) {
    let l = child.ly;

    if (l.grow)
      css['flex-grow'] = l.grow;
    if (l.sz)
      css['width'] = `${l.sz}%`;

    if (this.pad) {
      if (!child.id)
        css['margin-left'] = this.pad[0] + '%';

      let id = <int>child.id + 1;
      css['margin-right'] = this.pad[id] + '%';
    }
  }
  toJSON() { return this.json("row") as iRow<L>; }
}

/* ****************************TABLE***************************** */

interface TableStyle extends BoxStyle {
  /**style for child in the body */
  dt?: BoxStyle;
  /**style for child in the header */
  hd?: BoxStyle;
  /**style for child in the footer */
  ft?: BoxStyle;


  col?: BoxStyle;
  /**first row */
  fr?: BoxStyle;
  /**first column */
  fc?: BoxStyle;

  /**last row */
  lr?: BoxStyle;
  /**last column */
  lc?: BoxStyle;

  /**(odd row)linhas impar */
  or?: BoxStyle;

  /**(odd column)colunas impar */
  oc?: BoxStyle;
}

interface TbCellObj {
  /**size */
  sz?: float;
}
export type TbColInfo = TbCellObj | float;

export interface iTb<L = unknown> extends iParentBase<L> {
  tp: "tb";
  is?: TableStyle;
  hd?: iTr<void>;
  bd?: iTr<void>[];
  ft?: iTr<void>;
  empty?: iTr<void>;
  map?: bool;
  /**columns */
  cols?: TbColInfo[];
}
class Tb<L = unknown> extends Parent<L, void>{
  private _style: TableStyle;

  get style() {
    if (!this._style) {
      let th = theme.tables;
      this._style = assign(th[this.s] || th[''] || {}, this.is);

      //if (this.s)
      //  for (let i = 0; i < this.s.length; i++)
      //    extend(this._style, th.byKey(this.s[i]));
      //else extend(this._style, th.byKey(undefined));
    }
    return this._style;
  }
  _css(v: Dic) {
    let { style, is } = this,
      txtStyle = theme.p[is.tx || style && style.tx];
    styleBox(style)
    if (txtStyle)
      styleText(txtStyle, v);
  }
  cols: TbCellObj[];

  protected _i(i: iTb<L>, bb?: BB): void {
    this.cols = i.cols.map(c => isN(c) ? { sz: c } : c);
    super._i(i, bb);
  }
  fitIn() { }

  clear() {
    super.clear();
    this._style = null;
  }
  toJSON() { return this.json("tb") as iTb<L>; }
}

export interface TrLy {
  /**margin top*/
  mt?: int;
  /**margin left*/
  ml?: int;
  /**margin right*/
  mr?: int;
  /**margin bottom*/
  mb?: int;
  /**row span */
  span?: int;
}
/* ****************************TROW***************************** */
export interface iTr<L = void> extends iSBox<L> {
  tp: "tr";
  hd?: iBoxes<void> | str;
  bd?: (iBoxes<TrLy> | str)[];
  ft?: iBoxes<void> | str;
}

class Tr<L = void> extends SBox<L> implements BoxParent<L> {
  hd: Box<void>;
  bd?: Box<TrLy>[];
  ft: Box<void>;
  declare is: BoxStyle;
  tb: Tb;
  col: int;
  protected _i(i: iTr<L>, bb?: BB): void {
    super._i(i, bb);
    while (!((this.tb = this.p as any) instanceof Tb));
    extend(this, {
      hd: i.hd && createBox<void>(i.hd, DTParts.h, this as BoxParent<any>),
      bd: i.bd?.map((e, i) => createBox<TrLy>(e, i, this)),
      ft: i.ft && createBox<void>(i.ft, DTParts.f, this as BoxParent<any>),
    });
  }
  _css(v: Dic) {
    let
      tb = this.tb,
      props: Dic = {},
      tableStyle = tb.style,
      pS =
        this.id == DTParts.h ?
          tableStyle.hd :
          this.id == DTParts.f ?
            tableStyle.ft :
            tableStyle.dt,
      box = theme.box[this.s],
      txtStyle = theme.p[this.is.tx || (box && box.tx) || (pS && pS.tx)];
    styleBox(assign(props, pS, box, this.is), v);

    if (txtStyle)
      styleText(txtStyle, v);
  }
  body: S;
  protected render(pag: int) {
    let { hd, bd, ft } = this, r = div();
    this.body = hd || ft ? div().addTo(r) : r;
    hd?.view(pag);
    for (let i = 0; i < bd.length; i++)
      pag = bd[i].view(pag);
    ft?.view(pag);

    return r;
  }
  append(child: Box<TrLy>, pag: int) {
    (child.id >= 0 ? this.body : this.e).add(child.part(pag));
  }
  fitIn(child: Box<TrLy>, css: Dic) {
    let
      l = child.ly,
      cols = this.tb.cols,
      id = child.id;


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
  }
  getTextTheme() { return txtTheme(this.is, this.s, this.p); }
  transport(from?: int, to?: int) {
    let { hd, bd, ft } = this;
    super.transport();

    hd?.transport(from, to);
    ft?.transport(from, to);

    for (let i of bd)
      i.transport(from, to);
  }
  setEditMode() {

  }
  toJSON() { return this.json("tr") as iTr<L>; }

  static clone(box: iTr) {
    let temp = MBox.clone(box);

    return temp;
  }
}
function tableCellStyle(child: Box<TrLy>, css: Dic, table: Tb) {
  let
    l = child.ly,
    pst = table.style, m = "margin-";

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

function getCellStart(index: int, dt: iSBox<TrLy>[]) {
  let start = index;
  for (let i = 0; i < index; i++)
    if (dt[i].ly.span)
      start += dt[i].ly.span - 1;
  return start;
}

/* ***************************GRAPHIC**************************** */
interface GraphicStyle {

}
interface IGraphicBox<L = unknown> extends iSBox<L> {
  tp: "graphic";
  is?: GraphicStyle;
}
class GraphicBox<L = unknown> extends SBox<L> {
  clearStyle(): void {
    throw new Error("Method not implemented.");
  }
  _css() { }
  render(pag: int) {
    return div();
    //this.addBox(m(new gr.SvgViewer({ })), index);
  }
  toJSON() { return null; }
}

/* **************************PLACE HOLDER************************ */
export interface iPH<T = unknown> extends IMBox<T> {
  tp: "ph";
  bd: str;
}
class Ph<L = unknown> extends MBox<L> {
  #bd: Box<L>;
  parts = null;
  src: str;
  protected _i(i: iPH<L>, bb?: BB) {
    super._i(i, bb);
    this.src = i.bd;
  }
  clearStyle(): void {
    throw new Error("Method not implemented.");
  }
  _css() { }
  data: iSBox;
  valid(pag: int) {
    let { ly, p, src, id, bb } = this, b = p.ctx.calc(src, this) as iBox<L>;
    if (b) (this.#bd = createBox<L>(assign(b, { ly }), id, p, bb))._css(this.css);
    else this.#bd = null;
    return b && super.valid(pag);
  }
  render(pag: int) {
    return this.#bd.view(pag);
  }
  part(pag: number): S {
    return this.#bd?.part(pag) || this.parts[pag];
  }
  transport(from: int, to: int) {
    this.#bd?.transport(from, to);
    super.transport(from, to);
    super.transport(from, to);
  }
  clear() {
    this.#bd?.clear();
    super.clear();
  }
  toJSON(): iPH<L> {
    return null;
  }
}
export type PhT = Ph;


/* ****************************HR**************************** */

interface HrStyle extends Border {

}
export interface iHr<L = unknown> extends iSBox<L> {
  tp: "hr";
  is?: HrStyle,
  o?: Ori;
}
class Hr<L = unknown> extends SBox<L>{
  o?: Ori;
  declare is: HrStyle;
  clearStyle(): void {
    throw new Error("Method not implemented.");
  }
  _css(v: Dic) {
    v[this.o == "v" ?
      'border-left' :
      'border-bottom'
    ] = border(assign({}, theme.hr[this.s], this.is));
  }
  render() { return g("hr"); }
  toJSON(): iSBox<unknown> {
    return null;
  }
}

interface INP<L = unknown> extends iSBox<L> { tp: "np"; }
/**new pag */
class NP<L = unknown> extends SBox<L>{
  clearStyle(): void {
    throw new Error("Method not implemented.");
  }
  _css() { }
  view(pag: int) {
    this.valid(pag) && pag++;
    this.e = div();
    this.p.append(this, this.start = pag);
    return this.start;
  }
  // render(pag: int) {
  //   this.addBox(g('div'), ++index);

  //   this.p.append(this, index);
  //   //.part(/*model, */index).append();

  //   return this.end = index;
  // }
  toJSON(): iSBox<unknown> {
    return null;
  }

}

export interface iImg<T = unknown> extends iSBox<T> {
  tp: "img";
  is?: ImgStyle;
  bd: str;
}
class Img<L = unknown> extends SBox<L>{
  declare is: ImgStyle;
  bd: str;
  protected _i(i: iImg<L>, bb?: BB) {
    super._i(i, bb);
    this.bd = i.bd;
  }
  clearStyle(): void {
    throw new Error("Method not implemented.");
  }
  _css(v: Dic) {
    styleImg(this.is, v);
  }
  render() {
    return g('img', { src: this.ctx.img(this.bd) });
  }
  toJSON(): iSBox<unknown> {
    return null;
  }
}
//#endregion
/* ************************************************************** */
/* ****************************RENDER**************************** */
/* ************************************************************** */
//#region render
/**parent box */
export type iPBoxes<L = BodyLy> =
  iBlock<L> |
  iCol<L> |
  iRow<L> |
  iTb<L>;
export type iBoxes<L = any> =
  iP<L> |
  iPBoxes<L> |
  iHr<L> |
  INP<L> |
  iImg<L> |
  iPH<L> |
  IGraphicBox<L> |
  iRow<L> |
  iCol<L>;
type PBoxes<L = BodyLy> =
  Block<L> |
  Col<L> |
  Row<L> |
  Tb<L>;
type Boxes<L = any> =
  P<L> |
  PBoxes<L> |
  Hr<L> |
  NP<L> |
  Img<L> |
  Ph<L> |
  GraphicBox<L> |
  Row<L> |
  Col<L>;
export interface Book {
  sets?: Dic<str>;

  /**header size */
  hdSz?: int;

  /**footer size */
  ftSz?: int;
  /**padding */
  pad?: BoxSpace;

  rscs?: str[];
  /**@deprecated */
  imgs?: str[];

  hd?: iBoxes<SideLayout>;
  bd?: iPBoxes;
  ft?: iBoxes<SideLayout>;
  wm?: iP<WMLayout>;
  top?: iBoxes;
  bottom?: iBoxes;
}
/** */
interface WMLayout {
  tp?;
}

export type sbInput<L = void> = Box<L> | iBox<L> | str | (iBoxes<BlockLy> | str)[];
/**Singlepag Book */
export class SBook implements BoxParent<void>, Context {
  ctx: Context
  bd: Box<void>;
  constructor(bd: sbInput) {
    this.ctx = this;
    this.set(bd);
  }
  set(bd: sbInput) {
    return this.bd = bd instanceof Box ? bd :
      createBox(isA(bd) ? { tp: "block", bd } as iBlock<void> : bd, DTParts.bd, this);
  }
  getTextTheme() { }
  fitIn() { }
  overflow() { return OFTp.in; }
  e: S;
  append(child: Box<void>) { this.e = child.part(0) }
  bb: BB.stay
  view() {
    this.bd.view(0);
    return this.e;
  }
  fmt(this: any, value: unknown, exp: str) {
    return $.fmt(value, exp, {
      currency: (<any>this.dt).currency,
      currencySymbol: (<any>this.dt).currencySymbol || false,
      //refCurr:
    });
  }
  pagCount: 1
}
/**Multpage Book */
export class MBook implements BoxParent<BodyLy | void>{
  bb: BB.break
  hdSz?: float;
  ftSz?: float;
  /**padding */
  pad?: BoxSpace;
  hd?: Box<SideLayout>;
  bd?: PBoxes;
  ft?: Box<SideLayout>;
  wm?: P<WMLayout>;
  top?: Box;
  bottom?: Box;
  rsc?: str[];
  constructor({ hdSz, ftSz, pad, top, bottom, hd, ft, bd, rscs: rsc }: Book) {
    extend(this, {
      hdSz, ftSz, pad, rsc,
      top: createBox(top, DTParts.t, this, BB.stay),
      hd: createBox(hd, DTParts.h, this, BB.stay),
      bd: createBox(bd, DTParts.bd, this),
      bottom: createBox(bottom, DTParts.b, this, BB.stay),
      ft: createBox(ft, DTParts.f, this, BB.stay),
    });
  }
  getTextTheme() { }
  fitIn(child: Box<BodyLy>, css: Properties) {
    if (child.ly.fill)
      css.minHeight = "100%";
    return assign(css, { marginTop: 0, marginBottom: 0 });
  }
  bdE: S;
  overflow(e: Box<BodyLy>, pag: int) {
    let
      cRect = e.part(pag).rect(),
      pRect = this.bdE.rect(),
      dif = Math.floor(cRect.bottom) - Math.ceil(pRect.bottom);

    return Math.max(dif, OFTp.in);
  }
  append(e: Box<BodyLy | void>, pag: int) {
    if (e.id == DTParts.bd) {
      this.pagCount = pag;
      let
        { hdSz, ftSz, pad, top, h, hd, bottom, ft, wm } = this,
        hdE = g('header').css("height", `${hdSz || theme.hdSz}px`),
        ftE = g('footer').css("height", `${ftSz || theme.ftSz}px`),
        bdE = this.bdE = g('section'),
        content = this.pag = g('article', 0, hdE)
          .addTo(this.container)
          .css({
            background: '#fff',
            width: `${this.w}px`,
            height: `${this.h}px`,
            padding: space(pad ||= theme.padding),
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

      h -= (hdSz || theme.hdSz) + (ftSz || theme.ftSz) + pad[0] * 2;
      if (h <= 0)
        throw "error";

      if (wm) {
        this.pag = div("_ wm");
        wm.view(pag);
      }
      bdE.css('height', h + 'px');
      //[div, bd] = pag(ctx, bk, w, h, currentPag = index);

      bdE.add(e.part(pag));
    } else this.pag.add(e.part(pag));
  }
  container: S;
  w: float;
  h: float;
  ctx: Context;
  dt: unk;
  /**child current pag container */
  pag: S;
  pagCount: int;
  view(ctx: Context, container: S, w: float, h: float): Task<S> {
    assign(this, { ctx, container, w, h, dt: ctx.dt });
    this.bd.view(0);
    return ctx.wait ? Promise.all(ctx.wait).then(() => container) : container;
  }
  clear() {
    assign(this, { bdE: null, container: null, ctx: null, dt: null, pag: null });
  }
}
function render(box: iBox<void> | str) {
  if (!box)
    return null;
  if (isS(box))
    return g("p", 0, box);
  return new SBook(box).view();
}
const sheet = (bk: SBook, w: int) => g('article', "_ sheet", bk.view()).css({
  background: "#fff",
  width: `${w}px`,
  marginTop: `40px`,
  padding: space([0, 6]),
  whiteSpace: "pre-wrap"
});
//function pag(ctx: Context, bk: Book, w: int, h: int, index: int) {

//  return [div, bd];
//}
// export async function sheets(bk: MBook, ctx: Context, container: S, w: int, h: int) {
//   bk.view(ctx, container, w, h);

//   if (ctx.wait)
//     await Promise.all(ctx.wait);
//   return container;
// }
function dblSheets(container: S, w: int) {
  let t = container.childs().remove();
  for (let i = 0; i < t.length; i += 2) {
    let t2 = <(HTMLElement | S)[]>t.slice(i, i + 2);
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

export const css = (): Styles => ({
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
  "@media screen": {

  },
  "@media print": {
    ":not(._.sheet)": {
      display: "none"
    },
  }
});
type Sz = [w: int, h: int]
export const medias = {
  A4: <Sz>[210 * units.mm, 297 * units.mm],
  A5: <Sz>[148 * units.mm, 210 * units.mm],
  A3: <Sz>[297 * units.mm, 420 * units.mm],
}
export type Media = keyof (typeof medias);
export async function print(container: S, o: Ori, media: Media, cb: () => Task<void>) {
  let
    pags = container.childs(),
    style = g('style', null, `@page{size:${media} ${(o == "h" ? 'landscape' : 'portrait')};}`);

  g(document.body).add(pags);
  style.addTo(document.head);
  await cb();
  style.remove();
  container.add(pags);
}

interface WaterMark {
  dt/*: m.Child*/;
}
export interface BodyLy {
  fill?: bool;
}

type MediaType = (child: iBoxes, pag: int) => any;
//#endregion
/* ************************************************************** */
/* *****************************COLLECTIONS********************** */
/* ************************************************************** */
//#region COLLECTIONS

export const boxes: Dic<{ new(): Box<any> }> = {
  p: P,
  block: Block,

  graphic: GraphicBox,
  col: Col,
  row: Row,
  img: Img,
  new: NP,
  hr: Hr,
  ph: Ph,

  tb: Tb,
  tr: Tr,
};
export const theme: Theme = {
  padding: [4 * units.mm, 7 * units.mm],
  hdSz: 12 * units.mm,
  ftSz: 12 * units.mm,

  text: {
    ff: 'Arial',
    cl: "#000",
    b: false,
    i: false,
    lh: 1.2,
    al: "s",
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
//#endregion