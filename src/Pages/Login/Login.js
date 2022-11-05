import React, { useState } from "react";
import { Form } from "antd";
import "./Login.css";
import ApiService from "../../Services/ApiService";


function Login() {
  localStorage.setItem("isLoggedIn", false);
  const [error, setError] = useState(null);
  
  ApiService.getConfig()
  .then((response) => {
   
    document.querySelector("body").style.cssText =
      "--theme-dark:" + response.data.theme;
      document.title = response.data.title;
  })
  .catch((error) => {
    console.log(error);
  });

  const onFormSubmit = (values) => {
    let cdata = ApiService.getCredentials();
    localStorage.setItem("isLoggedIn", false);
    localStorage.setItem("user", null);
    if (
      values.username === cdata.username &&
      values.password === cdata.password
    ) {
      localStorage.setItem("user", cdata.username);
      localStorage.setItem("isLoggedIn", true);
      console.log("Login successfully");
      //navigate("/home");
      window.location = "home";
    } else {
      setError("Invalid Username/Password");
    }
    
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
