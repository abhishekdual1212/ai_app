// src/Component/Navbar.jsx
import logo from "/assets/imgs/logo.png";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import http from "../api/http"; // NEW

const Navbar = () => {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthenticatedUser(user || null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    try { await http.post("/api/auth/logout"); } catch (_) {}
    try { await signOut(auth); } catch (error) { console.error("Logout failed:", error); }
  };

  return (
    <nav className="w-full bg-[#EAF2FF] px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <img src={logo} alt="Logo" className="w-20 md:w-24" />

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 font-[poppins] font-normal text-[#6A6A6A]">
          <NavLink to="/" className="cursor-pointer text-[16px]">Home</NavLink>
          <NavLink to="/services" className="cursor-pointer text-[16px]">Services</NavLink>
          <NavLink to="/how-it-works" className="cursor-pointer text-[16px]">How it Works</NavLink>
          <NavLink to="/about" className="cursor-pointer text-[16px]">About Us</NavLink>
          <NavLink to="/contact" className="cursor-pointer text-[16px]">Contact Us</NavLink>
        </div>

        {/* User Section */}
        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
          ) : authenticatedUser ? (
            <>
              <button
                onClick={handleLogout}
                className="bg-[#2F5EAC] text-white px-4 py-1 rounded-full font-[poppins] font-medium text-[16px]"
              >
                Log out
              </button>
              <Link to="/dashboard">
                <img
                  src={authenticatedUser.photoURL || "/assets/imgs/logo1.png"}
                  alt="User"
                  className="w-10 h-10 rounded-full cursor-pointer border-2 border-orange-400"
                />
              </Link>
            </>
          ) : (
            <NavLink to="/login">
              <button className="bg-[#2F5EAC] text-white px-4 py-1 rounded-full font-[poppins] font-medium text-[16px]">
                Log in
              </button>
            </NavLink>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-[#2F5EAC]"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden mt-4 space-y-3 font-[poppins] font-normal text-[#6A6A6A]">
          <NavLink to="/" className="block text-[16px]" onClick={() => setIsOpen(false)}>Home</NavLink>
          <NavLink to="/services" className="block text-[16px]" onClick={() => setIsOpen(false)}>Services</NavLink>
          <NavLink to="/how-it-works" className="block text-[16px]" onClick={() => setIsOpen(false)}>How it Works</NavLink>
          <NavLink to="/about" className="block text-[16px]" onClick={() => setIsOpen(false)}>About Us</NavLink>
          <NavLink to="/contact" className="block text-[16px]" onClick={() => setIsOpen(false)}>Contact Us</NavLink>

          {loading ? (
            <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
          ) : authenticatedUser ? (
            <div className="flex flex-col items-start gap-3">
              <NavLink to="/dashboard" onClick={() => setIsOpen(false)}>
                <button className="bg-transparent text-[#2F5EAC] px-4 py-1 rounded-full font-[poppins] font-medium text-[16px] border border-[#2F5EAC]">
                  Dashboard
                </button>
              </NavLink>
              <button
                onClick={() => { handleLogout(); setIsOpen(false); }}
                className="bg-[#2F5EAC] text-white px-4 py-1 rounded-full font-[poppins] font-medium text-[16px]"
              >
                Log out
              </button>
            </div>
          ) : (
            <NavLink to="/login" onClick={() => setIsOpen(false)}>
              <button className="bg-[#2F5EAC] text-white px-4 py-1 rounded-full font-[poppins] font-medium text-[16px]">
                Log in
              </button>
            </NavLink>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
