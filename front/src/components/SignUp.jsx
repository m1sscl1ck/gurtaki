import React from "react";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-200">
      <div className="bg-white rounded-xl shadow-lg p-8 w-80">
        <h1 className="text-2xl font-bold text-center mb-6">Реєстрація</h1>
        <form className="flex flex-col gap-4">
          <input type="text" placeholder="Ім'я" className="border rounded-md p-2" />
          <input type="email" placeholder="Email" className="border rounded-md p-2" />
          <input type="password" placeholder="Пароль" className="border rounded-md p-2" />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-md p-2 mt-2"
          >
            SIGN UP
          </button>
        </form>
        <p
          className="text-gray-500 mt-4 cursor-pointer"
          onClick={() => navigate("/auth")}
        >
          Повернутися на вхід
        </p>
      </div>
    </div>
  );
};

export default SignUp;
