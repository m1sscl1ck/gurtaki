import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    dormitory_number: "",
    pass_photo: null,
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "pass_photo") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("dormitory_number", formData.dormitory_number);
      formDataToSend.append("pass_photo", formData.pass_photo);
      formDataToSend.append("password", formData.password);

      const response = await register(formDataToSend);
      if (response.data?.user || response.data?.token) {
        navigate("/auth");
      } else {
        setError("Помилка реєстрації. Спробуйте ще раз.");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Помилка реєстрації. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-200">
      <div className="bg-white rounded-xl shadow-lg p-8 w-80">
        <h1 className="text-2xl font-bold text-center mb-6">Реєстрація</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Ім'я"
            className="border rounded-md p-2"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="dormitory_number"
            placeholder="Номер гуртожитку"
            className="border rounded-md p-2"
            value={formData.dormitory_number}
            onChange={handleChange}
            required
          />
          <input
            type="file"
            name="pass_photo"
            accept="image/*"
            className="border rounded-md p-2"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            className="border rounded-md p-2"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-md p-2 mt-2"
            disabled={loading}
          >
            {loading ? "Завантаження..." : "SIGN UP"}
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
