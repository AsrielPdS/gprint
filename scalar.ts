import type { int, str } from "galho/util.js";

/**
 * List of unit rules for formatting numbers in Portuguese text.
 */
export const inFull: InFullUnit[] = [
  { v: 0, exp: () => 'zero' },

  { v: 1, exp: (_, o) => o.g == 'f' ? 'uma' : 'um' },
  { v: 2, exp: (_, o) => o.g == 'f' ? 'duas' : 'dois' },
  { v: 3, exp: () => 'três' },
  { v: 4, exp: () => 'quatro' },
  { v: 5, exp: () => 'cinco' },
  { v: 6, exp: () => 'seis' },
  { v: 7, exp: () => 'sete' },
  { v: 8, exp: () => 'oito' },
  { v: 9, exp: () => 'nove' },

  { v: 10, exp: () => 'dez' },
  { v: 11, exp: () => 'onze' },
  { v: 12, exp: () => 'doze' },
  { v: 13, exp: () => 'treze' },
  { v: 14, exp: () => 'quatorze' },
  { v: 15, exp: () => 'quinze' },
  { v: 16, exp: () => 'dezasseis' },
  { v: 17, exp: () => 'dezassete' },
  { v: 18, exp: () => 'dezoito' },
  { v: 19, exp: () => 'dezanove' },
  {
    v: 20, exp(n, o, i) {
      let r: string;
      switch (Math.floor(n / 10)) {
        case 2: r = 'vinte'; break;
        case 3: r = 'trinta'; break;
        case 4: r = 'quarenta'; break;
        case 5: r = 'cinquenta'; break;
        case 6: r = 'sessenta'; break;
        case 7: r = 'setenta'; break;
        case 8: r = 'oitenta'; break;
        case 9: r = 'noventa'; break;
      }
      let t = n % 10;
      if (t)
        r += ' e ' + o.c(t, o, i - 1);
      return r;
    }
  },

  { v: 100, exp: (n, o, i) => n == 100 ? 'cem' : 'cento e ' + o.c(n - 100, o, i - 1) },
  {
    v: 200, exp(n, o, i) {
      let r: string;
      switch (Math.floor(n / 100)) {
        case 2: r = 'duzentos'; break;
        case 3: r = 'trezentos'; break;
        case 4: r = 'quatrocentos'; break;
        case 5: r = 'quinhentos'; break;
        case 6: r = 'seiscento'; break;
        case 7: r = 'setecentos'; break;
        case 8: r = 'oitocentos'; break;
        case 9: r = 'novecentos'; break;
      }
      let t = n % 100;
      if (t)
        r += ' e ' + o.c(t, o, i - 1);
      return r;
    }
  },
  {
    v: 1_000, exp: (n, o, i) => {
      let
        t1 = Math.floor(n / 1_000),
        r = t1 == 1 ? 'mil' : o.c(t1, o, i - 1) + ' mil',
        t2 = n % 1_000;
      if (t2)
        r += ', ' + o.c(t2, o, i - 1);
      return r;
    }
  },
  {
    v: 1_000_000, exp: (n, o, i) => {
      let
        t1 = Math.floor(n / 1_000_000),
        r = t1 == 1 ? 'um milhão' : o.c(t1, o, i - 1) + ' milhões',
        t2 = n % 1_000_000;
      if (t2)
        r += ', ' + o.c(t2, o, i - 1);
      return r;
    }
  },
  {
    v: 1_000_000_000_000, exp: (n, o, i) => {
      let
        t1 = Math.floor(n / 1_000_000_000_000),
        r = t1 == 1 ? 'um bilhão' : o.c(t1, o, i - 1) + ' bilhões',
        t2 = n % 1_000_000_000_000;
      if (t2)
        r += ', ' + o.c(t2, o, i - 1);
      return r;
    }
  },
];

/**
 * Formats a given number into its word representation in Portuguese.
 * 
 * @param value - The number to convert to words.
 * @param opts - Configurations for gender, units, and decimal units representation.
 * @returns The number formatted in full uppercase Portuguese words.
 */
export function numbInFull (value: number, opts: Partial<InFullOptions>) {

  let
    vals = inFull,
    int = Math.floor(value),
    dec = Math.round(value % 1 * 100);

  if (int == 0)
    return vals[0].exp();
  if (!opts)
    opts = {};
  if (!opts.g)
    opts.g = 'm';
  opts.c = (v, opts: InFullOptions, i = vals.length - 1) => {
    for (; i > 0; i--) {
      let t = vals[i];
      if (t.v <= v)
        return t.exp(v, opts, i);
    }
  }
  let t = opts.c(int, <InFullOptions>opts);
  if (opts.p) {
    t += ' ' + (int == 1 && opts.s || opts.p);
    if (dec)
      if (opts.dp) {
        t += ` e ${opts.c(dec, <InFullOptions>opts)} ${(dec == 1 && opts.ds || opts.dp)}`;

      } else {
        throw "not implemented";
      }
  }

  return t.toUpperCase();
}

/**
 * Transforms an integer value into a specific alphanumeric sequence format.
 * 
 * @param value - The integer value to transform.
 * @param format - The target layout format option ('i', 'I', 'a', 'A').
 */
export function transform(value: int, format: "i" | "I" | "a" | "A") {

}

/**
 * Options configuration for number to word formatting representation.
 */
export interface InFullOptions {
  /** Gender: feminine ('f') or masculine ('m') */
  g: 'f' | 'm',
  /** Next value indicator */
  n?: str
  
  /** Callback to evaluate next level units */
  c(value: number, opts: InFullOptions, i?: number): str;
  /** Single unit representation string */
  s?: str;
  /** Plural unit representation string */
  p?: str;
  /** Decimal single unit representation string */
  ds?: str;
  /** Decimal plural unit representation string */
  dp?: str;
}

/**
 * Represents a single numeric value scale/range mapping and its expression rules.
 */
export interface InFullUnit {
  /** The value marker for the unit scale range */
  v: number,
  /** Expression function resolver */
  exp(value?: number, opts?: InFullOptions, i?: number): str;
}