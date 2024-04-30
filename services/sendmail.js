const dotenv = require('dotenv');
dotenv.config();
const EMAIL_FROM = process.env.EMAIL_FROM
const EMAIL_PASS = process.env.EMAIL_PASS
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const sendVerificationEmail = async (email, subject, message) => {
    const transporter = nodemailer.createTransport(
        smtpTransport({
            service: "gmail",
            auth: {
                user: EMAIL_FROM, 
                pass: EMAIL_PASS, 
            },
        })
    );

    const mailOptions = {
        from: EMAIL_FROM,
        to: email,
        subject: `${subject}`,
        text: `${message}`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
    }
};

module.exports={
    sendVerificationEmail,
}