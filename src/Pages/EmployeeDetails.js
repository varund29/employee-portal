import React, { Component } from "react";
import ApiService from "../Services/ApiService";
import DataTable from "react-data-table-component";

class EmployeeDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      columns: [
        {
          name: "UserId",
          selector: (row) => row.userId,
          sortable: true,
        },
        {
          name: "Job Title",
          selector: (row) => row.jobTitleName,
          sortable: true,
        },
        {
          name: "First Name",
          selector: (row) => row.firstName,
          sortable: true,
        },
        {
          name: "Last Name",
          selector: (row) => row.lastName,
          sortable: true,
        },
        {
          name: "Phone Number",
          selector: (row) => row.phoneNumber,
        },
        {
          name: "Email Address",
          selector: (row) => row.emailAddress,
          sortable: true,
        },
      ],

      data: [],
    };

    this.fetchData = this.fetchData.bind(this);
  }

  fetchData() {
    this.setState({ data: ApiService.getEmployees() });
  }
  componentDidMount() {
    this.fetchData();
  }

  render() {
    return (
      <div className="container-fluid">
        <h3 className="mt-4">Employee Details </h3>

        <DataTable
          columns={this.state.columns}
          data={this.state.data}
          pagination
        />
      </div>
    );
  }
}

export default EmployeeDetails;
