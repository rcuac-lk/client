import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// import axios from '../api/axios';
import axios from "axios";
import AuthService from "../services/auth.service";

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // let response = await axios.post("https://server.rcuac.lk/api/auth/signup", {
      //   firstName,
      //   lastName,
      //   role,
      //   email,
      //   password,
      //   password_confirmation,
      // });
      let response = await AuthService.register(firstName, lastName, role, email, password);
      console.log(response);
      if (response.status === 200) {
        console.log(response.data);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setPasswordConfirmation("");
        setRole("");
        navigate("/login");
      } else {
        console.log("Registration failed", response.data);
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log("Error response:", error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.log("Error request:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error message:", error.message);
      }
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-white text-center mb-5">
        Registration
      </h1>
      <form
        onSubmit={handleSubmit}
        class="max-w-sm w-full bg-gray-800 p-8 rounded-lg"
      >
        <div class="mb-5">
          <label for="email" class="block mb-2 text-sm font-medium text-white">
            First Name
          </label>
          <input
            type="name"
            id="fname"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            class="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="John"
            required
          />
        </div>
        <div class="mb-5">
          <label for="email" class="block mb-2 text-sm font-medium text-white">
            Last Name
          </label>
          <input
            type="name"
            id="lname"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            class="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="Doe"
            required
          />
        </div>
        <div class="mb-5">
          <label for="email" class="block mb-2 text-sm font-medium text-white">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            class="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="name@example.com"
            required
          />
        </div>
        <div class="mb-5">
          <label
            for="password"
            class="block mb-2 text-sm font-medium text-white"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            class="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div class="mb-5">
          <label
            for="password"
            class="block mb-2 text-sm font-medium text-white"
          >
            Confim Password
          </label>
          <input
            type="password"
            id="confirm_password"
            value={password_confirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            class="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="dropdown"
            className="block mb-2 text-sm font-medium text-white"
          >
            Select an Option
          </label>
          <select
            id="dropdown"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="" disabled>
              Select an option
            </option>
            <option value="Coach">Coach</option>
            <option value="Manager">Manager</option>
            <option value="Parent">Parent</option>
            {/* <option value="Student">Student</option> */}
          </select>
        </div>
        <button
          type="submit"
          class="text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
        >
          Register
        </button>
      </form>
      <div className="mt-4 text-sm text-gray-300">
        <span>Already have an account? </span>
        <Link to="/login" className="text-golden-yellow hover:underline">Login</Link>
      </div>
    </div>
  );
};

export default RegistrationPage;
