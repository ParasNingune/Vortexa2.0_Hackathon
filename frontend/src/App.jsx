
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home.jsx";
import Predict from "./components/Predict.jsx";
import Outbreak from "./components/Outbreak.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/outbreak" element={<Outbreak />} />
      </Routes>
    </Router>
  );
}

export default App;
