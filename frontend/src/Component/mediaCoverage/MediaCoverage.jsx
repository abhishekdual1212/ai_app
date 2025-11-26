import media from "/assets/imgs/media.png";

const MediaCoverage = () => {
  return (
    <>
      <div className="relative w-full">
        {/* Background Image */}
        <img src={media} alt="media" className="w-full h-auto" />

        {/* Overlay Content */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center items-center text-center">
          <h1 className="text-white text-3xl font-semibold font-['Roboto Serif']">
            In the Spotlight
          </h1>
          <p className="text-white text-[18px] font-medium font-['Poppins']  tracking-normal  mt-4">
            Abyde is gaining recognition across the tech and legal compliance
            space. Explore <br /> how our innovative solutions are featured and{" "}
            celebrated for driving change and <br /> simplifying business
            compliance.
          </p>
        </div>
      </div>

      <div className="w-full bg-white flex flex-col justify-center items-center my-28">
         <h2 className="font-[poppins] text-[#253E52] font-medium text-3xl text-center mb-10">Our Mission in Media</h2>
         <p className="font-[Poppins] font-light text-[18px] text-justify text-[#787878] mb-2 ">At Abyde, our mission is to bridge the gap between businesses and legal compliance through <br/>intuitive, tech-driven solutions. Every media mention, article, and expert review helps us amplify our <br/> message — making compliance more accessible, understandable, and actionable for businesses <br/> across all domains.</p>

         <p className="text-[#787878]  font-[Poppins] font-light text-[18px] text-justify mr-2 ">Whether it's simplifying documentation or offering AI-powered assistance, we use each opportunity <br/> in the media to echo our belief that technology should make compliance feel less like a challenge <br/> and more like a natural part of growth.</p>

      </div>
      <div className="bg-[#F8F8FF] w-full  flex flex-col justify-center items-center py-10">
        <h2 className="text-center text-[#253E52] font-medium text-2xl my-6">Our Vision for Visibility</h2>
        <p className="font-[poppins] font-light text-[18px] text-[#787878] text-justify mb-8">We envision a future where Abyde stands as a benchmark in the legal-tech landscape. Through <br/> consistent and meaningful media coverage, we aim to build credibility, spread awareness, and  <br/>highlight the real-world impact of our solutions as we continue to innovate and empower businesses <br/> to thrive confidently.</p>

      </div>
    </>
  );
};

export default MediaCoverage;
