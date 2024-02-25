import { Link, Outlet } from "react-router-dom";
import { BackIcon } from "../components/BackIcon.tsx";

export function Settings() {
  return (
    <>
      <div>
        <Link to="/">
          <BackIcon />
        </Link>
      </div>
      <Outlet />
    </>
  );
}
