import React, { useState } from "react";
import { Link } from "react-router-dom";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle WhatsApp message send
  const handleSend = () => {
    const { name, email, phone, message } = formData;

    if (!name || !email || !phone || !message) {
      alert("Please fill all required fields.");
      return;
    }

    // WhatsApp message format
    const text = `👋 Hello! This is a new contact message:
Name: ${name}
Email: ${email}
Phone: ${phone}
Message: ${message}`;

    // Encode message for URL
    const encodedText = encodeURIComponent(text);

    // WhatsApp number (India format)
    const whatsappNumber = "918219059577";

    // Open WhatsApp chat in a new tab
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, "_blank");
  };

  return (
    <div id="contact" className="container mx-auto px-6 py-20 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start w-11/12 mx-auto">
        {/* Left Section (Socials) */}
        <div className="w-full lg:order-1 order-2">
          <h2 className="text-2xl font-[poppins] font-semibold mb-3 md:text-left text-center">
            Get In Touch
          </h2>
          <p className="text-[#787878] font-normal py-7 md:text-left text-center">
            We’d love to hear from you! Whether it’s a question, feedback, or just to connect,
            reach out and we’ll get back to you as soon as possible.
          </p>

          <p className="text-[#787878] font-normal pb-7 md:text-left text-center">
            <nav className="font-semibold inline text-black">Follow Us on Social Media:</nav> Stay connected and updated by
            following us on Instagram, LinkedIn, and WhatsApp.
          </p>

          {/* Social Links */}
          <div className="flex gap-5 justify-center md:justify-start">
            {/* Instagram */}
            <Link
              to="https://www.instagram.com/datencetechnologies"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/assets/imgs/contacts/insta.svg" alt="Instagram" className="w-6 h-6" />
            </Link>

            {/* LinkedIn */}
            <Link
              to="https://www.linkedin.com/company/abyd/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/assets/imgs/contacts/linkedIn.svg" alt="LinkedIn" className="w-6 h-6" />
            </Link>

            {/* Email */}
            <Link to="mailto:contact@abyd.in">
              <img src="/assets/imgs/contacts/email.svg" alt="Email" className="w-6 h-6" />
            </Link>

            {/* WhatsApp */}
            <Link
              to="https://wa.me/918219059577"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/assets/imgs/contacts/whatsapp.svg" alt="WhatsApp" className="w-6 h-6" />
            </Link>
          </div>
        </div>

        {/* Right Section (Form) */}
        <div className="w-full max-w-2xl flex flex-col lg:order-2 order-1 bg-[#F6F8FF] py-20 px-8 rounded-2xl">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="flex flex-col">
                <label className="text-[#000000] font-medium py-3">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="border-none p-3 rounded-md w-full bg-white outline-none"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="text-[#000000] font-medium py-3">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="border-none p-3 rounded-md w-full bg-white outline-none"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col">
                <label className="text-[#000000] font-medium py-3">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your mobile number"
                  className="border-none p-3 rounded-md w-full bg-white outline-none"
                />
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col mt-8">
              <label className="text-[#000000] font-medium mb-7">
                Your suggestions and feedbacks <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your suggestions and feedbacks"
                className="border-none outline-none p-4 rounded-md w-full h-36 bg-white"
              ></textarea>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              className="bg-gray-900 text-white py-3 px-6 rounded-md hover:bg-gray-700"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
