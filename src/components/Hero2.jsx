import React from "react";

const testimonials = [
  {
    name: "Srikar Karthik",
    text: "This platform completely changed how we manage bookings. Its fast, simple, and very reliable,"
  },
  {
    name: "Ruthwik Reddy",
    text: "Clean interface and smooth experience. Everything works exactly the way we need it to",
  },
  {
    name: "Chervith Nannagaru",
    text: "Highly professional and easy to use. I would definitely recommend this to others",
  },
];

const Hero2 = () => {
  return (
    <>
      <section className="bg-[#a8c2ea] py-20 px-6 font-title">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black">
            What Do Our Users Say?
          </h2>
          <div className="w-24 h-1 bg-white mx-auto mt-4"></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center justify-center px-4 sm:px-10">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 text-center w-full sm:w-auto"
            >
              <p className="text-black mb-6 text-sm font-semibold">
                "{item.text}"
              </p>
              <div className="flex justify-center mb-4"></div>
              <h3 className="text-lg font-semibold text-black">
                {item.name}
              </h3>
              <p className="text-gray-500 text-sm">{item.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#cef3ef] font-title py-16 px-4">
        <div className="contact flex flex-col justify-center items-center gap-6">
          <div className="headercontext flex flex-col items-center text-center">
            <div className="contactus text-black text-3xl sm:text-4xl md:text-5xl font-bold">
              Frequently Asked Questions
            </div>
            <div className="w-24 h-1 bg-white mx-auto mt-4"></div>
          </div>
          <div className="questions w-full max-w-[1150px] mt-2">
            <div className="question1 bg-[#1F2937] text-white p-4 py-5">What is EcoLoop and how does it work?</div>
          </div>
          <div className="questions w-full max-w-[1150px]">
            <div className="question1 bg-[#1F2937] text-white p-4 py-5">What types of products can I buy or sell on EcoLoop?</div>
          </div>
          <div className="questions w-full max-w-[1150px]">
            <div className="question1 bg-[#1F2937] text-white p-4 py-5">Is EcoLoop only for second-hand products?</div>
          </div>
          <div className="questions w-full max-w-[1150px]">
            <div className="question1 bg-[#1F2937] text-white p-4 py-5">How does EcoLoop promote sustainability?</div>
          </div>
          <div className="questions w-full max-w-[1150px]">
            <div className="question1 bg-[#1F2937] text-white p-4 py-5">How does EcoLoop ensure secure transactions?</div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero2;