# ADR 0002: Use Cloudinary for File Storage

## Context

Resource-Adda needs to handle user-uploaded documents, PYQs, and study materials. Storing these files locally on the backend server limits scalability, complicates deployments (e.g., containerization), and risks data loss if the server crashes.

## Decision

We will use **Cloudinary** for storing all uploaded files.

- The backend will use `multer` to handle multipart/form-data.
- Files will be uploaded via `multer-storage-cloudinary` directly from the backend to Cloudinary, ensuring no temporary files are written to the local disk.

## Consequences

### Positive

- The backend remains stateless, allowing it to be easily scaled or containerized via Docker.
- Cloudinary provides robust CDN delivery, optimizing file downloads for end-users.
- No local disk space limits to worry about.

### Negative

- Introduces a dependency on a third-party service.
- Cloudinary's free tier has storage and bandwidth limits, which may require monitoring or eventual upgrading.
