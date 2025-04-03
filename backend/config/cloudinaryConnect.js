import { v2 as cloudinary } from 'cloudinary';

const cloudinaryupload = async (image)=>{
    try {
        cloudinary.config({ 
            cloud_name: 'doveow47r', 
            api_key: '699297699595231', 
            api_secret: 'v2vWPNqwE4S7XT2G9CZ_VARFGo8' // Click 'View API Keys' above to copy your API secret
        });
        const uploadResult = await cloudinary.uploader
        .upload(image)
            
            
      return uploadResult
        
    } catch (error) {
        console.log(error)
    }
}

export {cloudinaryupload}