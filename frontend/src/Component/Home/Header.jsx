import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../Firbase";
import axios from "axios";

import logo1 from "/assets/imgs/logo1.png"
import logo2 from "/assets/imgs/logo2.png"
import logo3 from "/assets/imgs/logo3.png"
import GoogleLogo from "../../../public/assets/google.png";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      await axios.post("http://localhost:3000/user/userRegister", {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName,
        email: firebaseUser.email,
      }, { headers: { "x-api-key": "1234567890abcdef" } });

      const sessionResponse = await axios.post("http://localhost:3000/api/session/create", {
        userId: firebaseUser.uid,
      }, { headers: { "x-api-key": "1234567890abcdef" } });

      const sessionId = sessionResponse.data.data._id;
      localStorage.setItem("sessionId", sessionId);

      navigate('/dashboard');
    } catch (e) {
      console.error("Google sign-in or API failed:", e.message);
    }
  };

  return (
    <div className="md:h-[30rem]">
      <div className="flex justify-center items-center mt-20">
        <div className="flex -space-x-4">
          <img src={logo1} alt="user1" className="w-10 h-10 rounded-full" />
          <img src={logo2} alt="user2" className="w-10 h-10 rounded-full " />
          <img src={logo3} alt="user3" className="w-10 h-10 rounded-full " />
          <img src={logo3} alt="user4" className="w-10 h-10 rounded-full" />
        </div>

        <p className="ml-4 font-poppins font-light text-[#6A6A6A] text-[18px]">
          Our Top Users
        </p>
      </div>

      <h2 className="font-[Roboto Serif] font-medium text-3xl text-center my-2">
        Hassle-Free Registrations, <br /> Compliance, and{" "}
        <span className="text-[#2F5EAC]">Legal Solutions</span>
      </h2>

      <div className="flex justify-center items-center gap-4 my-8">
        {user ? (
          <button
            onClick={() => navigate('/dashboard')}
            className="font-[poppins] font-medium text-white bg-[#2F5EAC] rounded-full px-6 py-3 flex items-center justify-center w-fit cursor-pointer shadow-lg hover:bg-[#244b90] transition-all"
          >
            start Compliance
          </button>
        ) : (
          <button
            className="font-[poppins] font-medium text-white bg-[#eccf4f] rounded-full px-6 py-3 flex items-center justify-center w-fit cursor-pointer shadow-lg hover:bg-[#244b90] transition-all"
            onClick={handleGoogleLogin}
          >
            <img
            
            
            />
            Start Compliance
          </button>
        )}
      </div>
  
       <div className="w-full flex items-center justify-center relative md:h-96 mt-28">
                <img src='/assets/imgs/hero.svg' alt="header" className="w-[60rem] " />
       </div>     
    </div>
  );
};
export default Header;
