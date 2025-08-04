import { useEffect, useState } from "react";

export function useLocationHash() {
    const [hash, setHash] = useState<null | string>(null);
    useEffect(() => {
        function handleHashChange(ev: HashChangeEvent) {
            const h = window.location.hash;
            if (h && h.trim() !== "#") {
                setHash(h);
            }

        }
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, [])
    return hash;
}