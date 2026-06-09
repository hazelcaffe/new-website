import { useEffect, useState } from "react";
import site from "../config/site.json";

export default function VisitorCounter() {
    const [count, setCount] = useState<string>("------");

    useEffect(() => {
        async function recordVisit() {
            try {
                const response = await fetch("/api/visitor", {
                    method: "POST",
                    cache: "no-store"
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);
                setCount(String(data.count).padStart(6, "0"));
            } catch {
                setCount("ERROR");
            }
        }

        void recordVisit();
    }, []);

    return (
        <section className="mini-panel pixel-border">
            <h3>site stats</h3>
            <p>you are visitor</p>
            <div className="counter" role="status" aria-label={`${count} unique visitors`}>
                {count}
            </div>
            <p>since {site.stats.since}</p>
        </section>
    );
}
