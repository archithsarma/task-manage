const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const fs = require('fs');
const configFilePath = 'config.json';
const rawConfig = fs.readFileSync(configFilePath);
const config = JSON.parse(rawConfig);


const app = express();
const port = config.port.port || 3000;
app.use(bodyParser.json());
const db = mysql.createConnection(config.dbConfig);

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('DB_CONN_FAIL', err);
  } else {
    console.log('Connected to the database');
  }
});

// Define your API endpoint for creating tasks
app.post('/api/createTask', (req, res) => {
    const {
      task_name,
      task_details,
      deadline,
      completed,
      priority,
      set_reminder,
      taskStart,
      startDate,
    } = req.body;
  
    // Insert the task into the database
    const insertQuery = `INSERT INTO tasks (task_name, task_details, deadline, completed, priority, set_reminder, taskStart, startDate) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  
    db.query(
      insertQuery,
      [task_name, task_details, deadline, completed, priority, set_reminder, taskStart, startDate],
      (err, result) => {
        if (err) {
          console.error('Error inserting task:', err);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.status(201).json({ message: 'SUCCESS' });
        }
      }
    );
  });
  
app.put('/api/updateTask/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    const {
      task_name,
      task_details,
      deadline,
      completed,
      priority,
      set_reminder,
      taskStart,
      startDate,
    } = req.body;
  
    // Construct an update query based on the provided parameters
    const updateFields = [];
    const updateValues = [];
  
    if (task_name !== undefined) {
      updateFields.push('task_name = ?');
      updateValues.push(task_name);
    }
    if (task_details !== undefined) {
      updateFields.push('task_details = ?');
      updateValues.push(task_details);
    }
    if (deadline !== undefined) {
      updateFields.push('deadline = ?');
      updateValues.push(deadline);
    }
    if (completed !== undefined) {
      updateFields.push('completed = ?');
      updateValues.push(completed);
    }
    if (priority !== undefined) {
      updateFields.push('priority = ?');
      updateValues.push(priority);
    }
    if (set_reminder !== undefined) {
      updateFields.push('set_reminder = ?');
      updateValues.push(set_reminder);
    }
    if (taskStart !== undefined) {
      updateFields.push('taskStart = ?');
      updateValues.push(taskStart);
    }
    if (startDate !== undefined) {
      updateFields.push('startDate = ?');
      updateValues.push(startDate);
    }
  
    if (updateFields.length === 0) {
      // No valid fields to update were provided
      res.status(400).json({ error: 'NO_VALID_FIELDS' });
      return;
    }
  
    const updateQuery = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`;
  
    // Add the task ID to the updateValues array
    updateValues.push(taskId);
  
    db.query(updateQuery, updateValues, (err, result) => {
      if (err) {
        console.error('ERR_UPDATE_TASK', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json({ message: 'Task updated successfully' });
      }
    });
  });
  

app.get('/api/tasks', (req, res) => {
    const { page, perPage, startDate, taskStart } = req.query;
    const pageNumber = parseInt(page) || 1;
    const tasksPerPage = parseInt(perPage) || 10; // Default to 10 tasks per page
    const offset = (pageNumber - 1) * tasksPerPage;
  
    // Construct the SQL query to retrieve paginated tasks
    let selectQuery = `
      SELECT * FROM tasks
      WHERE 1
    `;
  
    const queryParams = [tasksPerPage, offset];
  
    // Check if startDate filter is provided
    if (startDate) {
      selectQuery += 'AND startDate = ? ';
      queryParams.push(startDate);
    }
  
    // Check if taskStart filter is provided
    if (taskStart) {
      selectQuery += 'AND taskStart = ? ';
      queryParams.push(taskStart);
    }
  
    selectQuery += 'LIMIT ? OFFSET ?';
  
    db.query(selectQuery, queryParams, (err, results) => {
      if (err) {
        console.error('ERR_RETRIEVE_TASKS', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json({ tasks: results });
      }
    });
  });
  
  app.get('/api/taskStatus', (req, res) => {
    const { date } = req.query;
    let query;
    const queryParams = [];
  
    // Function to validate the date format (MM-YYYY)
    function isValidDateFormat(inputDate) {
      const dateFormat = /^(0[1-9]|1[0-2])-\d{4}$/;
      return dateFormat.test(inputDate);
    }
  
    // Check if the date is provided and in the correct format
    if (date) {
      if (!isValidDateFormat(date)) {
        res.status(400).json({ error: 'DATE_ERR' }); 
        return; // Return to prevent further execution
      }
      query = `
        SELECT 
          SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) AS open_tasks,
          SUM(CASE WHEN completed = 1 THEN 0 ELSE 1 END) AS inprogress_tasks,
          SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS completed_tasks
        FROM tasks
        WHERE DATE_FORMAT(deadline, '%m-%Y') = ?
      `;
      queryParams.push(date);
    } else {
      query = `
        SELECT 
          SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) AS open_tasks,
          SUM(CASE WHEN completed = 1 THEN 0 ELSE 1 END) AS inprogress_tasks,
          SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS completed_tasks
        FROM tasks
      `;
    }
  
    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error('Error fetching task status:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        if (results.length === 0) {
          // No data found for the specified date
          res.status(404).json({ error: 'DATA_NOT_FOUND' });
          return;
        }
  
        const taskStatus = {
          date: date ? date : 'Overall',
          metrics: {
            open_tasks: results[0].open_tasks,
            inprogress_tasks: results[0].inprogress_tasks,
            completed_tasks: results[0].completed_tasks,
          },
        };
  
        res.json(taskStatus);
      }
    });
  });
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
