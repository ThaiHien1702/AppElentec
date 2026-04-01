import React from "react";
import Header from "../../components/landing/Header";
import Hero from "../../components/landing/Hero";
import AboutCompany from "../../components/landing/AboutCompany";
import Features from "../../components/landing/Features";
import Recruitment from "../../components/landing/Recruitment";
import Testimonials from "../../components/landing/Testimonials";
import Faqs from "../../components/landing/Faqs";
import Footer from "../../components/landing/Footer";

const LandingPage = () => {
  return (
    <div className="bg-[#ffffff] text-gray-600">
      <Header></Header>
      <main>
        {/* <Hero></Hero> */}
        <AboutCompany></AboutCompany>
        {/* <Features></Features> */}
        <Recruitment></Recruitment>
        <Testimonials></Testimonials>
        <Faqs></Faqs>
        <Footer></Footer>
      </main>
    </div>
  );
};

export default LandingPage;
