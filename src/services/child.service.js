import axios from "axios";
import authHeader from "./auth-header";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

class ChildService {
  // Get all children for a parent
  getChildrenByParent(parentId) {
    return axios.get(`${API_URL}/parents/${parentId}/children`, { headers: authHeader() });
  }

  // Get a specific child
  getChild(childId) {
    return axios.get(`${API_URL}/children/${childId}`, { headers: authHeader() });
  }

  // Add a new child
  addChild(parentId, childData) {
    return axios.post(`${API_URL}/parents/${parentId}/children`, childData, { headers: authHeader() });
  }

  // Update a child's information
  updateChild(childId, childData) {
    return axios.put(`${API_URL}/children/${childId}`, childData, { headers: authHeader() });
  }

  // Delete a child
  deleteChild(childId) {
    return axios.delete(`${API_URL}/children/${childId}`, { headers: authHeader() });
  }
}

export default new ChildService(); 