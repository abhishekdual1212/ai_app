import React from "react";

const services = [
  {
    title: "IPR (Intellectual Property Rights)",
    description: "Safeguard your innovations, designs, and ideas with know-how, expert guidance and AI-powered support.",
    img: "/assets/landingpage/1.png",
    color: "bg-purple-100",
    border: "border-[#8E6FF8]"
  },
  {
    title: "POSH (Prevention of Sexual Harassment)",
    description: "Stay compliant with POSH regulations through streamlined tools and awareness resources for your organization.",
    img: "/assets/landingpage/harassment.png",
    color: "bg-orange-100",
    border: "border-[#FEC796]"
  },
  {
    title: "Startup Compliance",
    description: "From registration to regular filings, get all the support you need to build a legally sound and investor-ready startup.",
    img: "/assets/landingpage/TandC.png",
    color: "bg-pink-100",
    border: "border-[#FFAEBE]"
  },
  {
    title: "Contract Management",
    description: "Create, track, store, and manage legal agreements with ease—backed by AI tools and expert insights.",
    img: "/assets/landingpage/4.png",
    color: "bg-green-100",
    border: "border-[#C8FFB9]"
  }
];


const FeaturedServices = () => {
  return (
    <section className="py-10 text-center">
      <h2 className="text-green-500 font-semibold text-lg mb-2">Featured Services</h2>
      <p className="text-sm max-w-xl mx-auto text-gray-600 mb-10">
        Explore our curated services designed to simplify legal, compliance, and professional growth—so you can focus on what matters most.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6 md:px-20">
        {services.map((service, index) => (
          <div
            key={index}
            className={`border ${service.border} p-6 rounded-xl shadow-sm text-left hover:shadow-md transition-shadow relative overflow-hidden`}
            style={{
              backgroundImage: `linear-gradient(to top, rgba(255, 255, 255, 0.95) 20%, rgba(255, 255, 255, 0.5) 70%), url(${service.img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="py-4 h-44 relative z-10"></div>
            <h3 className="font-semibold text-sm uppercase mb-3 tracking-widest">{service.title}</h3>
            <p className="text-sm text-[#6A6A6A]">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedServices;
