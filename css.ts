import type { Styles } from "galho";

/**
 * Returns the default CSS styles for sheets in screen media.
 * @returns CSS styles structure for sheet components.
 */
export const bookCss = (): Styles => ({
  "@media screen": {
    "._.sheet": {
      margin: "2.3mm auto",
      boxShadow: "0 0.5mm 2mm #585858",
      overflow: "hidden",
      background: "#fff",
    }
  },
});