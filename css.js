export const bookCss = () => ({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3NzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBRyxHQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQ3BDLFVBQVUsRUFBRTtRQUNWLFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLFdBQVcsRUFBRSxPQUFPO1FBQ3BCLE1BQU0sRUFBRSxNQUFNO1FBQ2QsVUFBVSxFQUFFLFVBQVU7UUFDdEIsVUFBVSxFQUFFLE1BQU07UUFDbEIsS0FBSyxFQUFFLE1BQU07UUFDYixVQUFVLEVBQUUsTUFBTTtRQUNsQixvQkFBb0IsRUFBRSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUU7S0FDOUM7SUFDRCxPQUFPLEVBQUU7UUFDUCxVQUFVLEVBQUUsTUFBTTtRQUNsQixRQUFRLEVBQUUsVUFBVTtRQUNwQixRQUFRLEVBQUUsT0FBTztRQUNqQixNQUFNLEVBQUUsTUFBTTtRQUNkLFNBQVMsRUFBRSxxQ0FBcUM7UUFDaEQsR0FBRyxFQUFFLEtBQUs7UUFDVixJQUFJLEVBQUUsS0FBSztRQUNYLFVBQVUsRUFBRSxRQUFRO1FBQ3BCLE9BQU8sRUFBRSxHQUFHO1FBQ1osS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLHFDQUFxQyxFQUFFO1FBQzNELEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRSxxQ0FBcUMsRUFBRTtLQUM1RDtJQUNELGVBQWUsRUFBRTtRQUNmLFVBQVUsRUFBRTtZQUNWLE1BQU0sRUFBRSxRQUFRO1lBQ2hCLFNBQVMsRUFBRSxxQkFBcUI7WUFDaEMsWUFBWSxFQUFFLEtBQUs7U0FDcEI7S0FDRjtJQUNELGNBQWMsRUFBRSxFQUlmO0NBQ0YsQ0FBQyxDQUFDIn0=