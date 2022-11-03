import React, { Component } from "react";
import ApiService from "../Services/ApiService";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      employees: 0,
      departments: 0,
    };
    this.fetchData = this.fetchData.bind(this);
  }

  fetchData() {
    ApiService.getEmployees().then( (response) => {
      this.setState({ employees: response.data.Employees.length });
    
    })
    .catch( (error) => {
      console.log(error);
    })
    ApiService.getDepartmemts().then( (response) => {
      this.setState({ departments: response.data.Department.length });
    
    })
    .catch( (error) => {
      console.log(error);
    });      
  }
  componentDidMount() {
    this.fetchData();
  }
  render() {
    return (
      <div className="container-fluid">
        <h3 className="mt-4 bg-light-theme-txt">Dashboard </h3>

        <div className="float-container">
          <div className="float-child">
            <div className="green">Departments</div>
            <div className="cd-center">{this.state.departments}</div>
          </div>

          <div className="float-child">
            <div className="blue">Employees</div>
            <div className="cd-center">{this.state.employees}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
