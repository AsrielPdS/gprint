import { Component, G, div } from "galho";
import { anim } from "../galhui/util.js";
import { moveondoc, topLayer } from "galhui";
import { float } from "galho/util.js";

// interface iImgResizer{
// }
// export class ImgResizer extends Component<iImgResizer>{
//   view(){
//   }
// }
export function imgResizer(target: G<HTMLImageElement>, min: float, callback: () => void) {
  let tool: G, rm = () => { tool.remove(); tool = null; };
  target.on({
    mouseenter() {
      if (!tool) {
        let tl = topLayer();
        tl.add(tool = div().on({
          mouseleave(e) {
            if (e.relatedTarget != target.e)
              rm();
          },
          mousedown() {
            moveondoc("col-resize", (e) => {
              let rect = target.rect;
              console.log(Math.max(min, e.clientX - rect.x) + "px")
              target.css({
                width: Math.max(min, e.clientX - rect.x) + "px",
                // height: ""
              })
            })
          }
        }).css({
          borderRight: "dashed 6px #0006",
          cursor: "col-resize", zIndex: 100,
          position: "fixed", width: "8px",
        }));
        anim(() => {
          if (tl.contains(target) && tool?.parent) {
            let r = target.rect;
            tool.css({
              height: r.height + "px",
              left: `${r.right - 8}px`,
              top: `${r.top}px`
            })
          } else {
            tool&&rm();
            return false;
          }

        });
      }
    },
    mouseleave(e) {
      if (e.relatedTarget != tool.e) rm()
    }
  })
}