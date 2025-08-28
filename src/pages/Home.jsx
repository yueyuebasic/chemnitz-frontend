// src/pages/Home.jsx
import React from "react";

const Home = () => {
    return (
        <div
            className="h-screen bg-cover bg-center bg-fixed flex flex-col items-center justify-center"
            style={{ 
              backgroundImage: `url("/karlmarx.jpg")`
            }}
        >
          <div className="text-center bg-white bg-opacity-70 p-8 rounded-xl shadow-xl">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Hello, Karl-Marx City</h1>
              <p className="text-xl md:text-2xl text-gray-700">Here is Chemnitz</p>
          </div>
        </div>
    );
};

export default Home;
