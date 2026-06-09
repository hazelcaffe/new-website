import { useEffect, useState } from "react";
import site from "../config/site.json";

/**
 * Records this browser visit once and presents the persisted unique-visitor total.
 */
export default function VisitorCounter() {
    const [count, setCount] = useState<string>("------");

    useEffect(
        /**
         * Records at most once per mounted counter so React rerenders cannot inflate the total.
         */
        function initializeVisitorCounter() {
            /**
             * Uses the GET fallback because some production proxies reject API POST requests.
             */
            async function recordVisit() {
                try {
                    const response = await fetch("/api/visitor?record=1", { cache: "no-store" });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error);
                    setCount(String(data.count).padStart(6, "0"));
                } catch (error) {
                    console.error("Could not record visitor:", error);
                    setCount("ERROR");
                }
            }

            void recordVisit();
        },
        []
    );

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
