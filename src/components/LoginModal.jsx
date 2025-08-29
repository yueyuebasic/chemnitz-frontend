import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";

const LoginModal = ({ onClose }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
        const res = await fetch("https://chemnitz-backend-cfergkhzc2a5aacr.francecentral-01.azurewebsites.net/api/auth/login", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || "Login failed");
        }

        const data = await res.json();
            login(data.user, data.token); 
            onClose(); 
        } catch (err) {
            setError(err.message);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative bg-white p-6 rounded-lg w-[90%] max-w-sm shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-center">Login to continue</h2>

                {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Login
                    </button>
                </form>

                <button
                    onClick={onClose}
                    className="mt-4 w-full text-gray-500 text-sm hover:underline"
                >
                    Cancel
                </button>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-500 hover:underline">
                    Register here
                    </Link>
                </p>
            </div>
        </div>,
        document.getElementById("modal-root")
    );

};

export default LoginModal;
