
import jwt from "jsonwebtoken"

const  adminAuth =  (req,res ,next)=>{
     try {
    const  { admintoken} = req.headers;
              // console.log(req.headers); // Log the entire headers object to debug
              // console.log(admintoken); // Log the admintokenspecifically if(!adminToken){
           if(!admintoken){
            return res.status(403).json({sucess:false,message:"admin credentials not found"});
           }
         const decodedToken =  jwt.verify(admintoken, process.env.JWT_SECRET)
             //console.log(decodedToken)
         if(decodedToken.id!==process.env.ADMIN_EMAIL+process.env.ADMIN_PASSWORD){
            return res.status(403).json({sucess:false,message:" invalid token"})
         }

       next();
     } catch (error) {
         console.log(error)
         return res.status(401).json({sucess:false,message:error.message})
     }
}


 export  { adminAuth};