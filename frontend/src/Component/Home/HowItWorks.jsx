import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: '01',
      step: 1,
      title: 'ANSWER A FEW QUESTIONS',
      desc: 'Startups just sign in and answer a few simple questions about their business. We then create a custom compliance checklist and even offer a live call to understand their needs.',
      img: '/assets/landingpage/2.png',
    },
    {
      id: '02',
      step: 2,
      title: 'GET A COMPLIANCE CHECKLIST',
      desc: 'Aligned finds the best way to complete the checklist and provides a clear roadmap. The startup gets a step-by-step plan to stay fully compliant.',
      img: '/assets/landingpage/1.png',
    },
    {
      id: '03',
      step: 3,
      title: 'AVAIL THE SERVICES DIRECTLY',
      desc: 'Aligned finds the best way to complete the checklist and provides a clear roadmap. The startup gets a step-by-step plan to stay fully compliant.',
      img: '/assets/landingpage/3.png',
    },
  ];

  return (
    <div className="bg-white py-20 px-4">
      <div className="text-center mb-12">
        <h3 className="text-green-600 font-medium text-sm uppercase">
          How It Works
        </h3>
        <p className="text-gray-500 text-sm max-w-xl mx-auto mt-2">
          See how Alged makes compliance effortless and handles everything, so startups can focus on growth.
        </p>
      </div>

      <div className="bg-[#f5f6fb] rounded-2xl relative max-w-6xl mx-auto lg:px-16 lg:py-20 p-8 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 min-h-[40rem]">
        {/* Left side: Images */}
        <div className="relative w-full lg:w-1/2 h-96 hidden lg:flex items-center justify-center">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              animate={{
                x: (index - 1) * 40, // Adjust spacing
                y: activeStep === step.step ? -20 : 0,
                scale: activeStep === step.step ? 1.05 : 0.95,
                zIndex: activeStep === step.step ? 10 : index,
              }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="absolute w-64 h-80 bg-white border border-gray-200 rounded-xl shadow-lg"
            >
              <img
                src={step.img}
                alt={step.title}
                className="w-full h-full object-contain rounded-xl p-4"
              />
            </motion.div>
          ))}
        </div>

        {/* mid side: Steps with vertical line */}
        <div className="relative flex flex-col items-center justify-between h-80">
          <div className="absolute top-0 bottom-0 w-0.5 bg-[#2f5eac]/30 left-1/2 -translate-x-1/2" />
          {steps.map((step) => (
            <div
              key={step.step}
              onClick={() => setActiveStep(step.step)}
              className="relative z-10 cursor-pointer"
            >
              
                <div className="bg-[#92FFA4]/20 w-14 h-14 rounded-full flex items-center justify-center border border-green-500 font-semibold text-[#2F5EAC]">
                  {step.id}
                </div>
              </div>
          ))}
        </div>

        {/* right side: Step descriptions */}
        <div className="w-full lg:w-1/2 space-y-8">
          {steps.map((step) => (
            <motion.div
              key={step.step}
              animate={{
                opacity: activeStep === step.step ? 1 : 0.5,
              }}
              transition={{ duration: 0.4 }}
              className="cursor-pointer"
              onClick={() => setActiveStep(step.step)}
            >
              <h2 className="text-[#2f5eac] mb-2 font-semibold">{step.title}</h2>
              <p className="text-[16px] text-[#6A6A6A]">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;