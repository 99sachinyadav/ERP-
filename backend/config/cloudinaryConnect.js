import { v2 as cloudinary } from 'cloudinary';

const cloudinaryupload = async (image)=>{
    try {
        cloudinary.config({ 
            cloud_name: 'doveow47r', 
            api_key: '', 
            api_secret: '' // Click 'View API Keys' above to copy your API secret
        });
        const uploadResult = await cloudinary.uploader
        .upload(image)
            
            
      return uploadResult
        
    } catch (error) {
        console.log(error)
    }
}

export {cloudinaryupload}
