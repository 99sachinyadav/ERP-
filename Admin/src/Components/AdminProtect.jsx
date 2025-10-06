import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
const AdminProtect = ({children}) => {

    const adminToken = localStorage.getItem('adminToken')
     const navigate = useNavigate()
    useEffect(()=>{
        if(!adminToken){
           navigate('/')
        }
    },[adminToken])
  return (
    <div>
      {children}
    </div>
  )
}

export default AdminProtect