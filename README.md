# Task Management API

A simple API for task management built with Node.js, Express, and MySQL.

## Prerequisites

- Node.js
- MySQL

## Installation

1. Clone this repository:
    ```bash
    git clone [your-repo-link]
    ```

2. Navigate to the directory:
    ```bash
    cd [your-repo-directory]
    ```

3. Install the dependencies:
    ```bash
    npm install
    ```

4. Setup your MySQL database and make sure it's running.

5. Update the `config.json` with your database connection details and port:

    ```json
    {
      "dbConfig": {
        "host": "your_host",
        "user": "your_user",
        "password": "your_password",
        "database": "your_database"
      },
      "port": {
        "port": 3000
      }
    }
    ```

## Running the API

Start the server:
```bash
node [your-js-file-name]


## API Endpoints

### 1. Create Task

- **Endpoint**: `/api/createTask`
- **Method**: `POST`
- **Request Body**:

  | Parameter     | Type   | Description                |
  |---------------|--------|----------------------------|
  | `task_name`   | String | Name of the task           |
  | `task_details`| String | Details about the task     |
  | `deadline`    | Date   | Deadline for the task      |
  | `completed`   | Boolean| Task status                |
  | `priority`    | String | Task priority level        |
  | `set_reminder`| Boolean| Reminder status for task   |
  | `taskStart`   | Date   | Task start date            |
  | `startDate`   | Date   | Task registration date     |

- **Response**:
  - **Success**: 
    - Status Code: `201`
    - Body: `{ message: 'SUCCESS' }`
  - **Failure**:
    - Status Code: `500`
    - Body: `{ error: 'Internal Server Error' }`

### 2. Update Task

- **Endpoint**: `/api/updateTask/:taskId`
- **Method**: `PUT`
- **URL Parameters**: `taskId` (ID of the task to update)
- **Request Body**:

  | Parameter     | Type   | Description                |
  |---------------|--------|----------------------------|
  | `task_name`   | String | Name of the task           |
  | `task_details`| String | Details about the task     |
  | `deadline`    | Date   | Deadline for the task      |
  | `completed`   | Boolean| Task status                |
  | `priority`    | String | Task priority level        |
  | `set_reminder`| Boolean| Reminder status for task   |
  | `taskStart`   | Date   | Task start date            |
  | `startDate`   | Date   | Task registration date     |

- **Response**:
  - **Success**: 
    - Status Code: `200`
    - Body: `{ message: 'Task updated successfully' }`
  - **Failure**:
    - Status Code: `500`
    - Body: `{ error: 'Internal Server Error' }`

### 3. Get All Tasks

- **Endpoint**: `/api/tasks`
- **Method**: `GET`
- **Query Parameters**: 

  | Parameter   | Type   | Description                              |
  |-------------|--------|------------------------------------------|
  | `page`      | Number | Page number for pagination               |
  | `perPage`   | Number | Number of tasks per page                 |
  | `startDate` | Date   | Filter tasks by registration date        |
  | `taskStart` | Date   | Filter tasks by their start date         |

- **Response**:
  - **Success**: 
    - Status Code: `200`
    - Body: `{ tasks: [...] }` (Array of tasks)
  - **Failure**:
    - Status Code: `500`
    - Body: `{ error: 'Internal Server Error' }`

### 4. Get Task Status

- **Endpoint**: `/api/taskStatus`
- **Method**: `GET`
- **Query Parameters**: 

  | Parameter | Type   | Description                     |
  |-----------|--------|---------------------------------|
  | `date`    | String | Date in format MM-YYYY          |

- **Response**:
  - **Success**: 
    - Status Code: `200`
    - Body: `{ date: '...', metrics: { open_tasks: ..., inprogress_tasks: ..., completed_tasks: ... } }`
  - **Failure**:
    - Status Code: `500`
    - Body: `{ error: 'Internal Server Error' }`

