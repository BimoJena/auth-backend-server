import express from 'express'
import { isAuthenticated, login, logout, register, resetPassword, sendResetOTP, sendVerifyOtp, verifyEmail } from '../controllers/auth.controller.js'
import userAuth from '../middlewares/userAuth.middleware.js'

const authRoute = express.Router()

authRoute.post('/register', register)
authRoute.post('/login', login)
authRoute.post('/logout', logout)
authRoute.post('/send-verify-otp', userAuth, sendVerifyOtp)
authRoute.post('/verify-account', userAuth, verifyEmail)
authRoute.get('/is-auth', userAuth, isAuthenticated)
authRoute.post('/send-resetPaswword-otp', sendResetOTP)
authRoute.post('/reset-password', resetPassword)


export default authRoute