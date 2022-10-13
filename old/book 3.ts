import { div, empty, g, S } from "galho";
import { Properties, Styles } from "galho/css";
import { extend, bool, Dic, float, int, isA, isN, isS, Key, str, Task, unk, assign, def, l, isU, arr, Obj } from "galho/util.js";

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

type BorderType = "none" | "hidden" | "dotted" | "dashed" | "solid" | "double" | "groove" | "ridge" | "inset" | "outset";

interface Border {
  style?: BorderType;
  width?: int;
  color?: str;
}


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
type CPU = (expression: Expression, dt: Obj, pag?: int) => any;
type CPUExp = (this: { p: int, dt: Obj }, ...args: any[]) => any;
/** central processor unit */
export function cpu(ctx: Context): CPU {
  let
    funcs = <Dic<CPUExp>>{
      index() { return this.dt?.[$i] },
      set(key, value) { return this.dt[key] = value },
      //set and get data to temporary storage
      temp: (k, v?) => (ctx.temp ||= {})[k] = def(v, ctx.temp[k]),

      delay: (data: () => any) => {
        let r = g('span').html(empty);
        (ctx.wait ||= []).push(() => r.replace(data()));
        return r;
      },
      pags() { return ctx.pagCount; },
      pag() { return this.p; },
      //exchange(currency: str) {
      //  if (!currency)
      //    currency = (<any>this.s.ctx)._fOpts.currency;
      //  return scalar.currencies().byKey(currency, 'code').value;
      //},
      //currency() {
      //  return (<any>scp.ctx)._fOpts.currency;
      //}
    };

  return (v: Expression, dt: Obj, p?: int) => $.calc(v, {
    funcs: (name, args) => name in funcs ? def(funcs[name].call({ p, s: dt }, ...args), null) : void 0,
    vars(key, obj) {
      if (key == "@") return dt;
      let dt1 = dt;
      do { if (key in dt1) return dt1[key]; } while (dt1 = dt1[$p]);

      // @if DEBUG
      console.warn('not_found', { key: key, ctx: dt });
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
type NoType<T, U = { tp: str }> = Pick<T, Exclude<keyof T, keyof U>>;
export interface iText extends iSpan<SpanStyle> {
  tp?: "t";
}
/**expression span*/
interface iExp extends iSpan<SpanStyle> {
  tp: "e";
  /**input type */
  it?: str;
  /**format */
  fmt?: str;
}
interface iImgSpan extends iSpan<ImgStyle> {
  tp: "img";
  width?: float;
  height?: float;
  base?: 'width' | 'height';
  calc?: bool
}
interface Span<T = iSpan> {
  view(i: T, p: iP, ctx: Context): S;
  len?(i: T): int;
  json(i: T): void;

  //edit
  isEmpty?(i: T): bool;
  bold?(i: T): bool;
  italic?(i: T): bool;
  underline?(i: T): bool;
}
const spans: Dic<Span<any>> = {
  t: <Span<iText>>{
    len(i) { return i.dt.length; },
    bold(i): bool {
      return i.is?.b || false;
    },
    view({ is, dt }) {
      let t = g('span');
      is && t.css(styleText(is, {}));
      return t.html(dt);
    },
    // break(i, pag) {
    //   let part = g('span', null, i.dt);// = i[$part]?.[pag] 
    //   part.css(i.css);
    //   i.parts[pag] = part;
    //   return part;
    // },
    isEmpty(i) { return !i.dt; },
    json(i) { i.is = fall(i.is); },
  },
  e: <Span<iExp>>{
    view({ fmt, dt, is }, p, ctx) {
      let
        v: any = ctx.calc(dt, p);

      fmt && (v = ctx.fmt(v, fmt));
      if (v == null) return null;
      let t = g('code', 0, v);
      is && t.css(styleText(is, {}));
      return t;
    },
    // break(pag: int) {
    //   return i.parts[pag] = g('exp' as any).css(i.css);
    // },
    json(i) { i.is = fall(i.is); },
    isEmpty() { return false; },
  },
  img: <Span<iImgSpan>>{
    view({ width: w, height: h, dt, base, calc, is }, p, ctx) {
      let css = styleImg(is);
      if (base) {
        css[base] = '100%'
      } else {
        css.width = (w || 64) + 'px';
        css.height = (h || 64) + 'px';
      }
      if (calc) {
        let t = ctx.calc(dt, p);
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
        src: ctx.img(dt)
      }).css(css);
    },
    isEmpty() { return false; },
    json(i) { i.is = fall(i.is); },
  }
};
export type iSpans = iText | iExp | iImgSpan;

type BoxFilter = (v: iBox) => any;
//#endregion
/** ************************************************************* */
/** *************************** BOX ***************************** */
/** ************************************************************* */
//#region box
interface Context {
  dt?: unknown;
  temp?: Dic<unknown>;
  fmt?(value: unknown, exp: str, opts?: Dic): str;
  calc?(value: Expression, e: iBox): unknown;
  img?(path: str): str;
  rsc?(src: str): Task<unknown>
  wait?: (() => any)[];
  /**current pag */
  pag: int;
  pagCount?: int;
  cache?: Map<iBox, unk>;
}
// export interface Scope<L = unk> {
//   readonly p?: BoxParent<L>;
//   id?: int;
//   dt?: unknown;
//   readonly ctx: Context;
//   /**@deprecated */
//   ranges?: { [index: int]: Object[]; };
// }
type OFR = OFTp.in | OFTp.jump | float;
export interface BoxParent</**child layout*/CL = unk> {
  fitIn(child: iBox<CL>, css: Properties, p?: iParentBase): Properties;
  append(child: iBox<CL>, p?: iParentBase): void;
  overflow?(child: iBox<CL>, p?: iParentBase): OFR;
}
export interface iBox<L = unknown> {
  /**inline style: Estilo interno */
  is?: unknown;
  /**style: nome do estilo no theme que este item usara */
  s?: str;

  tp?: str;
  /**layout : informação que este elemento passa para o seu parent para ele definir no css */
  ly?: L;

  /**Closure: o escopo é usado pela formula para saber o objecto base de onde tirar as variaveis */
  sc?: str | int;
  /**validator: if this return false element is not renderized */
  vl?: str;
  /**unbreakeble se false caso não sobre espaço para por toda linha põe o que chegar na proxima pagina
   * por defualt é false*/
  ub?: bool;

  //------intern
  e?: S;
  [$i]: int;
  [$p]: iParentBase;
  /**controller */
  // $: Parte<any>
}
interface iParentBase<L = unknown> extends iBox<L> {
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
  //----------intern(not serializeble)
  // $: ParentParte<any, any>
}
interface iParent<L = unknown, CL = unknown> extends iParentBase<L> {
  hd?: iBoxes<CL> | str;
  bd?: (iBoxes<CL> | str)[];
  ft?: iBoxes<CL> | str;
  empty?: iBoxes<CL> | str;
}
interface Parte<T extends iBox = iBox> {
  json(i: T): void;
  transport(i: T): void;
  view(i: T, ctx: Context, pCtx: BoxParent, p?: iParentBase): void;
  render(i: T, ctx: Context, pCtx: BoxParent, p?: iParentBase): void;
  css(i: T): Properties;
  isEmpty(i?: T): bool;
  toJSON(): void;
  //------edit
  update?(): void;
}
interface ParentParte<T extends iParentBase = iParentBase, CL = any> extends Parte<T>, BoxParent<CL> {
}
type AnyBox<T = any> = str | iBox<T> | (str | iBox<BlockLy>)[];
      type MapContext = ArrayLike<any> & { pags: NDic<any[]> };
const
  /**index symbol */
  $i = Symbol(),
  /**parent symbol */
  $p = Symbol(),
  boxData = (me: iBox, ctx: Context) => {
    let t = (ctx.cache ||= new Map<iBox, unk>()).get(me);
    if (isU(t)) {
      let
        p = me[$p],
        pDt = p ? boxData(p, ctx) : ctx.dt;
      if (me.sc != null) {
        let exp = me.sc + "";
        if (exp[0] == '=') {
          pDt = ctx.calc(exp.slice(1), p) || {};
        } else {
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
  },
  n = <T extends Parte>(e: T, p = box) => assign({}, p, e),
  parse = <T>(v: AnyBox<T>): iBox<T> => isS(v) ? { bd: v } as iP<T> : isA(v) ? { tp: "block", bd: v } as iBlock<T> : v,
  view = (i: AnyBox, ctx: Context, pctx: BoxParent, p?: iParentBase) =>
    (!(i = parse(i)).vl || ctx.calc(i.vl, i)) && boxes[i.tp].render(i, ctx, pctx, i[$p] = p),
  box = <Parte>{
    json(i) {
      i.ly = fall(i.ly);
      i.is = fall(i.is);
    },
    view(i, ctx, pctx, p) {
      this.render(i, ctx, pctx, p);
      // : (
      //   i.e = emptyDiv(pctx.fitIn(i, this.css(i), p)),
      //   pctx.append(i, p),
      //   pctx.overflow(i, p) && pctx.append(i, p))
    },
    toJSON() { },
    isEmpty: () => false,
  },
  parent = n<ParentParte<iParent, any>>({
    render(i, ctx, pctx, p) {
      return {
        css: (v) => {
          let
            box = theme.box[i.s],
            txtStyle = theme.p[i.is?.tx || (box && box.tx)];
          styleBox(assign(v, box, i.is));

          if (txtStyle)
            styleText(txtStyle, v);
        },
        new() {
          i.e = div("_");
          i.hd && view(i.hd, ctx, this, i);
          i.ft && view(i.ft, ctx, this, i);
        },
        draw(check){
          if (i.map) {
            let
              dt = boxData(i, ctx) as MapContext,
              range: Object[] = [],
              bd = parse(i.bd[0]), pag = ctx.pag;
            dt.pags = { [pag]: range };
    
            if (l(dt))
              for (let j = 0; j < l(dt); j++) {
                let item = dt[j];
                item && (item[$i] = j);
                range.push(item);
    
                //temp.id = j;
                bd.sc = j;
                view(bd, ctx, this, i);
                if (ctx.pag != pag) {
                  range.pop();
                  dt.pags[pag = ctx.pag] = range = [item];
                }
                //for (let j = 0; j < l; j++) 
                //i++;
              }
            else i.empty && view(i.empty, ctx, this, i);
    
          } else for (let j of i.bd)
            view(j, ctx, this, i);
        }
      }

    },
    append: (child, { hd, e }) => child[$i] >= 0 && hd ? e.place(1, child.e) : e.add(child.e),
    part(i: iParent, ctx: Context, pctx: BoxParent, p: iParent) {

    },
    overflow(child, p) {
      if (child[$i] >= 0) {

        let result = this.p.overflow(this, pag);

        if (result && this.bb == BB.transport) {
          this.transport(pag, pag + 1);
          this.p.append(this, pag + 1);
          return OFTp.jump;
        }
        return result;
      } return OFTp.in;
    },
    transport(from: int, to: int) {
      let { hd, bd, ft } = this;
      super.transport(from, to);

      hd?.transport(from, to);
      ft?.transport(from, to);

      for (let i of bd)
        i.transport(from, to);
    },
    getTextTheme() { return txtTheme(this.is, this.s, this.p); },
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
    },
    isEmpty() {
      let { hd, bd, ft } = this;
      for (let child of bd)
        if (!child.isEmpty())
          return false;

      return hd?.isEmpty() && ft?.isEmpty();
    },
    json<TP extends str>(tp: TP): iParentBase<L> {
      let { hd, bd, ft, map } = this;
      return extend(this.json(tp) as iParent<L>, {
        hd: hd?.toJSON(),
        bd: bd.map(child => child.toJSON()),
        ft: ft?.toJSON(), map: !!map
      });
    },
  });

/**iParagraph */
export interface iP<L = unknown> extends iBox<L> {
  tp?: "p",
  is?: PStyle;
  /**list index */
  li?: int;
  /**body */
  bd?: (iSpans | str)[] | str;
}
interface PParte extends Parte<iP> {

}
export const boxes: Dic<Parte> = {
  p: n<PParte>({
    render(i, p, ctx) {
      return {
        css(v: Properties) {
          let props = assign({}, is), th = theme.p[s];
          if (th) {
            styleText(th, v);
            assign(props, th);
          }
          styleParagraph(props, v)
        },
      };
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
    },
    part(index: int) {
      let t = this.parts[index];
      if (!t) {
        t = this.parts[index] = this.addBox(g("p", "_"), index).css(this.css);
        this.p.append(this, index)
      }
      return t;
    },
    newSpan(span: iSpans | str) {
      isS(span) && (span = { dt: span });
      let t = Reflect.construct(spans[span.tp || "t"], [span, this]) as Spans;
      t.is ||= {};
      return t;
    },
    writeCheck(i, div: S, pag: int) {
      let
        overflow: OFR;

      while (overflow = p.overflow(i, pag)) {

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
              newSpan = lastE.cloneNode(),
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

    },
    //---------edit
    isEmpty({ bd }) {
      // for (let span of arr(bd)) {
      //   if (!parse(span).isEmpty())
      //     return false;
      // }
      return true;
    },
  }),
  block: n<ParentParte<iBlock>>({
    css(v: Dic) {
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
    fitIn(_: iBox<BlockLy>, css: Dic) {
      //if (child.ly.li) {
      //  let i = 0, dt = this.dt;
      //  while (i < dt.length)
      //    if (dt[i] == child)
      //      break;
      //    else i++;

      //  (css[attrs] || (css[attrs] = {})).li = i + 1;
      //}

    },
  }, parent),
  col: n<ParentParte<iCol>>({
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
    },
  }, parent),
  row: n<ParentParte<iRow>>({
    //TODO: overflow costumizado para cortar todas as colunas de maneira correta
    append(child: Box<RLy>, index: int) {
      let part = this.parts[index];
      if (!part) {
        part = this.part(index);
        this.p.append(this, index);
      }

      part.add(child.part(index));
    },
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
    },
  }, parent),

  tb: n<ParentParte<iTb>>({
    fitIn() { },
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
    },
    css(i, v) {
      let { style, is } = this,
        txtStyle = theme.p[is.tx || style && style.tx];
      styleBox(style)
      if (txtStyle)
        styleText(txtStyle, v);
    },
  }, parent),
  tr: n<Parte<iTr>>({
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
    },
    render(pag: int) {
      let { hd, bd, ft } = this, r = div();
      this.body = hd || ft ? div().addTo(r) : r;
      hd?.view(pag);
      for (let i = 0; i < bd.length; i++)
        pag = bd[i].view(pag);
      ft?.view(pag);

      return r;
    },
    append(child: Box<TrLy>, pag: int) {
      (child.id >= 0 ? this.body : this.e).add(child.part(pag));
    },
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
    },
    getTextTheme() { return txtTheme(this.is, this.s, this.p); },
    transport(from?: int, to?: int) {
      let { hd, bd, ft } = this;
      super.transport();

      hd?.transport(from, to);
      ft?.transport(from, to);

      for (let i of bd)
        i.transport(from, to);
    },
  }),

  img: n<Parte<iImg>>({
    css(v: Dic) {
      styleImg(this.is, v);
    },
    render() {
      return g('img', { src: this.ctx.img(this.bd) });
    },
  }),
  np: n<Parte<INP>>({
    css() { },
    view(pag: int) {
      this.valid(pag) && pag++;
      this.e = div();
      this.p.append(this, this.start = pag);
      return this.start;
    }
  }),
  hr: n<Parte<iHr>>({
    _css(v: Dic) {
      v[this.o == "v" ?
        'border-left' :
        'border-bottom'
      ] = border(assign({}, theme.hr[this.s], this.is));
    },
    render() { return g("hr"); },
  }),
  ph: n<Parte<iPH>>({
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
  }),
  graphic: n<Parte<iGraphic>>({
    css() { }
    render(pag) {
      return div();
      //this.addBox(m(new gr.SvgViewer({ })), index);
    }
  }),
};
export class P<L = unknown> extends MBox<L> implements NoType<iP, { tp, bd }> {
  bd: iSpan[];
  declare is: PStyle;
  li: int;

}
interface BlockList extends SpanStyle {
  /**@deprecated */
  indent?: int;
  /**format */
  fmt?: str;
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


  private _lCss: Dic;
  private _lItems: Array<{ s: S, p: P }>;
  l?: BlockList;

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
export interface iTr<L = void> extends iBox<L> {
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
  body: S;

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

function getCellStart(index: int, dt: iBox<TrLy>[]) {
  let start = index;
  for (let i = 0; i < index; i++)
    if (dt[i].ly.span)
      start += dt[i].ly.span - 1;
  return start;
}

/* ***************************GRAPHIC**************************** */
interface GraphicStyle {

}
interface iGraphic<L = unknown> extends iBox<L> {
  tp: "graphic";
  is?: GraphicStyle;
}
/* **************************PLACE HOLDER************************ */
export interface iPH<T = unknown> extends iBox<T> {
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
  data: iBox;

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
export interface iHr<L = unknown> extends iBox<L> {
  tp: "hr";
  is?: HrStyle,
  o?: Ori;
}

/**new pag */
interface INP<L = unknown> extends iBox<L> { tp: "np"; }

export interface iImg<T = unknown> extends iBox<T> {
  tp: "img";
  is?: ImgStyle;
  bd: str;
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
  iGraphic<L> |
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