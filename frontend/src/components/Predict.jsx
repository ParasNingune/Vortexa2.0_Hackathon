import React, { useState } from "react";

export default function Predict() {
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      alert("Prediction triggered for: " + file.name);
    } else {
      alert("Please upload a picture first.");
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl font-bold text-green-800 mb-8">Upload Crop Image</h2>
  
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg text-center transition-transform transform hover:scale-105"
      >

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-6 w-full border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
      />

      <button
        type="submit"
        className="bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 shadow-lg transition transform hover:scale-105"
      >
        
      Upload & Predict
    </button>
  </form>
</div>

  );
}
