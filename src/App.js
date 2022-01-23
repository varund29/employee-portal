import SideNav from "./components/SideNav";
import MainBody from "./components/MainBody";
function App() {
  return (
    <div className="d-flex" id="wrapper">
      <SideNav />
      <MainBody />
    </div>
  );
}

export default App;
