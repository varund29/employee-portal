import React, { Component } from "react";

import DataTable from "react-data-table-component";
import ApiService from "../Services/ApiService";

class DepartmentDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      columns: [
        {
          name: "DeptId",
          selector: (row) => row.DeptId,
          sortable: true,
        },
        {
          name: "Name",
          selector: (row) => row.Name,
          sortable: true,
        },
      ],

      data: [],
    };

    this.fetchData = this.fetchData.bind(this);
  }
  fetchData() {
    ApiService.getDepartmemts().then( (response) => {
      this.setState({ data: response.data.Department });
    
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
        <h3 className="mt-4 bg-light-theme-txt">Department Details </h3>

        <DataTable
          columns={this.state.columns}
          data={this.state.data}
          pagination
        />
      </div>
    );
  }
}

export default DepartmentDetails;
