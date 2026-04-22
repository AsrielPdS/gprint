import { G, type Properties } from "galho";
import type { Dic, Key, Obj, Task, bool, float, int, str, unk } from "galho/util.js";
/**book item type */
export type BT = "p" | "row" | "col" | "tr" | "th" | "block" | "ph" | "hr" | "table" | "tg" | "img" | "symbol" | "grid" | "custom" | "graphic" | "new";
/**book span type */
export type ST = "t" | "e" | "img";
export interface Context {
    dt?: unk;
    temp?: Dic<unk>;
    calc?(value: str, s: Scope, pag?: int): unk;
    img?(path: str): str;
    pagCount?: int;
    wait?: (() => any)[];
    theme: Theme;
}
interface Scope {
    readonly p?: BoxParent<any>;
    id?: int;
    dt?: Obj;
    readonly ctx: Context;
}
export interface BoxParent<CL = unk> extends Scope {
    fitIn?(css: Properties, ly: CL, e: G, id: int): void;
    append(child: Box<CL>, pag: int): void;
    overflow(child: iBox<CL>, pag: int): OFTp;
    listItem?(p: iP): G;
    /**tag used for p element */
    childTag?: keyof HTMLElementTagNameMap;
}
type BorderType = "none" | "hidden" | "dotted" | "dashed" | "solid" | "double" | "groove" | "ridge" | "inset" | "outset";
interface BorderObj {
    style?: BorderType;
    width?: int;
    color?: str;
}
type Border = BorderObj | BorderType;
interface NDic<T> {
    [n: int]: T;
    start?: int;
    end?: int;
}
export declare const enum DTParts {
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
    w = -5
}
export declare const enum units {
    cm = 37.79527559055118,
    mm = 3.7795275590551176,
    in = 96,
    pt = 1.3333333333333333,
    px = 1
}
type Borders = [Border, Border, Border, Border] | Border;
type BoxSpace = [int, int?, int?, int?];
type TextVAlign = "baseline" | "sub" | "super";
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
    nowrap?: bool;
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
    blur: int;
    brightness: int;
    contrast: int;
    grayscale: int;
    'hue-rotate': int;
    invert: int;
    opacity: int;
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
    al?: any;
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
    indent?: int;
    /**line height */
    lh?: int;
    /**align */
    al?: Align;
}
export type TextStyle = PStyle & SpanStyle;
interface CalcOpts {
    fn(name: str, args: any[]): any;
    vars(name: str, obj?: boolean): any;
}
type CPU = (expression: str, scp: Scope, pag?: int) => any;
type ExpFn = (this: {
    p: int;
    s: Scope;
}, ...args: any[]) => any;
/** central processor unit */
export declare function cpu(fn: (exp: str, opts: CalcOpts) => any, extraFn?: Dic<ExpFn>): CPU;
export interface Theme {
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
    p?: Dic<TextStyle & {
        title?: str;
    }>;
    box?: Dic<BoxStyle & {
        title?: str;
    }>;
    title?: str;
    info?: str;
    hr?: Dic<HrStyle>;
    /**table style, include text in table */
    tables?: Dic<TableStyle>;
}
export declare const create: <T>(i: iBox<T>, p: BoxParent<any>, id?: int) => Box;
export declare function write<T>(box: iBoxes<T> | str, pag: int, id: int, parent: BoxParent<any>): int;
interface SideLayout {
}
/** overflow type */
declare const enum OFTp {
    in = 0,
    out = 1,
    jump = -1
}
/** ************************************************************* */
/** ****************************SPAN***************************** */
/** ************************************************************* */
export interface iSpan<S = any> {
    tp?: ST;
    /**style */
    is?: S;
}
export interface iText extends iSpan<SpanStyle> {
    tp?: "t";
    /**data */
    bd?: str;
}
interface iExp extends iSpan<SpanStyle> {
    tp: "e";
    /**input type */
    it?: str;
    /**data */
    bd?: str | SpanExp;
}
export type ImgSize = float | [w: float | "", h: float | ""] | 'w' | 'h';
export interface IImg {
    tp: "img";
    sz?: ImgSize;
    bd: str;
    calc?: bool;
}
type iImgSpan = iSpan<ImgStyle> & IImg;
type Span<T extends iSpan = iSpan> = (i: T, p: P, pag: int) => G;
export declare const spans: Dic<Span>;
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
declare abstract class Box<L = unk, T extends iBox<L> = iBox<L>> implements Scope {
    i: T;
    id: int;
    /**@deprecated provavelmento so é util para o edit */
    start: int;
    /**@deprecated provavelmento so é util para o edit */
    end: int;
    _d: Dic;
    get dt(): Dic<any>;
    ctx: Context;
    p: BoxParent;
    /**
     * @param i interface
     * @param p parent
     * @param id
     */
    constructor(i: T, p: BoxParent, id: int);
    css(e: G): void;
    find?(filter: (v: iBox) => any): iBox[];
    valid(pag: int): unknown;
    update(): void;
    jump?(size: float): bool;
    abstract transport(): void;
    abstract part(pag: int): G;
    abstract view(pag: int): int;
    clear(): void;
    clearData(): void;
    /**self style */
    abstract ss(v: Properties): void;
}
export type BoxT<L = unknown> = Box<L>;
interface iSBox<L = unknown> extends iBox<L> {
}
declare abstract class SBox<L = unk, T extends iSBox<L> = any> extends Box<L, T> {
    e: G;
    part(): G<HTMLElement>;
    transport(): void;
    view(pag: int): number;
    clearData(): void;
    protected data?(pag: int): G;
}
interface iMBox<L = unknown> extends iBox<L> {
    /**unbreakeble se false caso não sobre espaço para por toda linha põe o que chegar na proxima pagina
     * por defualt é false*/
    ub?: bool;
}
declare abstract class MBox<L = unk, T extends iMBox<L> = any> extends Box<L, T> {
    parts: NDic<G>;
    view(pag: int): number;
    addBox(s: G, pag: int): G<HTMLElement>;
    transport(): void;
    clearData(): void;
    part(pag: int): G<HTMLElement>;
    protected abstract data(pag: int): void;
}
type SpanExp = (ctx: any, p: P, pag: int) => str | G;
export type ASpan = (iSpans | str | SpanExp)[] | str | iSpans | SpanExp;
export declare const span: (v: ASpan) => iSpans[];
export interface iP<L = unk> extends iMBox<L> {
    tp?: "p";
    $?: P<L>;
    is?: PStyle;
    /**list index */
    li?: int;
    /**body */
    bd?: ASpan;
}
declare class P<L = unk> extends MBox<L, iP<L>> {
    jump(size: number): boolean;
    ss(css: Properties): void;
    data(pag: int): number;
    check(e: G, pag: int, bd?: iSpans[]): number;
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
declare abstract class Parent<L = unk, CL = unk, T extends iParentBase<L> = iParent<L, CL>> extends MBox<L, T> implements BoxParent<CL> {
    ss(v: Properties): void;
    data(pag: int): number;
    append(ch: Box<CL>, pag: int): void;
    part(pag: int): G<HTMLElement>;
    transport(): void;
    overflow(child: iBox<CL>, pag: int): OFTp;
    break(child: iBox<CL>, index: int): boolean;
    private _lCss;
    private _lItems;
    listItem(p: iP): G<HTMLSpanElement>;
    abstract fitIn(css: Properties, ly: CL, e: G, id: int): void;
    protected abstract createPart(index: int): G;
    clear(): void;
    clearData(): void;
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
    tp: "d";
    cols?: BlockColumn;
}
declare class Div<L = unk> extends Parent<L, DivLy, iDiv<L>> {
    ss(css: Properties): void;
    createPart(index: int): G<HTMLElement>;
    fitIn(css: Properties, ly: CLy): void;
}
export type BlockT = Div;
export type Align = "e" | "s" | "c" | "j" | "l" | "r" | "end" | "start" | "center" | "justify" | "left" | "right";
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
export interface CLy extends FlexLy {
}
export interface iCol<L = unk> extends iParent<L, CLy> {
    tp: "col";
    /**padding */
    /**bottom to top */
    btt?: boolean;
    align?: Align;
}
export interface RLy extends FlexLy {
}
export interface iRow<L = unk> extends iParent<L, RLy> {
    tp: "row";
}
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
    bd?: (iTr)[];
    ft?: iTr;
    empty?: iTr;
    /**columns */
    cols?: TbColInfo[];
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
export interface iTr<L = void> extends iSBox<L> {
    tp: "tr";
    bd?: iBoxes<TrLy>[];
    is?: BoxStyle;
}
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
    gap: BoxSpace;
    cols: any[];
    rows: any[];
}
interface GraphicStyle {
}
interface iGraphic<L = unk> extends iBox<L> {
    tp: "graphic";
    is?: GraphicStyle;
}
export interface iPH<T = any> extends iMBox<T> {
    tp: "ph";
    bd: str;
}
interface HrStyle extends BorderObj {
}
export interface iHr<L = unk> extends iBox<L> {
    tp: "hr";
    is?: HrStyle;
    o?: Ori;
}
interface iNP<L = unk> extends iBox<L> {
    tp: "np";
}
export type iImgBox<L = unk> = iBox<L> & IImg & {
    is?: ImgStyle;
    al?: "center";
    $?: ImgBox<L>;
};
declare class ImgBox<L = unk> extends SBox<L, iImgBox<L>> {
    e: G<HTMLImageElement>;
    ss(css: Properties): void;
    data(): G<HTMLImageElement>;
}
export type iPBoxes<L = any> = iDiv<L> | iCol<L> | iRow<L> | iTb<L>;
export type iBoxes<L = any> = iP<L> | iPBoxes<L> | iPH<L> | iHr<L> | iNP<L> | iImgBox<L> | iGrid<L> | iGraphic<L> | iTr<L>;
export interface Book {
    hd?: iBoxes<SideLayout>;
    bd: ABoxes;
    ft?: iBoxes<SideLayout>;
    /**padding */
    wm?: iP<WMLayout>;
}
/** */
export interface WMLayout {
    tp?: any;
}
export type sbInput<L = void> = str | ABoxes<L>;
export declare function render(bd: sbInput, ctx: Context): G<any> | null;
export declare function sheet(ctx: Context, container: (pag: int) => G, bk: Book, w: int): (pag: int) => G;
export declare function sheets(ctx: Context, container: (pag: int) => G, bk: Book, w: int, h: int): (pag: int) => G;
export declare function dblSheets(container: G, w: int): G<HTMLElement>;
export type Sz = [w: int, h: int];
export declare const medias: {
    A4: Sz;
    A5: Sz;
    A3: Sz;
};
export type PageSize = keyof (typeof medias);
export declare function print(container: G, size: str, cb: () => Task<void>): Promise<void>;
export type MediaType = (child: iBoxes, pag: int) => any;
export declare const boxes: Dic<{
    new (i: any, p: BoxParent<any>, id: int): Box<any, any>;
}>;
export declare function deepExtend<T, U>(dest: T, src: U): T & U;
export declare function deepExtend<T>(dest: Partial<T>, src: Partial<T>): T;
export declare const createTheme: (prot?: Partial<Theme>) => Theme;
export {};
