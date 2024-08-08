// import axios from "axios";
import api from "./api";
import TokenService from "./token.service";
// const API_URL = "http://localhost:8080/api/";
const API_URL = "http://server.rcuac.lk/api/auth/";

const register = (username, email, password) => {
  return api.post(API_URL + "auth/signup", {
    username,
    email,
    password,
  });
};

const login = (username, password) => {
  return api
    .post(API_URL + "auth/signin", {
      username,
      password,
    })
    .then((response) => {
      if (response.data.accessToken) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    });
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