# Task Management Backend API

## Overview
This backend API provides comprehensive task management functionality with various endpoints for creating, reading, updating, and deleting tasks, as well as generating dashboard summaries.

## Base URL
- Local Development: `http://localhost:3000`
- Deployed URL: `https://hd-phi.vercel.app`

## Database Schema
### Task Model
```typescript
{
  title: String (required)
  startTime: Date (required)
  endTime: Date (required)
  priority: Number (required, min: 1, max: 5)
  status: String (required, enum: ['pending', 'finished'])
}
```

## Endpoints

### 1. Create a Task
- **URL:** `/tasks`
- **Method:** `POST`
- **Request Body:**
```json
{
  "title": "Project Planning",
  "startTime": "2024-03-15T10:00:00Z",
  "endTime": "2024-03-15T12:00:00Z",
  "priority": 3,
  "status": "pending"
}
```
- **Success Response:** 
  - **Code:** 201
  - **Content:** Created task object

### 2. Update a Task
- **URL:** `/tasks/:id`
- **Method:** `PUT`
- **Request Body:** Same as create task
- **Success Response:**
  - **Code:** 200
  - **Content:** Updated task object

### 3. Delete a Task
- **URL:** `/tasks/:id`
- **Method:** `DELETE`
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "message": "Task deleted successfully" }`

### 4. Get Tasks
- **URL:** `/tasks`
- **Method:** `GET`
- **Query Parameters:**
  - `priority`: Filter by priority
  - `status`: Filter by status ('pending' or 'finished')
  - `sortBy`: Sort by a specific field
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of task objects

### 5. Get Dashboard Summary
- **URL:** `/tasks/dashboard`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:**
```json
{
  "totalCount": 10,
  "completedPercentage": 40,
  "pendingCount": 6,
  "averageActualTime": 2.5,
  "pendingTaskSummary": [
    {
      "priority": 3,
      "title": "Project Planning",
      "timeLapsed": 1.5,
      "timeToFinish": 0.5
    }
  ]
}
```

## Test Data
### Sample Tasks
```json
[
  {
    "title": "Weekly Team Meeting",
    "startTime": "2024-03-15T09:00:00Z",
    "endTime": "2024-03-15T10:00:00Z",
    "priority": 2,
    "status": "finished"
  },
  {
    "title": "Project Proposal Draft",
    "startTime": "2024-03-16T14:00:00Z",
    "endTime": "2024-03-16T16:00:00Z",
    "priority": 4,
    "status": "pending"
  },
  {
    "title": "Client Presentation Prep",
    "startTime": "2024-03-17T11:00:00Z",
    "endTime": "2024-03-17T13:00:00Z",
    "priority": 5,
    "status": "pending"
  }
]
```

## Error Handling
All endpoints return a 500 status code with an error message if something goes wrong.


## Recommended Tools
- Postman
- MongoDB Compass
- VSCode REST Client

## Future Improvements
- Add user authentication
- Implement more advanced filtering
- Add task duration validation
- Create more comprehensive error handling
