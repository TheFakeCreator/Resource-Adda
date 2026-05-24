import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_SERVER_URL } from "../constants";
import Button from "../components/Button";
import "./Requests.css";

const Requests = ({ jwtToken }) => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null); // For managing selected request
    const [showPopup, setShowPopup] = useState(false); // For showing the popup

    const fetchPendingRequests = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${BASE_SERVER_URL}/pending-requests`,
                {
                    headers: { Authorization: `Bearer ${jwtToken}` },
                }
            );
            setPendingRequests(response.data);
        } catch (err) {
            console.error("Error fetching pending requests:", err);
            setError(err.response ? err.response.data.message : "Server error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const showDetails = (request) => {
        setSelectedRequest(request); // Set the selected request details
        setShowPopup(true); // Show the popup
    };

    const closePopup = () => {
        setShowPopup(false); // Hide the popup
        setSelectedRequest(null); // Clear selected request
    };

    const approve = (request) => {
        try {
            // Updated to match the backend req.body.contributionId
            const data = { contributionId: request._id }; 
            
            axios
                .post(`${BASE_SERVER_URL}/approve`, data, {
                    headers: { Authorization: `Bearer ${jwtToken}` },
                })
                .then((res) => {
                    // Update UI state so the item disappears immediately without a refresh
                    setPendingRequests((prevRequests) => 
                        prevRequests.filter((item) => item._id !== request._id)
                    );
                })
                .catch((err) => {
                    console.log(`Error while approving: ${err}`);
                });
        } catch (err) {
            console.log(`Error while approving: ${err}`);
        }
    };

    return (
        <div>
            <h2>Pending Requests</h2>
            {pendingRequests.length > 0 ? (
                <ul className="file-list req-list">
                    {pendingRequests.map((request) => (
                        <li
                            key={request._id}
                            className="file-item req-item hover-effect"
                        >
                            <a
                                href={request.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {request.filename}
                            </a>
                            <div className="req-btn-cont">
                                <Button
                                    className={"req-details-btn"}
                                    text={"Details"}
                                    onClick={() => {
                                        showDetails(request);
                                    }}
                                />
                                <Button
                                    className={"req-approve-btn"}
                                    text={"Approve"}
                                    onClick={() => {
                                        approve(request);
                                    }}
                                />
                                <Button
                                    className={"req-reject-btn"}
                                    text={"Reject"}
                                    onClick={() => {
        const confirmReject = window.confirm("Are you sure you want to permanently delete this file?");
        if (!confirmReject) return;

        axios.delete(`${BASE_SERVER_URL}/reject`, {
            headers: { Authorization: `Bearer ${jwtToken}` },
            // Notice how data is passed inside this object for a DELETE request
            data: { contributionId: request._id } 
        })
        .then(() => {
            // Remove it from the screen immediately
            setPendingRequests((prevRequests) => 
                prevRequests.filter((item) => item._id !== request._id)
            );
            console.log("File rejected and deleted.");
        })
        .catch((err) => {
            console.error(`Error while rejecting: ${err}`);
            alert("Failed to reject the file. Check console for details.");
        });
    }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No pending requests found.</p>
            )}

            {showPopup && selectedRequest && (
                <Popup request={selectedRequest} onClose={closePopup} />
            )}
        </div>
    );
};

// Popup component to show details of the request
const Popup = ({ request, onClose }) => {
    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content">
                <h3>Request Details</h3>
                <p>
                    <strong>Filename:</strong> {request.filename}
                </p>
                <p>
                    <strong>Branch:</strong> {request.branch}
                </p>
                <p>
                    <strong>Semester:</strong> {request.sem}
                </p>
                <p>
                    <strong>Subject:</strong> {request.subject}
                </p>
                <p>
                    <strong>Unit:</strong> {request.unit}
                </p>
                <p>
                    <strong>Email:</strong> {request.email}
                </p>
            </div>
        </div>
    );
};


export default Requests;
