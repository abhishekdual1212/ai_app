import React from 'react'

const OurMission = () => {
  return (
    <div className='w-full pb-12'>
      <div className="md:w-11/12 px-5 mx-auto flex gap-8">
        {/*left div */}
        <div className='flex flex-col gap-8'>
            <div className='bg-[#F7FFCC] p-10 py-14 rounded-2xl pr-28'>
                <h2 className='text-lg mb-4 font-semibold tracking-widest'>OUR MISSION</h2>
                <p className='text-[#6a6a6a]'>
                    To simplify complex legal and compliance processes through <br className="hidden md:block" />
                     smart, AI-driven solutions—empowering individuals, startups, and <br className="hidden md:block" />
                      professionals to learn, grow, and succeed with confidence.
                </p>
            </div>
            <div className='bg-[#FFEFEF] p-10 py-14 rounded-2xl pr-28'>
                <h2 className='text-lg mb-4 font-semibold tracking-widest'>SCOPE OF WORK</h2>
                <p className='text-[#6a6a6a]'>
                    To become the leading digital platform that bridges knowledge, law, and <br className="hidden md:block" />
                     technology—making legal empowerment, academic advancement, and <br className="hidden md:block" />
                      career readiness accessible to everyone, everywhere.
                </p>
            </div>
        </div>

        {/*right div */}
        <div className='bg-[#00000005] rounded-2xl  pt-24 px-16'>
            <h2 className="text-center mb-6 font-semibold text-lg">
                To become the leading digital platform that <br className="hidden md:block" />
                 bridges knowledge, law, and technology
            </h2>
            <img src="/assets/imgs/mission.svg" alt="mission" className='w-80' />
        </div>
      </div>
    </div>
  )
}

export default OurMission
