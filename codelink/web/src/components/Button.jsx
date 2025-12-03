import { DarkModeContext } from "./DarkModeContext";
import { useContext, useEffect, useState } from "react";

export default function Button({ children, onClick, className, style, title, disabled = false}) {
    const darkMode = useContext(DarkModeContext);

    return (
        <button onClick={onClick}
        disabled={disabled}
        className={className}
        title={title}
        style={{
            backgroundColor: darkMode ? "#9ba0ffff" : "#646cff",
            color: darkMode ? "#000000" : "#ffffff",
            borderRadius: 8,
            padding: "0.5em 1em",
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            ...style // will overwrite any elements provided
        }}>
            {children}
        </button>
    );
}