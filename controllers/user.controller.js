import {User} from '../models/users.model.js'

export const getUserData = async (req,res) => {
    try{
        const userId = req.userId
        const user = await User.findById(userId)
        if(!user){
            return res.status(400).json({status: false, message: "User not found."})
        }
        return res.status(200).json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified
            }
        })
    }catch(err){
        return res.status(500).json({status: false, message:"Internal Server Error.", error: message.err})
    }
}