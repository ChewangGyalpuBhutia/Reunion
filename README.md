# Task Management API

## Overview
This is a comprehensive Task Management API built with Express, MongoDB, and TypeScript. The API provides user authentication and task management functionalities.

## Technologies Used
- Express.js
- MongoDB
- Mongoose
- TypeScript
- JWT (JSON Web Tokens)
- Bcrypt (for password hashing)
- Nodemailer (for OTP email verification)

## Features

### User Authentication
- User signup with email verification
- OTP-based email verification
- Secure login with JWT token generation
- Password hashing

### Task Management
- Create tasks
- Update tasks
- Delete tasks
- Filter and sort tasks
- Task dashboard with comprehensive analytics

## Environment Variables
Required environment variables:
- `DATABASE_URL`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `EMAIL`: Gmail account for sending OTPs
- `EMAIL_PASSWORD`: Gmail account password or app-specific password

## API Endpoints

### Authentication Endpoints

#### Signup
- **URL**: `/signup`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Responses**:
  - `201`: User registered successfully
  - `400`: User already registered
  - `500`: Internal server error

#### Verify OTP
- **URL**: `/verify-otp`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Responses**:
  - `200`: Email verified successfully
  - `400`: Invalid OTP
  - `500`: Error verifying OTP

#### Login
- **URL**: `/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Responses**:
  - `200`: Returns JWT token
  - `400`: Invalid credentials or unverified email
  - `500`: Login error

### Task Endpoints

#### Create Task
- **URL**: `/tasks`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "title": "Project Meeting",
    "startTime": "2023-06-15T10:00:00Z",
    "endTime": "2023-06-15T11:00:00Z",
    "priority": 2,
    "status": "pending"
  }
  ```
- **Responses**:
  - `201`: Task created successfully
  - `500`: Error creating task

#### Update Task
- **URL**: `/tasks/:id`
- **Method**: `PUT`
- **Request Body**: Same as create task
- **Responses**:
  - `200`: Task updated successfully
  - `500`: Error updating task

#### Delete Task
- **URL**: `/tasks/:id`
- **Method**: `DELETE`
- **Responses**:
  - `200`: Task deleted successfully
  - `500`: Error deleting task

#### Get Tasks
- **URL**: `/tasks`
- **Method**: `GET`
- **Query Parameters**:
  - `priority`: Filter by task priority
  - `status`: Filter by task status
  - `sortBy`: Sort tasks by a specific field
- **Responses**:
  - `200`: Returns list of tasks
  - `500`: Error retrieving tasks

#### Task Dashboard
- **URL**: `/tasks/dashboard`
- **Method**: `GET`
- **Responses**:
  - `200`: Returns comprehensive task analytics
    ```json
    {
      "totalCount": 10,
      "completedPercentage": 60,
      "pendingCount": 4,
      "averageActualTime": 2.5,
      "pendingTaskSummary": [...]
    }
    ```
  - `500`: Error retrieving dashboard summary

## Task Schema
- `title`: String (required)
- `startTime`: Date (required)
- `endTime`: Date (required)
- `priority`: Number (1-5)
- `status`: String ('pending' or 'finished')

## Test Data

### Sample Tasks for Testing

1. High Priority Task
```json
{
  "title": "Product Launch Preparation",
  "startTime": "2024-02-10T09:00:00Z",
  "endTime": "2024-02-15T17:00:00Z",
  "priority": 5,
  "status": "pending"
}
```

2. Medium Priority Task
```json
{
  "title": "Weekly Team Meeting",
  "startTime": "2024-02-12T14:00:00Z",
  "endTime": "2024-02-12T15:00:00Z",
  "priority": 3,
  "status": "pending"
}
```

3. Low Priority Task
```json
{
  "title": "Update Project Documentation",
  "startTime": "2024-02-13T10:00:00Z",
  "endTime": "2024-02-14T12:00:00Z",
  "priority": 1,
  "status": "finished"
}
```

4. Completed Task
```json
{
  "title": "Client Presentation Review",
  "startTime": "2024-02-05T11:00:00Z",
  "endTime": "2024-02-06T12:00:00Z",
  "priority": 4,
  "status": "finished"
}
```

### Bulk Test Data Creation Script
You can use this script to quickly populate your database with test tasks:

```javascript
const tasks = [
  {
    "title": "Product Launch Preparation",
    "startTime": "2024-02-10T09:00:00Z",
    "endTime": "2024-02-15T17:00:00Z",
    "priority": 5,
    "status": "pending"
  },
  {
    "title": "Weekly Team Meeting",
    "startTime": "2024-02-12T14:00:00Z",
    "endTime": "2024-02-12T15:00:00Z",
    "priority": 3,
    "status": "pending"
  },
  // ... add other tasks
];

// Use your API or MongoDB client to insert these tasks
```

## Installation

1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   ```
3. Create `.env` file with required environment variables
4. Run the application
   ```bash
   npm start
   ```

## Security Notes
- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- OTP-based email verification
- CORS enabled
- Environment variables for sensitive configurations

## Contribution
Pull requests are welcome. For major changes, please open an issue first to discuss proposed changes.

## License
[MIT](https://choosealicense.com/licenses/mit/)
