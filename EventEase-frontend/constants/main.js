import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "http://192.168.1.10/eventease-api", // Replace with your XAMPP/Laravel/PHP backend IP
  timeout: 5000,
});

export default api;
