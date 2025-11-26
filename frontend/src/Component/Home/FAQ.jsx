import React, { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';

const faqData = [
    {
        query: 'What is Abyd and who is it for?',
        answer: 'Abyd is a comprehensive legal-tech platform designed for startups and businesses to manage their compliance, contracts, and intellectual property effortlessly. It\'s for entrepreneurs who want to focus on growth, not paperwork.'
    },
    {
        query: 'Are the advisory calls really free?',
        answer: 'Yes, absolutely! We offer a free initial advisory call to understand your business needs and guide you on the right path for compliance and legal services, with no obligations.'
    },
    {
        query: 'What kind of services does Abyd provide?',
        answer: 'Abyd provides a wide range of services including IPR (Intellectual Property Rights), POSH compliance, startup registration and compliance, contract management, and much more.'
    },
    {
        query: 'How secure is my data on Abyd?',
        answer: 'We take data security very seriously. Your data is encrypted and stored on secure servers. We follow industry-best practices to ensure your information is always protected.'
    },
    {
        query: 'Can I customize the services based on my startup\'s needs?',
        answer: 'Yes! Our platform is designed to be flexible. We create a custom compliance checklist based on your answers, and you can choose the services that are most relevant to you.'
    },
]

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className='w-full px-5 pb-12'>
      <div className="md:w-11/12 p-5 bg-[#F6F8FF] rounded-2xl md:py-22 md:px-20 mx-auto flex justify-between">
        <div>
            <h1 className='text-4xl tracking-wider'>Frequently Asked <br className="hidden md:block" /> Questions</h1>
            <p className='text-[#6a6a6a] mt-8'>
                Got questions? We've got answers. Explore <br className="hidden md:block" />
                 common queries about Abyd’s services, <br className="hidden md:block" />
                  features, and how we support your journey.
            </p>
        </div>

        <div className='w-full md:w-1/2 flex flex-col gap-3'>
          {faqData.map((item, index) => (
            <div key={index} className='bg-white rounded-lg transition-all duration-300'>
              <div
                className='p-4 flex justify-between items-center cursor-pointer'
                onClick={() => toggleFAQ(index)}
              >
                <p className='text-[#6a6a6a]/90 font-medium pr-4'>{item.query}</p>
                <div className="text-[#2F5EAC]">
                  {openIndex === index ? <FiMinus size={20} /> : <FiPlus size={20} />}
                </div>
              </div>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-40' : 'max-h-0'}`}>
                <p className='px-4 pb-4 text-sm text-[#6a6a6a]'>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FAQ
