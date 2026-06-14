import React, { useState, useEffect } from "react";
import "./fileexplorer.css";
import { motion } from "framer-motion";

const FolderList = ({
    groupedBySubject,
    selectedSubject,
    setSelectedSubject,
    setSelectedUnit,
    setIsFolderListVisible,
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(null);

    const toggleDropdown = (subject) => {
        if (dropdownOpen === subject) {
            setDropdownOpen(null);
        } else {
            setDropdownOpen(subject);
        }
        setSelectedSubject(subject);
        setSelectedUnit(null);
    };

    return (
        <div>
            <h2 className="folder-list-header">Subjects</h2>
            <ul className="folder-list">
                {Object.keys(groupedBySubject).map((subject, idx) => (
                    <motion.li
                        key={idx}
                        className="folder-item hover-effect"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                    >
                        <div
                            onClick={() => toggleDropdown(subject)}
                            className={`subject ${
                                selectedSubject === subject ? "selected" : ""
                            }`}
                        >
                            📁 {subject}
                        </div>
                        {dropdownOpen === subject && (
                            <motion.select
                                className="unit-dropdown hover-effect"
                                onChange={(e) => {
                                    setSelectedUnit(e.target.value);
                                    setIsFolderListVisible(false);
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                defaultValue=""
                            >
                                <option value="" disabled hidden>
                                    Select Category
                                </option>
                                {Object.keys(groupedBySubject[subject]).map(
                                    (unit, idx) => (
                                        <option key={idx} value={unit}>
                                            {unit}
                                        </option>
                                    )
                                )}
                            </motion.select>
                        )}
                    </motion.li>
                ))}
            </ul>
        </div>
    );
};

export default FolderList;
