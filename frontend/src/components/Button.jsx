import React from "react";
import "./Button.css";
import { motion } from "framer-motion";

export default function Button({ text, type = "button", className, onClick }) {
    return (
        <motion.button
            className={`btn ${className}`}
            type={type}
            onClick={onClick}
            whileHover={{scale: 1.1}}
            whileTap={{scale: .9}}
        >
            {text}
        </motion.button>
    );
}
