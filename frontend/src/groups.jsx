import React from 'react'
import './groups.css'
export  default function groups() {
      const data = {
        message: "groups and community",
        files: [
          {
            isPyq: false,
            _id: "66f5b5ea50a7e7c1aa7858af",
            fileUrl: "https://storage.googleapis.com/shayog-data/a45b5dda-8e94-4589-b5b2-c20187879b42.pdf",
            branch: "IT",
            sem: "3",
            unit: "1",
            fileName: "coding community",
            subject: "maths",
            uploadedAt: "2024-09-26T19:28:42.722Z",
            __v: 0
          },
          {
            isPyq: false,
            _id: "66f5b6bd4c214b6f668fa7ae",
            fileUrl: "https://storage.googleapis.com/shayog-data/5ae11226-cc8e-44bc-87d8-a55dc9a3075f.pdf",
            branch: "IT",
            sem: "3",
            unit: "2",
            fileName: "sports community",
            subject: "maths",
            uploadedAt: "2024-09-26T19:32:13.698Z",
            __v: 0
          }
        ]
      };
    
      return (
        <div className="container">
          <h1 className="title">{data.message}</h1>
          <ul className="file-list">
            {data.files.map((file) => (
              <li key={file._id} className="file-item">
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="file-link"
                >
                  {file.fileName}
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
    };
