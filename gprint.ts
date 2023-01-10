import { Properties, div, empty, g, S } from "galho";
import { arr, assign, bool, def, Dic, float, fmt, int, isA, isN, isS, Key, l, Obj, str, Task, unk } from "galho/util.js";
import { numbInFull } from "./scalar.js";


const hasProp = (obj: object) => Object.keys(obj).length;

/**book item type */
export type BT = "p" | "row" | "col" | "tr" | "th" | "block" | "ph" | "hr" | "table" | "tg" | "img" | "symbol" | "grid" | "custom" | "graphic" | "new";

/**book span type */
export type ST = "t" | "e" | "img";
/* ************************************************************** */
/* *********************MAIN INTERFACE*************************** */
/* ************************************************************** */
export interface Context {
  dt?: unk;
  temp?: Dic<unk>;
  calc?(value: str, s: Scope, pag?: int): unk;
  img?(path: str): str;
  pagCount?: int;
  wait?: (() => any)[];
}
interface Scope {
  readonly p?: BoxParent<any>;
  id?: int;
  dt?: Obj;
  readonly ctx: Context;
}
export interface BoxParent<CL = unk> extends Scope {
  fitIn?(css: Properties, ly: CL, e: S, id: int): void;
  append(child: Box<CL>, pag: int): void;
  overflow(child: iBox<CL>, pag: int): OFTp;
  listItem?(p: iP): S;
  /**tag used for p element */
  pTag?: keyof HTMLElementTagNameMap
}

//#region util
type BorderType = "none" | "hidden" | "dotted" | "dashed" | "solid" | "double" | "groove" | "ridge" | "inset" | "outset";

interface Border {
  style?: BorderType;
  width?: int;
  color?: str;
}

const $mapIndex = Symbol();

const minBoxSize = 40;

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
export const enum units {
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
type BoxSpace = [int, int?, int?, int?];
type TextVAlign = "baseline" | "sub" | "super"
type Margin = [int | null, int | null, int | null, int | null];

export interface SpanStyle {
  /**font family */
  ff?: str;
  /**font size */
  fs?: int;
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
  cl?: str;
  /**background */
  bg?: str;
}
interface Shadow {
  inset?: boolean;
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
}
interface Background {
  tp?: 'img' | 'color';
  dt: str;
}
interface BoxStyle {
  bg?: Background;
  /**border */
  br?: Borders;
  /**Padding */
  pd?: BoxSpace;
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
/**paragraph style */
export interface PStyle {

  shadow?: TextShadow[];
  // mg?: int;
  //paragraph properties
  indent?: int;
  /**line height */
  lh?: int;
  /**align */
  al?: Align;
  noWrap?: boolean
  overflow?: 'ellipsis' | 'clip';
}
export type TextStyle = PStyle & SpanStyle;

interface divisor<T> {
  base?: T;
  odd?: T;
  first?: T;
  last?: T;
}


/* ************************************************************** */
/* ***************************METHODS**************************** */

const border = (b: Border) => `${b.width || 1}px ${b.style || 'solid'} ${b.color || "#000"}`;

function borders(css: Properties, bord: Borders) {
  if (isA(bord)) {
    if (bord[0] && hasProp(bord[0]))
      css.borderTop = border(bord[0]);
    if (bord[1] && hasProp(bord[1]))
      css.borderRight = border(bord[1]);

    if (bord[bord.length - 2] && hasProp(bord[bord.length - 2]))
      css.borderBottom = border(bord[bord.length - 2]);
    if (bord[bord.length - 1] && hasProp(bord[bord.length - 1]))
      css.borderLeft = border(bord[bord.length - 1]);
  } else css.border = border(bord);
}

const space = (p: BoxSpace) => p.map(p => p + 'px').join(' ')

const buildShadow = (shadow: Shadow[]) =>
  shadow.map(sh => `${sh.inset ? 'inset' : ''} ${sh.x}px ${sh.y}px ${sh.blur}px ${sh.spread}px ${sh.color}`).join(',');
function styleImg(style: ImgStyle, size: ImgSize, css: Properties) {
  if (style) {
    if (style.border)
      if ('length' in style.border)
        assign(css, <Properties>{
          borderTop: border(style.border[0]),
          borderRight: border(style.border[1]),
          borderBottom: border(style.border[2]),
          borderLeft: border(style.border[3]),
        });
      else css.border = border(style.border);

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
    css[size == "w" ? "width" : "height"] = '100%'
  } else {
    let [w, h] = arr(size);
    css.width = w + 'px';
    css.height = (h || w) + 'px';
  }
  return css;
}
function styleBox(s: BoxStyle, css: Properties) {
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
function styleParagraph(style: PStyle, css: Properties) {
  if (style.shadow)
    css.textShadow = style.shadow.map(s => `${s.x}px ${s.y}px ${s.blur || 0}px ${s.color}`).join();

  //paragraph
  if (style.indent)
    css.textIndent = `${style.indent}px`;

  if (style.lh)
    css.lineHeight = style.lh;

  style.al && (css.textAlign = align(style.al))
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
    var data: unk;
    if (exp[0] == '=') {
      data = ctx.calc(exp.slice(1), scp, pag);
      if (data == null)
        data = {};
      //data[$parent] = parent.dt;
    } else {
      let split = exp.split('.');
      data = scp.dt;
      for (let i = 0; i < split.length; i++) {
        if (data == null) return {};
        data = data[split[i]];
      }
    }

    return data || {};
  } else return scp.dt;
}
interface CalcOpts {
  funcs(name: str, args: any[]): any;
  vars(name: str, obj?: boolean): any;
}
// interface Settings {
//   scalar?(value: int, fmt: str): any;

// }
// export const $: Settings = {}
type CPU = (expression: str, scp: Scope, pag?: int) => any;
type ExpFn = (this: { /**pag*/p: int, s: Scope }, ...args: any[]) => any;
/** central processor unit */
export function cpu(fn: (exp: str, opts: CalcOpts) => any, extraFn?: Dic<ExpFn>): CPU {
  let
    funcs = <Dic<ExpFn>>{
      numbInFull,
      id() { return this.s.dt[$mapIndex]; },
      set(key: str, value) { return this.s.dt[key] = value },
      get(src, field) { return src[field]; },
      //set and get data to temporary storage
      temp(k, v?) { return (this.s.ctx.temp ||= {})[k] = def(v, this.s.ctx.temp[k]) },
      delay(data: () => any) {
        let r = g('span').html(empty);
        (this.s.ctx.wait ||= []).push(() => r.replace(data()));
        return r;
      },
      pags() { return this.s.ctx.pagCount },
      pag() { return this.p; },
      fmt,
      sum(v:any[],fn=v=>v){return v.reduce<int>((p,c)=>p+fn(c),0)},
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

  return (v: str, s: Scope, p?: int) => fn(v, {
    funcs: (key, args) => key in funcs ? def(funcs[key].call({ p, s }, ...args), null) : void 0,
    vars(key, obj) {
      if (key == "@") return s.dt;
      let t = s;
      do if (key in t.dt) return t.dt[key]; while (t = t.p);

      // @if DEBUG
      console.warn('not_found', { key: key, ctx: s });
      // @endif
      return obj ? {} : null;
    }
  });
}

//#endregion
interface Theme {
  key?: str;
  base?: Key;
  /**espacamento padrão das paginas */
  padding?: BoxSpace;
  /**header size */
  hdSize?: int;

  /**footer size */
  ftSize?: int;

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

export const create = <T>(i: iBox<T>, p: BoxParent<any>, id?: int) =>
  Reflect.construct(boxes[i.tp || 'p'], [i, p, id]) as Box;
export function write<T>(box: iBoxes<T> | str, pag: int, id: int, parent: BoxParent<any>): int {
  if (isS(box)) {
    box = { bd: box };
  }
  return (box.$ ? (box.$.id = id, box.$) : create(box, parent, id)).view(pag);
}

interface SideLayout {

}

/** overflow type */
const enum OFTp {
  in = 0,
  out = 1,
  jump = -1
}
type OFR = OFTp.in | OFTp.jump | float;

interface IBookContext {
  readonly parent?: IBookContext;
  dt?: unk;
  ctx?: BoxRoot;
  parts?: NDic<S>;
}
interface BoxRoot extends IBookContext {
  items: Dic;
  warning(message: str, data?: unk): void;
  //context: RootContext
}

/** ************************************************************* */
/** ****************************SPAN***************************** */
/** ************************************************************* */

export interface iSpan<S = any> {
  tp?: ST;

  /**data */
  bd?: str;
  /**style */
  is?: S;
}
export interface iText extends iSpan<SpanStyle> {
  tp?: "t";
}
interface iExp extends iSpan<SpanStyle> {
  tp: "e";
  /**input type */
  it?: str;
  // /**format */
  // fmt?: str;
}
export type ImgSize = float | [w: float, h: float] | 'w' | 'h';
export interface IImg {
  tp: "img";
  sz?: ImgSize;
  bd: str;
  // pars: Dic<str>;
  calc?: bool;
}
type iImgSpan = iSpan<ImgStyle> & IImg;
type Span<T extends iSpan = iSpan> = (i: T, p: P, pag: int/*, edit: boolean*/) => S

export const spans: Dic<Span> = {
  t: <Span<iText>>(({ is, bd }) => {
    let t = g('span');
    is && t.css(styleText(is, {}));
    return bd ? t.text(bd) : t.html(empty);
  }),
  e: <Span<iExp>>(({ bd, is }, p, pag) => {
    let v: any = p.ctx.calc(bd, p, pag);
    // fmt && (v = p.ctx.fmt(v, fmt));
    if (v || v === 0) {
      let t = g('code', 0, v);
      is && t.css(styleText(is, {}));
      return t;
    }
  }),
  img: <Span<iImgSpan>>(({ sz, bd, calc, is }, p, pag) => {
    let css = styleImg(is, sz, {});
    if (calc) {
      let t = p.ctx.calc(bd, p, pag);
      if (isS(t))
        return g('img', { src: t }).css(css);
      else {
        t = g(<any>t);
        if ((t as S).valid)
          return (t as S).css(css)

        return null;
      }
    }
    else return g('img', {
      src: def(p.ctx.img?.(bd), bd)
    }).css(css);
  })
};
export type iSpans = iText | iExp | iImgSpan;

/** ************************************************************* */
/** *************************** BOX ***************************** */
/** ************************************************************* */
export interface iBox<L = unk> {
  $?: Box<L, any>;

  /**inline style: Estilo interno */
  is?: unknown;
  /**style: nome do estilo no theme que este item usara */
  s?: str;

  tp?: str;
  /**layout : informação que este elemento passa para o seu parent para ele definir no css */
  ly?: L;

  /**Closure: o escopo é usado pela formula para saber o objecto base de onde tirar as variaveis */
  sc?: str;
  /**validator: if this return false element is not renderized */
  vl?: str;
}
abstract class Box<L = unk, T extends iBox<L> = iBox<L>> implements Scope {

  /**@deprecated provavelmento so é util para o edit */
  start: int;
  parts: NDic<S> = {};
  //id: int;
  _d: Dic;
  get dt() {
    let { i, p, start } = this;
    return this._d ||= getCtx(i.sc, p, start);
  }
  ctx: Context;

  p: BoxParent;

  /**
   * @param i interface
   * @param p parent
   * @param id 
   */
  constructor(public i: T, p: BoxParent, public id: int) {
    i.$ = this;
    this.ctx = (this.p = p).ctx
  }

  css(e: S) {
    let css: Properties = {}, { p, id, i } = this;
    this.ss(css);
    p.fitIn?.(css, i.ly || {}, e, id);
    e.css(css)
  }
  find?(filter: (v: iBox) => any): iBox[];

  valid(pag: int) {
    return !this.i.vl || this.ctx.calc(this.i.vl, this, pag);
  }

  update() {
    throw "not implemented";
  }

  abstract transport(): void
  abstract part(pag: int): S;
  abstract view(pag: int): int;
  clear() { delete this.i.$; }
  clearData() { delete this._d; }
  /**self style */
  abstract ss(v: Properties): void;
}
export type BoxT<L = unknown> = Box<L>;
interface iSBox<L = unknown> extends iBox<L> {
}
abstract class SBox<L = unk, T extends iSBox<L> = any> extends Box<L, T>{
  protected e: S;
  part() { return this.e; }

  transport() { this.start++; }
  view(pag: int) {
    if (this.valid(pag)) {
      this.css(this.e = this.data(pag));

      let { p, i } = this;
      p.append(this, pag);
      p.overflow(i, pag) && p.append(this, ++pag);
    }
    return this.start = pag;
  }
  protected data?(pag: int): S;
}
interface iMBox<L = unknown> extends iBox<L> {
  /**unbreakeble se false caso não sobre espaço para por toda linha põe o que chegar na proxima pagina
   * por defualt é false*/
  ub?: bool;
}
abstract class MBox<L = unk, T extends iMBox<L> = any> extends Box<L, T>{
  /**@deprecated provavelmento so é util para o edit */
  end: int;
  view(pag: int) {

    this.start = this.end = pag;
    if (this.valid(pag))
      this.data(pag);
    return this.end;
  }
  addBox(s: S, pag: int) {
    this.css(this.parts[this.end = pag] = s);
    return s;
  }
  transport() {
    let { parts: p, end: e } = this;
    this.parts = { [e + 1]: p[e] };
  }
  part(pag: int) { return this.parts[pag]; }
  protected abstract data(pag: int): void;
}
export type ASpan = (iSpans | str)[] | str | iSpans;
// box[0] == '=' ? [{ tp: "e", bd: box.slice(1) }] : 
export const span = (v: ASpan) => v ? arr(v).map(v => isS(v) ? v[0] == '=' ? <iExp>{ tp: "e", bd: v.slice(1) } : { bd: v } : v) : [];
export interface iP<L = unk> extends iMBox<L> {
  tp?: "p",
  $?: P<L>,
  is?: PStyle;
  /**list index */
  li?: int;
  /**body */
  bd?: ASpan;
}
class P<L = unk> extends MBox<L, iP<L>> {
  ss(css: Properties) {
    let
      i = this.i,
      th = theme.p[i.s],
      props: Dic = {};
    css.margin = 0;
    if (th) {
      styleText(th, css);
      assign(props, th);
    }
    i.is && assign(props, i.is);
    styleParagraph(props, css)
  }
  data(pag: int) {
    let
      i = this.i,
      p = this.addBox(g(this.p.pTag || "p"), pag),
      items: S[] = [i.li ? this.p.listItem(i) : null];

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
    else p.html(empty);

    this.p.append(this, pag);
    return this.check(p, pag);
  }
  check(e: S, pag: int) {
    let i = this.i, p = this.p, o: OFR, bd = span(i.bd);

    while (o = p.overflow(i, pag)) {
      if (o == OFTp.jump)
        pag++;

      //se so sobrou um pouco de espaço nesta pagina
      else if (!l(bd) || o < 40) {
        p.append(this, ++pag);

      } else {
        let
          childs = e.childs(),
          newE = g("p"),
          j = childs.length - 1;

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
          let
            newSpan = last.clone(),
            lastSpanText = last.e.firstChild,
            split = lastSpanText.textContent.split(' '),
            newSpanText: str[] = [];

          do {
            newSpanText.unshift(split.pop());
            lastSpanText.textContent = split.join(' ');// lastSpanText.textContent.substring(0, lastSpanText.textContent.lastIndexOf(' '));
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
export type PT = P;
interface BlockList extends SpanStyle {
  /**@deprecated */
  indent?: int;
  /**format */
  fmt?: str;
}
export type ABoxes<L = unk> = iBoxes<L> | iBoxes<DivLy>[];
interface iParentBase<L = unknown> extends iMBox<L> {
  $?: Parent<L, any>;
  l?: BlockList;
  is?: BoxStyle;
  /**map: deve repetir a data usando o context */
  map?: bool;
  /**header */
  hd?: ABoxes;

  /**body */
  bd?: iBoxes[];

  /**footer */
  ft?: ABoxes;
  /**usado so quando tiver map e não tiver nenhum item */
  empty?: iBoxes;
}
export interface iParent<L = unk, CL = unk> extends iParentBase<L> {
  hd?: ABoxes<CL>;
  bd?: iBoxes<CL>[];
  ft?: ABoxes<CL>;
  empty?: iBoxes<CL>;
}
const bparse = <T>(v: T, k: keyof T): iBoxes => isA(v[k]) ? v[k] = <any>{ tp: "d", bd: v[k] } : v[k];
abstract class Parent<L = unk, CL = unk, T extends iParentBase<L> = iParent<L, CL>> extends MBox<L, T> implements BoxParent<CL> {
  //private _ctx: unk;
  ss(v: Properties) {
    let
      i = this.i,
      box = theme.box[i.s],
      txtStyle = theme.p[i.is?.tx || box && box.tx];

    styleBox({ ...box, ...i.is }, v);
    txtStyle && styleText(txtStyle, v);

  }

  data(pag: int) {
    type MapContext = ArrayLike<any> & { /**pag data */pd: NDic<any[]> };
    let { bd, map, empty } = this.i;

    if (map) {
      let
        dt = this.dt as MapContext,
        range: Object[] = [], bds = bd.map(i => create(i, this));

      dt.pd = { [pag]: range };

      if (l(dt))
        for (let i = 0; i < l(dt); i++) {
          let row = dt[i];
          for (let t of bds) {
            if (i) t.clearData();
            if (row) row[$mapIndex] = i;

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
        pag = write(empty, pag, DTParts.bd, this);

    } else for (let i = 0; i < l(bd); i++)
      pag = write(bd[i], pag, i, this);



    return pag;
  }

  append(ch: Box<CL>, pag: int) {
    let
      e = this.part(pag),
      cpart = ch.part(pag);

    ch.id >= 0 && (this.i.ft as iBoxes)?.$.part(pag) ? e.place(-2, cpart) : e.add(cpart);
  }
  part(pag: int) {
    let i = this.i, part = this.parts[pag];

    if (!part) {
      part = this.createPart(pag);
      this.p.append(this, pag);

      bparse(i, "hd") && write(i.hd as iBoxes<CL>, pag, DTParts.h, this);
      bparse(i, "ft") && write(i.ft as iBoxes<CL>, pag, DTParts.f, this);
    }
    return part;
  }
  transport() {
    let { hd, bd, ft } = this.i;
    super.transport();

    (hd as iBoxes<CL>)?.$.transport();
    (ft as iBoxes<CL>)?.$.transport();

    for (let i of bd)
      i?.$.transport();
  }
  overflow(child: iBox<CL>, pag: int) {
    let result = this.p.overflow(this.i, pag);

    if (result) {
      if (!this.break(child, pag)) {
        this.transport();
        this.p.append(this, pag + 1);
        return OFTp.jump;
      }
    }
    return result;
  }
  //protected abstract part(index: int): m.S;
  break(child: iBox<CL>, index: int) {
    let i = this.i;
    //não deve quebrar se for o header ou footer a pedir
    if (isN(child.$.id) && !i.ub) {


      return true;
    }
    return false;
  }

  private _lCss: Dic;
  private _lItems: Array<{ s: S, p: iP }>;
  listItem(p: iP) {
    throw "not implemented yet";
    let
      l = this.i.l,
      css = this._lCss || styleText(l, {}),
      s = g('span', ['li'],/* $.scalar(p.li, l.fmt) */).css(css);
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
  abstract fitIn(css: Properties, ly: CL, e: S, id: int): void;

  protected abstract createPart(index: int): S;

  clear() {
    let { hd, bd, ft } = this.i;

    for (let i of bd)
      i.$?.clear();

    (hd as iBoxes)?.$?.clear();
    (ft as iBoxes)?.$?.clear();

    super.clear();
  }
  clearData() {
    let { hd, bd, ft } = this.i;
    for (let i of bd)
      i.$?.clearData();

    (hd as iBoxes)?.$?.clearData();
    (ft as iBoxes)?.$?.clearData();
    super.clearData();
  }
}
export type ParentT = Parent;

interface BlockColumn {
  width?: int;
  rule?: Border;
  count?: int;
  gap?: int;
}
export interface DivLy {
  /**is list item */
  li?: boolean;
  /**Margin in pixels*/
  mg?: float | [top: float, bottom: float];
}

export interface iDiv<L = unk> extends iParent<L, DivLy> {
  tp: "d"
  cols?: BlockColumn;
}
class Div<L = unk> extends Parent<L, DivLy, iDiv<L>> {
  ss(css: Properties) {
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

  createPart(index: int) {
    return this.addBox(div(), index);
  }

  fitIn(css: Properties, ly: CLy) {
    if (ly.mg) {
      let [t, b] = arr(ly.mg);
      css.marginTop = t + "px";
      css.marginBottom = def(b, t) + "px"
    }
  }
}
export type BlockT = Div;
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
interface FlexLy {
  /**size defined in percent */
  sz?: float | [size: float, growShrink: float] | [size: float, grow: float, shrink: float];
  /**align accros secundary axis*/
  al?: Align;
  /**max and min in percentage*/
  mm?: [min: float | 0, max: float];
  /**Margin in pixels obs ""(empty string) means auto*/
  mg?: float | "" | [v0: float | "", v1: float | ""];
}
/**flex layout */
function fLy(ly: FlexLy, css: Properties, v0: "Top" | "Left", v1: "Bottom" | "Right") {
  if (ly.sz) {
    let [sz, g, s] = arr(ly.sz);
    css.flexGrow = g ||= 0;
    css.flexShrink = s || g;
    sz && (css.flexBasis = sz + "%");
  }

  if (ly.al) {
    if (ly.al) {
      let al: str;
      switch (ly.al) {
        case 's': al = 'flex-start'; break;
        case 'e': al = 'flex-end'; break;
        case 'c': al = 'center'; break;
        case 'j': al = 'stretch'; break;
        default: al = ly.al;
      }
      css.alignSelf = al;
    }
  }
  if (ly.mg) {
    let [t, b] = arr(ly.mg);
    b = def(b, t);
    css[`margin${v0}`] = t === "" ? "auto" : t + "px";
    css[`margin${v1}`] = b === "" ? "auto" : b + "px"
  }
}
export interface CLy extends FlexLy {
}
export interface iCol<L = unk> extends iParent<L, CLy> {
  tp: "col",
  /**padding */
  // pad?: int[];
  /**bottom to top */
  btt?: boolean;
  align?: Align;
}
class Col<L = unk> extends Parent<L, CLy, iCol<L>> {

  ss(v: Properties) {
    super.ss(v);
    assign(v, <Properties>{
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
  createPart(pag: int) {
    return this.addBox(div(), pag);
  }

  fitIn(css: Properties, ly: CLy) {
    fLy(ly, css, "Top", "Bottom");
    ly.mm && (
      css.minHeight = ly.mm[0] + "%",
      css.maxHeight = ly.mm[1] + "%")
  }
}



export interface RLy extends FlexLy {

  // grow?: int;
}
export interface iRow<L = unk> extends iParent<L, RLy> {
  tp: "row";
  /**padding */
  // pad?: int[];
}
class Row<L = unk> extends Parent<L, RLy, iRow<L>> {
  ss(css: Properties) {
    super.ss(css);
    assign(css, <Properties>{
      display: "flex",
      flexDirection: "row"
    });
  }
  data(pag: int) {
    let { bd } = this.i;
    for (let i = 0; i < bd.length; i++)
      pag = write(bd[i], pag, i, this);

    return pag;
  }
  createPart(pag: int) { return this.addBox(div(), pag) }
  append(ch: Box<RLy>, pag: int) {
    let part = this.parts[pag];
    if (!part) {
      part = this.part(pag);
      this.p.append(this, pag);
    }

    part.add(ch.part(pag));
  }
  break(child: iBox<RLy>, index: int) {
    //todo: corta todos os childs
    return super.break(child, index);
  }
  fitIn(css: Properties, ly: CLy) {
    fLy(ly, css, "Left", "Right");
    ly.mm && (
      css.minWidth = ly.mm[0] + "%",
      css.maxWidth = ly.mm[1] + "%")
  }
}

/* ************************************************************** */
/* ****************************TABLE***************************** */
/* ************************************************************** */

interface TableStyle extends BoxStyle {
  /**style for child in the body */
  bd?: BoxStyle;
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
interface TbCellObj {
  /**size */
  sz?: float;
}
export type TbColInfo = TbCellObj | float;

export type Ori = "h" | "v";
export interface iTb<L = unk> extends iParentBase<L> {
  tp: "tb";
  is?: TableStyle;
  hd?: iTr;
  bd?: (iTr)[]//(iTr | iBoxes<TrLy>[])[];
  ft?: iTr;
  empty?: iTr;
  /**columns */
  cols?: TbColInfo[];
}
class Tb<L = unk> extends Parent<L, void, iTb<L>> {
  private _style: TableStyle;
  /**span data */
  spans: Array<Array<unk>>;
  ss(v: Properties) {
    v.borderCollapse = "collapse"
  }
  get style() {
    if (!this._style) {
      let
        i = this.i,
        th = theme.tables;
      this._style = assign(th[i.s] || th[''] || {}, i.is);

      //if (md.s)
      //  for (let i = 0; i < md.s.length; i++)
      //    Object.assign(this._style, th.byKey(md.s[i]));
      //else Object.assign(this._style, th.byKey(undefined));
    }
    return this._style;
  }

  createPart(pag: int) {
    return this.addBox(g("table"), pag);
  }
  fitIn() { }
}

export interface TrLy {
  /**row span */
  span?: int;
  /**margin top*/
  mt?: int;
  /**margin left*/
  ml?: int;
  /**margin right*/
  mr?: int;
  /**margin bottom*/
  mb?: int;
}

/* ****************************TROW***************************** */
export interface iTr<L = void> extends iSBox<L> {
  tp: "tr";
  bd?: iBoxes<TrLy>[];
  is?: BoxStyle;
}
/**column size */
const cs = (c: TbColInfo) => isN(c) ? c : c.sz;
class Tr<L = void> extends SBox<L, iTr<L>> implements BoxParent<L> {
  declare p: Tb;
  ss(v: Properties) {
    let
      i = this.i,
      props: BoxStyle = {},
      tableStyle = this.p.style,
      pS =
        i.$.id == DTParts.h ?
          tableStyle.hd :
          i.$.id == DTParts.f ?
            tableStyle.ft :
            tableStyle.bd,
      box = theme.box[i.s],
      txtStyle = theme.p[i.is?.tx || (box && box.tx) || (pS && pS.tx)];

    styleBox(assign(props, pS, box, i.is), v)

    txtStyle && styleText(txtStyle, v);
  }

  data(pag: int) {
    this.e = g("tr");
    let bd = this.i.bd;
    for (let i = 0; i < bd.length; i++)
      pag = write(bd[i], pag, i, this);

    return this.e;
  }
  append(ch: Box<TrLy>, pag: int) {
    this.e.add(ch.part(pag));
  }
  get pTag(): keyof HTMLElementTagNameMap { return "td"; }
  fitIn(css: Properties, ly: TrLy, e: S<HTMLTableCellElement>, id: int) {
    let
      { i: { bd }, p } = this,
      cols = p.i.cols;

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
    ly.span && (e.e.colSpan = ly.span)
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

  overflow(_, pag: int) {
    let r = this.p.overflow(this.i as any, pag);

    if (r) {
      this.transport();
      this.p.append(this as any, pag + 1);
      return OFTp.jump;
    }
    return OFTp.in;
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


/* ************************************************************** */
/* ****************************GRID****************************** */
/* ************************************************************** */


interface GridRowLayout {
  /**column span */
  cspan?: int;
  /**top, right, bottom, left */
  margin?: Margin;

  break?: boolean;
}
interface GridLy extends GridRowLayout {
  /**column */
  c: int;

  /**row span */
  rspan?: int;

  /**row */
  r: int;
}
interface iGrid<L = unk> extends iParent<L, iBoxes<GridLy>> {
  tp: "grid";
  //orientation: ui.Orientation;
  gap: BoxSpace;
  cols: any[];
  rows: any[];
}
class GridBox<L = unk> extends Parent<L, GridLy, iGrid<L>> {
  ss(v: Properties) {
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
  createPart(pag: int) {
    return this.addBox(div(0, [div(), div(), div()]), pag);
  }
  fitIn(css: Properties, ly: GridLy) {
    return {
      'grid-area': `${ly.r + 1} / ${ly.c + 1} / span ${ly.rspan || 1} / span ${ly.cspan || 1}`,
      margin: (ly.margin || ["auto"]).join('px ') + 'px'
    };
  }
}

/* ************************************************************** */
/* ***************************GRAPHIC**************************** */
/* ************************************************************** */
interface GraphicStyle {

}
interface iGraphic<L = unk> extends iBox<L> {
  tp: "graphic";
  is?: GraphicStyle;
}
class Graphic<L = unk> extends SBox<L, iGraphic<L>> {
  ss() { }
  data(pag: int) {
    return div();
  }
}



/* ************************************************************** */
/* ****************************SYMBOL**************************** */
/* ************************************************************** */
export interface iPH<T = any> extends iMBox<T> {
  tp: "ph";
  bd: str;
}
class PH<L = unk> extends MBox<L, iPH<L>> {
  ss() { }
  bd: iBoxes<L>;
  valid(pag: int) {
    let { i, ctx } = this, bd = ctx.calc(i.bd, this) as iBoxes<L> | str;
    isS(bd) && (bd = { bd });
    bd && assign(bd, { ly: i.ly });
    return (this.bd = bd) && super.valid(pag);
  }
  data(pag: int) {
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


/* ************************************************************** */
/* ****************************HR**************************** */
/* ************************************************************** */

interface HrStyle extends Border {

}
export interface iHr<L = unk> extends iBox<L> {
  tp: "hr";
  is?: HrStyle,
  o?: Ori;
}
class Hr<L = unk> extends SBox<L, iHr<L>>{
  ss(v: Properties) {
    let { o, s, is } = this.i;
    v.border = "none";
    v.margin = 0;
    v[o == "v" ? "borderLeft" : "borderTop"] = border({ ...theme.hr[s], ...is });
  }
  data(pag: int) { return g('hr'); }
}

interface iNP<L = unk> extends iBox<L> { tp: "np"; }
/**new pag */
class NP<L = unk> extends SBox<L, iNP<L>>{
  ss() { }

  view(pag: int) {
    this.valid(pag) && pag++;
    this.e = div();
    this.p.append(this, this.start = pag);
    return this.start;
  }
}

export type iImgBox<T = unk> = iBox<T> & IImg & { is?: ImgStyle };
class ImgBox<L = unk> extends SBox<L, iImgBox<L>>{

  ss(v: Properties) {
    let { is, sz } = this.i;
    styleImg(is, sz, v);
  }
  data() {
    let { ctx, i } = this;
    return g('img', { src: def(ctx.img?.(i.bd), i.bd) });
  }
}
/* ************************************************************** */
/* ****************************RENDER**************************** */
/* ************************************************************** */
export type iPBoxes<L = any> =
  iDiv<L> |
  iCol<L> |
  iRow<L> |
  iTb<L>;
export type iBoxes<L = any> =
  iP<L> |
  iPBoxes<L> |
  iPH<L> |
  iHr<L> |
  iNP<L> |
  iImgBox<L> |
  iGrid<L> |
  iGraphic<L> |
  iTr<L>;
export interface Book {
  hd?: iBoxes<SideLayout>;
  bd: ABoxes;
  ft?: iBoxes<SideLayout>;

  // fill?: bool;
  /**header size */
  hdSz?: int;

  /**footer size */
  ftSz?: int;
  /**padding */
  // pad?: BoxSpace;
  wm?: iP<WMLayout>;
}
/** */
interface WMLayout {
  tp?;
}

export type sbInput<L = void> = str | ABoxes<L>;
export function render(bd: sbInput) {
  if (!bd)
    return null;
  if (isS(bd))
    return g("p", 0, bd);

  let
    r = S.empty,
    p: BoxParent = {
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
      overflow: () => OFTp.in,

      append: (child: Box) => r = child.part(0)
    };
  write(bparse({ bd }, "bd"), 0, 0, p);
  return r;
}

export const sheet = (bd: sbInput, w: int) => g('article', "_ sheet", render(bd)).css({
  width: `${w}px`,
  marginTop: `40px`,
  padding: space([0, 6]),
  ...styleText(theme.text, {})
});
//function pag(ctx: Context, bk: Book, w: int, h: int, index: int) {

//  return [div, bd];
//}
export function sheets(ctx: Context, container: S, bk: Book, w: int, h: int) {
  let
    height: int,
    hs = bk.hdSz || theme.hdSize,
    fs = bk.ftSz || theme.ftSize;
  write(bparse(bk, "bd"), 1, DTParts.bd, {
    ctx,
    dt: ctx.dt,
    fitIn: (css) => css.minHeight = `calc(100% - ${hs + fs}px)`,//(bk.fill && ()),
    // assign(css, { marginTop: 0, marginBottom: 0 })
    overflow: (child, pag: int) =>
      Math.max(Math.floor(child.$.part(pag).e.offsetHeight) - height, OFTp.in),
    append(ch, pag) {
      ctx.pagCount = pag;
      let
        pad = theme.padding,
        hd = g('header').css("height", `${hs}px`),
        ft = g('footer').css("height", `${fs}px`),
        part: S,
        p: BoxParent = {
          ctx,
          dt: ctx.dt,
          overflow: () => OFTp.in,
          append(ch) { part.add(ch.part(pag)); }
        };

      height = g("article", "_ sheet", [hd, ch.part(pag), ft])
        .addTo(container)
        .css({
          background: "#fff",
          width: `${w}mm`,
          //!GAMBIARRA
          minHeight: !h && "300mm",
          height: `${h}mm`,
          padding: space(pad),
          whiteSpace: 'pre-wrap',
          ...styleText(theme.text, {})
        }).e.clientHeight - (hs + fs + pad[0] * 2);

      if (bk.hd) {
        part = hd;
        write(bk.hd, pag, DTParts.h, p);
      }

      if (bk.ft) {
        part = ft;
        write(bk.ft, pag, DTParts.f, p);
      }

      if (bk.wm) {
        part = div("_ wm");
        write(bk.wm, pag, DTParts.b, p);
      }
      //[div, bd] = pag(ctx, bk, w, h, currentPag = index);
    }
  });
  if (ctx.wait)
    for (let w of ctx.wait) w();
  clear(bk);
  return container;
}
function clear({ hd, bd, ft }: Book) {
  hd?.$?.clear();
  (bd as iBoxes).$.clear();
  ft?.$?.clear();
}
export function dblSheets(container: S, w: int) {
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


type Sz = [w: int, h: int]
export const medias = {
  A4: <Sz>[210, 297],
  A5: <Sz>[148, 210],
  A3: <Sz>[297, 420],
}
export type PageSize = keyof (typeof medias);
export async function print(container: S, size: str, cb: () => Task<void>) {
  let
    pags = container.childs().css({ display: "block" }, true).uncss(["padding"]),
    style = g('style', null, `body{background:#fff!important}body>*{display:none!important}@page{size:${size};margin:${space(theme.padding)}}`);

  g(document.body).add(pags);
  style.addTo(document.head);
  await cb();
  style.remove();
  container.add(pags.css({ padding: space(theme.padding) }).uncss(["display"]));
}

interface WaterMark {
  dt/*: m.Child*/;
}

export type MediaType = (child: iBoxes, pag: int) => any;

/* ************************************************************** */
/* *****************************COLLECTIONS********************** */
/* ************************************************************** */

export const boxes: Dic<{ new(i, p: BoxParent<any>, id: int): Box<any, any>; }> = {
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
export const theme: Theme = {
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
      // mg: [4 * units.pt, 2 * units.pt],
      rd: 5
    },
    filled: {
      pd: [3 * units.pt, 2 * units.pt],
      // mg: [2 * units.pt, 1 * units.pt],
      rd: 1,
      tx: 'white',
      bg: {
        tp: 'color',
        dt: "#444"
      }
    },
    blank: {
      pd: [7 * units.pt, 5 * units.pt],
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