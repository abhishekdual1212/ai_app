import CountUp from 'react-countup';
import gear from "/assets/imgs/Gears.png"
import dee from "/assets/imgs/dee.png"

const Startup = () => {
  return (
    <div
      className="flex justify-between items-center px-20 py-20  relative  "
      style={{ backgroundColor: '#F9FDCB' }}
    >
      <div className='md:w-10/12 flex justify-between mx-auto items-center'>
        {/* Left: Count + Title */}
      <div className="">
        <h1 className="text-[#2F5EAC] text-7xl font-bold">
          <CountUp start={0} end={120} duration={3} />+
        </h1>
        <p className="text-5xl font-[Roboto Serif]  mt-2 ">Startups<br />Successfully Advised</p>
      </div>

      {/* Right: Description */}
      <div className="w-1/2 text-[#6A6A6A] text-2xl font-[Poppins]   ">
        Join thousands of founders who’ve trusted Abyd for legal clarity, compliance support, and smart startup guidance—at zero cost.
      </div>
      </div>

      {/* Background images */}
      <img src={gear} alt="Gear" className="absolute text-[#2F5EAC] left-0 bottom-0 w-40  " />
      <img src={dee} alt="Rocket" className="absolute right-0 bottom-0 w-72  z-0" />
      <img src='/assets/imgs/Graphic.svg' alt="Rocket" className="absolute right-14 bottom-0 w-25  z-0" />
    </div>
  );
};

export default Startup;
