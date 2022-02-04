import React, { useState } from "react";
import { Form } from "antd";
import "./Login.css";
import { useNavigate, Redirect } from "react-router-dom";
import ApiService from "../../Services/ApiService";

function Login() {
  localStorage.setItem("isLoggedIn", false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  let message = "";
  const onFormSubmit = (values) => {
    let cdata = ApiService.getCredentials();
    console.log(cdata);
    localStorage.setItem("isLoggedIn", false);
    localStorage.setItem("user", null);
    if (
      values.username == cdata.username &&
      values.password == cdata.password
    ) {
      localStorage.setItem("user", cdata.username);
      localStorage.setItem("isLoggedIn", true);
      console.log("Login successfully");
      //navigate("/home");
      window.location = "home";
    } else {
      setError("Invalid Username/Password");
    }
    /* 
     const formData = new FormData();
    formData.append("username", values.username);
    formData.append("password", values.password);

    const options = {
      method: "POST",
      body: formData,
    };
    try {
      fetch("./credentials.json", options)
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          let resp = JSON.stringify(data);
          console.log(resp);
          if (
            values.username == data.username &&
            values.password == data.password
          ) {
            navigate("/home");
          } else {
            setError("Invalid Username/Password");
          }
        });
    } catch {} */
  };
  return (
    <div className="wrapper fadeInDown">
      <div id="formContent">
        <div className="fadeIn first">
          <h3>Login</h3>
        </div>
        <h6 className="error">{error}</h6>
        <Form onFinish={onFormSubmit}>
          <Form.Item name="username">
            <input
              type="text"
              id="username"
              className="fadeIn second"
              required
              placeholder="username"
            />
          </Form.Item>
          <Form.Item name="password">
            <input
              required
              type="password"
              id="password"
              className="fadeIn third"
              placeholder="password"
            />
          </Form.Item>
          <input type="submit" className="fadeIn fourth" value="Log In" />
        </Form>
        <div id="formFooter">
          <a className="underlineHover" href="#">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
