import type { Styles } from "galho";

export const bookCss = (): Styles => ({
  // "._.sheet": {
  //   overflow: "hidden",
  //   position: "relative",
  //   breakInside: "avoid",
  //   cursor: "text",
  //   whiteSpace: "pre-wrap",
  //   background: "#fff",
  //   color: "#000",
  //   userSelect: "text",
  //   ":not(:first-child)": { breakBefore: "page" },
  // },
  // "._.wm": {
  //   userSelect: "none",
  //   position: "absolute",
  //   fontSize: "120pt",
  //   margin: "auto",
  //   transform: "translate(-50%, -50%)rotate(-45deg)",
  //   top: "50%",
  //   left: "50%",
  //   whiteSpace: "nowrap",
  //   opacity: 0.3,
  //   "&.v": { transform: "translate(-50%, -50%)rotate(-65deg)" },
  //   "&.h": { transform: "translate(-50%, -50%)rotate(-30deg)" },
  // },
  "@media screen": {
    "._.sheet": {
      margin: "0 auto",
      boxShadow: "0 0.5mm 2mm #585858",
      marginBottom: "6px",
    }
  },
  // "@media print": {
  //   ":not(._.sheet)": {
  //     display: "none"
  //   },
  // }
});