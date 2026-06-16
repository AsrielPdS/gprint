import { Component, G, div } from "galho";
import { anim } from "../galhui/util.js";
import { moveondoc, topLayer } from "galhui";
import { type float } from "galho/util.js";

/**
 * Enables image resizing capabilities on a target HTMLImageElement.
 * Creates overlay controls on hover and handles resize dragging.
 * 
 * @param target - The target image element wrapper to make resizable.
 * @param min - The minimum allowed width for the image in pixels.
 * @param callback - Callback triggered after resize operations (currently unused).
 */
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