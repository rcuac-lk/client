// import axios from "axios";
import api from "./api";
import authHeader from "./auth-header";

const API_URL = process.env.REACT_APP_BASE_URL;

const approvedUsers = () => {
  return api.get(API_URL + "coach/approved", { headers: authHeader() });
}

const searchUsers = (search, role) => {
  const params = {};
    if (search) params.search = search;
    if (role) params.role = role;
    return api.get(API_URL + "coach/search",  { params, headers: authHeader() });
}

const notApprovedUsers = () => {
  return api.get(API_URL + "coach/notApproved", { headers: authHeader() });
}

const getAllUsers = () => {
  return api.get(API_URL + "coach/approved", { headers: authHeader() });
}

const getUser = (id) => {
  return api.get(API_URL + "coach/get/" + id, { headers: authHeader() });
}

const approveUser = (id) => {
  return api.put(API_URL + "coach/approve/" + id, { headers: authHeader() });
}

const rejectUser = (id) => {
  return api.put(API_URL + "coach/deactivate/" + id, { headers: authHeader() });
}

const UserService = {
  approvedUsers,
  searchUsers,
  notApprovedUsers,
  getAllUsers,
  getUser,
  approveUser,
  rejectUser
};

export default UserService;