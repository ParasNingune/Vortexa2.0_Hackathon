import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import diseases from "../Data/disease_info.json";

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      <div className="relative mb-6">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <img src={icon} alt={title} className="w-10 h-10 filter brightness-0 invert" loading="lazy" />
        </div>
      </div>
      <h3 className="font-bold text-xl text-gray-800 mb-3 group-hover:text-green-600 transition-colors">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ number, label, color }) {
  return (
    <div className={`text-center p-6 rounded-2xl ${color} backdrop-blur-sm`}>
      <div className="text-4xl font-bold mb-2">{number}</div>
      <div className="text-sm font-semibold opacity-90">{label}</div>
    </div>
  );
}

export default function Home() {
  const observerRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.observe-me');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-green-700 via-green-600 to-emerald-700 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white opacity-5 rounded-full translate-x-20 translate-y-20"></div>
          </div>
          <div className="relative container mx-auto px-6 py-20 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              AI Crop Disease
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Tracker
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
              Revolutionizing agriculture with AI-powered disease detection and smart farming solutions
            </p>
            
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
              <StatCard number="37+" label="Diseases Detected" color="bg-white/20 text-white" />
              <StatCard number="95%" label="Accuracy Rate" color="bg-white/20 text-white" />
              <StatCard number="24/7" label="AI Monitoring" color="bg-white/20 text-white" />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
              <Link
                to="/predict"
                className="group bg-white text-green-700 font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex items-center space-x-3"
              >
                <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Start Detection</span>
              </Link>

              <Link
                to="/outbreak"
                className="group bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-2xl hover:bg-white hover:text-green-700 transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-3"
              >
                <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>View Outbreaks</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Disease Information Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Common Plant Diseases
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Learn about the most prevalent diseases affecting crops worldwide and how our AI can help identify them early
              </p>
            </div>

            <div className="space-y-24">
              {diseases.map((section, index) => (
                <div
                  key={section.id}
                  className={`observe-me flex flex-col lg:flex-row items-center gap-12 opacity-0 ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div className="lg:w-1/2">
                    <div className="relative group">
                      <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity blur-xl"></div>
                      <img
                        src={section["image url"]}
                        alt={section["name of disease"]}
                        className="relative w-full h-80 object-cover rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 transform group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  
                  <div className="lg:w-1/2 space-y-6">
                    <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      Disease #{section.id}
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                      {section["name of disease"]}
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {section["disease description"]}
                    </p>
                    <div className="flex items-center space-x-4 pt-4">
                      <div className="w-12 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                      <span className="text-sm text-gray-500 font-medium">AI Detection Available</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-50"></div>
          <div className="relative container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Powerful AI Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Cutting-edge technology meets agriculture to provide you with the most accurate and actionable insights
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <FeatureCard
                icon="https://cdn-icons-png.flaticon.com/512/4149/4149670.png"
                title="AI Disease Detection"
                description="Advanced computer vision algorithms analyze plant images to identify diseases with 95% accuracy in seconds."
              />
              <FeatureCard
                icon="https://cdn-icons-png.flaticon.com/512/3208/3208750.png"
                title="Smart Treatment Guidance"
                description="Receive personalized treatment recommendations based on disease severity, crop type, and environmental factors."
              />
              <FeatureCard
                icon="https://cdn-icons-png.flaticon.com/512/2913/2913465.png"
                title="Outbreak Forecasting"
                description="Climate-based predictive modeling helps you stay ahead of potential disease outbreaks in your region."
              />
            </div>

            {/* Additional Benefits */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-12 text-white text-center shadow-2xl">
              <h3 className="text-3xl font-bold mb-6">Why Choose Our AI Solution?</h3>
              <div className="grid md:grid-cols-4 gap-8">
                <div>
                  <div className="text-4xl font-bold mb-2">37+</div>
                  <div className="text-green-100">Disease Types</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">&lt; 5s</div>
                  <div className="text-green-100">Analysis Time</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">95%</div>
                  <div className="text-green-100">Accuracy Rate</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">24/7</div>
                  <div className="text-green-100">Availability</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Protect Your Crops?
            </h2>
            <p className="text-xl mb-10 opacity-90">
              Join thousands of farmers already using AI to safeguard their harvests
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/predict"
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-10 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                Start Free Analysis
              </Link>
              <Link
                to="/outbreak"
                className="border-2 border-white text-white font-bold px-10 py-4 rounded-2xl hover:bg-white hover:text-gray-800 transition-all duration-300 transform hover:-translate-y-1"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-2">
                <h3 className="text-2xl font-bold mb-4">AI Crop Disease Tracker</h3>
                <p className="text-gray-400 leading-relaxed">
                  Empowering farmers with AI-driven insights to protect crops and maximize yields through early disease detection and smart recommendations.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Features</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Disease Detection</li>
                  <li>Treatment Guidance</li>
                  <li>Outbreak Forecasting</li>
                  <li>Real-time Analysis</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Documentation</li>
                  <li>API Reference</li>
                  <li>Community</li>
                  <li>Contact Us</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>© 2025 AI Crop Disease Tracker | Smart Farming for the Future</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
