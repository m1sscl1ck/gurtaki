import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { testGet, testPost } from "../api";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 🔹 GET-запит фоново
    testGet().then((data) => console.log("GET-відповідь API:", data));

    // 🔹 POST-запит фоново
    testPost({ name: "Dasha", age: 18 }).then((data) =>
      console.log("POST-відповідь API:", data)
    );
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-200 p-4">
      <h1 className="text-3xl font-bold mb-6">Головна сторінка</h1>
      <button
        onClick={() => navigate("/auth")}
        className="bg-blue-500 text-white p-3 rounded-md"
      >
        Перейти до авторизації
      </button>
    </div>
  );
};

export default Home;
