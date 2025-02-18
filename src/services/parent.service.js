// import axios from "axios";
import api from "./api";
import authHeader from "./auth-header";

// const API_URL = process.env.BASE_URL;
// const API_URL = "https://api.rcuac.lk/api/";
const API_URL = "https://server.rcuac.lk/api/";
// const API_URL = "http://localhost:8080/api/";

const getUser = (id) => {
  return api.get(API_URL + "parent/get/" + id, { headers: authHeader() });
}

const searchUsers = (search, role) => {
  const params = {};
    if (search) params.search = search;
    if (role) params.role = role;
    return api.get(API_URL + "parent/search",  { params, headers: authHeader() });
}

const UserService = {
  getUser,
  searchUsers
};

export default UserService;