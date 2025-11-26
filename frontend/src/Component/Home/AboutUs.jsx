import React from 'react';

const AboutUs = () => {
  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-center text-4xl font-extrabold text-gray-900 sm:text-5xl">
          About Abyd
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-center text-xl text-gray-500">
          Simplifying legal compliance for startups and businesses with the power of AI.
        </p>

        <div className="mt-12 space-y-12">
          <div className="space-y-5 sm:space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Our Mission</h2>
            <p className="text-lg text-gray-500">
              Our mission is to democratize legal services, making compliance accessible, affordable, and effortless for entrepreneurs. We believe that founders should focus on innovation and growth, not get bogged down by complex legal paperwork. Abyd is here to automate the complexities, providing peace of mind and a solid legal foundation for every venture.
            </p>
          </div>

          <div className="space-y-5 sm:space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Our Story</h2>
            <p className="text-lg text-gray-500">
              Founded by a team of legal experts and tech innovators, Abyd was born from a shared frustration: the legal landscape is a major hurdle for new businesses. We saw brilliant ideas stumble over compliance issues that could have been easily avoided. We decided to build a solution—a smart, AI-driven platform that acts as a co-pilot for startups, navigating them through every legal requirement from day one.
            </p>
          </div>

          <div className="space-y-5 sm:space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">What We Do</h2>
            <p className="text-lg text-gray-500">
              Abyd offers a suite of tools designed for the modern business. From generating custom compliance checklists and managing contracts to safeguarding intellectual property and ensuring POSH compliance, our platform covers it all. We combine cutting-edge AI with expert human oversight to deliver services that are not only efficient but also reliable and tailored to your specific needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;