import mongoose from "mongoose"

const connectDB = () => {
    mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log(`MONGODB connected successfully`)
    })
    .catch((err) => {
        console.log(`MONGODB connection failed: ${err}`)
    })
} 

export default connectDB