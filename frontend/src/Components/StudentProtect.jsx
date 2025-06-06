import  { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
 

const StudentProtect = ({children}) => {

     const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(()=>{
       if(!token){
         navigate('/login')
       }
    },[token])
  return (
    <div>
      {children}
    </div>
   
  )
}

export default StudentProtect
