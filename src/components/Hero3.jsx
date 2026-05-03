import React from 'react'
import { Link } from 'react-router-dom'

const Hero3 = () => {
  return (
    <div>
      <div className="footer font-title">
        <div className="footerdetails">
          <div className="footercontent py-8 bg-black text-white">
            <div className="footerflex flex flex-col sm:flex-row justify-around items-center gap-6 sm:gap-0 px-4 text-center sm:text-left">
              <div className="Cartify font-bat text-2xl">
                Ecoloop
              </div>
              <ul className='flex flex-wrap justify-center items-center gap-4 sm:gap-10'>
                <Link to="/"><li className='p-2 hover:bg-white hover:text-black px-3 rounded-xl cursor-pointer'>Home</li></Link>
                <Link to="/explore"><li className='p-2 hover:bg-white hover:text-black px-3 rounded-xl cursor-pointer'>Explore</li></Link>
                <Link to="/cart"><li className='p-2 hover:bg-white hover:text-black px-3 rounded-xl cursor-pointer'>Cart</li></Link>
                <Link to="/login"><li className='p-2 hover:bg-white hover:text-black px-3 rounded-xl cursor-pointer'>Sign In</li></Link>
              </ul>
              <div className="copyright text-sm">
                © 2026 Copyright Claim
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero3