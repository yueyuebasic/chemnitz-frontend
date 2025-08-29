import React, { useState, useEffect} from "react";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import LoginModal from "./LoginModal";

const FavoriteButton = ({ itemId, itemType }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);


    useEffect(() => {
        const fetchFavoriteStatus = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const response = await axios.get("https://chemnitz-backend-cfergkhzc2a5aacr.francecentral-01.azurewebsites.net/api/favorites", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const favorites = response.data || [];
                const found = favorites.find(
                    (fav) => fav.targetId === itemId && fav.targetType === itemType
                );

                setIsFavorite(!!found);
            } catch (error) {
                console.error("Error fetching favorites:", error);
            }
        };

        fetchFavoriteStatus();
    }, [itemId, itemType]);

    const toggleFavorite = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setShowLoginModal(true);
            return;
        }

        setLoading(true);
        try {
            if (isFavorite) {
                await axios.post("https://chemnitz-backend-cfergkhzc2a5aacr.francecentral-01.azurewebsites.net/api/favorites/remove", 
                    { targetId: itemId, targetType: itemType },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setIsFavorite(false);
            } else {
                await axios.post("https://chemnitz-backend-cfergkhzc2a5aacr.francecentral-01.azurewebsites.net/api/favorites",
                    { targetId: itemId, targetType: itemType },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setIsFavorite(true);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            alert("Failed to update favorite, please try again.");
        }
        setLoading(false);
    };

    return (
        <>
            <button
                onClick={toggleFavorite}
                disabled={loading}
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                className={`text-2xl transition-colors duration-300 ${
                    isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-400"
                } focus:outline-none`}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
            {loading ? (
                <svg
                    className="animate-spin h-6 w-6 text-gray-600 mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                </svg>
            ) : isFavorite ? (
                <FaHeart />
            ) : (
                <FaRegHeart />
            )}
            </button>
            {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
        </>
    );
};

export default FavoriteButton;
