import emp from "./emp.json";
import dept from "./dept.json";
import credentials from "./credentials.json";
import movies from "./movies.json";

const ApiService = {
  getEmployees: () => {
    return emp ? emp.Employees : [];
  },

  getDepartmemts: () => {
    return dept ? dept.Department : [];
  },

  getEmployeesCount: () => {
    return emp.Employees.length;
  },

  getDepartmemtsCount: () => {
    return dept.Department.length;
  },
  getCredentials: () => {
    return credentials;
  },
  getMovies: () => {
    return movies ? movies : [];
  },
};

export default ApiService;
