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
    console.log("Signup api has been called")
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
  console.log("Verify otp api has been called")
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
  console.log("Login api has been called")
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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});