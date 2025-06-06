 
 
import { contact } from "../assets/assets"
 

 

const Contact = () => {
  return (
    <div>
      
       <h1 className=" text-3xl sm:text-5xl   flex justify-center sm:mt-10 mt-8 font-bold  text-blue-900   text-wrap ">
             Contact <span className="text-red-500 ml-3"> Us</span>
          </h1>

      <div className="my-10 flex flex-col justify-center md:flex-row gap-20 mb-28">
        <img src={contact} alt="" className=" w-full md:max-w-[650px]" />
        <div className=" flex flex-col ml-5 items-start justify-center gap-3">
          <p className="text-xl  font-semibold text-gray-600">Our Store </p>
          <p className="text-gray-500 text-xl">Rajnagar Extention<br/>RKGITM</p>
          <p className="text-gray-500 text-xl">+91-9315966203<br/> sy7841846@gmail.com<br/>Ratnesh34@gmail.com<br/>raj67@gmail.com</p>
          <p className="font-semibold text-xl">Careers at RKGITM</p>
          <p className="text-gray-500 text-xl">Learn more about your academic opportunities</p>
          <button className="px-4 py-2 border border-gray-500 text-sm mt-4 hover:bg-black hover:text-white transition duration-400 ease-in">Explore more</button>
        </div>
      </div>
        
    </div>
  )
}

export default Contact
