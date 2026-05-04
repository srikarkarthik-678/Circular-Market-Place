import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [username, setUsername] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUsername(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername("");
    navigate("/login");
  };

  const handleExplore = () => {
    if (username) {
      navigate("/explore");
    } else {
      navigate("/login");
    }
  };

  const handleCart = () => {
    if (username) {
      navigate("/cart");
    } else {
      navigate("/login");
    }
  };

  return (
    <div id="hero">
      <nav className='fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] sm:w-[75%] md:w-[60%] bg-white flex justify-between items-center px-6 sm:px-16 rounded-full p-2'>

        <ul>
          <li className='font-title font-semibold text-xl cursor-pointer'>
            EcoLoop
          </li>
        </ul>

        {/* Desktop Menu */}
        <ul className='hidden md:flex text-black justify-center items-center gap-5 font-title'>
          <li className='cursor-pointer hover:bg-black hover:text-white hover:rounded-2xl px-3 py-2'>
            Home
          </li>
          <li
            onClick={handleExplore}
            className='cursor-pointer hover:bg-black hover:text-white hover:rounded-2xl px-3 py-2'
          >
            Explore
          </li>
          <li
            onClick={() => navigate("/businesses")}
            className='cursor-pointer flex items-center gap-1 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:rounded-2xl px-3 py-2 font-semibold'
          >
            <span></span> Businesses
          </li>
          <li
            onClick={handleCart}
            className='cursor-pointer hover:bg-black hover:text-white hover:rounded-2xl px-3 py-2'
          >
            Cart
          </li>
          {!username ? (
            <Link to="/login">
              <li className='cursor-pointer hover:bg-black hover:text-white hover:rounded-2xl px-3 py-2'>
                Sign In
              </li>
            </Link>
          ) : (
            <>
              <li className='px-3 py-2 font-semibold'>
                {username}
              </li>
              <li
                onClick={handleLogout}
                className='cursor-pointer bg-red-500 text-white rounded-2xl px-3 py-2 hover:bg-red-600'
              >
                Sign Out
              </li>
            </>
          )}
        </ul>

        {/* Mobile Hamburger Button */}
        <button
          className='md:hidden flex flex-col gap-1.5 p-2'
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-black transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-5 h-0.5 bg-black transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-5 h-0.5 bg-black transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className='md:hidden fixed top-20 left-1/2 -translate-x-1/2 z-40 w-[90%] sm:w-[75%] bg-white rounded-2xl shadow-lg py-4 px-6 font-title'>
          <ul className='flex flex-col gap-3 text-black'>
            <li
              onClick={() => { navigate("/"); setMenuOpen(false); }}
              className='cursor-pointer hover:bg-black hover:text-white rounded-xl px-3 py-2'
            >
              Home
            </li>
            <li
              onClick={() => { handleExplore(); setMenuOpen(false); }}
              className='cursor-pointer hover:bg-black hover:text-white rounded-xl px-3 py-2'
            >
              Explore
            </li>
            <li
              onClick={() => { navigate("/businesses"); setMenuOpen(false); }}
              className='cursor-pointer flex items-center gap-1 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl px-3 py-2 font-semibold'
            >
              <span>🌱</span> Circular Businesses
            </li>
            <li
              onClick={() => { handleCart(); setMenuOpen(false); }}
              className='cursor-pointer hover:bg-black hover:text-white rounded-xl px-3 py-2'
            >
              Cart
            </li>
            {!username ? (
              <li
                onClick={() => { navigate("/login"); setMenuOpen(false); }}
                className='cursor-pointer hover:bg-black hover:text-white rounded-xl px-3 py-2'
              >
                Sign In
              </li>
            ) : (
              <>
                <li className='px-3 py-2 font-semibold'>{username}</li>
                <li
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className='cursor-pointer bg-red-500 text-white rounded-xl px-3 py-2 hover:bg-red-600'
                >
                  Sign Out
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
