import React, { Component } from "react";
import { Link } from "react-router-dom";

class SideNav extends Component {

  render() {
    return (
      <div className="border-end bg-white" id="sidebar-wrapper">
        <div className="sidebar-heading border-bottom bg-light-theme">
       <img src={"./assets/img/logo.png"} title={this.props.data.title} className="mgr-10"></img>  
        </div>
        <div className="list-group list-group-flush">
          <Link
            to="/home/dashboard"
            className="list-group-item list-group-item-action list-group-item-light p-3"
          >
            Dashboard
          </Link>

          <Link
            to="/home/employee"
            className="list-group-item list-group-item-action list-group-item-light p-3"
          >
            Employees
          </Link>
          <Link
            to="/home/department"
            className="list-group-item list-group-item-action list-group-item-light p-3"
          >
            Departments
          </Link>
          <Link
            to="/home/movies"
            className="list-group-item list-group-item-action list-group-item-light p-3"
          >
          Others
          </Link>
        </div>
      </div>
    );
  }
}

export default SideNav;
