import { Outlet } from "react-router-dom";
import { NavBar } from "../components/navbar";

export const MainLayout = () => {
  return (
    <div className="d-flex flex-column flex-md-row vh-100 overflow-md-hidden">
      <NavBar />
      <main
        className="flex-grow-1 p-4 overflow-y-auto h-100"
        style={{ minWidth: 0 }}
      >
        <Outlet />
      </main>
    </div>
  );
};
