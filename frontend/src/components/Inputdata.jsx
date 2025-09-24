import React, { useState } from "react";

export default function OutbreakForm() {
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    date: "",
    cases: "",
    type: "",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
    alert("Form submitted! Check console for data.");
    // Here you can send data to backend or API
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f6f5",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#fff",
          padding: "30px 40px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "450px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
            color: "#2a7a74",
          }}
        >
          Outbreak Data Form
        </h2>

        <label>Uploader Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter your name"
          style={inputStyle}
        />

        <label>Latitude:</label>
        <input
          type="number"
          name="latitude"
          value={formData.latitude}
          onChange={handleChange}
          required
          step="0.0001"
          placeholder="e.g., 28.6139"
          style={inputStyle}
        />

        <label>Longitude:</label>
        <input
          type="number"
          name="longitude"
          value={formData.longitude}
          onChange={handleChange}
          required
          step="0.0001"
          placeholder="e.g., 77.2090"
          style={inputStyle}
        />

        <label>Date of Observation:</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <label>Number of Cases Observed:</label>
        <input
          type="number"
          name="cases"
          value={formData.cases}
          onChange={handleChange}
          required
          placeholder="Enter number of cases"
          style={inputStyle}
        />

        <label>
          Type of Outbreak/Disease <span style={{ fontWeight: "normal", color: "#666", fontSize: "0.9em" }}>(Optional)</span>
        </label>
        <input
          type="text"
          name="type"
          value={formData.type}
          onChange={handleChange}
          placeholder="e.g., Dengue"
          style={inputStyle}
        />

        <label>
          Additional Notes <span style={{ fontWeight: "normal", color: "#666", fontSize: "0.9em" }}>(Optional)</span>
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="4"
          placeholder="Any additional information"
          style={textareaStyle}
        ></textarea>

        <button type="submit" style={buttonStyle}>
          Submit
        </button>
      </form>
    </div>
  );
}

// Inline styles
const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#2a7a74",
  color: "white",
  fontSize: "16px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
