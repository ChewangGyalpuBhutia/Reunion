# HighwayDelite Backend

This is the backend for the HighwayDelite login application with email OTP verification and JWT authentication. It is built using Node.js, Express, TypeScript, and MongoDB.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed on your machine.
- MongoDB Atlas account and cluster set up.
- Git installed on your machine.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/<your-username>/HighwayDeliteBackend.git
    cd HighwayDeliteBackend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory of the project and add the following environment variables:

    ```bash
    DATABASE_URL=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
    EMAIL=<your-email>
    EMAIL_PASSWORD=<your-email-password>
    JWT_SECRET=<your-jwt-secret>
    ```

4. Ensure your MongoDB Atlas cluster allows connections from your IP address.

5. Start the development server:

    ```bash
    npm run dev
    ```

## API Endpoints

Here are the available API endpoints:

- `POST /signup`: Register a new user and send an OTP for email verification.
- `POST /verify-otp`: Verify OTP for email verification.
- `POST /login`: Log in a user and generate JWT authentication.
