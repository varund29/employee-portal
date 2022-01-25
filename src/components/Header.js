function logout() {
  console.log("logout");
  localStorage.setItem("isLoggedIn", false);
  localStorage.setItem("user", null);
  window.location = "";
}
function Header() {
  let user = localStorage.getItem("user");

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mt-2 mt-lg-0">
            <li className="nav-item active">
              <a className="nav-link">
                Welcom <b>{user}!</b>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link c-pointer" onClick={() => logout()}>
                Logout
              </a>
            </li>
            {/*   <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                id="navbarDropdown"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Dropdown
              </a>
              <div
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="navbarDropdown"
              >
                <a className="dropdown-item" href="#!">
                  Action
                </a>
                <a className="dropdown-item" href="#!">
                  Another action
                </a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#!">
                  Something else here
                </a>
              </div>
            </li> */}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;
