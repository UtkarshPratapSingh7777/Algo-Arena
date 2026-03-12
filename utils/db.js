import mongoose from "mongoose";
const connectdb=async()=>{
    const url=process.env.MONGODB_URL;
    try{
        await mongoose.connect(url);
        console.log("Connected to database")
    }catch(error){
        console.log("Connection Failed",error.message)
        process.exit(1);
    }
}
export default connectdb;