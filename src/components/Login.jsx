import React, { useState } from "react";
import BASE_URL from "../utils/api";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullname: "",
    username: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const validate = (name, value) => {
    let error = "";
    if (!value) error = "This field is required";
    if (name === "email") {
      if (!/\S+@\S+\.\S+/.test(value)) error = "Invalid email format";
    }
    if (name === "password") {
      if (value.length < 6) error = "Minimum 6 characters required";
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    const error = validate(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const isFormValid = () => {
    if (isLogin) {
      return formData.email && formData.password && !errors.email && !errors.password;
    } else {
      return (
        formData.email && formData.password && formData.fullname && formData.username &&
        !Object.values(errors).some((e) => e)
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid() || loading) return;

    try {
      setLoading(true);

      const url = isLogin ? `${BASE_URL}/login` : `${BASE_URL}/signup`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("username", data.username);
        localStorage.setItem("isAdmin", data.isAdmin);
        alert(isLogin ? "Login successful ✅" : "Signup successful 🎉");
        window.location.href = "/explore";
      } else {
        alert(data.message || "Something went wrong ❌");
      }

      setFormData({ email: "", password: "", fullname: "", username: "" });
      setErrors({});
    } catch (err) {
      alert("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `p-2 w-[280px] rounded bg-white text-black ${errors[field] ? "border-2 border-red-500" : ""}`;

  return (
    <div className="bg-black min-h-screen text-white font-title flex justify-center items-center">
      <div className="flex justify-around items-center w-full max-w-5xl max-md:flex max-md:flex-col max-md:items-center max-md:justify-center max-md:gap-24">

        <div className="text-[55px] font-semibold font-bat">
          <a href="/" className="text-white no-underline">Ecoloop</a>
        </div>

        <div className="flex flex-col gap-4 items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsLogin(true)} className="px-6 py-2 bg-white text-black rounded-full">Log in</button>
            <span>|</span>
            <button onClick={() => setIsLogin(false)} className="px-6 py-2 bg-white text-black rounded-full">Sign Up</button>
          </div>

          <div className="text-center">
            {isLogin ? "Welcome back 👋" : "Create your account 🚀"}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input type="text" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={inputClass("email")} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className={inputClass("password")} />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

            {!isLogin && (
              <>
                <input type="text" name="fullname" placeholder="Full Name" value={formData.fullname} onChange={handleChange} className={inputClass("fullname")} />
                <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} className={inputClass("username")} />
              </>
            )}

            <button
              type="submit"
              disabled={!isFormValid() || loading}
              className={`mt-3 px-6 py-2 rounded-full ${!isFormValid() || loading ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-white text-black"}`}
            >
              {loading ? "Please wait..." : isLogin ? "Log in" : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
