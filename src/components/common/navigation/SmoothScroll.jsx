import { useEffect } from "react";

/**
 * Smoothly scrolls to anchor links on the page.
 * Use this component once (e.g. in App.jsx).
 */
export default function SmoothScroll() {
    useEffect(() => {
        function onClick(e) {
            // Find the nearest anchor with href^="#"
            let el = e.target;
            while (el && el.tagName !== "A") el = el.parentElement;
            if (
                el &&
                el.tagName === "A" &&
                el.getAttribute("href") &&
                el.getAttribute("href").startsWith("#") &&
                el.getAttribute("href").length > 1
            ) {
                const href = el.getAttribute("href");
                const section = document.querySelector(href);
                if (section) {
                    e.preventDefault();
                    section.scrollIntoView({ behavior: "smooth" });
                }
            }
        }
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, []);
    return null;
}