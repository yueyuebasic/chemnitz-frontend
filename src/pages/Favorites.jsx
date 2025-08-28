import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";


const Favorites = () => {
    const { token } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {  
        const fetchFavorites = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/favorites`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });

                const data = await res.json();

                if (!res.ok) {
                  throw new Error(data.error || "Failed to fetch favorites");
                }

                setFavorites(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, [token]);


  
    if (loading) return <div className="p-4 text-center">Loading favorites...</div>;
    if (error) return <div className="p-4 text-red-500 text-center">Error: {error}</div>;

    if (favorites.length === 0) {
      return <div className="p-4 text-center text-gray-600">You have no favorites yet.</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4 text-center">My Favorites</h2>
            <ul className="space-y-4">
                {favorites.map((fav, index) => (
                  <li key={index} className="border p-4 rounded shadow bg-white">
                      <h3 className="text-lg font-semibold mb-1">
                        {fav.item?.name || "Unnamed"}{" "}
                        {fav.type && <span className="text-sm text-gray-500">({fav.type})</span>}
                      </h3>

                      {fav.item?.address &&
                          (fav.item.address.street ||
                              fav.item.address.housenumber ||
                              fav.item.address.postcode ||
                              fav.item.address.city ||
                              fav.item.address.country) ? (
                            <p className="text-sm text-gray-600">
                                Address:{" "}
                                {`${fav.item.address.street || ""} ${fav.item.address.housenumber || ""}, ${fav.item.address.postcode || ""} ${fav.item.address.city || ""}, ${fav.item.address.country || ""}`}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-600">
                                Address: Not provided
                            </p>
                          )
                      }

                      
                      {!(
                        fav.item?.address &&
                          (fav.item.address.street ||
                            fav.item.address.housenumber ||
                            fav.item.address.postcode ||
                            fav.item.address.city ||
                            fav.item.address.country)
                      ) && fav.item?.coordinates?.coordinates && (
                        <p className="text-sm text-gray-600">
                            Coordinates: {fav.item.coordinates.coordinates[1].toFixed(6)},{" "}
                            {fav.item.coordinates.coordinates[0].toFixed(6)}
                        </p>
                      )}

                     
                      {fav.item?.category && (
                        <p className="text-sm text-gray-600">Category: {fav.item.category}</p>
                      )}
                  </li>
              ))}
          </ul>
        </div>
   );
};

export default Favorites;
