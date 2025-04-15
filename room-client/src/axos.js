import axios from "axios";

const axos = axios.create({
    baseURL: "http://localhost:5000/",
    withCredentials: true,
    // timeout: 5000,  // I disabled because email sent but because of return response time it responded with error code
    headers: { "Content-Type": "application/json" }  // Optional: Default headers
});

export default axos;
