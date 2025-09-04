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

const updatePassword = (id, oldPassword, newPassword) => {
  return api.put(API_URL + "users/updatePassword/" + id, { oldPassword, newPassword }, { headers: authHeader() });
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

const getAttendancedata = (date, session, age) => {
  const encodedDate = encodeURIComponent(date);
  const encodedSession = encodeURIComponent(session);
  const encodedAge = encodeURIComponent(age)
  console.log("age : ", age)
  return api.get(`${API_URL}users/getAttendancedata?date=${encodedDate}&session=${encodedSession}&age=${encodedAge}`, {
    headers: authHeader()
  });
};

const markAttendance = (data) => {
  return api.post(API_URL + "users/markAttendance", data, { headers: authHeader() });
};

const markTiming = (data) => {
  return api.post(API_URL + "users/markTiming", data, { headers: authHeader() });
}

const getAllStudents = () => {
  return api.get(API_URL + "users/getAllStudents", { headers: authHeader() });
}

const getStudentById = (id) => {
  return api.get(API_URL + "users/getStudentById/" + id, { headers: authHeader() });
}

const updateStudent = (id, data) => {
  return api.post(API_URL + "users/updateStudent/" + id, data, { headers: authHeader() })
}

const approveStudent = (id) => {
  return api.put(API_URL + "users/approveStudent/" + id, { headers: authHeader() });
}

const rejectStudent = (id) => {
  return api.put(API_URL + "users/deactivateStudent/" + id, { headers: authHeader() });
}

const getAttendancedataForReport = (startDate, endDate, id) => {
  const encodedStartDate = encodeURIComponent(startDate);
  const encodedEndDate = encodeURIComponent(endDate);
  const encodedUserId = encodeURIComponent(id)
  return api.get(`${API_URL}users/getAttendancedataForReport?startDate=${encodedStartDate}&endDate=${encodedEndDate}&userID=${encodedUserId}`, {
    headers: authHeader()
  });
}

const getTimingDataForReport = (startDate, endDate, id) => {
  const encodedStartDate = encodeURIComponent(startDate);
  const encodedEndDate = encodeURIComponent(endDate);
  const encodedUserId = encodeURIComponent(id)
  return api.get(`${API_URL}users/getTimingDataForReport?startDate=${encodedStartDate}&endDate=${encodedEndDate}&userID=${encodedUserId}`, {
    headers: authHeader()
  });
}

const getLeaderboardDataForReport = (data) => {
  console.log(data);
  return api.post(API_URL + "users/getLeaderboardDataForReport", data, { headers: authHeader() });
}

const addEvent = (data) => {
  console.log("data ", data);
  return api.post(API_URL + "users/addEvent", data, { headers: authHeader() });
}

const addDistance = (data) => {
  return api.post(API_URL + "users/addDistance", data, { headers: authHeader() });
}

const updateEvent = (id, data) => {
  return api.post(API_URL + "users/updateEvent/" + id, data, { headers: authHeader() });
}

const updateDistance = (id, data) => {
  return api.post(API_URL + "users/updateDistance/" + id, data, { headers: authHeader() });
}

const deactivateEvent = (id) => {
  return api.post(API_URL + "users/deactivateEvent/" + id, { headers: authHeader() });
}

const deactivateDistance = (id) => {
  return api.post(API_URL + "users/deactivateDistance/" + id, { headers: authHeader() });
}

const getSession = () => {
  return api.get(API_URL + "users/getSession", { headers: authHeader() });
}

const modifySession = (data) => {
  return api.post(API_URL + "users/modifySession", data, { headers: authHeader() });
}

const deleteSession = (id) => {
  return api.post(API_URL + "users/deleteSession/" + id, { headers: authHeader() });
}

const addSession = (data) => {
  return api.post(API_URL + "users/addSession", data, { headers: authHeader() });
}

const UserService = {
  notApprovedUsers,
  getAllUsers,
  getUser,
  approveUser,
  approvedUsers,
  updateUser,
  updatePassword,
  searchUsers,
  rejectUser,
  ageGroups,
  getSessionData,
  getEventTypes,
  getEventLengths,
  getAttendancedata,
  markAttendance,
  markTiming,
  getAllStudents,
  getStudentById,
  updateStudent,
  approveStudent,
  rejectStudent,
  getAttendancedataForReport,
  getTimingDataForReport,
  getLeaderboardDataForReport,
  addEvent,
  addDistance,
  updateEvent,
  updateDistance,
  deactivateEvent,
  deactivateDistance,
  getSession,
  modifySession,
  deleteSession,
  addSession
};

export default UserService;
