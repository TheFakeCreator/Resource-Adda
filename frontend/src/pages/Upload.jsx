import React, { useEffect, useRef } from "react";
import { useState } from "react";
import Button from "../components/Button";
import axios from "axios";
import { BASE_SERVER_URL, SOCKET_URL } from "../constants";
import AdminFileList from "../components/AdminFileList";
import AdminFolderList from "../components/AdminFolderList";
import { io } from "socket.io-client";
import { v4 } from "uuid";
import ProgressMenu from "../components/ProgressMenu";
import "./AdminPannel.css";
import "./Upload.css";

export default function Upload({ jwtToken }) {
    const [branchSem, setBranchSem] = useState({});
    const [data, setData] = useState({});
    const [uploading, setUploading] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [isFolderListVisible, setIsFolderListVisible] = useState(false);
    const [progresses, setProgresses] = useState([]);
    let branch, sem;

    const load = () => {
        if (!branchSem.branch || !branchSem.sem || uploading) return;
        branch = branchSem.branch;
        sem = branchSem.sem;
        try {
            const branchQuery = branch
                .map((b) => `branch=${encodeURIComponent(b)}`)
                .join("&");

            axios
                .get(`${BASE_SERVER_URL}/files?${branchQuery}&sem=${sem}`)
                .then((res) => {
                    setData(res.data);
                })
                .catch((e) => {
                    console.log(e);
                });
        } catch (e) {
            alert("something went wrong");
        }
    };

    useEffect(() => {
        load();
    }, [branchSem, uploading]);

    const [groupedBySubject, setGroupedBySubject] = useState({});

    useEffect(() => {
        let a;
        if (data.files) {
            a = data.files.reduce((acc, file) => {
                if (!acc[file.subject]) {
                    acc[file.subject] = {};
                }
                if (!acc[file.subject][file.unit]) {
                    acc[file.subject][file.unit] = [];
                }
                acc[file.subject][file.unit].push(file);
                return acc;
            }, {});
        } else a = {};
        if (selectedSubject && selectedUnit) {
            try {
                const b = a[selectedSubject][selectedUnit];
                if (!b) {
                    setSelectedSubject(null);
                    setSelectedUnit(null);
                }
            } catch {
                setSelectedSubject(null);
                setSelectedUnit(null);
            }
        }
        setGroupedBySubject(a);
    }, [data]);

    useEffect(() => {}, [groupedBySubject]);

    const del = async (url) => {
        try {
            const response = await axios.delete(`${BASE_SERVER_URL}/delete`, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
                data: {
                    fileUrl: url,
                    branch: branchSem.branch, // Pass the array of branches
                },
            });
        } catch (error) {
            console.error(
                "Error deleting file:",
                error.response ? error.response.data : error.message
            );
        } finally {
            load(); // This will run regardless of success or failure
        }
    };

    const toggleFolderList = () => {
        setIsFolderListVisible(!isFolderListVisible);
    };

    return (
        <>
            <ProgressMenu progresses={progresses} />
            {(!branchSem.branch || !branchSem.sem) && (
                <Select setBranchSem={setBranchSem} />
            )}
            {uploading && (
                <div className="admin-cont">
                    <div className="admin-inner-cont">
                        <Uploader
                            branch={branchSem.branch}
                            sem={branchSem.sem}
                            jwtToken={jwtToken}
                            setUploading={setUploading}
                            setProgresses={setProgresses}
                        />
                    </div>
                </div>
            )}
            {branchSem.branch && branchSem.sem && !uploading && (
                <div className="upload">
                    <div className="file-explorer">
                        <button
                            className="toggle-btn"
                            onClick={toggleFolderList}
                        >
                            {isFolderListVisible
                                ? "Hide Folders"
                                : "Show Folders"}
                        </button>
                        <div
                            className={`left-pane ${
                                isFolderListVisible ? "visible" : ""
                            }`}
                        >
                            <AdminFolderList
                                groupedBySubject={groupedBySubject}
                                selectedSubject={selectedSubject}
                                setSelectedSubject={setSelectedSubject}
                                setSelectedUnit={setSelectedUnit}
                                branchSem={branchSem}
                            />
                        </div>
                        <div className="right-pane">
                            {selectedSubject && selectedUnit ? (
                                <AdminFileList
                                    files={
                                        groupedBySubject[selectedSubject][
                                            selectedUnit
                                        ]
                                    }
                                    subject={selectedSubject}
                                    unit={selectedUnit}
                                    del={del}
                                />
                            ) : (
                                <div className="empty-box">
                                    Select a folder to see files
                                </div>
                            )}
                        </div>
                    </div>
                    <AddFileBtn setUploading={setUploading} />
                </div>
            )}
        </>
    );
}

const AddFileBtn = ({ setUploading }) => {
    return (
        <>
            <div
                onClick={() => {
                    setUploading(true);
                }}
                className="add-file-btn hover-effect"
            >
                <svg
                    enableBackground="new 0 0 50 50"
                    height="50px"
                    id="Layer_1"
                    version="1.1"
                    viewBox="0 0 50 50"
                    width="50px"
                >
                    <rect fill="none" height="50" width="50" />
                    <line
                        fill="none"
                        stroke="#FFF"
                        strokeMiterlimit="10"
                        strokeWidth="4"
                        x1="9"
                        x2="41"
                        y1="25"
                        y2="25"
                    />
                    <line
                        fill="none"
                        stroke="#FFF"
                        strokeMiterlimit="10"
                        strokeWidth="4"
                        x1="25"
                        x2="25"
                        y1="9"
                        y2="41"
                    />
                </svg>
            </div>
        </>
    );
};

const Uploader = ({ branch, sem, jwtToken, setUploading, setProgresses }) => {
    const [subject, setSubject] = useState("");
    const [unit, setUnit] = useState("");
    const [files, setFile] = useState([]);

    const submit = async () => {
        for (let file of files) {
            const socket = io(SOCKET_URL, {
                auth: {
                    token: jwtToken,
                },
                transports: ["websocket"],
                upgrade: false,
                perMessageDeflate: true,
            });

            const chunkSize = 1024 * 512; // 512 KB chunks
            let offset = 0;
            const id = v4() + "." + file.name.split(".").pop(); // Unique ID for the file

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
                    return prevProgresses.filter(
                        (element) => element.id !== id
                    );
                });
                socket.close();
            });

            socket.on("error", (errorMessage) => {
                setProgresses((prevProgresses) => {
                    return prevProgresses.filter(
                        (element) => element.id !== id
                    );
                });
                alert(errorMessage.message);
                socket.close();
            });

            let retries = 0;
            const RETRY_LIMIT = 5;

            // Function to send a chunk after the previous one is acknowledged
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
                        type: "upload",
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
        }
    };

    const cancel = () => {
        setUploading(false);
    };

    return (
        <>
            <div className="uploader-cont">
                <div className="subject-cont">
                    <label htmlFor="subject">Subject : </label>
                    <input
                        onChange={(e) => {
                            setSubject(e.target.value);
                        }}
                        type="text"
                        id="subject"
                    />
                </div>
                <div className="unit-cont">
                    <label htmlFor="unit">Category : </label>
                    <input
                        placeholder="Unit 1 Notes, Midsem PYQ, etc"
                        onChange={(e) => {
                            setUnit(e.target.value);
                        }}
                        type="text"
                        id="unit"
                    />
                </div>
                <div className="file-cont">
                    <label htmlFor="file">File : </label>
                    <input
                        onChange={(e) => {
                            setFile(e.target.files);
                        }}
                        type="file"
                        id="file"
                        multiple
                    />
                </div>
                <div className="btn-cont">
                    <Button text={"Upload"} onClick={submit} />
                    <Button text={"Go Back"} onClick={cancel} />
                </div>
            </div>
        </>
    );
};

const branches = [
    { title: "IT" },
    { title: "CSE" },
    { title: "ECE" },
    { title: "Electrical" },
    { title: "Chemical" },
    { title: "Mining" },
    { title: "Mechanical" },
    { title: "Metalurgy" },
    { title: "Civil" },
    { title: "BioMed" },
    { title: "BioTech" },
];

const Select = ({ setBranchSem }) => {
    const [sem, setSem] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedBranches, setSelectedBranches] = useState([]);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleBranchSelection = (branch) => {
        setSelectedBranches((prevSelected) => {
            if (prevSelected.includes(branch)) {
                // If already selected, remove it
                return prevSelected.filter((b) => b !== branch);
            } else {
                // Otherwise, add it to the selected branches
                return [...prevSelected, branch];
            }
        });
    };

    // Close dropdown when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        };

        // Add event listener for clicks
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            // Remove event listener on cleanup
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const setItems = () => {
        if (!selectedBranches || !sem) return;
        if (selectedBranches.length == 0) return;
        setBranchSem({ branch: selectedBranches, sem });
    };

    return (
        <>
            <div className="upload-select">
                <div className="upload-select-inner">
                    <div className="br">
                        <label htmlFor="branch">Branch ??</label>
                        <div
                            ref={dropdownRef}
                            className="multi-select-container"
                        >
                            <div
                                className="multi-select"
                                onClick={toggleDropdown}
                            >
                                <span>Select Branches</span>
                                <div
                                    className={`dropdown-icon ${
                                        isDropdownOpen ? "open" : ""
                                    }`}
                                >
                                    ▼
                                </div>
                            </div>

                            {isDropdownOpen && (
                                <div className="dropdown-menu">
                                    {branches.map((branch, index) => (
                                        <label
                                            key={index}
                                            className="dropdown-item"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedBranches.includes(
                                                    branch.title
                                                )}
                                                onChange={() =>
                                                    handleBranchSelection(
                                                        branch.title
                                                    )
                                                }
                                            />
                                            {branch.title}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="sem">
                        <label htmlFor="sem">Semester ??</label>
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
                    <Button className="go-btn" text={"GO"} onClick={setItems} />
                </div>
            </div>
        </>
    );
};
