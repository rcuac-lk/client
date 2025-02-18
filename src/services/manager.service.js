// import axios from "axios";
import api from "./api";
import authHeader from "./auth-header";

// const API_URL = process.env.BASE_URL;
// const API_URL = "https://api.rcuac.lk/api/";
const API_URL = "https://server.rcuac.lk/api/";
// const API_URL = "http://localhost:8080/api/";

const notApprovedUsers = () => {
  return api.get(API_URL + "manager/notApproved", { headers: authHeader() });
}

const getAllUsers = () => {
  return api.get(API_URL + "manager/approved", { headers: authHeader() });
}

const getUser = (id) => {
  return api.get(API_URL + "manager/get/" + id, { headers: authHeader() });
}

const approveUser = (id) => {
  return api.put(API_URL + "manager/approve/" + id, { headers: authHeader() });
}

const rejectUser = (id) => {
  return api.put(API_URL + "manager/deactivate/" + id, { headers: authHeader() });
}

const approvedUsers = () => {
  return api.get(API_URL + "manager/approved", { headers: authHeader() });
}

const updateUser = (id, data) => {
  return api.put(API_URL + "manager/updateProfile/" + id, data, { headers: authHeader() });
}

const searchUsers = (search, role) => {
  const params = {};
    if (search) params.search = search;
    if (role) params.role = role;
    console.log("params", params);
    return api.get(API_URL + "manager/search",  { params, headers: authHeader() });
}

const UserService = {
  notApprovedUsers,
  getAllUsers,
  getUser,
  approveUser,
  approvedUsers,
  updateUser,
  searchUsers,
  rejectUser
};

export default UserService;