import React from "react";
import secion1Image from "../assets/chalk-bg.jpg";
import tableImage from "../assets/tabel-front.png";
import "./Backdrop.css";

export default function Backdrop() {
    return (
        <>
            <div className="backdrop">
                <img className="bg-img" src={secion1Image} alt="" />
            </div>
            <div className="frontdrop">
                <img
                    className="front-img"
                    src={tableImage}
                    alt=""
                />
            </div>
        </>
    );
}
