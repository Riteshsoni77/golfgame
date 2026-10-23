import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/UserModel.js";

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select("-password -token")
            .populate("charity");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            message: "Failed to retrieve profile",
        });
    }
};


export const register = async (req, res) => {

    try {

        const { name, username, password /*,role */ } = req.body;
        


        if (!name || !username || !password) {
            return res.status(400).json({
                message: "Name, username and password are required"
            });
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            username,
            password: hashedPassword,
            // role
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                role: newUser.role,
                username: newUser.username
            }
        });

    } catch (error) {

        console.error("Register error:", error);

        return res.status(500).json({
            message: "Failed to register user"
        });
    }
};



export const login = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password ) {
            return res.status(400).json({
                message: "Username, password  are required",
            });
        }

        const allowedRoles = ["subscriber", "administrator"];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role",
            });
        }

        const user = await User.findOne({
            username: username.toLowerCase(),
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid username, password or role",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect || user.role !== role) {
            return res.status(401).json({
                message: "Invalid username, password or role",
            });
        }

        const token = crypto.randomBytes(20).toString("hex");

        user.token = token;
        await user.save();

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Failed to login",
        });
    }
};