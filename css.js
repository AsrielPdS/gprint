"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookCss = void 0;
const bookCss = () => ({
    "._.sheet": {
        overflow: "hidden",
        position: "relative",
        breakInside: "avoid",
        cursor: "text",
        whiteSpace: "pre-wrap",
        background: "#fff",
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
        "._.sheet": {
            margin: "0 auto",
            boxShadow: "0 0.5mm 2mm #585858",
            marginBottom: "6px",
        }
    },
    "@media print": {}
});
exports.bookCss = bookCss;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3NzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVPLE1BQU0sT0FBTyxHQUFHLEdBQVcsRUFBRSxDQUFDLENBQUM7SUFDcEMsVUFBVSxFQUFFO1FBQ1YsUUFBUSxFQUFFLFFBQVE7UUFDbEIsUUFBUSxFQUFFLFVBQVU7UUFDcEIsV0FBVyxFQUFFLE9BQU87UUFDcEIsTUFBTSxFQUFFLE1BQU07UUFDZCxVQUFVLEVBQUUsVUFBVTtRQUN0QixVQUFVLEVBQUUsTUFBTTtRQUNsQixLQUFLLEVBQUUsTUFBTTtRQUNiLFVBQVUsRUFBRSxNQUFNO1FBQ2xCLG9CQUFvQixFQUFFLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRTtLQUM5QztJQUNELE9BQU8sRUFBRTtRQUNQLFVBQVUsRUFBRSxNQUFNO1FBQ2xCLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLE1BQU0sRUFBRSxNQUFNO1FBQ2QsU0FBUyxFQUFFLHFDQUFxQztRQUNoRCxHQUFHLEVBQUUsS0FBSztRQUNWLElBQUksRUFBRSxLQUFLO1FBQ1gsVUFBVSxFQUFFLFFBQVE7UUFDcEIsT0FBTyxFQUFFLEdBQUc7UUFDWixLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUscUNBQXFDLEVBQUU7UUFDM0QsS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLHFDQUFxQyxFQUFFO0tBQzVEO0lBQ0QsZUFBZSxFQUFFO1FBQ2YsVUFBVSxFQUFFO1lBQ1YsTUFBTSxFQUFFLFFBQVE7WUFDaEIsU0FBUyxFQUFFLHFCQUFxQjtZQUNoQyxZQUFZLEVBQUUsS0FBSztTQUNwQjtLQUNGO0lBQ0QsY0FBYyxFQUFFLEVBSWY7Q0FDRixDQUFDLENBQUM7QUFyQ1UsUUFBQSxPQUFPLFdBcUNqQiJ9