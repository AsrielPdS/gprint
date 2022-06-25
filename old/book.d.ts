import { S } from "galho";
import { Properties } from "galho/css";
declare type Key = string | number;
interface Dic<T = any> {
  [key: string]: T;
}
declare type Task<T> = T | Promise<T>;
export declare const enum C {
  empty = "empty",
  body = "body",
  watermark = "wm",
  input = "in",
  bookMedia = "book-media",
  box = "box",
  sheet = "sheet",
  book = "bookeditor",
  row = "book-row",
  col = "book-col",
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
export declare type BT = "p" | "row" | "col" | "tr" | "th" | "block" | "ph" | "hr" | "table" | "tg" | "img" | "symbol" | "grid" | "custom" | "graphic" | "new";
/**book span type */
export declare type ST = "t" | "s" | "img";
declare type Expression = string;
export interface Context {
  dt?: unknown;
  temp?: Dic<unknown>;
  fmt?(value: unknown, exp: string): string;
  calc?(value: Expression, ctx: Scope, index?: number): unknown;
  img?(path: string, args?: Dic): string;
  symb?(src: string): Boxes;
  parts?: S[];
  wait?: Promise<any>[];
}
interface Scope {
  readonly p?: BoxParent<any>;
  id?: number;
  dt?: unknown;
  readonly ctx: Context;
  /**@deprecated */
  ranges?: {
    [index: number]: Object[];
  };
}
export interface BoxParent<C extends IBox = Boxes<any>> extends Scope {
  fitIn(box: C, css: Properties): object;
  append(child: C, index: number): void;
  remove?(child: C, index: number): void;
  overflow(child: C, index: number): OFTp;
  /** checa se o contiudo na pagina actual é so um pouco e pode ser totalmente transferivel para proxima pagina */
  justALittle?(child: C, index: number): boolean;
  insertAfter?(child: C, newE: IBox): any;
  posWrite?(index?: number): any;
  getTextTheme(): string;
  listItem?(p: IPBox): S;
  removeLI?(p: IPBox): void;
}
export declare const empty = "&#8203;";
declare type BorderType = "none" | "hidden" | "dotted" | "dashed" | "solid" | "double" | "groove" | "ridge" | "inset" | "outset";
interface Border {
  style?: BorderType;
  width?: number;
  color?: string;
}
interface NDic<T> {
  [n: number]: T;
  start?: number;
  end?: number;
}
export declare const enum DTParts {
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
  w = -5
}
export declare enum units {
  cm = 37.79527559055118,
  mm = 3.7795275590551176,
  in = 96,
  pt = 1.3333333333333333,
  px = 1
}
declare type Borders = [Border, Border, Border, Border] | Border;
declare type BoxSpace = [number, number?, number?, number?];
declare type TextVAlign = "baseline" | "sub" | "super";
declare type Margin = [number | null, number | null, number | null, number | null];
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
  blur: number;
  brightness: number;
  contrast: number;
  grayscale: number;
  'hue-rotate': number;
  invert: number;
  opacity: number;
  saturate: number;
  sepia: number;
}
interface ImgStyle {
  radius?: number;
  shadow?: Shadow[];
  border?: Border | [Border, Border, Border, Border];
  efect?: Efect;
  clip?: [number, number, number, number];
  h?: number;
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
  al?: any;
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
  indent?: number;
  /**line height */
  lh?: number;
  /**align */
  al?: TAlign;
  noWrap?: boolean;
  overflow?: 'ellipsis' | 'clip';
}
export declare type TAlign = "center" | "justify" | "left" | "right" | "start" | "end";
export declare type TextStyle = PStyle & SpanStyle;
interface CalcOpts {
  funcs(name: string, args: any[]): any;
  vars(name: string, obj?: boolean): any;
}
interface Settings {
  fmt?(value: unknown, exp: string, opts: Dic): string;
  scalar?(value: number, fmt: string): any;
  calc?(v: Expression, opts: CalcOpts): any;
}
export declare const $: Settings;
declare type CPU = (expression: Expression, scp: Scope, pag?: number) => any;
/** central processor unit */
export declare function cpu(): CPU;
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
  p?: Dic<TextStyle & {
    title?: string;
  }>;
  box?: Dic<BoxStyle & {
    title?: string;
  }>;
  title?: string;
  info?: string;
  hr?: Dic<HrStyle>;
  /**table style, include text in table */
  tables?: Dic<TableStyle>;
}
export declare function createBox<T>(box: IBox<T>, id: number, parent: BoxParent): Box<unknown, Boxes<unknown>, BoxParent<any>>;
export declare function write<T>(box: IBox<T>, pag: number, id: number, parent: BoxParent<any>): number;
interface SideLayout {
}
/** overflow type */
declare const enum OFTp {
  in = 0,
  out = 1,
  jump = 2
}
declare const enum BoxMode {
  editing = 0,
  preview = 1
}
/** ************************************************************* */
/** ****************************SPAN***************************** */
/** ************************************************************* */
export interface ISpanBase<S = any> {
  tp?: ST;
  /**@deprecated */
  s?: any;
  /**data */
  dt: string;
  $?: SpanBase;
  /**style */
  is?: S;
}
interface SpanBase<T extends ISpanBase = ISpanBase> {
  p: PBox;
  /**cria um novo box para esta clause */
  break(index: number): S;
  view(index: number): S;
  parts: NDic<S>;
  readonly length: number;
}
export interface ISpan extends ISpanBase<SpanStyle> {
  tp?: "t";
  $?: Span;
}
export declare class Span implements SpanBase<ISpan> {
  model: ISpan;
  p: PBox;
  constructor(model: ISpan, p: PBox);
  parts: NDic<S>;
  get css(): Dic<Key>;
  view(index: number): S<HTMLSpanElement>;
  break(index: number): S<HTMLSpanElement>;
  get bold(): boolean;
  get length(): number;
  static readonly break: true;
  static isEmpty(model: ISpan): boolean;
  toJSON(): void;
}
interface IScalar extends ISpanBase<SpanStyle> {
  tp: "s";
  $?: Scalar;
  /**input type */
  it?: string;
  /**format */
  fmt?: string;
}
declare class Scalar implements SpanBase<IScalar> {
  model: IScalar;
  p: PBox;
  constructor(model: IScalar, p: PBox);
  get length(): number;
  parts: NDic<S>;
  get css(): Dic<Key>;
  view(index: number): S<any>;
  break(index: number): S<any>;
  edit: any;
  static readonly break: true;
  static isEmpty(model: IScalar): boolean;
  toJSON(): void;
}
interface IImg extends ISpanBase<ImgStyle> {
  tp: "img";
  $?: Img;
  width?: number;
  height?: number;
  base?: 'width' | 'height';
  pars: Dic<string>;
  calc?: boolean;
}
declare class Img implements SpanBase<IImg> {
  model: IImg;
  p: PBox;
  parts: NDic<S>;
  constructor(model: IImg, p: PBox);
  view(index: number): S<HTMLElement>;
  break(): S;
  static isEmpty(model: IScalar): boolean;
  get length(): number;
  static readonly break: false;
  toJSON(): void;
}
export declare type Spans = ISpan | IScalar | IImg;
export interface IPBox<L = unknown> extends IBox<L> {
  tp: "p";
  $?: PBox<L>;
  is?: PStyle;
  /**list index */
  li?: number;
  /**data */
  dt?: Spans[];
}
/** ************************************************************* */
/** *************************** BOX ***************************** */
/** ************************************************************* */
export interface IBox<L = unknown> {
  $?: Box<L, any, any>;
  /**@deprecated */
  box?: any;
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
  /**validator: if this return false element is not renderized */
  vl?: string;
  /**validação por pagina deve ser processado no mesmo momento que
   o footer e o header*/
  pag?: Expression;
}
declare abstract class Box<L = unknown, T extends IBox<L> = Boxes<L>, P extends BoxParent<T> = BoxParent<any>> implements Scope {
  model: T;
  id: number;
  _css: Dic;
  private _ly;
  /**@deprecated provavelmento so é util para o edit */
  start: number;
  /**@deprecated provavelmento so é util para o edit */
  end: number;
  parts: NDic<S>;
  private _cd;
  get dt(): unknown;
  ctx: Context;
  readonly p: P;
  get layout(): object;
  constructor(model: T, parent: P, id: number);
  abstract get css(): object;
  find?(filter: (v: IBox) => any): IBox[];
  abstract part(index: number): S;
  abstract write(index: number): void;
  valid(pag: number): unknown;
  render(pag: number): void;
  addBox(s: S, index: number): S<HTMLElement>;
  /** @deprecated */
  reload(index: number): void;
  update(): void;
  clear(): void;
  checkPag(index: number): void;
  transport(from: number, to: number): void;
  static normalize(dt: IBox): IBox<unknown>;
  static symbs(dt: IBox, list: string[]): void;
  static clone(m: IBox): IBox<unknown>;
  static toMin(model: IBox): IBox<unknown>;
  static fromMin(model: any): IBox;
  static replace(_model: IParentBox, _key: string, _newValue: IBox): boolean;
  static isEmpty(model: IBox): boolean;
  private toJSON;
}
export declare class PBox<L = unknown> extends Box<L, IPBox<L>> {
  constructor(model: IPBox<L>, parent: BoxParent, id: number);
  get theme(): PStyle & SpanStyle & {
    title?: string;
  };
  get css(): Dic<any>;
  write(index: number): number;
  part(index: number): S<HTMLElement>;
  createSpan(span: Spans): void;
  writeCheck(p: S, index: number): number;
  static normalize(model: IPBox): IPBox<unknown>;
  static normalizeSpan(span: Spans): Spans;
  static isEmpty(model: IPBox): boolean;
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
}
declare abstract class ParentBox<L = unknown, C extends IBox = Boxes, T extends IParentBox<L, C> = IParentBox<L, C>, P extends BoxParent<T> = BoxParent<T>> extends Box<L, T, P> implements BoxParent<C> {
  ranges: {
    [index: number]: Object[];
  };
  mode: BoxMode;
  get css(): Dic<any>;
  write(pag: number): number;
  append(child: C, index: number): void;
  part(pag: number): S<HTMLElement>;
  transport(from: number, to: number): void;
  overflow(child: C, index: number): OFTp;
  justALittle(child: C, index: number): boolean;
  break(child: C, index: number): boolean;
  getTextTheme(): string;
  private _lCss;
  private _lItems;
  listItem(p: IPBox): S<HTMLSpanElement>;
  abstract fitIn(box: C, css: object): object;
  static normalize(md: IParentBox<any, any>): IParentBox<any, any>;
  static symbs({ dt, hd, ft }: IParentBox<any, any>, list: string[]): void;
  protected abstract createPart(index: number): S;
  clear(): void;
  static isEmpty(model: IPBox): boolean;
}
export declare type ParentBoxT = ParentBox;
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
  tp: 'block';
  cols?: BlockColumn;
}
export declare class BlockBox<L = unknown> extends ParentBox<L, Boxes<BlockLy>, IBlockBox<L>> {
  get css(): Dic<any>;
  createPart(index: number): S<HTMLElement>;
  fitIn(_: IBox<BlockLy>, css: object): object;
}
export declare const enum CAlign {
  s = "s",
  e = "e",
  c = "c",
  j = "j",
  sb = "s-b",
  sa = "s-a",
  se = "s-e"
}
export interface CLy {
  /**size defined in percent */
  sz?: number;
  max?: number;
  min?: number;
  /**align */
  lgn?: CAlign;
  /**@deprecated */
  start?: any;
  /**@deprecated */
  span?: any;
  /**@deprecated */
  grow?: any;
}
export interface ICol<L = unknown> extends IParentBox<L, Boxes<CLy>> {
  tp: "col";
  /**padding */
  pad?: number[];
  reverse?: boolean;
  align?: CAlign;
}
export interface RLy {
  /**size defined in percent */
  sz?: number;
  grow?: number;
  fl?: never;
  hd?: never;
  ft?: never;
}
declare type RC = Boxes<RLy>;
export interface IRow<L = unknown> extends IParentBox<L, RC> {
  tp: "row";
  /**@deprecated */
  justifty?: any;
  /**padding */
  pad?: number[];
}
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
export declare type Ori = "h" | "v";
export declare type TBoxes = ITRowBox | ITHeadBox;
export interface ITableBox<L = unknown> extends IParentBox<L, TBoxes> {
  tp: "table";
  is?: TableStyle;
  ori?: Ori;
  spans?: Array<TableSpan>;
  /**Cells */
  cols?: TbCell[];
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
export interface ITRowBox extends IParentBox<TableLayout, Boxes<TrLy>> {
  tp: "tr" | "th";
  map?: never;
  th?: never;
  tf?: never;
}
export interface ITHeadBox extends ITRowBox {
  tp: "th";
  hd?: Boxes<TrLy>;
  ft?: Boxes<TrLy>;
  groups?: Array<ITGroupBox<TrLy>>;
}
interface ITGroupBox<L = unknown> extends IParentBox<L, Boxes<any>> {
  tp: "tg";
  map?: never;
  hd: Boxes<TrLy>;
  dt?: Boxes<TrLy>[];
  ft?: never;
  from: number;
  to: number;
}
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
  gap: BoxSpace;
  columns: any[];
  rows: any[];
}
interface ICustomBox<L = unknown> extends IBox<L> {
  tp: "custom";
  render(p: BoxParent): Promise<any>;
}
interface GraphicStyle {
}
interface IGraphicBox<L = unknown> extends IBox<L> {
  tp: "graphic";
  is?: GraphicStyle;
}
export interface ISymbolBox<T = any> extends IBox<T> {
  tp: "symbol";
  dt: string;
  dir?: string;
}
export interface IPHBox<T = unknown> extends IBox<T> {
  tp: "ph";
  val?: string;
}
interface HrStyle extends Border {
}
interface IHrBox<L = unknown> extends IBox<L> {
  tp: "hr";
  is?: HrStyle;
  o?: Ori;
}
interface INewBox<L = unknown> extends IBox<L> {
  tp: "new";
}
export interface IImgBox<T = unknown> extends IBox<T> {
  tp: "img";
  is?: ImgStyle;
  dt: string;
  pars?: Dic<string>;
}
export declare type PBoxes<L = BodyLy> = IBlockBox<L> | ICol<L> | IRow<L> | ITableBox<L>;
export declare type Boxes<L = any> = IPBox<L> | PBoxes<L> | ISymbolBox<L> | IHrBox<L> | INewBox<L> | IImgBox<L> | IPHBox<L> | IGridBox<L> | ICustomBox<L> | IGraphicBox<L>;
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
  tp?: any;
}
export declare function render(box: IBox | string): S<any>;
export declare const sheet: (bk: Book, w: number) => S<HTMLElement>;
export declare function sheets(ctx: Context, container: S, bk: Book, w: number, h: number): Promise<S<HTMLElement>>;
export declare function dblSheets(container: S, w: number): S<HTMLElement>;
declare type Sz = [w: number, h: number];
export declare const medias: {
  A4: Sz;
  A5: Sz;
  A3: Sz;
};
export declare type Media = keyof (typeof medias);
export declare function print(container: S, o: Ori, media: Media, cb: () => Task<void>): Promise<void>;
interface BodyLy {
  fill?: boolean;
}
export declare type MediaType = (child: Boxes, pag: number) => any;
export declare function normalize(dt: Book): Book;
export declare const boxes: Dic<{
  replace(model: IBox, key: string, newValue: IBox): boolean;
  normalize(model: IBox): IBox;
  clone(model: any): IBox;
  isEmpty(model: any): boolean;
  new(model: any, parent: BoxParent<any>, id: number): Box<any, any, any>;
  symbs(model: IBox, list: string[]): any;
}>;
export declare const theme: Theme;
export { };
