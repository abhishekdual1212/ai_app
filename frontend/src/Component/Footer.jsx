import abyd from "/assets/imgs/abyd.png";
import facebook from "../../public/assets/imgs/facebook.png";
import message from "/assets/imgs/message.png";
import phone from "/assets/imgs/phone.png";
import socialn from "/assets/imgs/socialn.png";

const Footer = () => {
  const scrollToSection = (event, sectionId) => {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-[#2F5EAC] text-white py-10 px-6 md:px-20">
      {/* Top Section */}
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        {/* Left Section - Logo & Description */}
        <div className="md:w-1/2 space-y-6">
          <img
            src={abyd}
            alt="Datence Technologies"
            className="w-24 md:w-28"
          />
          <p className="text-sm md:text-base text-gray-100 font-light leading-relaxed">
            Ensure your business meets legal standards with our AI-driven Privacy
            & Policy Optimizer. Effortlessly generate, refine, and update policies
            tailored to your industry needs.
          </p>
        </div>

        {/* Right Sections */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-24">
          {/* Company Section */}
          <div>
            <h3 className="text-lg font-medium mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li
                className="cursor-pointer hover:underline"
                onClick={(event) => scrollToSection(event, "home")}
               href="/home"
              >
                Home
              </li>
              <li
                className="cursor-pointer hover:underline"
                onClick={(event) => scrollToSection(event, "About Us")}
              >
                About Us
              </li>
              <li
                className="cursor-pointer hover:underline"
                onClick={(event) => scrollToSection(event, "Dashboard")}
              href="/dashboard" >
                Dashboard
              </li>
            </ul>
          </div>

          {/* Services Section */}
          <div>
            <h3 className="text-lg font-medium mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li
                className="cursor-pointer hover:underline"
                onClick={(event) => scrollToSection(event, "Privacy Policy")}
              >
                Privacy Policy
              </li>
              <li
                className="cursor-pointer hover:underline"
                onClick={(event) => scrollToSection(event, "Terms of Service")}
              >
                Terms of Service
              </li>
              <li
                className="cursor-pointer hover:underline"
                onClick={(event) => scrollToSection(event, "contact")}
              >
                Contact Us
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center mt-10 border-t border-white/30 pt-6 gap-6 md:gap-0">
        <p className="font-light text-xs md:text-sm">
          © 2024 Datence Technologies. All Rights Reserved.
        </p>

        {/* Social Icons */}
        <div className="flex justify-center md:justify-end items-center gap-6">
          <img src={facebook} alt="facebook" className="w-5 cursor-pointer" />
          <img src={message} alt="message" className="w-5 cursor-pointer" />
          <img src={phone} alt="phone" className="w-5 cursor-pointer" />
          <img src={socialn} alt="social" className="w-5 cursor-pointer" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
