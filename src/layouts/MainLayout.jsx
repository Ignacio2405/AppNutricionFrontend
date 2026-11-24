import { Outlet } from "react-router-dom";
import { NavBar } from "../components/navbar";

export const MainLayout = () => {
  return (
    <div className="d-flex flex-column flex-md-row align-items-stretch min-vh-100">
      <NavBar />
      <main
        className="flex-grow-1 p-4"
        style={{ minWidth: 0 }}
      >
        <Outlet />
      </main>
    </div>
  );
};
