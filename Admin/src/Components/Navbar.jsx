// import { Link, useNavigate } from "react-router-dom";
// import { logo } from "../assets/assets";
// import { useState } from "react";

// const Navbar = () => {
//   const navigator = useNavigate();
//   const [Isopen, setIsopen] = useState(false);
 
  
//             const [colorbg, setcolorbg] = useState('');
//             const [user, setuser] = useState(false)
//             if (Isopen) {
//               document.body.style.overflow = "hidden";
//             } else {
//               document.body.style.overflow = "auto";
//             }

  
//   return (
//     <div   className="w-full sm:w-full h-[90px] sm:h-[110px]  flex start-0 shadow-md relative ">
//       <img
//         className="p-4   mt-2 sm:ml-10 sm:p-2 sm:pl-10 w-23 sm:w-40"
//         src={logo}
//         alt=""
//       />
//       <div className="mt-3 flex flex-col   sm:ml-2 leading-5 sm:pl-4 sm:leading-4">
//         <h1 className=" text-sm mt-3 sm:text-2xl font-[800]  text-blue-900 text-nowrap">
//           RAJ KUMAR GOEL
//         </h1>
//         <p className="font-[700] text-blue-900 sm:text-sm text-nowrap text-xs">
//           INSTITUTE OF TECHNOLOGY
//         </p>
//         <p className="font-[700] text-blue-900 sm:text-sm text-xs text-nowrap">
//           & MANAGEMENT (RKGITM)
//         </p>
//       </div>
       
//       <div className="h-full    font-[700] text-blue-900 w-[70%] ml-10 flex gap-20 justify-center items-center border-amber-600">
//         <Link  to="/" className="hidden sm:block   text-2xl">HOME</Link >
//         <Link to="/profile" className="hidden sm:block text-2xl">PROFILE</Link>
//         <Link  to="/about" className="hidden sm:block text-2xl">ABOUT</Link>
//         <Link  to="/department" className="hidden sm:block text-2xl">DEPARTMENT</Link>
//         <Link to="/contact" className="hidden sm:block text-2xl">CONTACT</Link>
//       </div>

//     <div className="  relative ml-[-110px] cursor-pointer sm:ml-10 sm:mt-8 mt-10 ">
    
//     <i  onClick={()=>{setuser(!user)}}  className="ri-user-line absolute top-0 left-4.5 sm:left-[-170px] sm:top-[-30px]  text-black sm:pr-[250px] sm:ml-10 sm:mt-8   cursor-pointer  text-2xl  sm:text-4xl"></i>
       
//        <div className={` ${user ? "block":"hidden"}   absolute  dropdown-menu right-[0px] sm:right-[120px] pt-4`}>
//                <div className="flex flex-col bg-slate-100 w-36  gap-2 text-gray-500 rounded py-3 px-5">
//                  <p className="cursor-pointer hover:text-black">My Profile</p>
//                  <p
//                    onClick={() =>{ navigator("/signup") ,setuser(false)}}
//                    className="cursor-pointer hover:text-black"
//                  >
//                    Signup
//                  </p>
//                  <p   className="cursor-pointer hover:text-black">
//                    Logout
//                  </p>
//                </div>
//              </div>
      
//     </div>

//       <i
//         onClick={() => {
//           setIsopen(true);
//         }}
//         className="ri-menu-3-line text-black  ml-17   mr-[5px] sm:ml-10 mt-8 sm:hidden text-4xl"
//       ></i>

//       <div
//         className={`absolute top-0 right-0 bottom-0 overflow-hidden h-screen overflow-y-hidden z-40 bg-white ${
//           Isopen ? "w-full" : "w-0 "
//         }`}
//       >
//         <div className=" flex flex-col w-full">
//           <div className=" flex gap-8 h-12   pl-3 items-center ">
//             <i
//               onClick={() => {
//                 setIsopen(false);
//               }}
//               className="ri-arrow-left-s-line text-4xl "
//             ></i>
//             <h1 className="text-3xl font-semibold"> Back</h1>
//           </div>
//           <hr className="w-full h-[1px] " />
//           <div onClick={()=>{navigator('/'),setIsopen(false), setcolorbg('home')}} className= {`flex gap-8 h-12 ${colorbg=='home'?"bg-pink-300 text-blue-900":"bg-white"}   pl-3 items-center `}>
//             <h1 className="text-md font-semibold ml-6"> HOME</h1>
//           </div>
//           <hr className="w-full h-[1px] " />
//           <div   onClick={()=>{navigator('/profile'),setIsopen(false), setcolorbg('profile')}} className= {`flex gap-8 h-12 ${colorbg=='profile'?"bg-pink-300 text-blue-900":"bg-white"}   pl-3 items-center `}>
//             <h1 className="text-md font-semibold ml-6"> PROFILE</h1>
//           </div>
//           <hr className="w-full h-[1px] " />
//           <div   onClick={()=>{navigator('/department'),setIsopen(false), setcolorbg('department')}} className= {`flex gap-8 h-12 ${colorbg=='department'?"bg-pink-300 text-blue-900":"bg-white"}   pl-3 items-center `}>
//             <h1 className="text-md font-semibold ml-6"> DEPARTMENT</h1>
//           </div>
//           <hr className="w-full h-[1px] " />
//           <div  onClick={()=>{navigator('/about'),setIsopen(false), setcolorbg('about')}} className= {`flex gap-8 h-12 ${colorbg=='about'?"bg-pink-300 text-blue-900":"bg-white"}   pl-3 items-center `}>
//             <h1 className="text-md font-semibold ml-6"> ABOUT</h1>
//           </div>
//           <hr className="w-full h-[1px] " />
//           <div  onClick={()=>{navigator('/contact'),setIsopen(false), setcolorbg('contact')}}  className= {`flex gap-8 h-12 ${colorbg=='contact'?"bg-pink-300 text-blue-900":"bg-white"}   pl-3 items-center `}>
//             <h1 className="text-md font-semibold ml-6"> CONTACT</h1>
//           </div>
//           <hr className="w-full h-[1px] " />
//         </div>
//       </div>

     

      
//     </div>
//   );
// };

// export default Navbar;