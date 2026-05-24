import React, { useEffect, useState } from "react";
import { BASE_SERVER_URL } from "./constants";

export default function FileList({ files, subject, unit }) {
    const downloadFile = (fileUrl, fileName) => {
        const downloadUrl = `${BASE_SERVER_URL}/download?fileUrl=${encodeURIComponent(
            fileUrl
        )}&fileName=${encodeURIComponent(fileName)}`;

        // Create a temporary anchor element
        const anchor = document.createElement("a");
        anchor.href = downloadUrl;
        anchor.target = "_blank"; // Open in a new tab
        anchor.rel = "noopener noreferrer"; // Prevent tab hijacking
        anchor.click(); // Programmatically click the anchor
    };

    return (
        <>
            <div>
                <h2>
                    {subject} :- {unit}
                </h2>
                <ul className="file-list">
                    {files.map((file) => (
                        <li
                            key={file._id}
                            className="file-item hover-effect"
                           onClick={() => window.open(file.fileUrl, "_blank")}
                            style={{ cursor: "pointer" }} // Add a pointer cursor for better UX
                        >
                            {file.fileName}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
