import React from "react";
import { Link } from "react-router-dom";
import diseases from "../Data/disease_info.json";

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 bg-green-100 rounded-xl shadow text-center">
      <img src={icon} alt={title} className="w-20 mx-auto mb-4" loading="lazy" />
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-green-50">
        <header className="bg-green-700 text-white p-6 shadow-md" style={{ height: "125px" }}>
          <h1 className="text-3xl font-bold text-center">AI Crop Disease Tracker</h1>
          <p className="text-center mt-2">Smart farming with AI-powered disease detection</p>
        </header>

        <div className="flex justify-center mt-8 py-4">
          <div>
          <Link
            to="/predict"
            className="bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-green-800 transition"
          >
            Go to Predict Page
          </Link>
          </div>

          <div className="mx-6">
          <Link
            to="/outbreak"
            className="bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-green-800 transition"
          >
            Go to Outbreak Visualization Page
          </Link>
          </div>
        </div>

        <div>
          {diseases.map((section, index) => (
            <section
              key={section.id}
              className={`flex flex-col md:flex-row items-center justify-center p-10 gap-10 ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              <img
                src={section["image url"]}
                alt={section["name of disease"]}
                className="w-100 rounded-2xl shadow-lg"
                loading="lazy"
              />
              <div className={`mt-6 md:mt-0 ${index % 2 === 0 ? "md:ml-20" : "md:mr-20"}`}>
                <h2 className="text-2xl font-semibold text-green-800 mb-4">
                  {section["name of disease"]}
                </h2>
                <p className="text-gray-700 leading-relaxed">{section["disease description"]}</p>
              </div>
            </section>
          ))}
        </div>

        <section className="bg-white py-12 px-6 md:px-20">
          <h2 className="text-2xl font-bold text-center text-green-800 mb-10">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="https://cdn-icons-png.flaticon.com/512/4149/4149670.png"
              title="AI Disease Detection"
              description="Identify crop diseases quickly using advanced computer vision."
            />
            <FeatureCard
              icon="https://cdn-icons-png.flaticon.com/512/3208/3208750.png"
              title="Treatment Guidance"
              description="Get actionable tips and remedies to save your crops."
            />
            <FeatureCard
              icon="https://cdn-icons-png.flaticon.com/512/2913/2913465.png"
              title="Outbreak Visualization"
              description="Climate based spread forecasting"
            />
          </div>
        </section>

        <footer className="bg-green-700 text-white p-6 text-center mt-10">
          <p>© 2025 AI Crop Disease Tracker | Smart Farming for the Future</p>
        </footer>
      </div>
    </>
  );
}
