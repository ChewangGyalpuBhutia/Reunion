import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());

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
    const { email, password } = req.body;

    // Check if the user already exists
    const userCheckResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheckResult.rows.length > 0) {
      res.status(400).json({ error: 'User with this email already exists' });
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    try {
      const result = await pool.query(
        'INSERT INTO users (email, password, otp) VALUES ($1, $2, $3) RETURNING *',
        [email, hashedPassword, otp]
      );
      await sendOTPEmail(email, otp);
      res.status(201).json({ message: 'User registered. Please verify your email.' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error registering user' });
    }
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/verify-otp', async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user && user.otp === otp) {
      await pool.query('UPDATE users SET is_verified = true WHERE email = $1', [email]);
      res.status(200).json({ message: 'Email verified successfully' });
    } else {
      res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error verifying OTP' });
  }
});

app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
      if (!user.is_verified) {
        res.status(400).json({ error: 'Email not verified' });
        return
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
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