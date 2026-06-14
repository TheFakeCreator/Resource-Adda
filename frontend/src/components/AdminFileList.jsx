import React from "react";
import Button from "./Button";

export default function AdminFileList({ files, subject, unit, del }) {
    return (
        <div>
            <h2>
                {subject} :- {unit}
            </h2>
            <ul className="file-list">
                {files.map((file) => (
                    <li
                        key={file._id}
                        className="file-item admin-file-item hover-effect"
                    >
                        <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {file.fileName}
                        </a>
                        <Button
                            className={"delete-btn"}
                            text={"Delete"}
                            onClick={() => {
                                del(file.fileUrl);
                            }}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}
