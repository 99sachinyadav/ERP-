import React from 'react'
import { useState } from 'react';
 import axios from 'axios';
 import { toast } from 'react-hot-toast';
 import { backendUrl } from '@/App';
 import ModuleState from './ui/module-state';

export const SpecialStudentMonitor = () => {


           const [specialStudents, setSpecialStudents] = useState([]);
     const [specialStudentsLoading, setSpecialStudentsLoading] = useState(false);
     const [specialStudentsError, setSpecialStudentsError] = useState("");

       const fetchSpecialStudents = async () => {
     setSpecialStudentsLoading(true);
     setSpecialStudentsError("");
     try {
         const response = await axios.get(backendUrl + '/api/getAllSpecialStudents', {
             headers: {
                 adminToken: localStorage.getItem('adminToken') ? localStorage.getItem('adminToken') : null,
             },
         });

         if(response.data?.success){
             setSpecialStudents(response.data.specialStudents || []);
         } else {
             setSpecialStudents([]);
             setSpecialStudentsError(response.data?.message || 'Unable to fetch special students.');
         }
     } catch (error) {
         const msg = error.response?.data?.message || 'An error occurred while fetching special students.';
         setSpecialStudentsError(msg);
         toast.error(msg);
     } finally {
         setSpecialStudentsLoading(false);
     }
    }

    React.useEffect(() => {
        fetchSpecialStudents();
    }, []);
  return (
     <div className="mt-6 rounded-lg border border-gray-300 bg-white p-3 shadow-sm">
                 <div className="mb-3 flex items-center justify-between">
                     <h3 className="text-sm font-semibold text-gray-700 sm:text-base">Special Student Records</h3>
                     <button
                         onClick={fetchSpecialStudents}
                         disabled={specialStudentsLoading}
                         className="rounded bg-gray-700 px-3 py-1 text-xs text-white transition hover:bg-gray-800 disabled:opacity-60 sm:text-sm"
                     >
                         {specialStudentsLoading ? 'Loading...' : 'Refresh'}
                     </button>
                 </div>
                 <div className="overflow-x-auto">
                     <table className="min-w-full border border-gray-300">
                         <thead className="bg-gray-100">
                             <tr>
                                 <th className="border px-2 py-2 text-left text-xs sm:text-sm">Name</th>
                                 <th className="border px-2 py-2 text-left text-xs sm:text-sm">Roll No</th>
                                 <th className="border px-2 py-2 text-left text-xs sm:text-sm">Year</th>
                                 <th className="border px-2 py-2 text-left text-xs sm:text-sm">Batch</th>
                                 <th className="border px-2 py-2 text-left text-xs sm:text-sm">Section</th>
                                 <th className="border px-2 py-2 text-left text-xs sm:text-sm">Remark</th>
                                 <th className="border px-2 py-2 text-left text-xs sm:text-sm">Date</th>
                             </tr>
                         </thead>
                         <tbody>
                             {specialStudentsLoading && (
                                 <tr>
                                     <td colSpan={7} className="p-4">
                                         <ModuleState type="loading" title="Loading special students" />
                                     </td>
                                 </tr>
                             )}
                             {!specialStudentsLoading && specialStudentsError && (
                                 <tr>
                                     <td colSpan={7} className="p-4">
                                         <ModuleState type="error" title="Unable to load special students" message={specialStudentsError} />
                                     </td>
                                 </tr>
                             )}
                             {!specialStudentsLoading && !specialStudentsError && specialStudents.length === 0 && (
                                 <tr>
                                     <td colSpan={7} className="p-4">
                                         <ModuleState type="empty" title="No special student records" message="Records will appear here once a student is moved to the special list." />
                                     </td>
                                 </tr>
                             )}
                             {!specialStudentsLoading && !specialStudentsError && specialStudents.map((entry) => (
                                 <tr key={entry._id || entry.rollno} className="bg-white">
                                     <td className="border px-2 py-2 text-xs sm:text-sm">{entry.name}</td>
                                     <td className="border px-2 py-2 text-xs sm:text-sm">{entry.rollno}</td>
                                     <td className="border px-2 py-2 text-xs sm:text-sm">{entry.Year}</td>
                                     <td className="border px-2 py-2 text-xs sm:text-sm">{entry.Batch}</td>
                                     <td className="border px-2 py-2 text-xs sm:text-sm">{entry.section}</td>
                                     <td className="border px-2 py-2 text-xs sm:text-sm">{entry.Remarks}</td>
                                     <td className="border px-2 py-2 text-xs sm:text-sm">{entry.Date ? new Date(entry.Date).toLocaleDateString() : '-'}</td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>     
  )
}


