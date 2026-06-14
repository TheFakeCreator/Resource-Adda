import React from "react";
import "./Home.css";
import NavigateButton from "../components/NavigateButton";
import { motion } from "framer-motion";
export function Home() {
    const TRANSITION_DELAY = 0.5;
    const TRANSITION_DURATION = 0.5;
    const TRANSITION_TYPE = "easeIn";
    const EXIT_DURATION = 0.5;
    return (
        <>
            <div className="home">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{
                            opacity: 0,
                            transition: { delay: 0, duration: EXIT_DURATION },
                        }}
                        transition={{
                            delay: TRANSITION_DELAY,
                            duration: TRANSITION_DURATION,
                            ease: TRANSITION_TYPE,
                        }}
                        className="section-1"
                    >
                        <motion.div
                            className="slangs"
                            initial={{ y: -50 }}
                            animate={{ y: 0 }}
                            exit={{
                                y: -50,
                                transition: {
                                    delay: 0,
                                    duration: EXIT_DURATION,
                                },
                            }}
                            transition={{
                                delay: TRANSITION_DELAY,
                                duration: TRANSITION_DURATION,
                                ease: TRANSITION_TYPE,
                            }}
                        >
                            <div className="text first-slang">
                                <span>Haa bhai... Aa gaya padhne</span>
                            </div>
                            <div className="text second-slang">
                                <span>Notes nahi mil rahe ??</span>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1 }}
                        >
                            <NavigateButton
                                className="res-btn"
                                text={"Get Study Material"}
                                path={"/resources"}
                            />
                        </motion.div>
                    </motion.div>
                    <motion.div
                        className="topper-sec"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{
                            opacity: 0,
                            transition: { delay: 0, duration: EXIT_DURATION },
                        }}
                        transition={{
                            delay: TRANSITION_DELAY,
                            duration: TRANSITION_DURATION,
                            ease: TRANSITION_TYPE,
                        }}
                    >
                        <motion.span
                            className="text"
                            initial={{ x: -50 }}
                            animate={{ x: 0 }}
                            exit={{
                                x: -50,
                                transition: {
                                    delay: 0,
                                    duration: EXIT_DURATION,
                                },
                            }}
                            transition={{
                                delay: TRANSITION_DELAY,
                                duration: TRANSITION_DURATION,
                                ease: TRANSITION_TYPE,
                            }}
                        >
                            Topper's Section
                        </motion.span>
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                        >
                            <NavigateButton
                                className={"home-contri-btn"}
                                text={"Contribute"}
                                path={"/contribute"}
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
