
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation.jsx";
import Home from "./components/Home.jsx";
import Predict from "./components/Predict.jsx";
import Outbreak from "./components/Outbreak.jsx";
import { ToastProvider } from "./components/Toast.jsx";

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/outbreak" element={<Outbreak />} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
