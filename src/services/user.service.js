// import axios from "axios";
import api from "./api";
import authHeader from "./auth-header";

const API_URL = process.env.REACT_APP_BASE_URL;

const notApprovedUsers = () => {
  return api.get(API_URL + "users/notApproved", { headers: authHeader() });
}

const getAllUsers = () => {
  return api.get(API_URL + "users/approved", { headers: authHeader() });
}

const getUser = (id) => {
  return api.get(API_URL + "users/get/" + id, { headers: authHeader() });
}

const approveUser = (id) => {
  return api.put(API_URL + "users/approve/" + id, { headers: authHeader() });
}

const rejectUser = (id) => {
  return api.put(API_URL + "users/deactivate/" + id, { headers: authHeader() });
}

const approvedUsers = () => {
  return api.get(API_URL + "users/approved", { headers: authHeader() });
}

const updateUser = (id, data) => {
  return api.put(API_URL + "users/updateProfile/" + id, data, { headers: authHeader() });
}

const searchUsers = (search, role) => {
  const params = {};
    if (search) params.search = search;
    if (role) params.role = role;
    return api.get(API_URL + "users/search",  { params, headers: authHeader() });
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