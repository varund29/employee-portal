import React from "react";
import Home from "./components/Home";
import Login from "./Pages/Login/Login";

import { BrowserRouter, Routes, Route } from "react-router-dom";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  login = () => {
    return <Login />;
  };
  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} exact />
          <Route path="/home" element={<Home nav="dashboard" />} />
          <Route path="/home/employee" element={<Home nav="employee" />} />
          <Route path="/home/department" element={<Home nav="department" />} />
          <Route path="/home/dashboard" element={<Home nav="dashboard" />} />
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;
