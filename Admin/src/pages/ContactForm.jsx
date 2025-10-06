import { backendUrl } from "@/App";
import axios from "axios";
import { useState } from "react";

function ContactForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await axios.post(backendUrl + "/api/send-email", {
        to: email,
        subject: "Test Email from Resend + React",
        message,
      });
      alert("Email sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send email");
    }
  };

  return (
    <form
      onSubmit={handleSend}
      className=" max-w-md mx-auto mt-10 p-8 bg-white rounded-lg  shadow-lg flex flex-col  gap-6"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Recipient Email"
        required
        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Your Message"
        required
        className="border border-gray-300 rounded-md px-4 py-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold"
      >
        Send Email
      </button>
    </form>
  );
}

export default ContactForm;