  
import Navbar from './Components/Navbar'

import "remixicon/fonts/remixicon.css"
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Studentsignup from './pages/Studentsignup'
import StudentLogin from './pages/StudentLogin'
import Profile from './pages/Profile'
import About from './pages/About'
import Department from './pages/Department'
import Contact from './pages/Contact'
import Sidepannel from './Components/Sidepannel'
import Footer from './Components/Footer'
import toast, { Toaster } from 'react-hot-toast';
import AttendenceUI from './Components/AttendenceUI'
import Attendence from './Components/Attendence'
 const App = () => {
   return (
     
<>
<div className=" w-full  ">
       <Navbar/>
      <Toaster/>
        <Routes>
          <Route path='/home'  element={<Home/>}  />
          <Route path='/'  element={<Studentsignup/>}  />
           <Route path='/login'  element={<StudentLogin/>}/>
          <Route path='/profile' element={<Profile/>}/>
          <Route path='/about' element={<About/>}/>
          <Route path='/department' element={<Department/>}/>
          <Route path='/contact'  element={<Contact/>}/>
          <Route path='/sidepannel'  element={<Sidepannel/>}/>
          <Route path='/attendance'  element={<AttendenceUI/>}/>
          <Route path='/viewattendance'  element={<Attendence/>}/>

        </Routes>
        <Footer/>
        
     </div>
</>
  
   )
 }
 
 export default App
