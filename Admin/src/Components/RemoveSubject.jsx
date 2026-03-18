import React from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { backendUrl } from "@/App";

const RemoveSubject = () => {
  const [section, setSection] = React.useState("");
  const [year, setYear] = React.useState("");
  const [batch, setBatch] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const removeSubject = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/removeSubject",
        {
          section,
          year,
          batch,
          subject,
        },
        {
          headers: {
            admintoken: localStorage.getItem("adminToken")
              ? localStorage.getItem("adminToken")
              : null,
          },
        }
      );

      if (response.data.sucess) {
        toast.success(response.data.message);
        setSection("");
        setYear("");
        setBatch("");
        setSubject("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Unable to remove subject");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center bg-gray-200">
      <div className="flex flex-col items-center gap-5 pb-20 sm:pb-20">
        <h1 className="flex justify-center text-3xl font-bold text-blue-900 sm:mt-10 sm:text-4xl">
          Remove <span className="ml-3 text-red-500">Subject</span>
        </h1>

        <form
          className="mt-1 flex w-84 flex-col gap-3 rounded-lg bg-white p-5 shadow-md sm:w-[450px] sm:p-8"
          onSubmit={removeSubject}
        >
          <label className="font-semibold text-gray-700" htmlFor="section">
            Section
          </label>
          <input
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder="Enter Your Section"
            type="text"
            id="section"
            className="rounded-md border border-gray-300 p-1"
            required
          />

          <label className="font-semibold text-gray-700" htmlFor="year">
            Year
          </label>
          <select
            className="rounded-md border border-gray-300 p-1"
            onChange={(e) => setYear(e.target.value)}
            value={year}
          >
            <option value="Ist">Ist Year</option>
            <option value="IInd">IInd Year</option>
            <option value="IIIrd">IIIrd Year</option>
            <option value="IVth">IV Year</option>
          </select>

          <label className="font-semibold text-gray-700" htmlFor="batch">
            Batch
          </label>
          <input
            value={batch}
            onChange={(e) => setBatch(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter a Starting Year"
            type="text"
            inputMode="numeric"
           
            id="batch"
            className="rounded-md border border-gray-300 p-1"
            required
          />

          <label className="font-semibold text-gray-700" htmlFor="subject">
            Subject
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter Subject Name"
            type="text"
            id="subject"
            className="rounded-md border border-gray-300 p-1"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-red-500 py-1 font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Removing..." : "REMOVE SUBJECT"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RemoveSubject;
