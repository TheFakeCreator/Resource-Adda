import React, {useState, useEffect} from "react";
import "./ProgressMenu.css";

export default function ProgressMenu({progresses}) {
    return (
        <div className="progress-menu">
            {progresses.map((p) => (
                <ToggleableProgressBar key={p.id} text={p.text} progress={p.progress} />
            ))}
        </div>
    );
}

const ToggleableProgressBar = ({text, progress }) => {
    const [isCircle, setIsCircle] = useState(window.innerWidth <= 1000);

    const toggleView = () => {
        if (window.innerWidth < 1000) {
            setIsCircle(!isCircle);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1000) {
                setIsCircle(true);
            } else {
                setIsCircle(false);
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div className={`progress-item ${isCircle ? "circle" : ""}`} onClick={toggleView}>
            {isCircle ? (
                    <CircularProgress text={text} progress={progress} />
            ) : (
                    <ProgressBar text={text} progress={progress}/>
            )}
        </div>
    );
}

const ProgressBar = ({text, progress}) => {
    return (
        <div className="progress-bar">
            <div className="progress-label">
                {text}
            </div>
            <div className="bar">
            <div className="conpleted-bar" style={{ width: `${progress}%`}}>
            </div>
            </div>
        </div>
    )
}

const CircularProgress = ({ progress}) => {
    return (
        <div className="circular-progress"  style={{ "--progress": `${progress}` }}>
            <div className="progress-circle"></div>
        </div>
    );
};