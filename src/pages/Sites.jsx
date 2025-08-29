import React, { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";
import FavoriteButton from "../components/FavoriteButton";
import LoginModal from "../components/LoginModal";
import {MapPin,Tag,Compass,Phone,Globe,Clock,
        Mail, BadgeDollarSign, Smartphone, 
        Utensils, Truck, Salad, Sofa,
        Cigarette, Package, Sun, CreditCard,
} from "lucide-react";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const manIcon = L.icon({
    iconUrl: "/man.png",       
    iconSize: [36, 36],        
    iconAnchor: [18, 36],      
    popupAnchor: [0, -36]      
});

const formatAddress = (address) => {
    if (!address || Object.values(address).every((val) => !val || val.trim() === "")) {
        return null;
    }
    return `${address.street || ""} ${address.housenumber || ""}, ${address.postcode || ""} ${address.city || ""}, ${address.country || ""}`;
};

const MapFlyTo = ({ coordinates }) => {
    const map = useMap();

    useEffect(() => {
        if (coordinates && map) {
            map.flyTo(coordinates, 13);

            setTimeout(() => {
                const offsetX = -(window.innerWidth / 3); 
                map.panBy([offsetX, 0], {
                animate: true,
                duration: 0.5,
                });
        }, 600);
        }
    }, [coordinates, map]);

    return null;
};


const Sites = () => {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [type, setType] = useState("");
    const [pois, setPois] = useState([]);
    const [activePoiId, setActivePoiId] = useState(null);
    const [detailPoi, setDetailPoi] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const cardRefs = useRef({});
    const markerRefs = useRef({});
    const [filteredPois, setFilteredPois] = useState([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [clickedLatLng, setClickedLatLng] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [nearbyPois, setNearbyPois] = useState([]);
    const [wheelchair, setWheelchair] = useState("");
    const [openingHours, setOpeningHours] = useState("");
    const [artworkType, setArtworkType] = useState("");
    const [cuisine, setCuisine] = useState("");
    const [dietType, setDietType] = useState("");
    const [delivery, setDelivery] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);



    const categoryTypesMap = {
        amenity: [
            { value: "theatre", label: "Theatre" },
            { value: "restaurant", label: "Restaurant" },
        ],
        tourism: [
            { value: "museum", label: "Museum" },
            { value: "artwork", label: "Artwork" },
        ],
    };

    useEffect(() => {
        const fetchPois = async () => {
        try {
            let url = "https://chemnitz-backend-cfergkhzc2a5aacr.francecentral-01.azurewebsites.net/api/pois";
            if (search) {
                url = `https://chemnitz-backend-cfergkhzc2a5aacr.francecentral-01.azurewebsites.net/api/pois/search?keyword=${encodeURIComponent(search)}`;
            } else if (category || type) {
                const params = new URLSearchParams();
                if (category) params.append("category", category);
                if (type) params.append("type", type);
                url = `https://chemnitz-backend-cfergkhzc2a5aacr.francecentral-01.azurewebsites.net/api/pois/filter?${params.toString()}`;
            }
            const res = await axios.get(url);
            setPois(res.data);
        } catch (err) {
            console.error("Failed to fetch POIs", err);
        }
        };
            fetchPois();
        }, [search, category, type]);

    useEffect(() => {
        if (activePoiId && cardRefs.current[activePoiId]) {
            cardRefs.current[activePoiId].scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [activePoiId]);

    useEffect(() => {
        if (activePoiId && markerRefs.current[activePoiId]) {
            markerRefs.current[activePoiId].openPopup();
        }
    }, [activePoiId]);

    const handleCardClick = (poi) => {
        setDetailPoi(poi);
        setActivePoiId(poi._id);
    };

    const handleBackToList = () => {
        setDetailPoi(null);
        setActivePoiId(null);
    };
    
    useEffect(() => {
        const fetchData = async () => {
        
            if (showFavoritesOnly) {
            
                try {
                    const res = await axios.get("https://chemnitz-backend-cfergkhzc2a5aacr.francecentral-01.azurewebsites.net/api/favorites", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    });
                const favs = res.data;
                const poiFavorites = favs.filter(f => f.targetType === "poi" && f.item).map(f => f.item);
                setPois(poiFavorites);
                const filtered = poiFavorites.filter(poi => {
                const matchesSearch = !search || poi.name.toLowerCase().includes(search.toLowerCase());
                const matchesCategory = !category || poi.category === category;
                const matchesType = !type || poi.type === type;
                const matchesWheelchair = !wheelchair || (poi.wheelchair && poi.wheelchair === wheelchair);
                const matchesOpeningHours = !openingHours || (poi.opening_hours && poi.opening_hours.includes(openingHours));
                const matchesArtworkType = !artworkType || (poi.artwork_type && poi.artwork_type === artworkType);
                const matchesCuisine = !cuisine || (poi.cuisine && poi.cuisine === cuisine);
                const matchesDietType = !dietType || (poi["diet:type"] && poi["diet:type"] === dietType);
                const matchesDelivery = !delivery || (poi.delivery && poi.delivery === delivery);
            
                return matchesSearch && 
                matchesCategory && 
                matchesType && 
                matchesWheelchair &&
                matchesOpeningHours &&
                matchesArtworkType &&
                matchesCuisine &&
                matchesDietType &&
                matchesDelivery;
                });
                setFilteredPois(filtered);

            
                
                } catch (err) {
                    console.error("Failed to load favorites", err);
                    alert("Please log in to view favorites.");
                    setPois([]);
                    setFilteredPois([]);
                }

            } else {
            
            
                try {
                    let url = "https://chemnitz-backend-cfergkhzc2a5aacr.francecentral-01.azurewebsites.net/api/pois";
                    const params = new URLSearchParams();
                    params.append("page", page); 
                    params.append("limit", 20);  


                    if (search) {
                        
                        url = `https://chemnitz-backend-cfergkhzc2a5aacr.francecentral-01.azurewebsites.net/api/pois/search?keyword=${encodeURIComponent(search)}`;
                    } else {
                    
                        if (category) params.append("category", category);
                        if (type) params.append("type", type);
                        if (wheelchair) params.append("wheelchair", wheelchair);
                        if (artworkType) params.append("artwork_type", artworkType);
                        if (openingHours) params.append("opening_hours", openingHours);
                        if (dietType) params.append("dietType", dietType);
                        if (delivery) params.append("delivery", delivery);
                        if (cuisine) params.append("cuisine", cuisine);

                        if ([...params].length > 0) {
                            url = `https://chemnitz-backend-cfergkhzc2a5aacr.francecentral-01.azurewebsites.net/api/pois/filter?${params.toString()}`;
                        } else {
                            url = `https://chemnitz-backend-cfergkhzc2a5aacr.francecentral-01.azurewebsites.net/api/pois?${params.toString()}`;
                        }
                    }

                    const res = await axios.get(url);
                    const newData = res.data;

                    if (page === 1) {
                        setPois(newData);
                        setFilteredPois(newData);
                    } else {
                        setPois(prev => [...prev, ...newData]);
                        setFilteredPois(prev => [...prev, ...newData]);
                    }

                    setHasMore(newData.length === 20); 
            
                } catch (err) {
                    console.error("Failed to fetch POIs", err);
                    if (page === 1) {
                        setPois([]);
                        setFilteredPois([]);
                    }
                    setHasMore(false);
                }
            }
        };

        fetchData();
    }, [showFavoritesOnly, search, category, type, wheelchair, artworkType, openingHours, dietType, cuisine, delivery, page]);

    useEffect(() => {
    if (!showFavoritesOnly) {
        setPage(1);
    }
    }, [search, category, type, wheelchair, artworkType, openingHours, dietType, cuisine, delivery, showFavoritesOnly]);

    const handleToggleFavorites = () => {
        if (!localStorage.getItem("token")) {
            setShowLoginModal(true);  
            return;                   
        }
        setShowFavoritesOnly(!showFavoritesOnly);
        setSearch("");
        setCategory("");
        setType("");
    };


    
    const renderAdditionalDetails = (rawProperties = {}) => {
    
        const detailFields = [
            { key: "artwork_type", label: "Artwork Type" },
            { key: "material", label: "Material" },
            { key: "wikipedia", label: "Wikipedia" },
            { key: "artist_name", label: "Artist Name" },
            { key: "start_date", label: "Start Date" },
            { key: "year_of_construction", label: "Year of Construction" },
            { key: "landuse", label: "Land Use" },
            { key: "museum", label: "Museum" },
            { key: "operator", label: "Operator" },
            { key: "website", label: "Website", icon: Globe },
            { key: "email", label: "Email", icon: Mail },
            { key: "fax", label: "Fax" },
            { key: "fee", label: "Fee", icon: BadgeDollarSign },
            { key: "opening_hours", label: "Opening Hours", icon: Clock },
            { key: "phone", label: "Phone", icon: Phone },
            { key: "mobile", label: "Mobile", icon: Smartphone },
            { key: "toilets:wheelchair", label: "Wheelchair Accessible Toilets" },
            { key: "architect", label: "Architect" },
            { key: "description", label: "Description" },
            { key: "cuisine", label: "Cuisine", icon: Utensils },
            { key: "delivery", label: "Delivery", icon: Truck },
            { keyPrefix: "diet:", labelPrefix: "Diet", icon: Salad },
            { key: "indoor_seating", label: "Indoor Seating", icon: Sofa },
            { key: "outdoor_seating", label: "Outdoor Seating", icon: Sun },
            { keyPrefix: "payment:", labelPrefix: "Payment", icon: CreditCard },
            { keyPrefix: "roof:", labelPrefix: "Roof" },
            { key: "smoking", label: "Smoking", icon: Cigarette },
            { key: "takeaway", label: "Takeaway", icon: Package },
        ];

        return (
            <div className="mt-4 space-y-2 text-sm text-gray-700">
            {detailFields.map(({ key, label, keyPrefix, labelPrefix, icon }) => {
                if (key) {
                    const value = rawProperties[key];
                    if (value) {
                        const IconComponent = icon;
                        if (key === "website" || key === "wikipedia") {
                            const url = value.startsWith("http") ? value : "https://" + value;
                            return (
                                <p key={key}>
                                    {IconComponent && <IconComponent className="inline-block w-5 h-5 mr-1 text-gray-500" />}
                                    <strong>{label}:</strong>{" "}
                                    <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                    {value}
                                    </a>
                                </p>
                            );
                        }
                        return (
                            <p key={key} className="flex items-start gap-2">
                            {IconComponent && <IconComponent className="inline-block w-5 h-5 mr-1 text-gray-500" />}
                            <strong>{label}:</strong> {value}
                            </p>
                        );
                    }

                } else if (keyPrefix) {

                    const IconComponent = icon;
                    const matchedEntries = Object.entries(rawProperties).filter(([k, v]) => k.startsWith(keyPrefix) && v);
                    if (matchedEntries.length > 0) {
                        return (
                            <div key={keyPrefix} className="flex items-start gap-2">
                                {IconComponent && <IconComponent className="inline-block w-5 h-5 mr-1 text-gray-500" />}
                                <div>
                                    <strong>{labelPrefix}:</strong>
                                    <ul className="list-disc ml-5">
                                    {matchedEntries.map(([k, v]) => (
                                    <li key={k}>
                                    {k.replace(keyPrefix, "").replace(/_/g, " ")}: {v.toString()}
                                    </li>
                                    ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    }
                }
                return null;
            })}
            </div>
        );
    };

    function ClickHandler({ onClick }) {
    useMapEvents({
        click(e) {
        onClick(e.latlng);
        },
    });
    return null;
    }

    const handleMapClick = (latlng) => {
        setClickedLatLng(latlng);
        setShowModal(true);
    };

    const handleConfirmExploration = async () => {
        setShowModal(false);
        if (!clickedLatLng) return;

        const res = await fetch(`https://chemnitz-backend-cfergkhzc2a5aacr.francecentral-01.azurewebsites.net/api/pois/nearby?lat=${clickedLatLng.lat}&lng=${clickedLatLng.lng}&radius=800`);
        const data = await res.json();
        setNearbyPois(data);
    };


    return (
        <div className="relative h-[calc(100vh-64px)]">

            <MapContainer center={[50.8323, 12.9253]} zoom={13} className="h-full w-full z-0">
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                    {clickedLatLng && (
                    <Marker position={[clickedLatLng.lat, clickedLatLng.lng]} icon={manIcon}>
                    </Marker>
                    )}

                    {nearbyPois.length > 0
                    ? nearbyPois.map((poi) => (
                        <Marker
                            key={poi._id}
                            position={[poi.coordinates.coordinates[1], poi.coordinates.coordinates[0]]}
                            eventHandlers={{ click: () => {
                                setActivePoiId(poi._id);
                                setDetailPoi(poi);  
                            }}}
                        >
                            <Popup>
                                <strong>{poi.name}</strong><br />
                                Type: {poi.type}<br />
                                {formatAddress(poi.address) ? (
                                    <span className="text-sm text-gray-600">
                                        Address: {formatAddress(poi.address)}
                                    </span>
                                    ) : poi.coordinates?.coordinates ? (
                                    <span className="text-sm text-gray-500 italic">
                                        Address not provided.
                                        <br />
                                        Location: {poi.coordinates.coordinates[1].toFixed(5)}, {poi.coordinates.coordinates[0].toFixed(5)}
                                    </span>
                                    ) : (
                                    <span className="text-sm text-gray-500 italic">
                                        No location info.
                                    </span>
                                    )}
                                <br />
                                {poi.distance?.toFixed(0)}m away from me
                            </Popup>
                        </Marker>
                    ))

                : pois.map((poi) =>
                    poi.coordinates?.coordinates ? (
                        <Marker
                            key={poi._id}
                            position={[poi.coordinates.coordinates[1], poi.coordinates.coordinates[0]]}
                            ref={(ref) => ref && (markerRefs.current[poi._id] = ref)}
                            eventHandlers={{ click: () => {
                                setActivePoiId(poi._id);
                                setDetailPoi(poi);  
                            }}}
                        >
                            <Popup>
                                <strong>{poi.name}</strong>
                                <br />
                                {poi.type}
                            </Popup>
                        </Marker>
                    ) : null
                    )}

                    {activePoiId && (() => {
                        const active = pois.find((poi) => poi._id === activePoiId);
                        return active?.coordinates?.coordinates ? (
                            <MapFlyTo coordinates={[active.coordinates.coordinates[1], active.coordinates.coordinates[0]]} 
                            />
                        ) : null;
                    })()}
                    
                    <ClickHandler onClick={handleMapClick} />

            </MapContainer> 

            
            <div className="absolute top-0 left-0 h-full w-full md:w-[400px] bg-white/30 backdrop-blur-sm p-6 overflow-y-auto shadow-xl z-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Explore Cultural Sites</h2>
                    <button
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded"
                        onClick={handleToggleFavorites}
                    >
                        {showFavoritesOnly ? "🔙 Back" : "⭐ My Favorites"}
                    </button>
                </div>

                
                <div className="mb-6 flex flex-col gap-2">
                    <input
                        type="text"
                        placeholder="Search by keyword..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setNearbyPois([]);
                        }}
                        className="border rounded p-2"
                    />
                    <select
                        value={category}
                        onChange={(e) => {
                        setCategory(e.target.value);
                        setType("");
                        setNearbyPois([]); 
                        }}
                        className="border rounded p-2"
                    >
                        <option value="">All Categories</option>
                        <option value="amenity">Amenity</option>
                        <option value="tourism">Tourism</option>
                    </select>
                    <select
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value);
                            setNearbyPois([]); 
                        }}
                        className="border rounded p-2"
                        disabled={!category}
                    >
                        <option value="">All Types</option>
                        {(categoryTypesMap[category] || []).map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                        ))}
                    </select>

          
                {type === "theatre" && (
                    <select
                        value={wheelchair}
                        onChange={(e) => setWheelchair(e.target.value)}
                        className="border rounded p-2"
                    >
                        <option value="">Wheelchair Access</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="limited">Limited</option>
                    </select>
                )}

                {type === "museum" && (
                    <>
                        <input
                            type="text"
                            placeholder="Opening Hours (e.g. Mo-Su 10:00-17:00)"
                            value={openingHours}
                            onChange={(e) => setOpeningHours(e.target.value)}
                            className="border rounded p-2"
                        />
                        <select
                            value={wheelchair}
                            onChange={(e) => setWheelchair(e.target.value)}
                            className="border rounded p-2"
                        >
                            <option value="">Wheelchair Access</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                            <option value="limited">Limited</option>
                        </select>
                    </>
                )}

                {type === "artwork" && (
                    <select
                        value={artworkType}
                        onChange={(e) => setArtworkType(e.target.value)}
                        className="border rounded p-2"
                    >
                        <option value="">Artwork Type</option>
                        <option value="bust">Bust</option>
                        <option value="graffiti">Graffiti</option>
                        <option value="installation">Installation</option>
                        <option value="mural">Mural</option>
                        <option value="painting">Painting</option>
                        <option value="sculpture">Sculpture</option>
                        <option value="statue">Statue</option>
                    </select>
                )}

                {type === "restaurant" && (
                    <>
                        <select
                            value={cuisine}
                            onChange={(e) => setCuisine(e.target.value)}
                            className="border rounded p-2"
                        >
                            <option value="">Cuisine</option>
                            <option value="asian">Asian</option>
                            <option value="burger">Burger</option>
                            <option value="chinese">Chinese</option>
                            <option value="german">German</option>
                            <option value="greek">Greek</option>
                            <option value="indian">Indian</option>
                            <option value="italian">Italian</option>
                            <option value="japanese">Japanese</option>
                            <option value="kebab">Kebab</option>
                            <option value="mediterranean">Mediterranean</option>
                            <option value="pizza">Pizza</option>
                            <option value="regional">Regional</option>
                            <option value="turkish">Turkish</option>
                            <option value="vietnamese">Vietnamese</option>
                        </select>

                        <select
                            value={dietType}
                            onChange={(e) => setDietType(e.target.value)}
                            className="border rounded p-2"
                        >
                            <option value="">Diet Type</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="vegan">Vegan</option>
                            <option value="halal">Halal</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Opening Hours"
                            value={openingHours}
                            onChange={(e) => setOpeningHours(e.target.value)}
                            className="border rounded p-2"
                        />

                        <select
                            value={delivery}
                            onChange={(e) => setDelivery(e.target.value)}
                            className="border rounded p-2"
                        >
                            <option value="">Delivery</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </>
                )}
            </div>

        
            <div className="space-y-4">
                {filteredPois.map((poi) => (
                    <div
                        key={poi._id}
                        ref={(el) => (cardRefs.current[poi._id] = el)}
                        onClick={() => handleCardClick(poi)}
                        className={`border rounded p-4 shadow transition bg-white ${
                            poi._id === activePoiId ? "bg-white border-blue-500 shadow-lg ring-2 ring-blue-400" : ""
                        }`}
                    >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-lg">
                                {poi.name && poi.name.toLowerCase() !== "unnamed"
                                ? poi.name
                                : `Unnamed ${poi.type?.charAt(0).toUpperCase() + poi.type?.slice(1)}`}
                            </h3>
                            <p className="text-sm text-gray-600">Type: {poi.type}</p>
                            {formatAddress(poi.address) ? (
                                <p className="text-sm text-gray-600">Address: {formatAddress(poi.address)}</p>
                            ) : poi.coordinates?.coordinates ? (
                                <p className="text-sm text-gray-500 italic">
                                Address not provided.
                                <br />
                                Location: {poi.coordinates.coordinates[1].toFixed(5)}, {poi.coordinates.coordinates[0].toFixed(5)}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No location info.</p>
                            )}
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                            <FavoriteButton itemId={poi._id} itemType="poi" />
                        </div>
                    </div>
                    </div>
                ))}
            </div>

            
            {!showFavoritesOnly && hasMore && (
                <button
                    onClick={() => setPage(prev => prev + 1)}
                    className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded w-full"
                >
                    Load More
                </button>
            )}
            </div>

           
            {detailPoi && (
                <div className="
                    absolute 
                    top-20 left-[420px] w-[300px] max-h-[calc(100vh-5rem)] 
                    border border-gray-200 bg-white/90 backdrop-blur-md shadow-2xl rounded-lg z-30 p-6 overflow-y-auto
                    md:w-[400px] md:left-[420px] md:top-20
                    w-full left-0 bottom-0 top-auto rounded-t-xl
                    ">

                    {/*<div className="absolute top-4 right-4 z-40">
                        <FavoriteButton itemId={detailPoi._id} itemType="poi" />
                    </div>*/}
                    <button
                        onClick={handleBackToList}
                        className="mb-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        ← Back
                    </button>
                    <h2 className="text-2xl font-bold mb-2">{detailPoi.name}</h2>

                    {detailPoi.type && (
                        <p className="flex items-center text-gray-700 mb-2">
                            <Tag className="w-5 h-5 mr-2 text-gray-500" />
                            Type: {detailPoi.type}
                        </p>
                    )}
                    
                    {formatAddress(detailPoi.address) && (
                        <p className="flex items-center text-gray-700 mb-2">
                            <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                            Address: {formatAddress(detailPoi.address)}
                        </p>
                        
                    )}

                    {detailPoi.coordinates?.coordinates && (
                        <p className="flex items-center text-gray-500 italic mb-2">
                            <Compass className="w-5 h-5 mr-2 text-gray-500" />
                            Location: {detailPoi.coordinates.coordinates[1].toFixed(5)},{" "}
                            {detailPoi.coordinates.coordinates[0].toFixed(5)}
                        </p>
                    )}

                    {renderAdditionalDetails(detailPoi.rawProperties)}

                </div>
            )}

            <button
                onClick={() => setShowLoginModal(true)}
                className="text-sm text-blue-500 hover:underline ml-2"
            >
                Login
            </button>
            {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
       
           
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
                    <div className="bg-white p-6 rounded-xl shadow-md text-center">
                        <p className="text-lg mb-4">Want to see which sites are accessible within 10 munites on foot?</p>
                        <button
                            onClick={handleConfirmExploration}
                            className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => setShowModal(false)}
                            className="bg-gray-300 px-4 py-2 rounded"
                        >
                            No
                        </button>
                    </div>
                </div>
            )}


    </div>
    );
};

export default Sites;
