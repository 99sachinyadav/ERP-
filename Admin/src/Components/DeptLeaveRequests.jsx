import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { backendUrl } from "@/App";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";

const DeptLeaveRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [remarks, setRemarks] = useState({});

    const department = localStorage.getItem("teacherdepartment");

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${backendUrl}/api/leaves/hod/pending`, {
                params: { department },
                headers: { teachertoken: localStorage.getItem("teacherToken") }
            });
            if (res.data.success) {
                setRequests(res.data.leaveRequests);
            }
        } catch (error) {
            toast.error("Failed to fetch department leaves");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (department) fetchRequests();
    }, [department]);

    const handleAction = async (id, action) => {
        try {
            const endpoint = action === "forward" ? "forward" : "reject";
            const res = await axios.put(`${backendUrl}/api/leaves/hod/${id}/${endpoint}`, 
                { remark: remarks[id] || "", teacherId: localStorage.getItem("teacherId") },
                { headers: { teachertoken: localStorage.getItem("teacherToken") } }
            );
            if (res.data.success) {
                toast.success(res.data.message);
                fetchRequests();
            }
        } catch (error) {
            toast.error("Action failed");
        }
    };

    if (!department) return <div>No department assigned to you.</div>;

    return (
        <Card className="w-full mt-6">
            <CardHeader>
                <CardTitle>Department Leave Requests ({department})</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? <p>Loading...</p> : (
                    <div className="space-y-4">
                        {requests.length === 0 ? <p>No pending requests</p> : requests.map(req => (
                            <div key={req._id} className="border p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex-1">
                                    <p className="font-bold">{req.teacher?.name} ({req.leaveType})</p>
                                    <p className="text-sm text-gray-600">{new Date(req.fromDate).toLocaleDateString()} to {new Date(req.toDate).toLocaleDateString()}</p>
                                    <p className="text-sm bg-slate-100 p-2 rounded mt-2">{req.reason}</p>
                                </div>
                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                    <Input 
                                        placeholder="Remark" 
                                        className="w-full"
                                        value={remarks[req._id] || ""}
                                        onChange={(e) => setRemarks({...remarks, [req._id]: e.target.value})}
                                    />
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="default" 
                                            className="bg-green-600 hover:bg-green-700 flex-1"
                                            onClick={() => handleAction(req._id, "forward")}
                                        >Forward</Button>
                                        <Button 
                                            variant="destructive" 
                                            className="flex-1"
                                            onClick={() => handleAction(req._id, "reject")}
                                        >Reject</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DeptLeaveRequests;
