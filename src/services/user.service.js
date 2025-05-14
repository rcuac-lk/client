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

const ageGroups = () => {
  return api.get(API_URL + "users/ageGroups", { headers: authHeader() });
}

const getSessionData = () => {
  return api.get(API_URL + "users/getSessionData", { headers: authHeader() });
}

const getEventTypes = () => {
  return api.get(API_URL + "users/getEventTypes", { headers: authHeader() });
}

const getEventLengths = () => {
  return api.get(API_URL + "users/getEventLengths", { headers: authHeader() });
}

const getAttendancedata = (date, session) => {
  const encodedDate = encodeURIComponent(date);
  const encodedSession = encodeURIComponent(session);
  return api.get(`${API_URL}users/getAttendancedata?date=${encodedDate}&session=${encodedSession}`, {
    headers: authHeader()
  });
};

export const markAttendance = (data) => {
  return api.post(API_URL + "users/markAttendance", data, { headers: authHeader() });
};

const UserService = {
  notApprovedUsers,
  getAllUsers,
  getUser,
  approveUser,
  approvedUsers,
  updateUser,
  searchUsers,
  rejectUser,
  ageGroups,
  getSessionData,
  getEventTypes,
  getEventLengths,
  getAttendancedata,
  markAttendance,
};

export default UserService;