import complience from "../../../public/assets/complience.png"
import { NavLink } from "react-router-dom"
const DiyComplience = () =>{
    return (
        <>
        <div className=" w-full flex flex-col justify-center items-center mt-12">
            <h1 className="font-[Roboto Serif] font-medium text-2xl text-[#000000] text-center mb-4">Welcome to <span className="text-[#2F5EAC]">DIY</span> Compliance!</h1>

           <img src={complience} className="w-[50rem]" alt="complicence"/>
           <p className="font-[poppins] font-light text-sm text-[#787878] text-center mb-4 relative bottom-12">Take control of your compliance process with our step-by-step DIY Compliance <br/> Checklist. Simplify legal requirements and stay compliant effortlessly!</p>
           <NavLink to="/dashboard/question">
           <button className="font-[poppins] font-medium text-sm px-4 py-2 text-[#FFFFFF] rounded-md bg-[#2F5EAC] mb-4">Start DIY Compliance Now</button>
           </NavLink>
        </div>
        
        
        
        
        </>
    )
}
export default DiyComplience
