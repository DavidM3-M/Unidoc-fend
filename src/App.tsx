import "./App.css";
import { ToastContainer } from "react-toastify";
import { Outlet } from "react-router";

function App() {
  return (
    <>
      <div className="w-full m-auto relative min-h-screen">
        <ToastContainer />
        <div className="flex flex-col items-center justify-center h-full w-full">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default App;
