import User from "../model/User.model.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

const registerUser = async (req, res) => {
    // get data
    const { name, email, password } = req.body;

    // validate data
    if (!name || !email || !password) {
        res.status(400).json({
            message: "All Fields are required",
            success: false
        })
    }

    try {
        // check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(401).json({
                message: "User already exists!",
                success: false
            })
        }

        // create user if not registered
        const user = await User.create({
            name,
            email,
            password
        })

        console.log(user);

        // if user not registered
        if (!user) {
            res.status(400).json({
                message: "User not registered",
            })
        }

        // create token
        const token = crypto.randomBytes(32).toString("hex")
        console.log("token:", token)

        // save token to the db
        user.verificationToken = token;

        // save all
        user.save();

        // send email

        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOSTNAME,
            port: process.env.MAILTRAP_PORT,
            secure: false, // true for port 465, false for other ports
            auth: {
                user: process.env.MAILTRAP_USERNAME,
                pass: process.env.MAILTRAP_PASSWORD,
            },
        });

        // 2. create mailoptions
        const mailOptions = {
            from: process.env.MAILTRAP_SENDEREMAIL,
            to: user.email,
            subject: "Verify Your Email",
            text: `Click the link below to verify your email or copy and paste it into your browser: 
            ${process.env.BASE_URL}/api/v1/users/verify/${token}`,
            html: `
                <h2>Email Verification</h2>
                <p>Click the button below to verify your email:</p>
                <a href="${process.env.BASE_URL}/api/v1/users/verify/${token}" 
                   style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; 
                          text-decoration: none; border-radius: 5px;">
                    Verify Email
                </a>
                <p>If the button doesn't work, copy and paste the following link into your browser:</p>
                <p><a href="${process.env.BASE_URL}api/v1/users/verify/:${token}">
                    ${process.env.BASE_URL}/api/v1/users/verify/${token}
                </a></p>
            `,
        };

        // send email
        await transporter.sendMail(mailOptions);

        res.status(201).json({
            message: "User registered successfully!",
            success: true
        })
    } catch (error) {
        console.log("Internal server error", error);

        res.status(500).json({
            message: "Internal server error",
            error,
            success: false
        })
    }

}

const verifyUser = async function (req, res) {
    // get token from url
    const { token } = req.params;
    console.log(token);

    // validate
    if (!token) {
        return res.status(400).json({
            message: "Invalid token",
        });
    }

    // find user based on token
    const user = await User.findOne({ verificationToken: token });

    // if not handle edge case 
    if (!user) {
        return res.status(400).json({
            message: "User not registered",
        });
    }
    // set isVerified field to true
    user.isVerified = true

    // remove verification token
    user.verificationToken = undefined;

    // save
    await user.save();

    // return response
    res.status(210).json({
        message: "User Verified successfully!",
        success: true
    })
    console.log('User Verified successfully!');

}

const login = async function (req, res) {
    // get data
    const { email, password } = req.body;

    // validate
    if (!email || !password) {
        res.status(400).json({
            message: "All fields are required",
            success: false
        })
    }

    try {
        const user = await User.findOne({ email })
        if (!user) {
            res.status(400).json({
                message: "User not registered",
                success: false
            })
        }

        // compare password 
        const isMatch = bcrypt.compare(password, user.password);
        console.log(isMatch);

        if (!isMatch) {
            res.status(400).json({
                message: "Invalid password",
                success: false
            })
        }

        // create token
        const token = jwt
            .sign(
                {
                    id: user.id,
                    role: user.role
                },
                process.env.JWTSECRET.toString(),
                {
                    expiresIn: "12h"
                }
            );

        // set cookies
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        }

        res.cookie("token", token, cookieOptions);

        // return status
        res.status(202).json({
            message: "Login Successfull!",
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role
            }
        });

        console.log('Login Successfull!');

    } catch (error) {
        console.log('Internal server error while logging', error);
        res.status(500).json({
            message: "Internal Server error while logging",
            success: false,
            error,
        })
    }

}
export { registerUser, verifyUser,login };
