import React from 'react'
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ChangeStudentSection = () => {
    const [year, setyear] = React.useState('');
    const [batch, setbatch] = React.useState('');
    const [section, setsection] = React.useState('');
    const [students, setstudent] = React.useState([]);
    const [subjects, setsubjects] = React.useState([]);
    const [teacher, setteacher] = React.useState('');
    const [newSection, setNewSection] = React.useState({});
    const [newYear,setNewYear] = React.useState({})
    const [changed, setchanged] = useState({})
    const changeSection = async (studentId ) => {

        //    console.log(newSection[studentId] , studentId,newYear[studentId]);
           try {

            const response = await axios.put('http://localhost:4000/api/changeStudentSection',{
                year,
                batch,
                section,
                newsection:newSection[studentId],
                newyear:newYear[studentId],
                studentId,

            },{
                headers:{
                    adminToken:localStorage.getItem('adminToken')
                }
            })

            console.log(response );
              if(response.data.sucess===true){
                toast.success(response.data.message);
                setchanged(prev=>({...prev, [studentId]: true}));
                
             }
            
      
            
        
               
              
           } catch (error) {
             setchanged(prev => ({ ...prev, [studentId]: false }));
             console.log(error.message);
             toast(error.response?.data?.message || "An error occurred while updating Section or Year.")
           }


    }  



   const showStudents = async ()=>{
    try {
     
        // console.log(localStorage.getItem('teacherToken'), localStorage.getItem('adminToken'));
         
        const responce = await axios.get('http://localhost:4000/api/gelStudentBySection', {
            headers: {
                // teachertoken: localStorage.getItem('teacherToken')? localStorage.getItem('teacherToken') : null,
                adminToken: localStorage.getItem('adminToken')? localStorage.getItem('adminToken') : null,
            },
            params: {
                year: year,
                batch: batch,
                section: section,
            },
        });
             console.log(responce.data)

           
       // console.log(responce.data.findSection.students);
        if(responce.data.sucess === false){
            toast.error(responce.data.message)
            console.log(responce.data.message)
        }
        else{
           setstudent(responce.data.findSection.students)
           setsubjects(responce.data.findSection.subjects)
           setteacher(responce.data.findSection.teacher?.name || "Unknown Teacher")
           toast.success(responce.data.message)
        }
        

    } catch (error) {
          // Check if the error has a response and a message
        // console.error(error);
        toast.error(error.response?.data?.message || "An error occurred while fetching students.");
    }
 }

return (
    <div className="p-2 sm:p-4">
        <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg shadow-md bg-white">
                <thead className="border border-gray-300 bg-gray-200 w-full">
                    <tr className="bg-gray-100">
                        <th className="p-1 sm:p-3 border-b w-1/4 min-w-[100px]">
                            <select
                                value={year}
                                onChange={(e) => setyear(e.target.value)}
                                className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-base"
                            >
                                <option id="first_year" value="Ist">Ist</option>
                                <option id="second_year" value="IInd">IInd</option>
                                <option id="third_year" value="IIIrd">IIIrd</option>
                                <option id="fourth_year" value="IVth">IVth</option>
                            </select>
                        </th>
                        <th className="p-1 sm:p-3 border-b min-w-[100px]">
                            <input
                                type="text"
                                placeholder="Batch"
                                value={batch}
                                onChange={e => setbatch(e.target.value)}
                                className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-base"
                            />
                        </th>
                        <th className="p-1 sm:p-3 border-b min-w-[100px]">
                            <input
                                type="text"
                                placeholder="Section"
                                value={section}
                                onChange={e => setsection(e.target.value)}
                                className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-base"
                            />
                        </th>
                        <th className="p-1 sm:p-3 border-b min-w-[100px]">
                            <button
                                onClick={() => {
                                    setchanged({}); // Reset changed status on new showStudents call
                                    showStudents();
                                }}
                                className="bg-blue-600 text-white px-2 py-1 sm:px-4 sm:py-2 rounded hover:bg-blue-700 transition w-full text-xs sm:text-base"
                            >
                                Show Students
                            </button>
                        </th>
                    </tr>
                </thead>
            </table>

            <table className="min-w-full border border-gray-300 rounded-lg shadow-md bg-white mt-4">
                <thead className="border border-gray-300 bg-gray-200 w-full">
                    <tr className="bg-gray-100">
                        <th className="p-1 sm:p-3 border text-left min-w-[80px] sm:min-w-[100px] text-xs sm:text-base">Name</th>
                        <th className="p-1 sm:p-3 border text-left min-w-[80px] sm:min-w-[100px] text-xs sm:text-base">Roll No</th>
                        <th className="p-1 sm:p-3 border text-left min-w-[80px] sm:min-w-[100px] text-xs sm:text-base">Email</th>
                        <th className="p-1 sm:p-3 border text-left min-w-[50px] sm:max-w-[50px] text-xs sm:text-base">Section</th>
                        <th className="p-1 sm:p-3 border text-left min-w-[80px] sm:min-w-[120px] text-xs sm:text-base">New Section</th>
                        <th className="p-1 sm:p-3 border text-left min-w-[80px] sm:min-w-[120px] text-xs sm:text-base">New Year</th>
                        <th className="p-1 sm:p-3 border text-left min-w-[80px] sm:min-w-[120px] text-xs sm:text-base">Change</th>
                    </tr>
                </thead>
                <tbody>
                    {students.length > 0 && students.map((student, idx) => (
                        <tr key={idx} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                            <td className="p-1 sm:p-3 border w-1/4 min-w-[80px] sm:min-w-[100px] text-xs sm:text-base">{student.name}</td>
                            <td className="p-1 sm:p-3 border w-1/4 min-w-[80px] sm:min-w-[100px] text-xs sm:text-base">{student.rollno}</td>
                            <td className="p-1 sm:p-3 border w-1/4 min-w-[80px] sm:min-w-[100px] text-xs sm:text-base">{student.email}</td>
                            <td className="p-1 sm:p-3 border w-1/4 min-w-[50px] sm:max-w-[50px] text-xs sm:text-base">{student.section}</td>
                            <td className="p-1 sm:p-3 border w-1/4 min-w-[80px] sm:min-w-[120px] text-xs sm:text-base">
                                <input
                                    type="text"
                                    value={newSection[student._id]??''}
                                    onChange={(e) => setNewSection(prev=>({...prev , [student._id]: e.target.value??''}))}
                                    className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-base"
                                />
                            </td>
                            <td className="p-1 sm:p-3 border w-1/4 min-w-[80px] sm:min-w-[120px] text-xs sm:text-base"> 
                                <select
                                    value={newYear[student._id]??''}
                                    onChange={(e) => setNewYear(prev=>({...prev , [student._id]: e.target.value??''}))}
                                    className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-base">
                                    <option value="Ist">Ist</option>
                                    <option value="IInd">IInd</option>
                                    <option value="IIIrd">IIIrd</option>
                                    <option value="IVth">IVth</option>
                                </select>
                            </td>
                            <td className="p-1 sm:p-3 border w-1/4 min-w-[80px] sm:min-w-[120px] text-xs sm:text-base">
                                <button
                                    onClick={() => !changed[student._id] && changeSection(student._id)}
                                    className={`${changed[student._id] ? "bg-green-600" : "bg-blue-600"} text-white px-2 py-1 sm:px-4 sm:py-2 rounded hover:bg-green-700 transition w-full text-xs sm:text-base`}
                                >
                                    {changed[student._id] ? 'Changed' : 'Change'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
)
}

export default ChangeStudentSection