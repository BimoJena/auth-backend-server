import jwt from 'jsonwebtoken'

const userAuth = async (req, res, next) => {
    const {token} = req.cookies

    if(!token){
        return res.status(404).json({success: false, message: "Not Authorized Login Again."})
    }
    try{

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET) // check krega token fake h ya real and decode kr k de dega
        if(decodedToken.id){
            req.userId = decodedToken.id
        }
        else{
            return res.status(404).json({success: false, message: "Not Authorized Login Again."})
        }

        next()

    }catch(err){
        return res.status(500).json({success: false, message: "Internal Server Error.", error: err.message})
    }
}

export default userAuth