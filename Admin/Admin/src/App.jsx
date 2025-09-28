import { Route ,Routes} from "react-router-dom"
import AdminLogin from "./pages/AdminLogin"
import Attendence from "./pages/Attendence"
import { Toaster} from "react-hot-toast"
 
import TeacherRegister from "./pages/TeacherRegister"
import Dashboard from "./pages/Dashboard"
import TeacherLogin from "./pages/TeacherLogin"
import Home from "./pages/Home"
import AdminProtect from "./Components/AdminProtect"
import TeacherProTect from "./Components/TeacherProTect"
import TeacherDashboard from "./pages/TeacherDashboard"
import AddSubjects from "./Components/AddSubjects"
import SeeAllStudent from "./Components/SeeAllStudent"
import MonitorAttendence from "./Components/MonitorAttendence"
 import ContactForm from "./pages/ContactForm"
import SendEmail from "./Components/SendEmail"
 

function App() {
 

  return (
    <div className=" w-full  ">

    <Toaster/>
       <Routes>
          <Route path="/admindashboard" element={
            <AdminProtect>
              <Home />
            </AdminProtect>
          }
           />
          <Route path="/" element={ <AdminLogin />} />
          <Route path="/teacherRegister" element={
            <AdminProtect>
              <TeacherRegister/>
            </AdminProtect>
          } />
           <Route path="/email" element={<ContactForm />} />
          <Route path="/teacherdashboard" element={
            <TeacherProTect>
              <TeacherDashboard/>
            </TeacherProTect>
          } />
           <Route path = '/addSubjects' element ={
            <TeacherProTect>
            <AddSubjects/>
            </TeacherProTect>
          } />
           <Route path = '/monitorStudents' element ={
            <TeacherProTect>
            <MonitorAttendence/>
            </TeacherProTect>
          } />

          <Route path = '/sendEmail' element ={
            <TeacherProTect>
            <SendEmail/>
            </TeacherProTect>
          } />
           <Route path = '/seeStudent' element ={
            <TeacherProTect>
            <SeeAllStudent/>
            </TeacherProTect>
          } />
          <Route path="/dashboard" element={
            <TeacherProTect>
              <Dashboard />
            </TeacherProTect>
          } />
          <Route path="/teacherlogin" element={<TeacherLogin />} />
       </Routes>

    </div>
  )
}
 
export default App
