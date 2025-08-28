import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();            
        navigate("/");       
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                <div className="text-xl font-bold text-gray-800">Chemnitz Explorer</div>
                  <div className="space-x-6">
                        <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
                        <Link to="/sites" className="text-gray-700 hover:text-blue-600">Sites</Link>
                        <Link to="/favorites" className="text-gray-700 hover:text-blue-600">Favorites</Link>
                        {user ? (
                            <div className="inline-block relative">
                                <button
                                  onClick={() => setDropdownOpen(!dropdownOpen)}
                                  className="text-gray-700 hover:text-blue-600"
                                >
                                  {user.username || "User"} ⌄
                                </button>
                                {dropdownOpen && (
                                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                                    <Link
                                      to="/update-profile"
                                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                      onClick={() => setDropdownOpen(false)}
                                    >
                                      Update Profile
                                    </Link>
                                    <Link
                                      to="/delete-account"
                                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                      onClick={() => setDropdownOpen(false)}
                                    >
                                      Delete Account
                                    </Link>
                                    <button
                                      onClick={handleLogout}
                                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                    >
                                      Logout
                                    </button>
                                  </div>
                                )}
                              </div>
                        ) : (
                              <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
                        )}
                  </div>
            </div>
        </nav>
    );
};

export default Navbar;
