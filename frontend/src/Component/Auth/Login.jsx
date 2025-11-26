// src/Component/Auth/Login.jsx
import login from "../../../public/assets/login.png";
import GoogleLogo from "../../../public/assets/google.png";
import { auth, googleProvider } from "../../Firbase";
import { signInWithPopup } from "firebase/auth";
import { IoChevronBackOutline } from "react-icons/io5";
import { useNavigate, NavLink } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import http from "../../api/http";

const Login = () => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const GooglePopup = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const user = result.user;
      const tokenId = result._tokenResponse.idToken;
      const uid = user.uid;
      const name = user.displayName || (user.email ? user.email.split("@")[0] : "user");
      const email = user.email;

      localStorage.setItem("token", tokenId);

      await axios.post(
        "http://localhost:3000/user/userRegister",
        { uid, name, email },
        { headers: { "x-api-key": "1234567890abcdef" } }
      );

      const sessionResponse = await axios.post(
        "http://localhost:3000/api/session/create",
        { userId: uid },
        { headers: { "x-api-key": "1234567890abcdef" } }
      );
      const sessionId = sessionResponse?.data?.data?._id;
      if (sessionId) localStorage.setItem("sessionId", sessionId);

      const { data: urlLogin } = await http.post("/api/auth/url-login", {
        userid: uid,
        username: name,
      });

      // Important: hit the handshake route so the server can set cookies
      navigate(`/${encodeURIComponent(urlLogin.sid)}/consume/explore`, { replace: true });
    } catch (e) {
      console.error("Google sign-in or API failed:", e);
      setBusy(false);
    }
  };

  return (
    <div className="bg-[#2F5EAC] flex justify-center items-center h-screen w-full">
      <div className="mx-auto w-4/6">
        <div className="flex flex-row items-center space-x-2 mb-4">
          <IoChevronBackOutline className="text-white " />
          <NavLink to="/">
            <h2 className="text-[#FFFFFF] font-[poppins] cursor-pointer">
              Back to Web
            </h2>
          </NavLink>
        </div>

        <div className="bg-[#FFFFFF33] rounded-3xl py-16 px-20 flex items-center ">
          <div className="w-1/2 flex flex-col space-y-6">
            <h2 className="font-[poppins] font-semibold text-5xl text-[#FFFFFF] pb-2">
              Welcome back!
            </h2>
            <p className="font-[Roboto Flex] font-light text-[14px] text-[#FFFFFF] leading-6 pb-12">
              Log in to Generate, Analyze, and Optimize <br /> with Ease!
            </p>

            <button
              disabled={busy}
              className="font-[poppins] font-medium text-[#5C066A] bg-[#F3B2FD] rounded-full px-6 py-2 flex items-center justify-center w-fit cursor-pointer mb-32 disabled:opacity-60"
              onClick={GooglePopup}
            >
              <img src={GoogleLogo} alt="Google" className="w-6 h-6 mr-2" />
              {busy ? "Signing in..." : "Sign-in with Google"}
            </button>
          </div>

          <div className="w-1/2 flex justify-end ">
            <img src={login} alt="Login" className="w-80 " />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
