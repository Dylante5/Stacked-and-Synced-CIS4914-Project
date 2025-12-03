import { DarkModeContext } from "./DarkModeContext";
import { useContext, useEffect, useState } from "react";

export default function Paragraph ({children, style, className="text-sm"}) {
    const darkMode = useContext(DarkModeContext);

    return (
        <p className={className + (darkMode ? " text-gray-100" : " text-gray-600")} style={style}>{children}</p>
    )
}