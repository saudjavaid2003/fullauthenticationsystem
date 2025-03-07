import User from "../models/models";
import { catchasyncerror } from "../middleware/CatchAsyncError";
import { errormiddleware } from "../middleware/error";
import { sendEmail } from "../utils/sendEmail";
import twilio from "twilio"
const client=twilio(process.env.AUTH_SID,process.env.AUTH_TOKEN)
export const register = catchasyncerror(async (req, res, next) => {
    try {
        const { name, email, password, phone, verificationMethod} = req.body;


        if (!name || !email || !verificationMethod || !password || !phone) {
            return next(new errormiddleware("All fields are required", 400));
        }

        const validatePhoneNumber = (phoneNumber) => {
            const phoneRegex = /^\+923\d{9}$/;
            return phoneRegex.test(phoneNumber);
        };

        if (!validatePhoneNumber(phone)) {  // Fixed: Function call was empty
            return next(new errormiddleware("Phone number does not match the format", 400));
        }

        const existingUser = await User.findOne({
            $or: [
                {
                    email,
                    accountVerified: true,
                },
                {
                    phone,
                    accountVerified: true,
                },
            ],
        });

        if (existingUser) {
            return next(new errormiddleware("Phone or Email is already used.", 400)); // Fixed: Used `errormiddleware` instead of `ErrorHandler`
        }

        const registrationAttemptsByUser = await User.find({  // Fixed: Await added
            $or: [
                {
                    phone,
                    accountVerified: false, // Fixed: Changed `accountverified` to `accountVerified` (consistent with schema)
                },
                {
                    email,
                    accountVerified: false, // Fixed: Same typo fix
                },
            ],
        });

        if (registrationAttemptsByUser.length > 3) {
            return next(new errormiddleware("You have attempted more than three times. Please wait for an hour to register again.", 400));
        }

        const userData = {
            email,
            name,
            password,
            phone,
        };

        const user = await User.create(userData);
        const verificationCode = await  user.generateVerificationCode(); // Assumed method exists
        await user.save();
        sendVerificationCode(verificationMethod, verificationCode, email, phone);

        res.status(200).json({
            success: true, // Fixed: Changed `false` to `true`, assuming success
        });

    } catch (err) {
        next(err);
    }
});
async function sendVerificationCode(verificationMethod, verificationCode, email, phone) {
    try {
        if (verificationMethod === "email") {
            const message = generateEmailTemplate(verificationCode);
            await sendEmail({ email, subject: "Your verification code", message });
        } else if (verificationMethod === "phone") {
            const spacedCode = verificationCode.toString().split("").join(" ");
            await client.calls.create({
                twiml: `<Response><Say>Your verification code is ${spacedCode}. I repeat, your verification code is ${spacedCode}.</Say></Response>`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            });
        } else {
            throw new errormiddleware("You did not choose any verification method", 400);
        }
    } catch (error) {
        throw new errormiddleware(error.message, 500);
    }
}


function generateEmailTemplate(verificationCode) {
    return `
        <html>
        <head>
            <style>
                .container {
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                    background-color: #f9f9f9;
                }
                .header {
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    color: #333;
                }
                .content {
                    font-size: 16px;
                    color: #555;
                    margin-top: 20px;
                }
                .code {
                    font-size: 22px;
                    font-weight: bold;
                    color: #007bff;
                    text-align: center;
                    padding: 10px;
                    border: 1px dashed #007bff;
                    display: inline-block;
                    margin-top: 20px;
                }
                .footer {
                    font-size: 14px;
                    color: #777;
                    margin-top: 20px;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">Verify Your Email</div>
                <div class="content">
                    Hello, <br><br>
                    Thank you for registering. Please use the following verification code to complete your signup process:
                    <div class="code">${verificationCode}</div>
                    <br>
                    If you did not request this code, please ignore this email.
                </div>
                <div class="footer">Best regards, <br> Your Company Name</div>
            </div>
        </body>
        </html>
    `;
}
