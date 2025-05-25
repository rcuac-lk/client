// import axios from "axios";
import api from "./api";
import authHeader from "./auth-header";

const API_URL = process.env.REACT_APP_BASE_URL;

const getUser = (id) => {
  return api.get(API_URL + "parent/get/" + id, { headers: authHeader() });
}

const searchUsers = (search, role) => {
  const params = {};
    if (search) params.search = search;
    if (role) params.role = role;
    return api.get(API_URL + "parent/search",  { params, headers: authHeader() });
}

const addStudent = (data) => {
  return api.post(API_URL + "parent/addStudent", data, { headers: authHeader() });
}

const getStudents = (id) => {
  return api.get(API_URL + "parent/getStudents/" + id, { headers: authHeader() });
}

const UserService = {
  getUser,
  searchUsers,
  addStudent,
  getStudents
};

export default UserService;