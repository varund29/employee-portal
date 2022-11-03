import emp from "./emp.json";
import dept from "./dept.json";
import credentials from "./credentials.json";
import movies from "./movies.json";
import config from "./config.json";
import axios from 'axios';
const ApiService = {
  getConfig: () => {
    //return config ? config : {};
    return axios.get('../assets/config.json');
  },

  getEmployees: () => {
   //return emp ? emp.Employees : [];
   return axios.get('../assets/emp.json');
  },

  getDepartmemts: () => {
    //return dept ? dept.Department : [];
    return axios.get('../assets/dept.json');
  },

  getEmployeesCount: () => {
    //return emp.Employees.length;
    return axios.get('../assets/emp.json');
  },

  getDepartmemtsCount: () => {
    //return dept.Department.length;
    return axios.get('../assets/dept.json');
  },
  getCredentials: () => {
    return credentials;
  },
  getMovies: () => {
    //return movies ? movies : [];
    return axios.get('../assets/movies.json');
  },
};

export default ApiService;
