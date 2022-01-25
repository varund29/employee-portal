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
    this.setState({
      employees: ApiService.getEmployeesCount(),
      departments: ApiService.getDepartmemtsCount(),
    });
  }
  componentDidMount() {
    this.fetchData();
  }
  render() {
    return (
      <div className="container-fluid">
        <h3 className="mt-4">Dashboard </h3>

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
