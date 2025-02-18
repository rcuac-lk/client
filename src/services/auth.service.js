// import axios from "axios";
import axios from "axios";
import api from "./api";
import TokenService from "./token.service";

// const API_URL = "https://api.rcuac.lk/api/";
const API_URL = "https://server.rcuac.lk/api/";
// const API_URL = "http://localhost:8080/api/";
// const API_URL = process.env.BASE_URL;

const register = (firstName, lastName, role, email, password) => {
  return api.post(API_URL + "auth/signup", {
    firstName,
    lastName,
    role,
    email,
    password,
  });
};

const login = async (email, password) => {
  const response = await axios
    .post(API_URL + "auth/signin", {
      email,
      password,
    });
  console.log("Login Response:", response.data);
  if (response.data.accessToken) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  TokenService.removeUser();
};

const getCurrentUser = () => {
  return TokenService.getUser();
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default AuthService;