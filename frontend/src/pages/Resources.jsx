import React, { useState, useEffect } from "react";
import "./Resources.css";
import NavigateButton from "../components/NavigateButton";
import noticeBoard from "../assets/notice-board-green.png";
import { motion } from "framer-motion";

export default function Resources() {
    const [branch, setBranch] = useState("");
    const [sem, setSem] = useState("");
    const [redirect, setRedirect] = useState("");
    const TRANSITION_DURATION = 1;
    const TRANSITION_DELAY = 0.2;
    const TRANSITION_TYPE = "backInOut";
    const EXIT_DELAY = 0;
    const EXIT_DURATION = 1;
    const EXIT_TYPE = "backInOut";

    useEffect(() => {
        if (branch != "" && sem != "")
            setRedirect("/resources/" + branch + "/" + sem);
        else setRedirect("");
    }, [branch, sem]);

    return (
        <>
            <div
                className="res-body"
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 70,
                    overflow: "hidden",
                }}
            >
                <div className="res">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            duration: TRANSITION_DURATION,
                            delay: TRANSITION_DELAY,
                            ease: TRANSITION_TYPE,
                        }}
                        exit={{
                            opacity: 0,
                            transition: {
                                delay: EXIT_DELAY,
                                duration: EXIT_DURATION,
                                ease: EXIT_TYPE,
                            },
                        }}
                        className="overlay"
                    ></motion.div>
                    <motion.div
                        className="res-inner"
                        initial={{ top: "140%", y: "-50%" }}
                        animate={{ top: "calc(50vh)" }}
                        exit={{
                            top: "140%",
                            transition: {
                                delay: EXIT_DELAY,
                                duration: EXIT_DURATION,
                                ease: EXIT_TYPE,
                            },
                        }}
                        transition={{
                            duration: TRANSITION_DURATION,
                            delay: TRANSITION_DELAY,
                            ease: TRANSITION_TYPE,
                        }}
                    >
                        <img
                            className="notice-board"
                            src={noticeBoard}
                            alt=""
                        />
                        <div className="br">
                            <label htmlFor="branch">Aapki Branch ??</label>
                            <select
                                value={branch}
                                onChange={(e) => setBranch(e.target.value)}
                                name="Branch"
                                id="branch"
                            >
                                <option value="" disabled hidden>
                                    Select Branch
                                </option>
                                <option value="IT">IT</option>
                                <option value="CSE">CSE</option>
                                <option value="ECE">ECE</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Chemical">Chemical</option>
                                <option value="Mining">Mining</option>
                                <option value="Mechanical">Mechanical</option>
                                <option value="Metalurgy">Metalurgy</option>
                                <option value="Civil">Civil</option>
                                <option value="BioMed">BioMed</option>
                                <option value="BioTech">BioTech</option>
                            </select>
                        </div>
                        <div className="sem">
                            <label htmlFor="sem">Aapka Sem ??</label>
                            <select
                                value={sem}
                                onChange={(e) => setSem(e.target.value)}
                                name="sem"
                                id="sem"
                            >
                                <option value="" disabled hidden>
                                    Select Semester
                                </option>
                                <option value="1">Sem-1</option>
                                <option value="2">Sem-2</option>
                                <option value="3">Sem-3</option>
                                <option value="4">Sem-4</option>
                                <option value="5">Sem-5</option>
                                <option value="6">Sem-6</option>
                                <option value="7">Sem-7</option>
                                <option value="8">Sem-8</option>
                            </select>
                        </div>
                        <NavigateButton
                            className="go-btn"
                            text={"GO"}
                            path={redirect}
                        />
                    </motion.div>
                </div>
            </div>
        </>
    );
}
