import React, { useState } from "react";
import { Form } from "antd";
import "./Login.css";
import { useNavigate, Redirect } from "react-router-dom";

function Login() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  let message = "";
  const onFormSubmit = (values) => {
    console.log(values);
    const formData = new FormData();
    formData.append("username", values.username);
    formData.append("password", values.password);

    const options = {
      method: "POST",
      body: formData,
    };

    try {
      fetch("https://emp-portal.free.beeceptor.com/my/api/path", options)
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
    } catch {}
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
