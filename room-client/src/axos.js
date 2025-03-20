import axios from "axios";

const axos = axios.create({
    baseURL: "http://localhost:5000/",
    // timeout: 5000,  // Optional: Set request timeout
    headers: { "Content-Type": "application/json" }  // Optional: Default headers
});

export default axos;
