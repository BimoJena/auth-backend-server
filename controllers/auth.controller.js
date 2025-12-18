import { User } from '../models/users.model.js'
import bcyrpt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import transporter from '../config/nodemailer.js'
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js'
import { resend } from '../config/resend.js'


// register function
// export const register = async (req,res) => {
//     const {name, email, password} = req.body
//     if(!name || !email || !password){
//         return res.status(400).json({success: false, message: "All Fields Are Required."})
//     }
//     try{
//         const userExist = await User.findOne({email})
//         if(userExist){
//             return res.status(401).json({success: false, message: "User Already Exist."})
//         }
//         const hashPassword = await bcyrpt.hash(password, 10)

//         const user = new User({
//             name, 
//             email,
//             password: hashPassword
//         })
//         await user.save()

//         const token = jwt.sign(
//             {id: user._id},
//             process.env.JWT_SECRET,
//             {expiresIn: '7d'}
//         )

//         res.cookie('token', token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: process.env.NODE_ENV === 'production' ? 'none': 'strict',
//             maxAge: 7 * 24 * 60 * 60 * 1000 //7days in milisecond
//         })

//         // console.log("TRANSPORT AUTH:", transporter.options.auth); //debugging

//         // send welcome email 
//         const mailOptions = {
//             from: process.env.EMAIL_FROM,
//             to: email,
//             subject: 'Welcome to Authentication Project',
//             text: `Welcome ${name} to Authentication Project created by BIMOCHAN JENA. Your Account is successfully created on this website with your email: ${email}`
//         }
//         await transporter.sendMail(mailOptions)

//         return res.status(200).json({success: true, message: "User Registered Successfully."})

//     }catch(err){
//         return res.status(500).json({success: false, message: "Internal Server Error.", error: err.message})
//     }
// }

// ===================== REGISTER =====================
export const register = async (req, res) => {
    console.log("👉 REGISTER API HIT");
    console.log("📦 Request Body:", req.body);

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        console.log("❌ Missing fields");
        return res.status(400).json({
            success: false,
            message: "All Fields Are Required."
        });
    }

    try {
        console.log("🔍 Checking if user already exists...");
        const userExist = await User.findOne({ email });
        console.log("User exists:", !!userExist);

        if (userExist) {
            return res.status(401).json({
                success: false,
                message: "User Already Exist."
            });
        }

        console.log("🔐 Hashing password...");
        const hashPassword = await bcyrpt.hash(password, 10);
        console.log("Password hashed successfully");

        console.log("💾 Creating user...");
        const user = new User({
            name,
            email,
            password: hashPassword
        });

        await user.save();
        console.log("✅ User saved:", user._id.toString());

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        console.log("🍪 Setting auth cookie...");
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Send email asynchronously (fire & forget)
        resend.emails.send({
            from: "Auth System <onboarding@resend.dev>",
            to: user.email,
            subject: "Welcome to Authentication Project",
            html: `<h2>Welcome ${user.name} 🎉</h2>
            <p>Your account has been created successfully.</p>`
        }).catch(err => {
            console.error("Resend register mail error:", err.message);
        });

        return res.status(200).json({
            success: true,
            message: "User Registered Successfully."
        });

    } catch (err) {
        console.error("🔥 REGISTER ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
            error: err.message
        });
    }
};


// login function
export const login = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "All Fields Are Required." })
    }
    try {

        const userExist = await User.findOne({ email })
        if (!userExist) {
            return res.status(401).json({ success: false, message: "Invalid Credentials." })
        }

        const isMatch = await bcyrpt.compare(password, userExist.password)
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid Credentials." })
        }

        const token = jwt.sign(
            { id: userExist._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 //7days in milisecond
        })

        return res.status(200).json({ success: true, message: "User LoggedIn Successfully." })

    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error.", error: err.message })
    }
}


// logout function
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        })

        return res.status(200).json({ success: true, message: "LoggedOut Successfully." })
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error.", error: err.message })
    }
}


// Send EmailVerification OTP
// export const sendVerifyOtp = async (req,res) => {
//     try{
//         const userId = req.userId
//         const user = await User.findById(userId);

//         if(!user){
//             return res.status(404).json({success: false, message: "User not found"});
//         }

//         if(user.isAccountVerified){
//             return res.status(400).json({success: false, message: "Account Already Verified."})
//         }
//         const otp = String(Math.floor(100000 + Math.random() * 900000))

//         user.verifyOtp = otp
//         user.verifyOtpExipreAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours expiry

//         await user.save()

//         // send verification OTP
//         const mailOptions = {
//             from: process.env.EMAIL_FROM,
//             to: user.email,
//             subject: 'Account Verification OTP',
//             replyTo: process.env.EMAIL_REPLY_TO,
//             // text: `Your OTP is ${otp}. Verify your account using this OTP within 24hours from now.`,
//             html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
//         }
//         await transporter.sendMail(mailOptions)

//         return res.status(200).json({success: true, message: "Account Verification OTP sent successfully."})

//     }catch(err){
//         return res.status(500).json({success: false, message: "Internal Server Error.",error: err.message})
//     }
// }

// ===================== SEND VERIFY OTP =====================
export const sendVerifyOtp = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.isAccountVerified) {
      return res.status(400).json({ success: false, message: "Already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExipreAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // async mail
    resend.emails.send({
      from: "Auth System <onboarding@resend.dev>",
      to: user.email,
      subject: "Email Verification OTP",
      html: `<h2>Your OTP: ${otp}</h2>
             <p>Valid for 24 hours</p>`
    }).catch(err => {
      console.error("Verify OTP mail error:", err.message);
    });

    return res.status(200).json({
      success: true,
      message: "OTP generated successfully"
    });

  } catch (err) {
    console.error("SEND VERIFY OTP ERROR:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



// Get OTP and Verify Account
export const verifyEmail = async (req, res) => {
    const { otp } = req.body
    const userId = req.userId
    if (!userId || !otp) {
        return res.status(400).json({ success: false, message: "Missing Details" })
    }
    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found." })
        }

        if (user.verifyOtp == "" || user.verifyOtp != otp) {
            return res.status(401).json({ success: false, message: "Invalid OTP" })
        }
        if (user.verifyOtpExipreAt < Date.now()) {
            return res.status(401).json({ success: false, message: "OTP Expired." })
        }

        user.isAccountVerified = true
        user.verifyOtp = ""
        user.verifyOtpExipreAt = 0

        await user.save()
        return res.status(200).json({ success: true, message: "Email Verified Successfully." })

    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error.", error: err.message })
    }
}


// already loggedIn or not
export const isAuthenticated = async (req, res) => {
    try {
        return res.status(200).json({ success: true })
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message })
    }
}


// send OTP to reset password
// export const sendResetOTP = async (req,res) => {
//     const {email} = req.body
//     if(!email){
//         return res.status(400).json({success: false, message: "Email is required."})
//     }
//     try{

//         const user = await User.findOne({email})
//         if(!user){
//             return res.status(401).json({success: false, message: "User not found."})
//         }

//         const otp = String(Math.floor(100000 + Math.random() * 900000))
//         user.resetOtp = otp
//         user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000 // 15mins in milisecond

//         await user.save()

//         const mailOptions = {
//             from: process.env.EMAIL_FROM,
//             to: user.email,
//             subject: 'Reset Password OTP',
//             replyTo: process.env.EMAIL_REPLY_TO,
//             // text: `Here is the OTP: ${otp} for to reset your password. This OTP is valid for 15 mins only.`,
//             html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", email)
//         }
//         await transporter.sendMail(mailOptions)

//         return res.status(200).json({success: true, message: "Reset Password OTP sent successfully."})

//     }catch(err){
//         return res.status(500).json({success: false, message: "Internal Server Error", error: err.message})
//     }
// }

// ===================== SEND RESET OTP =====================
export const sendResetOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    resend.emails.send({
      from: "Auth System <onboarding@resend.dev>",
      to: user.email,
      subject: "Reset Password OTP",
      html: `<h2>OTP: ${otp}</h2>
             <p>Valid for 15 minutes</p>`
    }).catch(err => {
      console.error("Reset OTP mail error:", err.message);
    });

    return res.status(200).json({
      success: true,
      message: "OTP generated successfully"
    });

  } catch (err) {
    console.error("SEND RESET OTP ERROR:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};




// get OTP and Reset Password
export const resetPassword = async (req, res) => {
    const { otp, email, newPassword } = req.body
    if (!otp || !email || !newPassword) {
        return res.status(400).json({ success: false, message: "All Fields Are Required." })
    }

    try {

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found." })
        }
        if (user.resetOtp == "" || user.resetOtp != otp) {
            return res.status(401).json({ success: false, message: "Invalid OTP" })
        }
        if (user.resetOtpExpireAt < Date.now()) {
            return res.status(401).json({ success: false, message: "OTP Expired." })
        }

        const hashPassword = await bcyrpt.hash(newPassword, 10)
        user.password = hashPassword

        user.resetOtp = ""
        user.resetOtpExpireAt = 0

        await user.save()
        return res.status(200).json({ success: true, message: "Password Reset successfully." })

    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message })
    }
}

