import React, { useState } from "react";

const testimonials = [
  {
    name: "Srikar Karthik",
    text: "This platform completely changed how we manage bookings. Its fast, simple, and very reliable,",
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

const faqs = [
  {
    question: "What is EcoLoop and how does it work?",
    answer:
      "EcoLoop is a sustainable marketplace where users can buy, sell, and repair pre-owned electronics. Simply sign up, list your item with photos and a price, and connect with buyers in your area.",
  },
  {
    question: "What types of products can I buy or sell on EcoLoop?",
    answer:
      "You can buy or sell mobile phones, laptops, TVs, kitchen appliances, washing machines, headphones, and more. Basically any electronics that still have life left in them!",
  },
  {
    question: "Is EcoLoop only for second-hand products?",
    answer:
      "Primarily yes — EcoLoop focuses on pre-owned and refurbished electronics. However, sellers can also list lightly used or open-box items. Our goal is to give every device a second life.",
  },
  {
    question: "How does EcoLoop promote sustainability?",
    answer:
      "By extending the lifespan of electronics, EcoLoop reduces e-waste and carbon emissions from manufacturing new devices. Every item sold or repaired on our platform is a step toward a greener planet.",
  },
  {
    question: "How does EcoLoop ensure secure transactions?",
    answer:
      "We use Razorpay for secure payment processing with industry-standard encryption. All transactions are verified and our admin team monitors listings to ensure a safe buying and selling experience.",
  },
];

const Hero2 = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
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
              <h3 className="text-lg font-semibold text-black">{item.name}</h3>
              <p className="text-gray-500 text-sm">{item.role}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-[#cef3ef] font-title py-16 px-4">
        <div className="flex flex-col justify-center items-center gap-4">
          <div className="flex flex-col items-center text-center mb-4">
            <div className="text-black text-3xl sm:text-4xl md:text-5xl font-bold">
              Frequently Asked Questions
            </div>
            <div className="w-24 h-1 bg-white mx-auto mt-4"></div>
          </div>

          {faqs.map((faq, index) => (
            <div key={index} className="w-full max-w-[1150px]">
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between bg-[#1F2937] text-white px-5 py-4 text-left transition-all hover:bg-[#2d3f52]"
              >
                <span className="font-medium">{faq.question}</span>
                <span className="text-xl transition-transform duration-300 ml-4 shrink-0">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="bg-white text-gray-700 px-5 py-4 text-sm leading-relaxed border-l-4 border-[#1F2937]">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Hero2;
