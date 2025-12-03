import { DarkModeContext } from "./DarkModeContext";
import { useContext, useEffect, useState } from "react";

export default function Input({ id, value, onChange, placeholder }) {
    const darkMode = useContext(DarkModeContext);
    const [className, setClassName] = useState("w-full rounded-lg border px-3 py-2 text-gray-600"); // TODO: alter size on level(?)

    useEffect(() => {
        setClassName("w-full rounded-lg border px-3 py-2 " + (darkMode ? "text-gray-100" : "text-gray-600"));
    }, [darkMode]);

    return (
        <input
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={className}
        />
    );
}