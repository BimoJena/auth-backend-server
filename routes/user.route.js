import express from 'express'
import userAuth from '../middlewares/userAuth.middleware.js'
import { getUserData } from '../controllers/user.controller.js'

const userRoute = express.Router()

userRoute.get('/userData', userAuth, getUserData)

export default userRoute