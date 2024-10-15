# Project 2: Collaborative Note-taking Web App

**Version**: 1.1  
**Due Date**: 14 October, midnight AOE  
**Group Project**

## Overview

This project involved developing a **collaborative note-taking web application**. The application supports **Markdown** for note-taking and provides **real-time collaboration** via WebSockets. Both frontend and backend development was built using **React.js**, **Tailwind CSS**, **Node.js**, and a **PostgreSQL** database normalized to 3NF.

### Key Features

- **Markdown support** using the Marked library.
- **Real-time collaboration** on shared notes using WebSockets.
- **Authentication**: Implement authentication via cookies with JWT, for user login and registration.
- **Responsive Design**: Ensure the app is responsive and accessible.
- **Database Operations**: Support full CRUD functionality for users, categories, and notes.

## Specifications

- **Frontend**: React.js with Tailwind CSS for styling.
- **Backend**: Node.js with REST API.
- **Database**: PostgreSQL (normalized to 3NF).
- **Real-time Collaboration**: Use WebSockets to support collaborative editing.
- **Authentication**: Cookies incorporating JWT tokens for authentication setup.
- **ORM**: Prisma.
- **Additional Features**: CI pipeline incorporating unit tests, resetting password via email

### Environment Setup

- Sensitive information is stored in **environment variables** using **Dotenv**.
- The use of managed services for infrastructure (e.g., Heroku) used for hosting, S3 used for data storage.


### Git Practice

- **Branching strategy**: Implemented a dev branch for working components and source branches to allow for individual feature implementations.

## Known Issues

**Full disclosure of known issues** 