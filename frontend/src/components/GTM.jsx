import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GoogleTagManager = ({ gtmId }) => {
    const location = useLocation();

    useEffect(() => {
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
        document.head.appendChild(script);
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            "gtm.start": new Date().getTime(),
            event: "gtm.js",
        });
    }, [gtmId]);

    useEffect(() => {
        // Get the path excluding the first segment
        const fullPath = location.pathname.split("/").slice(2).join("/"); // Exclude the first segment

        // Push a page view event to the data layer on route change
        window.dataLayer.push({
            event: "pageview",
            page: fullPath,
        });
    }, [location]);

    return null;
};

export default GoogleTagManager;
