import React from "react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-200">
      <div className="bg-white rounded-xl shadow-lg p-8 w-80">
        <h1 className="text-2xl font-bold text-center mb-6">єГуртaк</h1>
        <h2 className="text-center text-blue-300 mb-4">Log In</h2>
        
        <form className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter email..."
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="password"
            placeholder="Enter password..."
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            type="submit"
            className="bg-gray-200 text-gray-400 rounded-md p-2 mt-2 cursor-not-allowed"
            disabled
          >
            LOG IN
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <p
            className="text-gray-500 cursor-pointer"
            onClick={() => navigate("/")}
          >
            Повернутися на головну
          </p>
          <p
            className="text-blue-500 font-semibold cursor-pointer mt-1"
            onClick={() => navigate("/signup")}
          >
            SIGNUP
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
