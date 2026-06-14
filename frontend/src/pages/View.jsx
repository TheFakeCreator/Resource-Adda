import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Button from "../components/Button"; // Assuming you still have this component
// import "./View.css"; // We'll add some simple CSS to make it look nice

// Bulletproof Worker Setup
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function View() {
    const location = useLocation();
    
    // State management for pagination and loading
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [uri, setUri] = useState("");
    const [fileName, setFileName] = useState("document.pdf");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Grab the 'uri' and 'fileName' from the browser URL
        const params = new URLSearchParams(location.search);
        const fileUri = params.get("uri");
        const name = params.get("fileName");
        
        if (fileUri) setUri(fileUri);
        if (name) setFileName(name);
    }, [location.search]);

    // Handle successful PDF load
    function onDocLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setIsLoading(false);
    }

    // Pagination controls
    const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
    const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages || 1));

    // Simple Direct Download Function
    const handleDownload = () => {
        if (!uri) return;
        const link = document.createElement("a");
        link.href = uri;
        link.download = fileName; // Suggests a filename to the browser
        link.target = "_blank";   // Fallback in case the browser forces a new tab
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="pdf-viewer-container">
            <div className="pdf-toolbar">
                {/* Pagination Controls */}
                <div className="pagination">
                    <button 
                        onClick={goToPrevPage} 
                        disabled={pageNumber <= 1 || isLoading}
                        className="control-btn"
                    >
                        Previous
                    </button>
                    <span className="page-info">
                        Page {pageNumber} of {numPages || '--'}
                    </span>
                    <button 
                        onClick={goToNextPage} 
                        disabled={pageNumber >= numPages || isLoading}
                        className="control-btn"
                    >
                        Next
                    </button>
                </div>

                {/* Download Button */}
                <button onClick={handleDownload} className="download-btn">
                    Download File
                </button>
            </div>

            {/* Document Viewer */}
            <div className="pdf-document-wrapper">
                {uri ? (
                    <Document 
                        file={uri} 
                        onLoadSuccess={onDocLoadSuccess}
                        loading={<div className="loading-text">Loading PDF...</div>}
                        error={<div className="error-text">Failed to load PDF. Please try downloading it instead.</div>}
                    >
                        <Page 
                            pageNumber={pageNumber} 
                            renderTextLayer={true} // Allows user to highlight text
                            renderAnnotationLayer={false} 
                            className="pdf-page"
                        />
                    </Document>
                ) : (
                    <p>No document URI provided.</p>
                )}
            </div>
        </div>
    );
}