const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming you have a User model
const router = express.Router();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Register User Route
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, phone, password, confirmPassword } = req.body;

  // Check if all required fields are provided
  if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password, // Ensure password is hashed
    });

    // Send response with user details and token
    res.status(201).json({
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Error during registration:', error); // Log the error
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login User Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      // Successfully logged in
      res.status(200).json({
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      // Invalid credentials
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error during login:', error); 
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/customers', async (req, res) => {
  try {
    console.log('Fetching customers...');
    const customers = await User.find({});
    console.log('Fetched customers:', customers); 
    
    if (!customers || customers.length === 0) {
      console.log('No customers found'); 
      return res.status(404).json({ message: 'No customers found' });
    }

    res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;
