import { div, g, S } from "galho";
import { Properties } from "galho/css";
import { height, isS, rect } from "galho/s";

type Key = string | number;
interface Dic<T = any> { [key: string]: T; }
type Task<T> = T | Promise<T>;

const hasProp = (obj: object) => Object.keys(obj).length;

export const enum C {
  empty = "empty",
  body = "body",
  watermark = "wm",

  input = "in",
  bookMedia = "book-media",

  box = 'box',
  sheet = 'sheet',
  book = 'bookeditor',
  row = 'book-row',
  col = 'book-col',
  table = "book-table",
  tableGroup = "book-table-group",
  block = "block",
  grid = "grid",
  parent = "parent",
  stack = "stack",
  img = "img",
  hr = "hr",
  newBox = "new-box",
  tr = "book-tr",
  th = "book-th",
  bubble = "bubble"
}
/**book item type */
export type BT = "p" | "row" | "col" | "tr" | "th" | "block" | "ph" | "hr" | "table" | "tg" | "img" | "symbol" | "grid" | "custom" | "graphic" | "new";

/**book span type */
export type ST = "t" | "s" | "img";
type Expression = string;
/* ************************************************************** */
/* *********************MAIN INTERFACE*************************** */
/* ************************************************************** */
export interface Context {
  dt?: unknown;
  temp?: Dic<unknown>;
  fmt?(value: unknown, exp: string): string;
  calc?(value: Expression, ctx: Scope, index?: number): unknown;
  img?(path: string, args?: Dic): string;
  symb?(src: string): Boxes
  parts?: S[];
  wait?: Promise<any>[];
}
interface Scope {
  readonly p?: BoxParent<any>;
  id?: number;
  dt?: unknown;
  readonly ctx: Context;
  /**@deprecated */
  ranges?: { [index: number]: Object[]; };
}
export interface BoxParent<C extends IBox = Boxes<any>> extends Scope {

  fitIn(box: C, css: Properties): object;
  append(child: C, index: number): void;
  remove?(child: C, index: number): void;
  overflow(child: C, index: number): OFTp;
  /** checa se o contiudo na pagina actual é so um pouco e pode ser totalmente transferivel para proxima pagina */
  justALittle?(child: C, index: number): boolean;

  insertAfter?(child: C, newE: IBox);
  posWrite?(index?: number);
  //checkStyle?<K extends keyof TextStyle>(key: K): TextStyle[K];
  getTextTheme(): string;
  listItem?(p: IPBox): S;
  removeLI?(p: IPBox): void;
  //readonly edit?: boolean;
}

//#region util
export const empty = '&#8203;';
type BorderType = "none" | "hidden" | "dotted" | "dashed" | "solid" | "double" | "groove" | "ridge" | "inset" | "outset";

interface Border {
  style?: BorderType;
  width?: number;
  color?: string;
}

const $mapIndex = Symbol();

const minBoxSize = 40;

interface NDic<T> {
  [n: number]: T;
  start?: number;
  end?: number;
}
export const enum DTParts {
  /**head */
  h = -1,
  /**foot */
  f = -2,
  /**data (body) */
  d = 0,
  /**top */
  t = -3,
  /**bottom */
  b = -4,
  /** water mark */
  w = -5,

}
export enum units {
  cm = 96 / 2.54,
  mm = cm / 10,
  in = 96,
  pt = 96 / 72,
  px = 1
}


/* ************************************************************** */
/* **************************INTERFACE*************************** */
/* ************************************************************** */
type Borders = [Border, Border, Border, Border] | Border;
type BoxSpace = [number, number?, number?, number?];
type TextVAlign = "baseline" | "sub" | "super"
type Margin = [number | null, number | null, number | null, number | null];

export interface SpanStyle {
  /**font family */
  ff?: string;
  /**font size */
  fs?: number;
  /**bold */
  b?: boolean;
  /**italic */
  i?: boolean;
  /**underline */
  u?: boolean;
  /**strikethrough */
  st?: boolean;

  sub?: boolean;
  sup?: boolean;

  transform?: 'capitalize' | 'uppercase';
  /**vertical align */
  va?: TextVAlign;
  /**color */
  cl?: string;
  /**background */
  bg?: string;
}
interface Shadow {
  inset?: boolean;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}
interface Efect {
  blur: number,
  brightness: number,
  contrast: number,
  grayscale: number,
  'hue-rotate': number,
  invert: number,
  opacity: number,
  saturate: number;
  sepia: number;
}
interface ImgStyle {
  radius?: number;
  shadow?: Shadow[];
  border?: Border | [Border, Border, Border, Border];
  efect?: Efect;
  clip?: [number, number, number, number];
  h?: number,
  w?: number;
}
interface Background {
  tp?: 'img' | 'color';
  dt: string;
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
  rd?: number | [number, number, number?, number?];
  /**@deprecated */
  al?
  /**text style */
  tx?: string;
}
interface TextShadow {
  x: number;
  y: number;
  blur?: number;
  color?: string;
}
export interface PStyle {

  shadow?: TextShadow[];
  mg?: number;
  //paragraph properties
  indent?: number;
  /**line height */
  lh?: number;
  /**align */
  al?: TAlign;
  noWrap?: boolean
  overflow?: 'ellipsis' | 'clip';
}
export type TAlign = "end" | "start" | 'center' | 'justify'|"left"|"right";
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


/* ************************************************************** */
/* ***************************METHODS**************************** */

function border(b: Border) {

  return `${b.width || 1}px ${b.style || 'solid'} ${b.color || "#000"}`;
}

function borders(css: Dic, bord: Borders) {
  if ('length' in bord) {
    if (bord[0] && hasProp(bord[0]))
      css['border-top'] = border(bord[0]);
    if (bord[1] && hasProp(bord[1]))
      css['border-right'] = border(bord[1]);

    if (bord[bord.length - 2] && hasProp(bord[bord.length - 2]))
      css['border-bottom'] = border(bord[bord.length - 2]);
    if (bord[bord.length - 1] && hasProp(bord[bord.length - 1]))
      css['border-left'] = border(bord[bord.length - 1]);

  } else css.border = border(bord);
}

const space = (p: BoxSpace) => p.map(p => p + 'px').join(' ')


//existe 6 styles do tipo header
//e 6 do tipo paragrafo que definim informação relacionadas a formatação do texto
//tem inline style mas so para algumas propiedades(line,bold,italic,super,sub)
//os table head não tenhem inline style e so podem ser de algum dos 6 tipos de header style
//table cell não tem inline style tambem e so podem ser de um paragraph style
//estilos do documentos (ex:border,padding,round,filter) tambem ficam nos styles globas mas tambem podem estar inlines
function styleText(style: SpanStyle, css: Dic<Key>) {

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

function emptyBlock(ly: Dic) {
  return div([C.empty]).css(ly).html(empty);
}

function buildShadow(shadow: Shadow[]) {
  return shadow.map(sh => `${sh.inset ? 'inset' : ''} ${sh.x}px ${sh.y}px ${sh.blur}px ${sh.spread}px ${sh.color}`).join(',');
}
function styleImg(style: ImgStyle, css: Dic<Key> = {}) {

  if (style) {
    if (style.border)
      if ('length' in style.border)
        Object.assign(css, {
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
  if (style.mg)
    css.margin = `${style.mg}px 0`
  if (style.shadow)
    css.textShadow = style.shadow.map(s => `${s.x}px ${s.y}px ${s.blur || 0}px ${s.color}`).join();

  //paragraph
  if (style.indent)
    css.textIndent = `${style.indent}px`;

  if (style.lh)
    css.lineHeight = style.lh;

  style.al && (css.textAlign = style.al)
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

function getCtx(exp: string, scp: Scope, pag: number) {
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
  let w = scp.ctx.wait ||= [];
  w.push(new Promise<void>(rs => {
    setTimeout(() => { cb(); rs(); });
  }));
}
interface CalcOpts {
  funcs(name: string, args: any[]): any;
  vars(name: string, obj?: boolean): any;
}
interface Settings {
  fmt?(value: unknown, exp: string, opts: Dic): string;
  scalar?(value: number, fmt: string): any;
  calc?(v: Expression, opts: CalcOpts): any;
}
export const $: Settings = {}
type CPU = (expression: Expression, scp: Scope, pag?: number) => any;
type Exp = (this: { p: number, s: Scope }, ...args: any[]) => any;
/** central processor unit */
export function cpu(): CPU {
  let
    delay = <Exp>function (data: () => any) {
      let r = g('span').html(empty);
      wait(this.s, () => { r.replace(data()); });
      return r;
    },
    funcs = <Dic<Exp>>{
      //options: (key: string) => system.options[key],
      ctx(item?: string) {
        let t = this.s.dt;
        if (item) {
          if (t)
            for (let k of item.split('.'))
              if (!(t = (t[k])))
                break;
        }
        return t;
      },
      map_index() { return this.s.dt ? (this.s.dt[$mapIndex] + 1) : null },
      set(key: string, value) { return this.s.dt[key] = value },
      //set data to temporary storage
      set_temp(key: string, value) { return (this.s.ctx.temp ||= {})[key] = value },
      //get data from temporary storage
      get_temp(key: string) { return this.s.ctx.temp?.[key] },
      up(levels: number) {
        let t = this.s;
        for (let i = 0, j = levels || 1; i < j; i++)
          t = t.p;
        return t.dt;
      },
      index() { return this.s.id },
      sheet_data() {
        let t = this.s;
        while (!t.ranges)
          t = t.p;
        return t.ranges[this.p];
      },
      sheetData() { return funcs.sheet_data.call(this); },
      span(i: number, j: number) { return (this.s as TableElement).table.spans[i][j]; },
      //item(key: string){ return  this.s.ctx.items.get(key) },
      delay,
      pag_sum(name: string, mapFn: (item: number) => number, format?: string) {
        return delay.call(this, () => {
          let
            lastValue = <number>funcs.get_temp.call(this, name) || 0,
            data = funcs.sheet_data.call(this).map(mapFn).reduce((p, n) => p + (n || 0), lastValue);

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

  return (v: Expression, s: Scope, p?: number) => $.calc(v, {
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

function cloneBox<T extends IBox>(box: T) {
  return JSON.parse(JSON.stringify(box)) as T;
  //return <T>acceptBoxes.get(box.tp).clone(box);
}

function emptyBox() {
  return PBox.normalize({ tp: "p" });
}


interface Theme {
  key?: string;
  base?: Key;
  /**espacamento padrão das paginas */
  padding?: BoxSpace;
  /**header size */
  hdSize?: number;

  /**footer size */
  ftSize?: number;

  text?: TextStyle;

  /**paragraph style, include default style for text in paragraph */
  p?: Dic<TextStyle & { title?: string }>;
  box?: Dic<BoxStyle & { title?: string }>;
  title?: string;
  info?: string;

  //#region extensions
  hr?: Dic<HrStyle>;
  /**table style, include text in table */
  tables?: Dic<TableStyle>;
  //#endregion
}

export function createBox<T>(box: IBox<T>, id: number, parent: BoxParent) {
  let t = boxes[box.tp];
  if (!t)
    throw 'tp not found';

  return Reflect.construct(t, [box, parent, id]) as Box;
}
export function write<T>(box: IBox<T>, pag: number, id: number, parent: BoxParent<any>): number {
  if (box.$) {
    box.$.id = id;
    box.$.render(pag);
  } else {
    createBox(box, id, parent).render(pag);
  }
  return box.$.end;
}
/** normalize box */
const normBox = <T extends IBox>(box: T) => boxes[box.tp].normalize(box);


interface SideLayout {

}


/** overflow type */
const enum OFTp {
  in = 0,
  out = 1,
  jump = 2
}



interface IBookContext {
  readonly parent?: IBookContext;
  dt?: unknown;
  ctx?: BoxRoot;
  parts?: NDic<S>;
}
interface BoxRoot extends IBookContext {
  items: Dic;
  warning(message: string, data?: unknown): void;
  //context: RootContext


}


const enum BoxMode {
  editing,

  preview
}


/** ************************************************************* */
/** ****************************SPAN***************************** */
/** ************************************************************* */

export interface ISpanBase<S = any> {
  tp?: ST;

  /**@deprecated */
  s?;
  /**data */
  dt: string;
  $?: SpanBase;
  /**style */
  is?: S;
}
interface SpanBase<T extends ISpanBase = ISpanBase> {
  //new?(model: T, parent: IBookContext): SpanBase;

  p: PBox;
  /**cria um novo box para esta clause */
  break(index: number): S;
  view(index: number/*, edit: boolean*/): S;
  //edit(action: string, opts: unknown)
  parts: NDic<S>;

  readonly length: number;
}


export interface ISpan extends ISpanBase<SpanStyle> {
  tp?: "t";
  $?: Span;
}
export class Span implements SpanBase<ISpan> {
  constructor(public model: ISpan, public p: PBox) { }

  parts: NDic<S> = {};

  get css() {
    return styleText(this.model.is, {});
  }

  view(index: number) {
    let t = this.parts[index] = g('span').css(this.css);
    if (this.model.dt)
      t.text(this.model.dt);
    else t.html(empty);
    return t;
  }
  break(index: number) {
    let
      model = this.model,
      part = g('span', null, model.dt).css(this.css);
    this.parts[index] = part;
    return part;
  }

  get bold(): boolean {
    let is = this.model.is;
    return is && is.b || false;
  }
  get length() { return this.model.dt.length; }

  static readonly break: true;
  static isEmpty(model: ISpan) { return !model.dt; }
  toJSON() { }
}
interface IScalar extends ISpanBase<SpanStyle> {
  tp: "s";
  $?: Scalar;
  /**input type */
  it?: string;
  /**format */
  fmt?: string;
}
class Scalar implements SpanBase<IScalar> {
  constructor(public model: IScalar, public p: PBox) {
  }
  get length() { return this.model.dt.length; }

  parts: NDic<S> = {};

  get css() {
    return styleText(this.model.is, {});
  }
  view(index: number) {
    const model = this.model;
    let
      p = this.p,
      v: any = p.ctx.calc(model.dt, p, index);

    if (model.fmt)
      v = p.ctx.fmt(v, model.fmt);

    return v == null ? null : this.parts[index] = g('exp' as any, { css: this.css }, v);
  }
  break(index: number) {
    return this.parts[index] = g('exp' as any).css(this.css);
  }
  edit
  //edit(action: BookBaseAction | string, opts?: unknown): boolean {
  //  if (action.startsWith('t-')) {
  //    editText(this.model, action, opts);
  //    return true;
  //  }
  //  return false;
  //}

  static readonly break: true;
  static isEmpty(model: IScalar) { return false; }
  toJSON() { }
}

interface ILink extends ISpan { }
class Link extends Span {

}

interface IImg extends ISpanBase<ImgStyle> {
  tp: "img";
  $?: Img;
  width?: number;
  height?: number;
  base?: 'width' | 'height';
  pars: Dic<string>;
  calc?: boolean
}
class Img implements SpanBase<IImg> {

  parts: NDic<S> = {};

  constructor(public model: IImg, public p: PBox) { }
  view(index: number) {
    let
      model = this.model,
      css = styleImg(model.is),
      media = this.p.ctx;
    if (model.base) {
      css[model.base] = '100%'
    } else {
      css.width = (model.width || 64) + 'px';
      css.height = (model.height || 64) + 'px';
    }
    if (model.calc) {
      let t = media.calc(model.dt, this.p, index);
      if (isS(t))
        return g('img', { src: t }).css(css);
      else {
        t = g(<any>t);
        if ((t as S).valid)
          return (t as S).css(css)

        return null;
      }
    }
    else return this.parts[index] = g('img', {
      src: media.img(model.dt, model.pars)
    }).css(css);
  }
  break(): S { throw "this clause is unbreakable"; }

  static isEmpty(model: IScalar) { return false; }
  get length() { return 1; }

  //edit(action: BookBaseAction, opts?: unknown): boolean {
  //  if (action.startsWith('img-')) {
  //    editImg(this.model, action, opts);
  //    return true;
  //  }
  //  return false;
  //}

  static readonly break: false;
  toJSON() { }
}

export type Spans = ISpan | IScalar | IImg;

export interface IPBox<L = unknown> extends IBox<L> {
  tp: "p",
  $?: PBox<L>,
  is?: PStyle;
  /**list index */
  li?: number;
  /**data */
  dt?: Spans[];
}



type BoxFilter = (v: IBox) => any;
/** ************************************************************* */
/** *************************** BOX ***************************** */
/** ************************************************************* */
export interface IBox<L = unknown> {
  $?: Box<L, any, any>;

  /**@deprecated */
  box?
  /**inline style: Estilo interno */
  is?: unknown;
  /**style: nome do estilo no theme que este item usara */
  s?: string;

  tp: Key;
  /**layout : informação que este elemento passa para o seu parent para ele definir no css */
  ly?: L;

  /**Closure: o escopo é usado pela formula para saber o objecto base de onde tirar as variaveis */
  sc?: string;
  /**unbreakeble se false caso não sobre espaço para por toda linha põe o que chegar na proxima pagina
   * por defualt é false*/
  ub?: boolean;
  ///**key:identificador unico */
  //key?: string;
  /**validator: if this return false element is not renderized */
  vl?: string;
  /**validação por pagina deve ser processado no mesmo momento que
   o footer e o header*/
  pag?: Expression;
}
abstract class Box<L = unknown, T extends IBox<L> = Boxes<L>, P extends BoxParent<T> = BoxParent<any>> implements Scope {
  _css: Dic;
  private _ly: object;

  /**@deprecated provavelmento so é util para o edit */
  start: number;
  /**@deprecated provavelmento so é util para o edit */
  end: number;
  parts: NDic<S> = {};
  //id: number;
  private _cd: Dic;
  get dt() {
    let { model, p, start } = this;
    return this._cd ||= getCtx(model.sc, p, start);
  }
  ctx: Context;

  readonly p: P;

  get layout() {
    return this._ly || (this._ly = this.p.fitIn(this.model, {}));
  }
  constructor(public model: T, parent: P, public id: number) {
    model.$ = this;
    this.ctx = (this.p = parent).ctx
  }

  abstract get css(): object;

  find?(filter: (v: IBox) => any): IBox[];
  abstract part(index: number): S;
  abstract write(index: number): void;

  valid(pag: number) {
    return !this.model.vl || this.ctx.calc(this.model.vl, this, pag);
  }
  render(pag: number): void {
    this.start = this.end = pag;
    if (this.valid(pag))
      this.write(pag);

    else {
      this.addBox(emptyBlock(this.layout), pag);
      this.p.append(this.model, pag);
      this.p.overflow(this.model, pag);
    }
  }

  addBox(s: S, index: number) {
    this.parts[this.end = index] = s.cls([C.box]);

    this.checkPag(index);
    //if (this.edit)
    //  this.setEditPart(s.prop('$', this.model));
    return s;
  }
  /** @deprecated */
  reload(index: number) {
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
  checkPag(index: number) {
    if (this.model.pag) {
      let pag = this.ctx.calc(this.model.pag, this, index) as (pags, pag) => boolean;
      if (pag) {
        wait(this, () => {
          if (!pag(this.ctx.parts.length, index + 1))
            this.part(index).css('visibility', 'hidden');
        });
      }
    }
  }
  transport(from: number, to: number) {
    let parts = this.parts;
    if (from == this.start)
      this.start = to;

    this.end = to;

    if (parts && from in parts) {
      parts[to] = parts[from];
      delete parts[from];
    }
  }



  static normalize(dt: IBox) {
    if (!dt.ly)
      dt.ly = {};
    if (!dt.is)
      dt.is = {};
    return dt;
  }
  static symbs(dt: IBox, list: string[]) { }
  static clone(m: IBox) {
    return <IBox>{
      tp: m.tp,
      is: m.is,
      s: m.s,
      ub: m.ub,
      vl: m.vl,
      sc: m.sc,
      ly: m.ly,
    };
  }
  static toMin(model: IBox) {

    return model;
  }
  static fromMin(model): IBox {
    return model;
  }
  // static replace(_model: IParentBox, _key: string, _newValue: IBox) {
  //   return false;
  // }
  static isEmpty(model: IBox) { return false; }
  private toJSON() { }
}

export class PBox<L = unknown> extends Box<L, IPBox<L>> {

  constructor(model: IPBox<L>, parent: BoxParent, id: number) {
    super(model, parent, id);
    for (let i = 0; i < model.dt.length; i++)
      this.createSpan(model.dt[i]);
  }

  get theme() {
    return theme.p[this.model.s] || null;
  }
  get css() {
    if (!this._css) {
      let
        md = this.model,
        th = theme.p,
        props: Dic = {},
        css: Dic = {};

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

  write(index: number) {
    let
      md = this.model,
      p = this.part(index),
      items: S[] = [md.li ? this.p.listItem(md) : null];

    for (let i = 0, l = md.dt.length; i < l; i++) {
      let
        dtModel = md.dt[i],
        data = dtModel.$.view(index/*, this.edit*/);

      if (data) {
        //if (this.edit)
        //  data.prop('$', dtModel);
        items.push(data);
      }
    }

    if (items.length)
      p.add(items);
    else p.html(empty);


    return this.writeCheck(p, index);
  }
  part(index: number) {
    let t = this.parts[index];
    if (!t) {
      t = this.parts[index] = this.addBox(g("p"), index).css(this.css);
      this.p.append(this.model, index)
    }
    return t;
  }
  createSpan(span: Spans) {
    PBox.normalizeSpan(span);
    span.$ = Reflect.construct(spans[span.tp], [span, this]) as any;
  }
  writeCheck(p: S, index: number) {
    let
      md = this.model,
      parent = this.p,
      overflow: OFTp;

    while (overflow = parent.overflow(md, index)) {

      if (overflow == OFTp.jump) {

        index++;
        continue;
      }

      //se so sobrou um pouco de espaço nesta pagina
      if (!md.dt.length || parent.justALittle(md, index)) {
        parent.append(md, ++index);

      } else {
        let
          childs = p.childs(),
          newE = g("p").css(this.css),
          i = childs.length - 1;

        while (i >= 0) {
          newE.prepend(childs[i]);
          //usar aqui para que quando fazer o break diminua 
          i--;
          if (!parent.overflow(md, index))
            break;
        }


        let
          last = childs[i + 1],
          lastModel = md.dt[i + 1];

        if (spans[lastModel.tp].break) {
          p.add(last);

          if (parent.overflow(md, index)) {
            let newClauseDiv = lastModel.$.break(index),
              lastClauseDivText = <Text>last.firstChild,
              lcdtSplit = lastClauseDivText.textContent.split(' ');

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

  static normalize(model: IPBox) {
    Box.normalize(model);

    if (!model.dt)
      model.dt = [];
    if (!model.dt.length)
      model.dt.push(this.normalizeSpan({ dt: '' }));

    for (let item of model.dt)
      this.normalizeSpan(item);
    return model;
  }
  static normalizeSpan(span: Spans) {
    if (!span.tp)
      span.tp = "t"
    if (!span.is)
      span.is = {};

    return span;
  }
  static isEmpty(model: IPBox) {
    for (let i = 0; i < model.dt.length; i++) {
      let child = model.dt[i];
      if (!spans[child.tp].isEmpty(child))
        return false;
    }
    return true;
  }
}

interface BlockList extends SpanStyle {
  /**@deprecated */
  indent?: number;
  /**format */
  fmt?: string;
}
export interface IParentBox<L = unknown, C extends IBox = Boxes> extends IBox<L> {
  $?: ParentBox<L, C>;

  l?: BlockList;
  /**header */
  hd?: C;

  /**data */
  dt?: (C | string)[];

  /**footer */
  ft?: C;


  is?: BoxStyle;
  /**map: deve repetir a data usando o context */
  map?: boolean;
  /**usado so quando tiver map e não tiver nenhum item */
  empty?: C;
  ///**style of box */
  //box?: string[];
}
abstract class ParentBox<L = unknown, C extends IBox = Boxes, T extends IParentBox<L, C> = IParentBox<L, C>, P extends BoxParent<T> = BoxParent<T>> extends Box<L, T, P> implements BoxParent<C> {
  //private _ctx: unknown;
  ranges: { [index: number]: Object[]; };
  mode: BoxMode;

  get css() {
    if (!this._css) {
      let
        md = this.model,
        p = this.p,
        box = theme.box[md.s],
        txtStyle = theme.p[md.is.tx || box && box.tx];


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

  write(pag: number) {
    let
      { dt, map, empty, sc } = this.model,
      l = dt.length;

    if (l) {
      if (map && this.mode != BoxMode.editing) {
        let
          ctx = /*this._ctx = */this.dt as ArrayLike<unknown>,
          //book = this.book,
          range: Object[] = [];
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
            if (row) row[$mapIndex] = i;

            range.push(row);

            let temp = cloneBox(<IBox>dt[0]);
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
          pag = write(empty, pag, DTParts.d, this);

      } else for (let i = 0; i < l; i++) {
        let temp = <IBox>dt[i];
        //temp.$.id = i;
        pag = write(temp, pag, i, this);
      }
    } else this.part(pag);

    return pag;
  }

  append(child: C, index: number) {
    const
      md = this.model,
      part = this.part(index),
      cpart = child.$.part(index),
      id = child.$.id;


    switch (id) {
      case 0:
        if (md.hd)
          part.place(1, cpart);
        else part.prepend(cpart);
        break;
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
        if (md.map) {
          if (md.ft)
            md.ft.$.parts[index].putBefore(cpart);
          else part.add(cpart);
        } else {
          let prev = (<C>md.dt[id - 1]).$;
          if (index in prev.parts)
            prev.parts[index].putAfter(cpart);
          else {
            if (md.hd)
              part.place(1, cpart);
            else part.prepend(cpart);
          }
        }
    }
  }
  part(pag: number) {
    let md = this.model, part = this.parts[pag];

    if (!part) {
      part = this.createPart(pag);
      this.p.append(md, pag);

      if (md.hd)
        write(md.hd, pag, DTParts.h, this);
      if (md.ft)
        write(md.ft, pag, DTParts.f, this);
    }
    return part;
  }
  transport(from: number, to: number) {
    let { hd, dt, ft } = this.model;
    super.transport(from, to);

    hd?.$.transport(from, to);
    ft?.$.transport(from, to);

    if (dt) for (let i of <C[]>dt)
      if (i.$)
        i.$.transport(from, to);
  }
  overflow(child: C, index: number) {
    let result = this.p.overflow(this.model, index);

    if (result) {
      if (!this.break(child, index)) {
        this.transport(index, index + 1);
        this.p.append(this.model, index + 1);
        return OFTp.jump;
      }
    }
    return result;
  }
  justALittle(child: C, index: number) {
    return this.p.justALittle(this.model, index);
  }
  //protected abstract part(index: number): m.S;
  break(child: C, index: number) {
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

  private _lCss: Dic;
  private _lItems: Array<{ s: S, p: IPBox }>;
  listItem(p: IPBox) {
    let
      l = this.model.l,
      css = this._lCss || styleText(l, {}),
      s = g('span', ['li'], $.scalar(p.li, l.fmt)).css(css);
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

  abstract fitIn(box: C, css: object): object;

  static normalize(md: IParentBox<any, any>) {
    Box.normalize(md);

    if (md.empty)
      normBox(md.empty);

    if (!md.dt)
      md.dt = [];

    if (!md.dt.length && !md.hd && !md.ft)
      md.dt.push(<IPBox>{ tp: "p" });

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
  static symbs({ dt, hd, ft }: IParentBox<any, any>, list: string[]) {
    let t = (dt: IBox) => boxes[dt.tp].symbs(dt, list);
    dt.forEach(t);
    hd && t(hd);
    ft && t(ft);
  }
  protected abstract createPart(index: number): S;

  clear() {
    let { hd, dt, ft } = this.model;

    for (let i of <C[]>dt)
      if (i.$) i.$.clear();

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

  static isEmpty(model: IPBox) {
    for (let i = 0; i < model.dt.length; i++) {
      let child = model.dt[i];
      if (!boxes[child.tp].isEmpty(child))
        return false;
    }
    return true;
  }
}
export type ParentBoxT = ParentBox;

interface BlockColumn {
  width?: number;
  rule?: Border;
  count?: number;
  gap?: number;
}
interface BlockLy {
  /**is list item */
  li?: boolean;
}

export interface IBlockBox<L = unknown> extends IParentBox<L, Boxes<BlockLy>> {
  tp: 'block'
  cols?: BlockColumn;
}
export class BlockBox<L = unknown> extends ParentBox<L, Boxes<BlockLy>, IBlockBox<L>> {
  public get css() {
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

  createPart(index: number) {
    return this.addBox(div(C.block).css(this.css), index);
  }

  fitIn(_: IBox<BlockLy>, css: object) {
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

export const enum CAlign {
  s = "s",//start
  e = "e",//end
  c = "c",//center
  j = "j", //Justify
  sb = "s-b",
  sa = "s-a",
  se = "s-e"
};
export interface CLy {
  /**size defined in percent */
  sz?: number;
  max?: number;
  min?: number;
  /**align */
  lgn?: CAlign;
  /**@deprecated */
  start?
  /**@deprecated */
  span?
  /**@deprecated */
  grow?
}
export interface ICol<L = unknown> extends IParentBox<L, Boxes<CLy>> {
  tp: "col",
  /**padding */
  pad?: number[];
  reverse?: boolean;
  align?: CAlign;
}
class ColBox<L = unknown> extends ParentBox<L, Boxes<CLy>, ICol<L>> {

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
  createPart(index: number) {
    return this.addBox(div([C.col]), index)
      .css(this.css);
  }

  fitIn(child: IBox<CLy>, css: Dic) {
    let
      ly = child.ly,
      md = this.model;

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
      let al: string;
      switch (ly.lgn) {
        case 's': al = 'flex-start'; break;
        case 'e': al = 'flex-end'; break;
        case 'c': al = 'center'; break;
        case 'j': al = 'stretch'; break;
      }
      css['align-self'] = al;
    }
    if (md.pad) {
      if (!child.$.id)
        css['margin-top'] = (md.pad[0] || (md.pad[0] = 0)) + 'px';

      let id = <number>child.$.id + 1;
      css['margin-bottom'] = (md.pad[id] || (md.pad[id] = 0)) + 'px';
    }

    return css;
  }
}



export interface RLy {
  /**size defined in percent */
  sz?: number;
  grow?: number;
  fl?: never;
  hd?: never;
  ft?: never;
}
type RC = Boxes<RLy>;
export interface IRow<L = unknown> extends IParentBox<L, RC> {
  tp: "row";
  /**@deprecated */
  justifty?
  /**padding */
  pad?: number[];
}
class RowBox<L = unknown> extends ParentBox<L, RC, IRow<L>> {
  write(pag: number) {
    let { dt } = this.model;
    for (let i = 0; i < dt.length; i++)
      pag = write(<RC>dt[i], pag, i, this);

    return pag;
  }
  createPart(index: number) {
    return this
      .addBox(div(C.row), index)
      .css(this.css);
  }
  append(child: RC, index: number) {
    const model = this.model;
    let part = this.parts[index];
    if (!part) {
      part = this.part(index);
      this.p.append(model, index);
    }

    part.add(child.$.part(index));
  }
  break(child: RC, index: number) {
    //todo: corta todos os childs
    return super.break(child, index);
  }
  fitIn(child: RC, css: Dic) {
    let
      l = child.ly,
      md = this.model;

    if (l.grow)
      css['flex-grow'] = l.grow;
    if (l.sz)
      css['width'] = `${l.sz}%`;

    if (md.pad) {
      if (!child.$.id)
        css['margin-left'] = md.pad[0] + '%';

      let id = <number>child.$.id + 1;
      css['margin-right'] = md.pad[id] + '%';
    }
    return css;
  }

  static normalize(model: IRow) {
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

/* ************************************************************** */
/* ****************************TABLE***************************** */
/* ************************************************************** */

interface TableSpan {
  start: number;
  val: string;
  sz?: number;
  hd?: Boxes<TSpanRowLayout>;
  dt?: Boxes<TSpanRowLayout>;
  ft?: Boxes<TSpanRowLayout>;
}

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
interface TableLayout {

}
export interface TbCell {
  /**size */
  sz?: number;
}


export type Ori = "h" | "v";
export type TBoxes = ITRowBox | ITHeadBox;
export interface ITableBox<L = unknown> extends IParentBox<L, TBoxes> {
  tp: "table";
  is?: TableStyle,
  ori?: Ori;
  spans?: Array<TableSpan>;
  /**Cells */
  cols?: TbCell[];
}
class Tb<L = unknown> extends ParentBox<L, TBoxes, ITableBox<L>> {
  private _style: TableStyle;
  /**span data */
  spans: Array<Array<unknown>>;

  get style() {
    if (!this._style) {
      let
        md = this.model,
        th = theme.tables;
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
      let
        md = this.model,
        p = this.p,
        style = this.style,
        txtStyle = theme.p[md.is.tx || style && style.tx];
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

  createPart(index: number) {
    return this
      .addBox(div(C.table), index)
      .css(this.css);
  }
  fitIn(_child: IBox<TableLayout>, css: Dic) {
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
        let
          span = md.spans[i],
          items = <unknown[]>this.ctx.calc(span.val, this, pag);

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
  static normalizeSize(cols: TbCell[]) {
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
  static normalize(md: ITableBox) {
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
        let t = (<TBoxes>md.dt[0]).dt;
        if (t && t.length)
          md.cols = t.map(_ => <TbCell>{ sz: 100 / t.length });
        else throw "unsetted1";
      } else throw "unsetted2";

    Tb.normalizeSize(md.cols);
    return md;
  }
}

interface TrLYBase {
  /**margin top*/
  mt?: number;
  /**margin left*/
  ml?: number;
  /**margin right*/
  mr?: number;
  /**margin bottom*/
  mb?: number;
}
export interface TrLy extends TrLYBase {
  /**row span */
  span?: number;
}
interface TSpanRowLayout extends TrLYBase {
  single?: boolean;
}

/* ****************************TROW***************************** */
export interface ITRowBox extends IParentBox<TableLayout, Boxes<TrLy>> {
  tp: "tr" | "th";
  map?: never;
  th?: never;
  tf?: never;
}
interface TableElement extends Box<any, any, any> {
  readonly table: Tb;
}

class Tr<T extends ITRowBox = ITRowBox> extends ParentBox<TableLayout, Boxes<TrLy>, T, Tb> implements TableElement {
  protected bd: Boxes<TrLy>[];

  get table() { return this.p as Tb; }
  constructor(model: T, parent: Tb, id: number) {
    if (model.ub == null)
      model.ub = true;

    super(model, parent, id);

    let
      //model = this.model,
      dt = model.dt,
      spanDatas = parent.spans,
      spans = parent.model.spans;

    if (spans && spans.length) {
      dt = dt.slice();
      for (let i = 0; i < spans.length; i++) {
        let span = spans[i], sdata = spanDatas[i], sdt = this.model.$.id == DTParts.h ? span.hd : this.model.$.id == DTParts.f ? span.ft : span.dt;
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

    this.bd = <Boxes<TrLy>[]>dt;
  }

  get css() {
    if (!this._css) {
      let
        md = this.model,
        p = <Tb>this.p,
        props: Dic = {},
        tableStyle = p.style,
        pS =
          md.$.id == DTParts.h ?
            tableStyle.hd :
            md.$.id == DTParts.f ?
              tableStyle.ft :
              tableStyle.dt,
        box = theme.box[md.s],
        txtStyle = theme.p[md.is.tx || (box && box.tx) || (pS && pS.tx)];

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

  protected setSpan(dt: IBox<TrLy>[]) {
    let
      parent = (this.p as Tb),
      spanDatas = parent.spans,
      spans = parent.model.spans;

    if (spans && spans.length) {
      dt = dt.slice();
      for (let i = 0; i < spans.length; i++) {
        let span = spans[i], sdata = spanDatas[i], sdt = this.model.$.id == DTParts.h ? span.hd : this.model.$.id == DTParts.f ? span.ft : span.dt;
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

  write(pag: number) {
    if (this.bd)
      for (let i = 0; i < this.bd.length; i++) {
        let temp = this.bd[i];
        //temp.$.id = ;

        pag = write(temp, pag, i, this);
      }
    return pag;
  }
  append(child: IBox, index: number) {
    this
      .part(index)
      .add(child.$.part(index));
  }
  part(index: number) {
    let part = this.parts[index];

    if (!part) {
      this.checkPag(index);

      part = this.createPart(index);
      this.p.append(this.model, index);
    }
    return part;
  }
  createPart(index: number) {
    return this
      .addBox(div(C.tr), index)
      .css(this.css);
  }
  //setup(index: number, parent: TableBox): void {
  //  super.setup(index, parent);

  //}

  fitIn(child: IBox<TrLy>, css: Dic) {
    let
      l = child.ly,
      cols = (this.p as Tb).model.cols,
      id = child.$.id;


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
    tableCellStyle(child, css, this.p as Tb);
    return css;
  }

  setEditMode() {

  }

  static clone(box: ITRowBox) {
    let temp = Box.clone(box);

    return temp;
  }
}
function tableCellStyle(child: IBox<TrLy>, css: Dic, table: Tb) {
  let
    l = child.ly,
    pst = table.style;

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

/* ****************************THEAD***************************** */
export interface ITHeadBox extends ITRowBox {
  tp: "th";
  hd?: Boxes<TrLy>;
  ft?: Boxes<TrLy>;
  groups?: Array<ITGroupBox<TrLy>>;
}
class Th extends Tr<ITHeadBox> {
  constructor(model: ITHeadBox, parent: Tb, id: number) {
    super(model, parent, id);

    let dt = this.bd;
    //model = this.model,

    if (dt && dt.length) {
      let groups = model.groups;

      if (groups && groups.length) {
        dt = dt.slice();
        let
          spanData = (this.p as Tb).spans,
          spans = (this.p as Tb).model.spans;

        for (let i = 0; i < groups.length; i++) {
          let gr = groups[i];
          if (spans) {
            //erro: aqui ele vai adicionar o span no group sempre que renderizar
            for (let j = 0; j < spans.length; j++)
              if (gr.from <= spans[j].start && gr.to >= spans[j].start)
                gr.to += spanData[j].length - 1;
          }
          let l = gr.to - gr.from + 1;
          if (l < 1) break;

          //nos proximo niveis este group vai representar os seus filhos
          dt.splice(gr.from, l, ...<any>(gr.dt = dt.slice(gr.from, gr.to + 1)).map(_ => gr));
          gr.ly.span = l;
        }
        dt = dt.filter((f, i) => {
          return dt.indexOf(f, i + 1) == -1;
        });
      }
      this.bd = dt;
    }
  }

  write(pag: number) {
    let model = this.model;

    if (model.hd) {
      //model.hd.$.id = ;
      pag = write(model.hd, pag, DTParts.h, this);
    }

    pag = super.write(pag);

    if (model.ft) {
      //model.ft.$.id = ;
      pag = write(model.ft, pag, DTParts.f, this);
    }
    return pag;
  }

  //setup(index: number, parent: TableBox): void {
  //  super.setup(index, parent);

  //}
  createPart(pag: number) {
    return this
      .addBox(div(C.th, div([C.body])), pag)
      .css(this.css);
  }
  append(child: IBox, pag: number) {
    let
      part = this.part(pag),
      cpart = child.$.part(pag);

    switch (child.$.id) {
      case DTParts.h:
        part.prepend(cpart);
        break;
      case DTParts.f:
        part.add(cpart);
        break;
      default:
        part.child('.' + C.body).add(cpart);
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

/* ****************************TGROUP***************************** */
interface ITGroupBox<L = unknown> extends IParentBox<L, Boxes<any>> {
  tp: "tg";
  map?: never;
  hd: Boxes<TrLy>;
  dt?: Boxes<TrLy>[];
  ft?: never;
  from: number;
  to: number;
}
class Tg<L = unknown> extends ParentBox<L, Boxes<any>, ITGroupBox<L>> implements TableElement {
  private size: number;
  private cols: TbCell[];
  private _table: Tb;
  constructor(model: ITGroupBox<L>, parent: BoxParent<ITGroupBox<any>>, id: number) {
    super(model, parent, id);
    let
      cols = this.cols = this.table.model.cols,
      //id = model.$.id as number,
      l = model.ly as TrLy;

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
        p = p.p as BoxParent<any>;
      this._table = p as Tb;
    }
    return this._table;
  }

  fitIn(child: IBox<TrLy>, css: Dic): Dic {
    let
      l = child.ly,
      start = child.$.id as number;

    //se não for o head
    if (start >= 0) {
      start = getCellStart(start, this.model.dt) + (this.model.$.id as number);

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
  append(child: IBox<TrLy>, index: number): void {
    let
      part = this.part(index),
      cpart = child.$.part(index);

    if (child.$.id == DTParts.h)
      part.prepend(cpart);
    else part.child('.' + C.body).add(cpart);
  }
  //setup(index: number, parent: IBoxParent): void {
  //  super.setup(index, parent);

  //}
  write(pag: number): number {
    let { hd, dt } = this.model;

    pag = write(hd, pag, DTParts.h, this);

    for (let i = 0; i < dt.length; i++) {
      let t = dt[i];
      pag = write(t, pag, i, this);
    }

    return pag;
  }
  part(index: number): S<HTMLElement> {
    let part = this.parts[index];
    if (!part) {
      part = this
        .addBox(div([C.box, C.tableGroup], div([C.body])), index)
        .css(this.css);
      this.p.append(this.model, index);
    }
    return part;
  }
  createPart(index: number) { return null; }

  static normalize(model/*: ITGroupBox*/) {
    super.normalize(model);
    normBox(model.hd);
    return model;
  }
}

function getCellStart(index: number, dt: IBox<TrLy>[]) {
  let start = index;
  for (let i = 0; i < index; i++)
    if (dt[i].ly.span)
      start += dt[i].ly.span - 1;
  return start;
}


/* ************************************************************** */
/* ****************************GRID****************************** */
/* ************************************************************** */


interface GridRowLayout {
  /**column span */
  cspan?: number;
  /**top, right, bottom, left */
  margin?: Margin;

  break?: boolean;
}
interface GridLayout extends GridRowLayout {
  /**column */
  c: number;

  /**row span */
  rspan?: number;

  /**row */
  r: number;
}
interface IGridBox<L = unknown> extends IParentBox<L, Boxes<GridLayout>> {
  tp: "grid";
  //orientation: ui.Orientation;
  gap: BoxSpace;
  columns: any[];
  rows: any[];
}
class GridBox<L = unknown> extends ParentBox<L, Boxes<GridLayout>, IGridBox<L>> {
  get css() {
    var css = this._css;
    if (!css) {
      var md = this.model,
        template = '';
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
  createPart(index: number) {
    return this
      .addBox(div(C.grid, [div(), div(), div()]), index)
      .css(this.css);
  }
  fitIn(child: IBox<GridLayout>, css: Dic) {
    var l = child.ly;
    return {
      'grid-area': `${l.r + 1} / ${l.c + 1} / span ${l.rspan || 1} / span ${l.cspan || 1}`,
      margin: (l.margin || ["auto"]).join('px ') + 'px'
    };
  }
}


/* ************************************************************** */
/* ****************************CHART***************************** */
/* ************************************************************** */

interface ICustomBox<L = unknown> extends IBox<L> {
  tp: "custom";
  render(p: BoxParent): Promise<any>;
}
class CustomBox<L = unknown> extends Box<L, ICustomBox<L>> {
  get css() { return this._css || <Dic>(this._css = this.p.fitIn(this.model, {})) }
  write(pag: number) {
    let
      md = this.model,
      p = this.p;
    md.render(p);
  }
  part(index: number) {
    return this.parts[index];
  }
}

/* ************************************************************** */
/* ***************************GRAPHIC**************************** */
/* ************************************************************** */
interface GraphicStyle {

}
interface IGraphicBox<L = unknown> extends IBox<L> {
  tp: "graphic";
  is?: GraphicStyle;
}
class GraphicBox<L = unknown> extends Box<L, IGraphicBox<L>> {
  clearStyle(): void {
    throw new Error("Method not implemented.");
  } get css() {
    return this._css || (this._css = {});
  }
  write(index: number) {
    const model = this.model,
      parent = this.p;
    //this.addBox(m(new gr.SvgViewer({ })), index);
    parent.append(model, index);

    return index;
  }
  part(index: number) {
    return this.parts[index];
  }
  static default: Partial<IImgBox> = {
  };
}



/* ************************************************************** */
/* ****************************SYMBOL**************************** */
/* ************************************************************** */
export interface ISymbolBox<T = any> extends IBox<T> {
  tp: "symbol";
  dt: string;
  dir?: string;
}
class SymbolBox<L = unknown> extends Box<L, ISymbolBox<L>> {
  get css() {
    return this.data ? this.data.$.css : this.layout;
  }

  clearStyle(): void {
    throw new Error("Method not implemented.");
  }
  data: Boxes<any>;
  valid(index) {
    let model = this.model, data: Boxes<any>;
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
  write(index: number) {
    let t = write(this.data, index, this.id, this.p);
    for (let part in this.data.$.parts)
      this.parts[part] = this.data.$.parts[part];
    return t;
  }
  part(index: number) {
    //// so não tem data returna o empty-box
    //if (this.data && !(index in this.parts))
    //  this.addBox(this.data.$.part(index), index);

    ////return empty box
    return this.parts[index];

  }
  transport(from: number, to: number) {
    if (this.data)
      this.data.$.transport(from, to);
    super.transport(from, to);
  }
  clear() {
    if (this.data && this.data.$)
      this.data.$.clear();
    super.clear();
  }
  static symbs(dt: ISymbolBox, list: string[]) {
    list.push(dt.dt);
  }
}

/* ************************************************************** */
/* **************************PLACE HOLDER************************ */
/* ************************************************************** */
export interface IPHBox<T = unknown> extends IBox<T> {
  tp: "ph";
  val?: string;
}
class PHBox<L = unknown> extends Box<L, IPHBox<L>> {
  clearStyle(): void {
    throw new Error("Method not implemented.");
  }
  get css() {
    return this.data ? this.data.$.css : this.layout;
  }
  data: IBox;
  valid(index) {
    let model = this.model, data: IBox;
    if (this.data !== undefined)
      data = this.data;
    else {
      let t = super.valid(index) ? <string | IBox>this.ctx.calc(model.val, this, index) : null;
      if (t) {
        this.data = data = isS(t) ?
          <IPBox>{ tp: 'p', dt: [{ dt: t }] } :
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
  write(index: number) {
    let t = write(this.data, index, this.id, this.p);
    for (let part in this.data.$.parts)
      this.parts[part] = this.data.$.parts[part];
    return t;
  }
  part(index: number) {
    //// so não tem data returna o empty-box
    //if (this.data && !(index in this.parts))
    //  this.addBox(this.data.$.part(index), index);

    ////return empty box
    return this.parts[index];

  }
  transport(from: number, to: number) {
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


/* ************************************************************** */
/* ****************************HR**************************** */
/* ************************************************************** */

interface HrStyle extends Border {

}
interface IHrBox<L = unknown> extends IBox<L> {
  tp: "hr";
  is?: HrStyle,
  o?: Ori;
}
class HrBox<L = unknown> extends Box<L, IHrBox<L>>{
  clearStyle(): void {
    throw new Error("Method not implemented.");
  } get css() {
    if (!this._css) {
      let
        md = this.model,
        p = this.p;
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
        'border-bottom'
      ] = bd;
    }
    return this._css;
  }
  write(index: number) {
    var
      model = this.model,
      parent = this.p;
    this.addBox(g('hr', [C.hr]).css(this.css), index);
    //sheet = parent.part(/*model, */index);

    parent.append(model, index);
    if (parent.overflow(model, index))
      parent.append(model, ++index);

    return index;
  }
  part(index: number) {
    return this.parts[index];
  }
}

interface INewBox<L = unknown> extends IBox<L> { tp: "new"; }
class NewBox<L = unknown> extends Box<L, INewBox<L>>{
  clearStyle(): void {
    throw new Error("Method not implemented.");
  }
  get css() {
    return this._css || (this._css = {});
  }

  write(index: number) {
    //const model = this.model;
    this.addBox(g('div'), ++index);

    this.p.append(this.model, index);
    //.part(/*model, */index).append();

    return this.end = index;
  }
  part(index: number) {
    return this.parts[index];
  }

}

export interface IImgBox<T = unknown> extends IBox<T> {
  tp: "img";
  is?: ImgStyle;
  dt: string;
  pars?: Dic<string>;
}
class ImgBox<L = unknown> extends Box<L, IImgBox<L>>{
  clearStyle(): void {
    throw new Error("Method not implemented.");
  }
  get css() {
    if (!this._css) {
      let
        md = this.model,
        p = this.p;

      this._css = p.fitIn(md, styleImg(md.is));
    }
    return this._css;
  }
  write(index: number) {
    var
      model = this.model,
      parent = this.p;

    this.addBox(g('img', [C.box, C.img])
      .prop("src", parent.ctx.img(model.dt, model.pars))
      .css(this.css), index);

    parent.append(model, index);
    if (parent.overflow(model, index) == OFTp.out)
      parent.append(model, ++index);
    //.part(model, index)
    //.append();

    return index;
  }
  part(index: number) {
    return this.parts[index];
  }

  static default: Partial<IImgBox> = {
    is: {
      w: 64,
      h: 64
    },
    ub: true
  };
}
/* ************************************************************** */
/* ****************************RENDER**************************** */
/* ************************************************************** */
export type PBoxes<L = BodyLy> =
  IBlockBox<L> |
  ICol<L> |
  IRow<L> |
  ITableBox<L>;
export type Boxes<L = any> =
  IPBox<L> |
  PBoxes<L> |
  ISymbolBox<L> |
  IHrBox<L> |
  INewBox<L> |
  IImgBox<L> |
  IPHBox<L> |
  IGridBox<L> |
  ICustomBox<L> |
  IGraphicBox<L> |
  IRow<L> |
  ICol<L>;
export interface Book {
  sets?: Dic<string>;
  dt?: PBoxes;

  hd?: Boxes<SideLayout>;
  ft?: Boxes<SideLayout>;

  /**header size */
  hdSize?: number;

  /**footer size */
  ftSize?: number;
  /**padding */
  pad?: BoxSpace;
  wm?: IPBox<WMLayout>;
  top?: Boxes;
  bottom?: Boxes;

  symbs?: string[];
  imgs?: string[];

}
/** */
interface WMLayout {
  tp?;
}

export function render(box: IBox | string) {
  if (!box)
    return null;
  if (isS(box))
    return g("p", 0, box);

  let
    r = S.empty,
    p: BoxParent = {
      ctx: {
        fmt(this: any, value: unknown, exp: string) {
          return $.fmt(value, exp, {
            currency: (<any>this.dt).currency,
            currencySymbol: (<any>this.dt).currencySymbol || false,
            //refCurr:
          });
        },
        //calc(value: Expression, ctx: IBookContext, index?: number) {
        //  return getValue(value, ctx, index);
        //},
        //img() { return ''; }
      },

      getTextTheme: () => null,
      fitIn: (_: IBox, css: Dic) => css,
      overflow: () => OFTp.in,

      append(child: IBox) {
        r = child.$.part(0)
      }
    };
  write(box, 0, 0, p);
  return r;
}

export const sheet = (bk: Book, w: number) => g('article', C.sheet, render(bk.dt)).css({
  background: "#fff",
  width: `${w}px`,
  marginTop: `40px`,
  padding: space([0, 6]),
  whiteSpace: "pre-wrap"
});
//function pag(ctx: Context, bk: Book, w: number, h: number, index: number) {

//  return [div, bd];
//}
export async function sheets(ctx: Context, container: S, bk: Book, w: number, h: number) {
  let content: S, bd: S, currentPag = -1;
  write(bk.dt, 0, DTParts.d, {
    ctx,
    dt: ctx.dt,
    getTextTheme: () => null,
    fitIn(child, css) {
      if (child.ly.fill)
        css.minHeight = "100%";
      return Object.assign(css, { marginTop: 0, marginBottom: 0 });
    },
    overflow(child, index: number) {
      let
        cRect = child.$.part(index).rect(),
        pRect = rect(bd);

      return Math.floor(cRect.bottom) > Math.ceil(pRect.bottom) ? OFTp.out : OFTp.in;
    },
    justALittle(child, index) {
      let
        cRect = child.$.part(index).rect(),
        pRect = rect(bd);

      return (pRect.bottom - cRect.top) < minBoxSize;
    },
    append(dt, index) {
      if (index != currentPag) {
        let
          pad = bk.pad || theme.padding,
          hd = g('header').css("height", `${bk.hdSize || theme.hdSize}px`),
          ft = g('footer').css("height", `${bk.ftSize || theme.ftSize}px`),
          p: BoxParent = {
            ctx,
            dt: ctx.dt,
            getTextTheme: () => null,
            fitIn: (_, css) => css,
            overflow: () => OFTp.in,
            append(dt) { part.add(dt.$.part(index)); }
          };

        bd = g('section', C.body);
        content = g('article', C.sheet, hd)
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
          write(bk.top, index, DTParts.t, p);
          h -= height(bk.top.$.part(index));
        }
        content.add(bd);
        if (bk.bottom) {
          write(bk.bottom, index, DTParts.b, p);
          h -= height(bk.bottom.$.parts[index]);
        }

        if (bk.hd) {
          part = hd;
          write(bk.hd, index, DTParts.h, p);
        }

        content.add(ft);
        if (bk.ft) {
          part = ft;
          write(bk.ft, index, DTParts.f, p);
        }

        h -= (bk.hdSize || theme.hdSize) + (bk.ftSize || theme.ftSize) + pad[0] * 2;
        if (h <= 0)
          throw "error";

        if (bk.wm) {
          part = div(C.watermark);
          write(bk.wm, index, DTParts.b, p);
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
export function dblSheets(container: S, w: number) {
  let t = container.childs().remove();
  for (let i = 0; i < t.length; i += 2) {
    let t2 = <(HTMLElement | S)[]>t.slice(i, i + 2);
    t2.splice(1, 0, g('hr').css({
      borderLeft: '1px dashed #AAA',
      margin: 0
    }));
    container.add(div(C.sheet, t2).css({
      width: (w * 2) + "px",
      display: 'flex',
      flexDirection: 'row'
    }));
  }
  return container;
}

type Sz = [w: number, h: number]
export const medias = {
  A4: <Sz>[210 * units.mm, 297 * units.mm],
  A5: <Sz>[148 * units.mm, 210 * units.mm],
  A3: <Sz>[297 * units.mm, 420 * units.mm]
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
  fill?: boolean;
}

export type MediaType = (child: Boxes, pag: number) => any;

export function normalize(dt: Book) {
  let
    symbs = dt.symbs ||= [],
    t = (dt: IBox) => boxes[dt.tp].symbs(dt, symbs);

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

const spans: Dic<{
  isEmpty(model): boolean;
  break: boolean;
  new(model: ISpanBase, parent: PBox): SpanBase;
}> = {
  ["t"]: Span,
  ["s"]: Scalar,
  ["img"]: Img
};
export const boxes: Dic<{

  // replace(model: IBox, key: string, newValue: IBox): boolean,
  normalize(model: IBox): IBox,
  clone(model): IBox,
  isEmpty(model): boolean;
  new(model, parent: BoxParent<any>, id: number): Box<any, any, any>;
  symbs(model: IBox, list: string[]);
}> = {
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
export const theme: Theme = {
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