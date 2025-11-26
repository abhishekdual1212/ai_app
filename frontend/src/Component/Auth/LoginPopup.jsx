import write from "../../public/assets/write.png"
import { FaCheckCircle } from "react-icons/fa";

const LoginPopup = () =>{
    return(
        <>
       <div className="flex justify-center items-center h-screen bg-gray-800">
      <div className="bg-white w-[30rem] p-8 rounded-3xl ">
        <h2 className="text-black text-xl font-semibold  mb-4">
          Generate & Optimize Your Privacy Policy
        </h2>
        <p className="text-gray-500 text-sm  mb-4">
          Log in to access your privacy policy reports, optimize existing
          policies, and stay compliant effortlessly.
        </p>
        <div className="space-y-4">
          <p className="text-gray-700 text-sm flex items-center">
            <FaCheckCircle className="text-green-500 mr-2" /> Manage & Generate Policies
          </p>
          <p className="text-gray-700 text-sm flex items-center">
            <FaCheckCircle className="text-green-500 mr-2" /> AI-Powered Optimization
          </p>
          <p className="text-gray-700 text-sm flex items-center">
            <FaCheckCircle className="text-green-500 mr-2" /> Secure & Fast Access
          </p>
        </div>

    
        <div className="flex  mt-6 space-x-4">
          <button className="bg-[#EDA600] text-white px-6 py-2 rounded-full font-medium hover:bg-yellow-500 transition">
            Log In
          </button>
          <p className="text-gray-500 text-sm mt-3 ">
            New here?{" "}
            <span className="text-purple-600 font-medium cursor-pointer mx-3">
              Sign Up Now
            </span>
          </p>
        </div>
      </div>
    </div>
        </>
    )
}
export default LoginPopup