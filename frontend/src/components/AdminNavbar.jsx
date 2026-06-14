import React from "react";
import "./Navbar.css";
// import "./AdminNavbar.css"
import { useState } from "react";
import { Link } from "react-router-dom";
export default function AdminNavbar({ setView }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const goToHome = () => {
        setView("home");
    };

    const goToUpload = () => {
        setView("upload");
    };

    const goToRequests = () => {
        setView("requests");
    };

    return (
        <>
            <div
                className={isMenuOpen ? "underlay" : "underlay collapse"}
                onClick={toggleMenu}
            ></div>
            <div>
                <header className="admin-nav-header nav-header">
                    <div className="logo">
                        <h1>Resource ADDA</h1>
                    </div>
                    <nav>
                        <ul>
                            <li>
                                <label
                                    onClick={goToHome}
                                    className="hover-effect"
                                >
                                    Admin Home
                                </label>
                            </li>
                            <li>
                                <label
                                    onClick={goToUpload}
                                    className="hover-effect"
                                >
                                    Upload
                                </label>
                            </li>
                            <li>
                                <label
                                    onClick={goToRequests}
                                    className="hover-effect"
                                >
                                    Requests
                                </label>
                            </li>
                            <li>
                                <Link className="hover-effect" to="/">
                                    Client Panel
                                </Link>
                            </li>
                        </ul>
                        <div
                            className={
                                isMenuOpen ? "hamburger" : "hamburger collapse"
                            }
                            onClick={toggleMenu}
                        >
                            <svg
                                width="800px"
                                height="800px"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M4 18L20 18"
                                    stroke="#FFFFFF"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M4 12L20 12"
                                    stroke="#FFFFFF"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M4 6L20 6"
                                    stroke="#FFFFFF"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    </nav>
                    <div
                        className={
                            isMenuOpen
                                ? "hamburger-cont"
                                : "hamburger-cont collapse"
                        }
                        onClick={toggleMenu}
                    >
                        <HamburgerMenu goToHome={goToHome} goToUpload={goToUpload} goToRequests={goToRequests}/>
                    </div>
                </header>
            </div>
        </>
    );
}

function HamburgerMenu({goToHome, goToUpload, goToRequests}) {
    return (
        <>
            <ul>
                <li>
                    <label onClick={goToHome} className="hover-effect">
                        Admin Home
                    </label>
                </li>
                <li>
                    <label onClick={goToUpload} className="hover-effect">
                        Upload
                    </label>
                </li>
                <li>
                    <label onClick={goToRequests} className="hover-effect">
                        Requests
                    </label>
                </li>
                <li>
                    <Link className="hover-effect" to="/">
                        Client Panel
                    </Link>
                </li>
            </ul>
        </>
    );
}
