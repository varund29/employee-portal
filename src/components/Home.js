import React, { Component } from "react";
import SideNav from "./SideNav";
import Header from "./Header";

import EmployeeDetails from "../Pages/EmployeeDetails";
import DepartmentDetails from "../Pages/DepartmentDetails";
import Dashboard from "../Pages/Dashboard";
import Movies from "../Pages/Movies";
import "./styles.css";
import Login from "../Pages/Login/Login";
import ApiService from "../Services/ApiService";

class Home extends Component {
  data={};
  constructor(props) {
    super(props);

    this.state = {data:{}};
    let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    this.fetchData = this.Config.bind(this);
  }

  renderSwitch() {
    switch (this.props.nav) {
      case "employee":
        return <EmployeeDetails />;
      case "department":
        return <DepartmentDetails />;
      case "movies":
        return <Movies />;
      default:
        return <Dashboard />;
    }
  }
  componentDidMount() {
    this.fetchData();
  }
  render() {
    let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    return isLoggedIn ? (
      <div className="d-flex" id="wrapper">
        <SideNav data={this.state.data} />
        <div id="page-content-wrapper">
          <Header data={this.state.data} />
          {this.renderSwitch()}
        </div>
      </div>
    ) : (
      <Login />
    );
  }
  Config() {
    //let config=ApiService.getConfig();
    ApiService.getConfig()
      .then((response) => {
        let config = response.data;
        this.data=config;
        this.setState({ data: config });
        document.querySelector("body").style.cssText =
          "--theme-dark:" + config.theme;
          document.title = response.data.title;
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

export default Home;
