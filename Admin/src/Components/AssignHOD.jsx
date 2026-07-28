import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { backendUrl } from '@/App';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";

const departments = ["AIML/CSE/IT", "ECE/EN", "APPLIED/STAFF", "ADMINISTRATOR"];

const AssignHOD = () => {
    const [email, setEmail] = useState("");
    const [department, setDepartment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAssign = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(backendUrl + '/api/assignHOD', 
                { teacheremail: email, department },
                { headers: { adminToken: localStorage.getItem('adminToken') } }
            );
            if (response.data.sucess) {
                toast.success(response.data.message);

                setEmail("");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to assign HOD");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-md mx-auto mt-10">
            <CardHeader>
                <CardTitle>Assign Department HOD</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAssign} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Teacher Email</label>
                        <Input 
                            type="email" 
                            placeholder="teacher@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Department</label>
                        <select 
                            className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        >
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Assigning..." : "Assign HOD"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default AssignHOD;
