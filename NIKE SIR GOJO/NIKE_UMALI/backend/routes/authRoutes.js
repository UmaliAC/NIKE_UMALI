
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const crypto = require("crypto");
const sendVerificationEmail = require("../emailService");

const router = express.Router();

// SIGN UP
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all fields."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationCode = crypto
            .randomInt(100000, 1000000)
            .toString();

        const newUser = new User({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            isVerified: false,
            verificationCode,
            verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000)
        });

        await newUser.save();

        console.log("EMAIL BEING SENT:", normalizedEmail);

        try {
            await sendVerificationEmail(
                name,
                normalizedEmail,
                verificationCode
            );
        } catch (emailError) {
    console.error("EMAILJS ERROR DETAILS:", emailError);

    await User.deleteOne({ _id: newUser._id });

    return res.status(500).json({
        success: false,
        message: emailError.message || "Unable to send verification email."
    });
}

        res.status(201).json({
            success: true,
            message: "Verification email sent successfully!"
        });

    } catch (error) {
        console.error("Signup Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter your email and password."
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        if (!user.isVerified) {
    return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in."
    });
}

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        console.log("SUCCESSFUL LOGIN:", user.email);

res.status(200).json({
    success: true,
    message: "Login successful!",
    user: {
        id: user._id,
        name: user.name,
        email: user.email
    }
});

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

// VERIFY EMAIL
router.post("/verify-email", async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: "Please enter your verification code."
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Account not found."
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified."
            });
        }

        // CHECK VERIFICATION CODE
        const submittedCode = String(code).trim();
        const savedCode = String(user.verificationCode || "").trim();

        console.log("SUBMITTED CODE LENGTH:", submittedCode.length);
        console.log("SAVED CODE LENGTH:", savedCode.length);
        console.log("CODES MATCH:", savedCode === submittedCode);
        console.log("CODE EXPIRED:",
            !user.verificationCodeExpires ||
            user.verificationCodeExpires < new Date()
        );

        if (
            savedCode !== submittedCode ||
            !user.verificationCodeExpires ||
            user.verificationCodeExpires < new Date()
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification code."
            });
        }

        // VERIFY ACCOUNT
        user.isVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpires = null;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Email verified successfully! You can now log in."
        });

    } catch (error) {
        console.error("Verification Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

// RESEND VERIFICATION EMAIL
router.post("/resend-verification", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Account not found."
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "This email is already verified."
            });
        }

        const verificationCode = crypto
            .randomInt(100000, 1000000)
            .toString();

        user.verificationCode = verificationCode;
        user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

        await user.save();

        console.log("RESEND ROUTE TRIGGERED:", normalizedEmail);

        await sendVerificationEmail(
            user.name,
            user.email,
            verificationCode
        );

        res.status(200).json({
            success: true,
            message: "A new verification code has been sent!"
        });

    } catch (error) {
        console.error("Resend Email Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to resend verification email."
        });
    }
});

module.exports = router;
