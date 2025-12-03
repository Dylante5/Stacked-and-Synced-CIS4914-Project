import { DarkModeContext } from "./DarkModeContext";
import { useContext, useEffect, useState } from "react";

export default function Section({ children, className, style}) {
    const darkMode = useContext(DarkModeContext);

    style = {
        boxShadow: "3px 3px 10px rgba(0, 0, 0, 0.1)",
        ...style
    }

    return (
        <section className={className + (darkMode ? " !bg-gray-800" : " !bg-white")} style={style}>
            {children}
        </section>
    )
}