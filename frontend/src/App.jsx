  
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
 const App = () => {
   return (
     
    <div  >
       <Navbar/>
      
        <Routes>
          <Route path='/'  element={<Home/>}  />
          <Route path='/signup'  element={<Studentsignup/>}  />
           <Route path='/login'  element={<StudentLogin/>}/>
          <Route path='/profile' element={<Profile/>}/>
          <Route path='/about' element={<About/>}/>
          <Route path='/department' element={<Department/>}/>
          <Route path='/contact'  element={<Contact/>}/>
          <Route path='/sidepannel'  element={<Sidepannel/>}/>
        </Routes>
        <Footer/>
        
     </div>
  
   )
 }
 
 export default App
