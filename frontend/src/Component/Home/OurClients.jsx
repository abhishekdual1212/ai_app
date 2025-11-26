import React from 'react'
import a from "/assets/imgs/clients/client1.svg";
import b from "/assets/imgs/clients/client2.svg";
import c from "/assets/imgs/clients/client3.svg";
import d from "/assets/imgs/clients/client4.svg";
import e from "/assets/imgs/clients/client5.svg";
import f from "/assets/imgs/clients/client6.svg";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";

const OurClients = () => {
  return (
    <div className='py-28 w-full '>
      <h2 className="text-green-500 font-semibold text-lg mb-2 text-center">Our Clients</h2>
      <p className='text-[#6a6a6a] mt-1 text-center'>We are trusted by startups at various stages of their journey.</p>

      <div className="flex justify-between items-center sm:px-20 px-10 py-12 bg-[#F7F7F799] md:gap-4 mt-14">
      <Swiper
          modules={[Autoplay, Pagination]} 
          spaceBetween={0} 
          autoplay={{ delay: 2000, disableOnInteraction: false }} // Auto play slides every 3 seconds
          loop={true} 
          className="mx-5"
          breakpoints={{
            // when window width is >= 640px
            300: {
              slidesPerView: 2, // Show 1 slide for mobile devices
              pagination: { clickable: true },
            },
            // when window width is >= 768px
            640: {
              slidesPerView: 3, // Show 2 slides for tablets
            },
            1024: {
              slidesPerView: 6, 
            },
           
          }}
        >
          <SwiperSlide>
            <img src={a} className=" md:w-36 sm:w-44 w-36" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={b} className=" lg:w-36  w-36" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={c} className=" lg:w-36  w-36" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={d} className=" lg:w-18  w-14" />
          </SwiperSlide>
          <SwiperSlide>
            <img src={e} className=" lg:w-36  w-36" />
          </SwiperSlide>
        <SwiperSlide>
            <img src={f} className=" lg:w-36  w-36" />
          </SwiperSlide>
                <SwiperSlide>
            <img src={d} className=" lg:w-18  w-36" />
          </SwiperSlide>     
        </Swiper>
      
        
      </div>
    </div>
  )
}

export default OurClients
