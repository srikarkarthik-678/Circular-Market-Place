import React from 'react'
import heroImg from '../assets/hero.png'
import arrow from "../assets/dark-arrow.png"
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
    const navigate = useNavigate();

const handleExplore = () => {
    const user = localStorage.getItem("username");

    if (user) {
        navigate("/explore");
    } else {
        navigate("/login");
    }
};
    return (
        <div className="relative w-full h-screen bg-cover bg-center font-title" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.1)), url('360_F_232160763_FuTBWDd981tvYEJFXpFZtolm8l4ct0Nz.jpg')" }}>
            <div className="herocontents">
                <div className="bigletters flex flex-col justify-center h-screen items-center relative gap-5 px-4">
                    <div className="bigflex flex flex-col items-center gap-3 text-center">
                        <div className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white'>Buy, sell, exchange—keep the loop alive</div>
                        <div className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white'>for a better world</div>
                    </div>
                    <div className="smallitems flex flex-col items-center text-center px-2">
                        <div className="hi text-sm sm:text-base text-white">
                            Our purpose-built platform enables individuals and businesses to participate confidently in a circular economy through
                        </div>
                        <div className="hello text-sm sm:text-base text-white">
                            seamless buying, selling, and repair services
                        </div>
                    </div>
                    <div
                        onClick={handleExplore}
                        className="imgarrow flex items-center text-black bg-white gap-1 rounded-full px-6 cursor-pointer"
                    >
                        <div className="exploremore p-2">
                            Explore More
                        </div>
                        <div className="img3">
                            <img src={arrow} alt="" className='w-4 relative' />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero