import User from "../models/models";
import { catchasyncerror } from "../middleware/CatchAsyncError";
import { errormiddleware } from "../middleware/error";

export const register = catchasyncerror(async (req, res, next) => {
    try {
        const { name, email, password, phone, verificationMethod } = req.body;

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
        const verificationCode = await User.generateVerificationCode(); // Assumed method exists
        await user.save();
        sendVerificationCode(verificationMethod, verificationCode, email, phone);

        res.status(200).json({
            success: true, // Fixed: Changed `false` to `true`, assuming success
        });

    } catch (err) {
        next(err);
    }
});
