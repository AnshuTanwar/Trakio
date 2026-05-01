const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

// Serve frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) =>
    res.sendFile(
      path.resolve(__dirname, '../', 'frontend', 'dist', 'index.html')
    )
  );
} else {
  app.get('/', (req, res) => {
    res.send('Trakio Task Management API Running');
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
