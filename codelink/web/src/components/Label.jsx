import { DarkModeContext } from "./DarkModeContext";
import { useContext, useEffect, useState } from "react";

export default function Label({ children, htmlFor }) {
    const darkMode = useContext(DarkModeContext);
    const [className, setClassName] = useState("block text-sm font-medium"); // TODO: alter size on level(?)

    // dark mode
    useEffect(() => {
        setClassName("block text-sm font-medium " + (darkMode ? "text-gray-100" : "text-gray-600"));
    }, [darkMode]);

    return (
        <label htmlFor={htmlFor} className={className}>{children}</label>
    )
}