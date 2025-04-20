import axios from 'axios';
const axos = axios.create({
  baseURL: "http://localhost:5000/",
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',  
  }
});
// axos.interceptors.request.use(
//   (config) => {
//     // Add the token to the request header if available in cookies
//     const token = document.cookie
//       .split('; ')
//       .find(row => row.startsWith('token='))
//       ?.split('=')[1]; // Extract token from cookies

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// axos.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response.status === 401) {
//       // Handle 401 errors, maybe redirect to login or show error
//       console.error('Unauthorized access - 401');
//     }
//     return Promise.reject(error);
//   }
// );

export default axos;
