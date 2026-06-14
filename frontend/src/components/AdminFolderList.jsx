import React, { useEffect, useState } from "react";

const AdminFolderList = ({
    groupedBySubject,
    selectedSubject,
    setSelectedSubject,
    setSelectedUnit,
    branchSem
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(null); // Manage dropdown state for each subject
    const [branches, setBranches] = useState(null)
    const [sem, setSem] = useState(null)

    useEffect(() => {
        setBranches(branchSem.branch.join(', '))
        setSem(branchSem.sem)
    }, [branchSem])

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
        <div className="admin-folder-list">
            <p>Branches:- {branches}</p>
            <p>Sem:- {sem}</p>
            <hr/>
            <h2 className="folder-list-header">Subjects</h2>
            <ul className="folder-list">
                {Object.keys(groupedBySubject).map((subject, idx) => (
                    <li key={idx} className="folder-item hover-effect">
                        <div
                            onClick={() => toggleDropdown(subject)}
                            className={`subject ${
                                selectedSubject === subject ? "selected" : ""
                            }`}
                        >
                            📁 {subject}
                        </div>
                        {dropdownOpen === subject && (
                            <select
                                className="unit-dropdown hover-effect"
                                onChange={(e) =>
                                    setSelectedUnit(e.target.value)
                                }
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
                            </select>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminFolderList;
