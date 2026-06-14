import React, { useState } from "react";
import "./Contribute.css";
import Button from "../components/Button";
import { SOCKET_URL } from "../constants";
import { io } from "socket.io-client";
import { v4 } from "uuid";
import ProgressMenu from "../components/ProgressMenu";
import { motion } from "framer-motion";

export default function Contribute() {
    const [branch, setBranch] = useState("");
    const [sem, setSem] = useState("");
    const [subject, setSubject] = useState();
    const [unit, setUnit] = useState();
    const [file, setFile] = useState();
    const [email, setEmail] = useState();
    const [progresses, setProgresses] = useState([]);
    const TRANSITION_DURATION = 0.5;
    const TRANSITION_DELAY = 1;
    const TRANSITION_TYPE = "easeInOut";
    const EXIT_DELAY = 0;
    const EXIT_DURATION = 0.5;
    const EXIT_TYPE = "easeInOut";

    const handleSubmit = async (e) => {
        e.preventDefault();

        const socket = io(SOCKET_URL, {
            transports: ["websocket"],
            upgrade: false,
            perMessageDeflate: true,
        });

        const chunkSize = 1024 * 512;
        let offset = 0;
        const id = v4() + "." + file.name.split(".").pop();

        setProgresses((prevProgresses) => {
            let a = prevProgresses.map((element) => {
                return element;
            });
            a.push({ text: file.name, progress: 0, id });
            return a;
        });

        socket.on("uploadProgress", (progress) => {
            setProgresses((prevProgresses) => {
                return prevProgresses.map((element) => {
                    if (element.id === id) {
                        return { ...element, progress };
                    }
                    return element;
                });
            });
        });

        socket.on("uploadSuccess", (response) => {
            setProgresses((prevProgresses) => {
                return prevProgresses.filter((element) => element.id !== id);
            });
            alert("Thanks for your contribution😊");
            socket.close();
        });

        socket.on("error", (errorMessage) => {
            setProgresses((prevProgresses) => {
                return prevProgresses.filter((element) => element.id !== id);
            });
            console.log(errorMessage);
            alert(errorMessage);
            socket.close();
        });

        let retries = 0;
        const RETRY_LIMIT = 5;

        function uploadChunk(chunk, data) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = () => {
                    data.fileBuffer = reader.result;

                    socket.emit("uploadFileChunk", data);
                    socket.once("chunkUploaded", () => {
                        retries = 0;
                        resolve();
                    });
                };

                reader.onerror = (error) => {
                    reject(error);
                };

                reader.readAsArrayBuffer(chunk);
            });
        }

        async function uploadFileInChunks() {
            while (offset < file.size) {
                const chunk = file.slice(offset, offset + chunkSize);
                const data = {
                    branch,
                    sem,
                    subject,
                    unit,
                    fileName: file.name,
                    offset,
                    fileSize: file.size,
                    id,
                    type: "contribute",
                    email,
                };

                try {
                    await uploadChunk(chunk, data);
                    offset += chunkSize;
                } catch (error) {
                    console.error("Error uploading chunk:", error);
                    if (retries < RETRY_LIMIT) {
                        console.log("Retrying");
                        retries++;
                    } else break;
                }
            }
        }

        uploadFileInChunks();
    };

    return (
        <>
            <ProgressMenu progresses={progresses} />
            <motion.div className="contribute">
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
                    className="contri-head"
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
                >
                    Wanna help others?
                </motion.div>
                <div className="contri-form-cont">
                    <motion.div
                        className="contri-inner"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        exit={{
                            scaleY: 0,
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
                        <form onSubmit={handleSubmit} className="contri-form">
                            <label className="bang-bang" htmlFor="branch">
                                Branch
                            </label>
                            <select
                                value={branch}
                                onChange={(e) => setBranch(e.target.value)}
                                name="Branch"
                                id="branch"
                                required
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
                            <label className="bang-bang" htmlFor="sem">
                                Semester
                            </label>
                            <select
                                value={sem}
                                onChange={(e) => setSem(e.target.value)}
                                name="sem"
                                id="sem"
                                required
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
                            <label className="bang-bang" htmlFor="subject">
                                Subject
                            </label>
                            <input
                                onChange={(e) => setSubject(e.target.value)}
                                type="text"
                                id="subject"
                                required
                            />
                            <label className="bang-bang" htmlFor="unit">
                                Category
                            </label>
                            <input
                                onChange={(e) => setUnit(e.target.value)}
                                type="text"
                                id="unit"
                                placeholder="Unit 1 Notes, Midsem PYQ, etc"
                                required
                            />
                            <label className="bang-bang" htmlFor="file">
                                File
                            </label>
                            <input
                                onChange={(e) => setFile(e.target.files[0])}
                                type="file"
                                id="file"
                                required
                            />
                            <label className="bang-bang" htmlFor="email">
                                Email
                            </label>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                id="email"
                                required
                            />

                            <button className="contri-btn">Contribute</button>
                        </form>
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
}
