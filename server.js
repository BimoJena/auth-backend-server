import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import connectDB from './config/db.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRoute from './routes/auth.route.js'
import userRoute from './routes/user.route.js'

const app = express()
const port = process.env.PORT || 4000
connectDB()

app.use(express.json())
app.use(cookieParser())

// const allowedOrigins = ['http://localhost:5173']
// const allowedOrigins = ['https://auth-bimo.vercel.app']

// app.use(cors({origin: allowedOrigins, credentials: true}))

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://auth-bimo.vercel.app'
  ],
  credentials: true
}));


// API END-POINTS
app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)

app.get('/', (req,res) =>{
    res.send(`app started`)
})

app.listen(port, () => {
    console.log(`server is running at port: ${port}`)
})
