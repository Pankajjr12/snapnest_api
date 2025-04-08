import User from "../models/user.model.js";
import Follow from "../models/follow.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const registerUser = async (req, res) => {
  const { username, displayName, email, password } = req.body;

  // Ensure all fields are provided
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    // Check if the email already exists in the database
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    // Check if the username already exists in the database
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    // Hash the password
    const newHashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const user = await User.create({
      username,
      displayName,
      email,
      hashedPassword: newHashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Exclude the password from the response

    const { hashedPassword, ...detailsWithoutPassword } = user.toObject(); 
    // Return the user details without the password
    res.status(201).json({
      ...detailsWithoutPassword,
 // Send the list of categories
    });
  } catch (error) {
    // Handle unexpected errors
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password with hashed password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.hashedPassword
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    // Set the token in the cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Exclude password from the response
    const { hashedPassword, ...detailsWithoutPassword } = user.toObject();

    // Return the user details without password
    res.status(200).json(detailsWithoutPassword);
  } catch (error) {
    // Handle unexpected errors
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const logoutUser = async (req, res) => {
  res.clearCookie("token");

  res.status(200).json({ message: "Logout successful" });
};

export const getUser = async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });

  const { hashedPassword, ...detailsWithoutPassword } = user.toObject();

  const followerCount = await Follow.countDocuments({ following: user._id });
  const followingCount = await Follow.countDocuments({ follower: user._id });

  const token = req.cookies.token;

  if (!token) {
    res.status(200).json({
      ...detailsWithoutPassword,
      followerCount,
      followingCount,
      isFollowing: false,
    });
  } else {
    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
      if (!err) {
        const isExists = await Follow.exists({
          follower: payload.userId,
          following: user._id,
        });

        res.status(200).json({
          ...detailsWithoutPassword,
          followerCount,
          followingCount,
          isFollowing: isExists ? true : false,
        });
      }
    });
  }
};

export const followUser = async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });

  const isFollowing = await Follow.exists({
    follower: req.userId,
    following: user._id,
  });

  if (isFollowing) {
    await Follow.deleteOne({ follower: req.userId, following: user._id });
  } else {
    await Follow.create({ follower: req.userId, following: user._id });
  }

  res.status(200).json({ message: "Successful" });
};


// user.controller.js



