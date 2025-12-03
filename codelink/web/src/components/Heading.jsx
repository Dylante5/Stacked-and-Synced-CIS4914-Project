export default function Heading({level=2, children, darkMode, className}) { // TODO: default level
    const style = {
        color: "#646cff" // TOOD: dark mode
    }

    switch (level) {
        case 1:
            return <h1 className="font-extrabold" style={style}>{children}</h1>; // TODO: fill out
        case 2:
            return <h2 className="text-2xl font-bold" style={style}>{children}</h2>;
        case 3:
            return <h3 className="font-semibold" style={style}>{children}</h3>;
        case 4:
            return <h4 className={className} style={style}>{children}</h4>;
        case 5:
            return <h5 className={className} style={style}>{children}</h5>;
        case 6:
            return <h6 className={className} style={style}>{children}</h6>;
        default:
            throw Error("Unknown level: ", level);
    }
}