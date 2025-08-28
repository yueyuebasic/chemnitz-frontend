
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; 
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Sites from "./pages/Sites";
import Favorites from "./pages/Favorites";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import UpdateProfile from "./pages/UpdateProfile";
import DeleteAccount from "./pages/DeleteAccount";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sites" element={<Sites />} />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/update-profile" element={<UpdateProfile />} />
            <Route path="/delete-account" element={<DeleteAccount />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
