import mongoose from "mongoose"

 export const connectdb = async ()=>{
    try {
        
     const connect=  await mongoose.connect(process.env.MONGOURI);
      //  console.log(connect);
        console.log("database connected")
    } catch (error) {
        console.log(error.message)
    }
 }