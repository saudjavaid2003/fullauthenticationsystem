import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 32
    },
    phone: {
        type: String,
        required: true
    },
    accountVerified: {
        type: Boolean,
        default: false
    },    

    verificationCode: {
        type: Number
    },
    verificationCodeExpire: {
        type: Date
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    },
    createdat:{
        type:Date,
        default:Date.now
    }
});

// ** Hash the password before saving **
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // Skip hashing if password is not modified

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ** Compare passwords **
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.methods.generateVerificationCode= async function(){
    function generateRandomFiveDigits(){
        const firstDigit = Math.floor(Math.random() * 9) + 1;

        const remainingDigits=Math.floor(Math.random()*10000).toString().padStart(4,0);
        return parseInt(firstDigit + remainingDigits);

    }
    const verificationCode=generateRandomFiveDigits();
    this.verificationCode=verificationCode;
    this.verificationCodeExpire = Date.now() + 5 * 60 * 1000;

    return verificationCode;

}

const User = mongoose.model("User", userSchema);
export default User;
