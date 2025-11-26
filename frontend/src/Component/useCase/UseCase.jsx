import bro from "/assets/imgs/bro.png";
const UseCase = () => {
  return (
    <>
      <div className="w-full flex items-center px-20 py-10 ">
        <div className="w-1/2">
          <p className="text-4xl font-medium font-[Roboto Serif] text-black tracking-[144%]">
            Your Trusted Partner in Smarter
            <br />
            Legal Compliance
          </p>
        </div>

        <div className="w-1/2 flex justify-center">
          <img src={bro} alt="useCase" className="w-[80%] h-auto" />
        </div>
      </div>

      <div className="w-full bg-white my-24">
        <h2 className="text-[#6BBC79] font-[Poppins] font-medium text-2xl text-center mb-5">
          Why Choose ABYDE
        </h2>
        <p className="text-[#6A6A6A] font-[Roboto Serif] font-light text-xl text-center">
          At Abyde, we’re committed to transforming how businesses handle
          compliance— <br />
          making it smarter, smoother, and more secure. Here’s what sets us
          apart:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4  px-36 py-10 my-2">
        {/* card-1 */}
        <div className="bg-[#EDE8FE] rounded-xl border border-[#8E6FF8] p-10 w-[30rem]">
          <h2 className="font-[Poppins] font-semibold text-2xl mb-4 text-black">
            Smart Legal Tech
          </h2>
          <p className="text-[#6A6A6A] font-light font-[Poppins] text-lg leading-relaxed">
            Our AI-powered platform is designed to automate complex compliance
            tasks, reduce human error, and save valuable time—so you can focus
            more on growing your business.
          </p>
        </div>

        {/* card-2 */}
        <div className="bg-[#FEF1E7] rounded-xl border border-[#FFD2B7] p-10 w-[30rem]">
          <h2 className="font-[Poppins] font-semibold text-2xl mb-4 text-black">
            User-Friendly Interface
          </h2>
          <p className="text-[#6A6A6A] font-light font-[Poppins] text-lg leading-relaxed">
            We've crafted an intuitive and easy-to-navigate experience that
            makes compliance management simple, even with no legal background.
            No stress, no steep learning curves.
          </p>
        </div>

        {/* card-3 */}
        <div className="bg-[#FFEFF0] rounded-xl border border-[#FFBFC1] p-10 w-[30rem]">
          <h2 className="font-[Poppins] font-semibold text-2xl mb-4 text-black">
            Expert-Backed Solutions
          </h2>
          <p className="text-[#6A6A6A] font-light font-[Poppins] text-lg leading-relaxed">
            Built in collaboration with legal experts, our tools are reliable,
            accurate, and thorough when solving compliance standards—so you're
            always protected and in control.
          </p>
        </div>

        {/* card-4 */}
        <div className="bg-[#E9F9EC] rounded-xl border border-[#A6E7B2] p-10 w-[30rem]">
          <h2 className="font-[Poppins] font-semibold text-2xl mb-4 text-black">
            Scalable for All
          </h2>
          <p className="text-[#6A6A6A] font-light font-[Poppins] text-lg leading-relaxed">
            Whether you're a solo entrepreneur, a growing startup, or an
            established enterprise, Abyde scales with your business needs,
            offering flexible solutions that evolve with you.
          </p>
        </div>
      </div>
    </>
  );
};
export default UseCase;
