import jwt from "jsonwebtoken";
export const authenticate = async (req,res,next) => {
    try {
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({
                message : "User not Authenticated",
                success : false
            })
        }
        const decode = await jwt.verify(token ,  process.env.JWT_SECRET);
        if(!decode){
            return res.status(401).json({
                message : "Invalid Token",
                success : false
            })
        }
        req.userId = decode.userId;
        next();
    } catch (error) {
        return res.status(401).json({
            message : "Authentication failed",
            success : false
        })
    }
}