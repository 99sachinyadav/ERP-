import { Route ,Routes} from "react-router-dom"
import AdminLogin from "./pages/AdminLogin"
import Attendence from "./pages/Attendence"
import { Toaster} from "react-hot-toast"
 
import TeacherRegister from "./pages/TeacherRegister"
import Dashboard from "./pages/Dashboard"
import TeacherLogin from "./pages/TeacherLogin"
import Home from "./pages/Home"
 
 

function App() {
 

  return (
    <div className=" w-full  ">

    <Toaster/>
       <Routes>
          <Route path="/admindashboard" element={<Home />} />
          <Route path="/" element={<AdminLogin />} />
          <Route path="/teacherRegister" element={<TeacherRegister/>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teacherlogin" element={<TeacherLogin />} />
       </Routes>

    </div>
  )
}
 
export default App
