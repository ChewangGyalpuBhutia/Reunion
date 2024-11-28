import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
console.log("hello you have deployed the code");

// Use CORS middleware to allow all origins
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL as string)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Define User schema and model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String },
  is_verified: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`,
  });
};

app.post('/signup', async (req: Request, res: Response) => {
  try {
    console.log("Signup API has been called");
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    const otp = generateOTP();
    if (existingUser) {
      if (existingUser.is_verified) {
        res.status(400).json({ message: 'User already registered and verified.' });
      } else {
        existingUser.otp = otp;
        await existingUser.save();
        await sendOTPEmail(email, otp);
        res.status(200).json({ message: 'OTP resent. Please verify your email.' });
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        email,
        password: hashedPassword,
        otp,
      });
      await newUser.save();
      await sendOTPEmail(email, otp);
      res.status(201).json({ message: 'User registered. Please verify your email.' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/verify-otp', async (req: Request, res: Response) => {
  console.log("Verify OTP API has been called");
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && user.otp === otp) {
      user.is_verified = true;
      user.otp = undefined;
      await user.save();
      res.status(200).json({ message: 'Email verified successfully' });
    } else {
      res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error verifying OTP' });
  }
});

app.post('/login', async (req: Request, res: Response) => {
  console.log("Login API has been called");
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      if (!user.is_verified) {
        res.status(400).json({ error: 'Email not verified' });
        return;
      }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
      res.status(200).json({ token });
    } else {
      res.status(400).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

app.get('/test', async (req: Request, res: Response) => {
  console.log("Test API has been called");
  try {
    res.status(200).json({ message: 'Test API called successfully' });
  }
  catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Define Task schema and model
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  priority: { type: Number, required: true, min: 1, max: 5 },
  status: { type: String, required: true, enum: ['pending', 'finished'] },
});

const Task = mongoose.model('Task', taskSchema);

// Create a new task
app.post('/tasks', async (req: Request, res: Response) => {
  try {
    const { title, startTime, endTime, priority, status } = req.body;
    console.log(title, startTime, endTime, priority, status);

    const newTask = new Task({ title, startTime, endTime, priority, status });
    console.log(newTask)
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Error creating task' });
  }
});

// Update a task
app.put('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, startTime, endTime, priority, status } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(id, { title, startTime, endTime, priority, status }, { new: true });
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Error updating task' });
  }
});

// Delete a task
app.delete('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting task' });
  }
});

// Get tasks with filtering and sorting
app.get('/tasks', async (req: Request, res: Response) => {
  try {
    const { priority, status, sortBy } = req.query;
    const filter: any = {};
    if (priority) filter.priority = priority;
    if (status) filter.status = status;
    const tasks = await Task.find(filter).sort(sortBy ? { [sortBy as string]: 1 } : {});
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving tasks' });
  }
});

// Get task dashboard summary
app.get('/tasks/dashboard', async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find();
    const totalCount = tasks.length;
    const completedCount = tasks.filter(task => task.status === 'finished').length;
    const pendingCount = totalCount - completedCount;
    const completedPercentage = (completedCount / totalCount) * 100;
    const pendingTasks = tasks.filter(task => task.status === 'pending');

    const totalActualTime = tasks.filter(task => task.status === 'finished').reduce((acc, task) => {
      return acc + (new Date(task.endTime).getTime() - new Date(task.startTime).getTime()) / (1000 * 60 * 60);
    }, 0);
    const averageActualTime = completedCount ? totalActualTime / completedCount : 0;

    const currentTime = new Date();
    const pendingTaskSummary = pendingTasks.map(task => {
      const timeLapsed = (currentTime.getTime() - new Date(task.startTime).getTime()) / (1000 * 60 * 60);
      const timeToFinish = Math.max((new Date(task.endTime).getTime() - currentTime.getTime()) / (1000 * 60 * 60), 0);
      return {
        priority: task.priority,
        title: task.title,
        timeLapsed,
        timeToFinish,
      };
    });

    res.status(200).json({
      totalCount,
      completedPercentage,
      pendingCount,
      averageActualTime,
      pendingTaskSummary,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving task dashboard summary' });
  }
});

// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });
export default app;