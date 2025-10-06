import React from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
const TeacherProTect = ({children}) => {
    const teacherToken = localStorage.getItem('teacherToken')
    const navigate = useNavigate()
    useEffect(() => {
        if (!teacherToken) {
            navigate('/teacherlogin')
        }
    }, [teacherToken, navigate])
  return (
    <div>
      {children}
    </div>
  )
}

export default TeacherProTect
