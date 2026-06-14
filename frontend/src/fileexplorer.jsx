import React, { useEffect, useState } from "react";
import "./fileexplorer.css";
import FolderList from "./FolderList";
import FileList from "./FileList";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BASE_SERVER_URL } from "./constants";

export default function fileexplorer() {
    const [data, setData] = useState({});
    const { branch, sem } = useParams();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("Loading...")
    useEffect(() => {
        axios
            .get(`${BASE_SERVER_URL}/files?branch=${branch}&sem=${sem}`)
            .then((res) => {
                setData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                setMessage("Something went wrong... \ncould not load")
            })
    }, []);
    const [groupedBySubject, setGroupedBySubject] = useState({});
    const [isFolderListVisible, setIsFolderListVisible] = useState(true);

    useEffect(() => {
        if (!data.files) return;
        setGroupedBySubject(
            data.files.reduce((acc, file) => {
                if (!acc[file.subject]) {
                    acc[file.subject] = {};
                }
                if (!acc[file.subject][file.unit]) {
                    acc[file.subject][file.unit] = [];
                }
                acc[file.subject][file.unit].push(file);
                return acc;
            }, {})
        );
    }, [data]);

    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const toggleFolderList = () => {
        setIsFolderListVisible(!isFolderListVisible);
    };

    return (
        <>
            <div className="file-explorer">
                <button className="toggle-btn" onClick={toggleFolderList}>
                    {isFolderListVisible ? "Hide Folders" : "Show Folders"}
                </button>

                <div
                    className={`left-pane ${
                        isFolderListVisible ? "visible" : ""
                    }`}
                >
                    {loading && (<h2>{message}</h2>)}
                    {!loading && (
                        <FolderList
                            groupedBySubject={groupedBySubject}
                            selectedSubject={selectedSubject}
                            setSelectedSubject={setSelectedSubject}
                            setSelectedUnit={setSelectedUnit}
                            setIsFolderListVisible={setIsFolderListVisible}
                        />
                    )}
                </div>
                <div className="right-pane">
                    {selectedSubject && selectedUnit ? (
                        <FileList
                            files={
                                groupedBySubject[selectedSubject][selectedUnit]
                            }
                            subject={selectedSubject}
                            unit={selectedUnit}
                        />
                    ) : (
                        <div className="empty-box">
                            Select a folder to see files
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
