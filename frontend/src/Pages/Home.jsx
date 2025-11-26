import React from 'react'
import Header from '../Component/Home/Header'
import Service from '../Component/Home/Service'
import Startup from "../Component/Home/Startup"
import OurClients from '../Component/Home/OurClients'
import BackedBy from '../Component/Home/BackedBy'
import FeaturedServices from '../Component/Home/FeaturedService'
import OurMission from '../Component/Home/OurMission'
import FAQ from '../Component/Home/FAQ'
import Contact from '../Component/Home/Contact'
import ExploreByIndustry from '../Component/Home/ExploreByIndustry'
import HowItWorks from '../Component/Home/HowItWorks'



const Home = () => {
  return (
    <div className="w-full overflow-x-hidden">
      <Header/>
      <Service/>
      <Startup/>
      {/* <ExploreByIndustry />  */}
    <BackedBy />
      <HowItWorks />
      <FeaturedServices />
     
      {/* <OurMission /> */}
      <FAQ />
      <Contact />
    </div>
  )
}

export default Home
