// import axios from "axios";
import api from "./api";
import authHeader from "./auth-header";

// const API_URL = "http://localhost:8080/api/";
const API_URL = "http://server.rcuac.lk/api/auth/";

// const getPublicContent = () => {
//   return axios.get(API_URL + "all");
// };

// const getUserBoard = () => {
//   return axios.get(API_URL + "user", { headers: authHeader() });
// };

// const getModeratorBoard = () => {
//   return axios.get(API_URL + "mod", { headers: authHeader() });
// };

// const getAdminBoard = () => {
//   return axios.get(API_URL + "admin", { headers: authHeader() });
// };

const notApprovedUsers = () => {
  return api.get(API_URL + "users/notApproved", { headers: authHeader() });
}

const getAllUsers = () => {
  return api.get(API_URL + "users/getAll", { headers: authHeader() });
}

const getUser = (id) => {
  return api.get(API_URL + "users/get/" + id, { headers: authHeader() });
}

const approveUser = (id) => {
  return api.put(API_URL + "users/approve/" + id, { headers: authHeader() });
}

const approvedUsers = () => {
  return api.get(API_URL + "users/approved", { headers: authHeader() });
}

const UserService = {
  notApprovedUsers,
  getAllUsers,
  getUser,
  approveUser,
  approvedUsers
};

export default UserService;