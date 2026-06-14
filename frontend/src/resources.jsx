import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import axios from "axios";
// Import the smart URL we just created
import { BASE_SERVER_URL } from "./constants";

export default function Resources() {
    const [files, setFiles] = useState({});
    const [folders, setFolders] = useState({}); // You might want to use this later!
    const { branch, sem } = useParams();

    useEffect(() => {
        // Now it uses the live Render URL!
        axios
            .get(`${BASE_SERVER_URL}/files?branch=${branch}&sem=${sem}`)
            .then((response) => {
                setFiles(response.data.files);
                groupFilesBySubject(response.data.files);
            })
            .catch((error) => {
                console.error("Error fetching files:", error);
            });
    }, [branch, sem]);

    const groupFilesBySubject = (files) => {
        const groupedFiles = files.reduce((acc, file) => {
            acc[file.subject] = acc[file.subject] || [];
            acc[file.subject].push(file);
            return acc;
        }, {});
        // Note: You aren't doing anything with groupedFiles here yet!
        // You might want to do: setFolders(groupedFiles);
    };

    return <>Resources</>;
}