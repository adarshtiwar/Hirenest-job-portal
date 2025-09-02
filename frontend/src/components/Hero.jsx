import React, { useContext, useRef, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

// Inline custom styles for animation
const CustomStyles = () => (
  <style>{`
    @keyframes heroFadeIn {
      from {opacity:0; transform:translateY(40px);}
      to {opacity:1; transform:translateY(0);}
    }
    .animate-heroFadeIn {
      animation: heroFadeIn 0.7s cubic-bezier(0.4,0,0.2,1) forwards;
    }
    @keyframes slideInUp {
      from { opacity:0; transform:translateY(30px);}
      to { opacity:1; transform:translateY(0);}
    }
    .animate-slideInUp {
      animation: slideInUp 1s cubic-bezier(0.4,0,0.2,1) forwards;
    }
    @keyframes iconBounce {
      0% { transform: scale(1);}
      40% { transform: scale(1.12);}
      100% { transform: scale(1);}
    }
    .hover\\:animate-iconBounce:hover {
      animation: iconBounce 0.5s;
    }
  `}</style>
);

// Counter Component for Animated Number
const AnimatedCounter = ({ end = 10000, duration = 1200 }) => {
  const [count, setCount] = useState(0);
  const start = 0;
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return <span>{count.toLocaleString()}</span>;
};

const Hero = () => {
  const navigate = useNavigate();
  const titleRef = useRef(null);
  const locationRef = useRef(null);
  const { setSearchFilter, setIsSearched } = useContext(AppContext);

  const searchHandler = (e) => {
    e.preventDefault();
    setSearchFilter({
      title: titleRef.current.value,
      location: locationRef.current.value,
    });
    setIsSearched(true);

    if (titleRef.current.value || locationRef.current.value) {
      navigate("/all-jobs/all");
    }
  };

  return ( 
    <div>
      <CustomStyles />
      <section className="mt-4 bg-gradient-to-r from-purple-800 to-purple-950 sm:h-80 flex items-center justify-center mx-2 sm:mx-10 rounded-3xl shadow-xl relative overflow-hidden animate-heroFadeIn">
        <div className="w-full text-center px-2 sm:px-8 py-6 flex flex-col justify-center items-center animate-slideInUp">
          {/* Animated headline: number counts up */}
          <h1 className="text-white text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">
            There Are <span className="text-yellow-400"><AnimatedCounter end={10000} duration={1500} /></span> Postings Here For You!
          </h1>

          {/* Subtext */}
          <p className="text-purple-200 text-xs sm:text-base mb-6">
            Your next big career move starts right here — explore the best job opportunities
            <br className="hidden sm:block" />
            and take the first step toward your future!
          </p>

          {/* Search Form */}
          <form
            onSubmit={searchHandler}
            className="w-full max-w-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mx-auto"
          >
            {/* Job Title Input */}
            <div className="flex items-center bg-white rounded-md px-3 py-2 flex-1 drop-shadow-md">
              <img src={assets.search_icon} alt="search" className="w-5" />
              <input
                type="text"
                name="job"
                placeholder="Job Title"
                ref={titleRef}
                className="ml-2 w-full focus:outline-none text-sm"
              />
            </div>

            {/* Location Input */}
            <div className="flex items-center bg-white rounded-md px-3 py-2 flex-1 drop-shadow-md">
              <img src={assets.location_icon} alt="location" className="w-5" />
              <input
                type="text"
                name="location"
                placeholder="Location"
                ref={locationRef}
                className="ml-2 w-full focus:outline-none text-sm"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow transition-transform duration-200 hover:scale-105"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Trusted by section */}
      <div className="flex flex-col items-center justify-center mt-8 sm:mt-10 space-y-4 animate-heroFadeIn">
        <p className="text-md sm:text-xl font-semibold text-gray-700">
          Trusted by
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
          <img src={assets.microsoft_logo} alt="Microsoft" className="w-20 sm:w-24 hover:animate-iconBounce transition-all duration-300" />
          <img src={assets.accenture_logo} alt="Accenture" className="w-20 sm:w-24 hover:animate-iconBounce transition-all duration-300" />
          <img src={assets.walmart_logo} alt="Walmart" className="w-20 sm:w-24 hover:animate-iconBounce transition-all duration-300" />
          <img src={assets.adobe_logo} alt="Adobe" className="w-20 sm:w-24 hover:animate-iconBounce transition-all duration-300" />
          <img src={assets.amazon_logo} alt="Amazon" className="w-20 sm:w-24 hover:animate-iconBounce transition-all duration-300" />
        </div>
      </div>
    </div>
  );
};

export default Hero;
