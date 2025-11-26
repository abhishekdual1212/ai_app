// src/Component/dashboard/Navbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useSettings } from "../SettingsContext.jsx";

import log from "../../../public/assets/imgs/log.png";
import explore from "../../../public/assets/imgs/explore.png";
import dasboard from "../../../public/assets/imgs/dasboard.png";
import seeting from "../../../public/assets/imgs/seeting.png";
import defaultAvatar from "../../../public/assets/imgs/logo1.png";
import http from "../../api/http";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { open } = useSettings();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [user, setUser] = useState(null);

  // If path looks like /:slug/(explore|dashboard) use that slug
  const idMatch = location.pathname.match(/^\/([^/]+)\/(explore|dashboard)/);
  const idInPath = idMatch ? idMatch[1] : null;

  const leftItems = idInPath
    ? [
        { icon: explore, label: "Explore", link: `/${idInPath}/explore` },
        { icon: dasboard, label: "Dashboard", link: `/${idInPath}/dashboard` },
      ]
    : [
        { icon: explore, label: "Explore", link: "/dashboard" },
        { icon: dasboard, label: "Dashboard", link: "/dashboard/order" },
      ];

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try { await http.post("/api/auth/logout"); } catch {}
    try {
      const auth = getAuth();
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <div className="flex justify-center items-center w-full px-4 py-4 bg-white">
        <div className="w-full max-w-[1280px] bg-[#2F5EAC] border border-[#94B4E9] rounded-full flex items-center justify-between px-6 py-2 shadow-md">
          {/* Left: Logo + Navigation */}
          <div className="flex items-center gap-6">
            <div className="bg-white rounded-full p-2">
              <img src={log} alt="logo" className="h-6 w-6" />
            </div>
            <div className="flex gap-4 text-white text-sm font-medium">
              {leftItems.map((item, index) => {
                const isActive =
                  location.pathname === item.link ||
                  (item.label === "Explore" &&
                    (location.pathname === "/dashboard" ||
                      /^\/[^/]+\/explore(?:\/|$)/.test(location.pathname))) ||
                  (item.label === "Dashboard" &&
                    (location.pathname === "/dashboard/order" ||
                      /^\/[^/]+\/dashboard(?:\/|$)/.test(location.pathname)));

                return (
                  <Link to={item.link} key={index}>
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-full transition cursor-pointer ${
                        isActive ? "bg-[#4979d1]" : "hover:bg-[#4979d1]"
                      }`}
                    >
                      <img src={item.icon} alt={item.label} className="h-5 w-5" />
                      <span
                        className={`font-[poppins] font-normal ${
                          isActive ? "text-white" : "text-[#FFFFFFB2]"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Settings + Login/Logout + Profile */}
          <div className="flex items-center gap-4 text-white font-medium">
            <button
              type="button"
              onClick={open}
              className="flex items-center gap-2 px-3 py-2 rounded-full transition cursor-pointer hover:bg-[#4979d1]"
              aria-label="Settings"
              title="Settings"
            >
              <img src={seeting} alt="Settings" className="h-5 w-5" />
              <span className="font-[poppins] font-normal text-[#FFFFFFB2] hover:text-white">
                Settings
              </span>
            </button>

            {user ? (
              <>
                <span
                  className="text-[#FFFFFFB2] hover:text-white cursor-pointer"
                  onClick={() => setShowLogoutPopup(true)}
                >
                  Log Out
                </span>
                <div className="ml-2">
                  <img
                    src={user.photoURL || defaultAvatar}
                    alt="profile"
                    className="h-10 w-10 rounded-full border-2 border-orange-500"
                  />
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="text-[#FFFFFFB2] hover:text-white cursor-pointer"
                >
                  Login
                </button>
                <div className="ml-2">
                  <img
                    src={defaultAvatar}
                    alt="default profile"
                    className="h-10 w-10 rounded-full border-2 border-gray-400"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center">
            <h2 className="text-xl font-semibold mb-4">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
