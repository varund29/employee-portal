import React, { Component } from "react";
import SideNav from "./SideNav";
import Header from "./Header";

import EmployeeDetails from "../Pages/EmployeeDetails";
import DepartmentDetails from "../Pages/DepartmentDetails";
import Dashboard from "../Pages/Dashboard";
import "./styles.css";
import Login from "../Pages/Login/Login";

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    console.log("ssdsdf=", isLoggedIn);
  }

  renderSwitch() {
    console.log(this.props.nav);

    switch (this.props.nav) {
      case "employee":
        return <EmployeeDetails />;
      case "department":
        return <DepartmentDetails />;
      default:
        return <Dashboard />;
    }
  }
  render() {
    let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    console.log("lod=", isLoggedIn);
    return isLoggedIn ? (
      <div className="d-flex" id="wrapper">
        <SideNav />
        <div id="page-content-wrapper">
          <Header />
          {this.renderSwitch()}
        </div>
      </div>
    ) : (
      <Login />
    );
  }
}

export default Home;
