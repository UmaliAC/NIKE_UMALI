
const emailjs = require("@emailjs/nodejs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
    path: path.join(__dirname, ".env")
});

const sendVerificationEmail = async (name, email, code) => {
    try {
        await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_TEMPLATE_ID,
            {
    name: name,
    email: email,
    to_email: email,
    verification_code: code
},
            {
                publicKey: process.env.EMAILJS_PUBLIC_KEY,
                privateKey: process.env.EMAILJS_PRIVATE_KEY
            }
        );

        console.log("Verification email sent successfully!");

    } catch (error) {
        console.error("Email sending failed:", error);
        throw error;
    }
};

module.exports = sendVerificationEmail;
