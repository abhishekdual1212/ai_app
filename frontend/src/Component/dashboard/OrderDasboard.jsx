import { FiSearch } from "react-icons/fi";
import das from "../../../public/assets/imgs/das.png";
import SummeryOrder from "./SummeryOrder";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const OrderDasboard = () => {

  const [username, setUsername] = useState("User"); // default

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUsername(currentUser.displayName || "User");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="py-8">
      {/* Search Bar */}
  

      {/* Welcome Card */}
      <div className="bg-[#F8F8F8] rounded-xl p-6 md:p-8 flex flex-col-reverse md:flex-row justify-between items-center w-full max-w-4xl mx-auto mb-10">
        <div className="mt-6 md:mt-0 text-center md:text-left">
          <h1 className="font-[Roboto Serif] font-medium text-xl md:text-[22px]">
            Welcome to Your Dashboard, <span className="text-[#FF9A25]">{username}!</span>
          </h1>
          <p className="text-sm text-[#6A6A6A] mt-2 font-[poppins] font-light">
            Explore AI-driven insights, tailored advice, and instant support. Access tools and expert guidance effortlessly.
          </p>
        </div>
        <div>
          <img src={das} alt="Dashboard Illustration" className="w-48 md:w-[16rem]" />
        </div>
      </div>
      <h1 className="font-[poppins] font-medium text-xl my-7 mb-3.5 pl-1.5">Summary of Orders</h1>
      <SummeryOrder/>
    </div>
  );
};

export default OrderDasboard;
