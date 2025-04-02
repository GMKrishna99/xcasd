import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import {
  HiOutlineLogout,
  HiUser,
  HiHome,
  HiFolder,
  HiUserGroup,
  HiCog, HiLightningBolt
} from "react-icons/hi";
import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { FaUserPlus, FaFileAlt } from "react-icons/fa";
import { useAuth } from "../Context/AuthContext";
import { PERMISSIONS } from "../Constants/permissions";

const userNavigation = [
  { name: "Your profile", href: "/Profile" },
  { name: "Sign out", href: "/" },
];

const Navigation = ({ isNavbarOpen, toggleNavbar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [logindata, setLogindata] = useState(null);
  const { isLoggedIn, permissionsID } = useAuth();

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      setLogindata(JSON.parse(userData));
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/");
  };

  useEffect(() => {
    document.body.classList.toggle("body-pd", isNavbarOpen);
  }, [isNavbarOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white shadow-md flex items-center justify-between px-4 h-12 z-50">
        <button className="text-xl text-[#632e0f]" onClick={toggleNavbar}>
          <FiMenu />
        </button>

        <div className="flex items-center gap-4">
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2 hover:bg-[#8B4513]/10 rounded-lg px-2 py-1">
              <img
                src={
                  logindata?.ProfileImage || "https://i.imgur.com/hczKIze.jpg"
                }
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {logindata
                  ? `${logindata.FirstName} ${logindata.LastName}`
                  : "User"}
              </span>
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg">
              {userNavigation.map((item) => (
                <Menu.Item key={item.name}>
                  {({ active }) => (
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        item.name === "Sign out"
                          ? handleSignOut()
                          : navigate(item.href);
                      }}
                      className={`${
                        active
                          ? "bg-[#8B4513]/10 text-[#632e0f]"
                          : "text-gray-700"
                      } block px-4 py-2 text-sm`}
                    >
                      {item.name}
                    </a>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Menu>
        </div>
      </header>

      <div
        className={`fixed top-0 left-0 h-full transition-all ${
          isNavbarOpen ? "w-60" : "w-16"
        } bg-gradient-to-b from-[#8B4513] via-[#632e0f] to-[#301607]`}
      >
        <nav className="flex flex-col h-full mt-14">
          <div className="flex flex-col flex-1">
            {permissionsID.includes(PERMISSIONS.ACCESS_DASHBOARD) && (
              <Link
                to="/dashboard"
                className="flex items-center gap-3 p-3 text-white hover:bg-[#8B4513]/50"
              >
                <HiHome className="text-xl" />
                {isNavbarOpen && (
                  <span className="text-sm font-medium">Dashboard</span>
                )}
              </Link>
            )}
          
            <Link
              to="/department"
              className="flex items-center gap-3 p-3 hover:bg-[#8B4513]/50 text-white"
            >
              <HiLightningBolt className="text-xl" />
              {isNavbarOpen && (
                <span className="text-sm font-medium">Function</span>
              )}
            </Link>
            <Link
              to="/documentsList"
              className="flex items-center gap-3 p-3 hover:bg-[#8B4513]/50 text-white"
            >
              <HiFolder className="text-xl" />
              {isNavbarOpen && (
                <span className="text-sm font-medium">Documents</span>
              )}
            </Link>
            {permissionsID.includes(PERMISSIONS.ACCESS_USERS) && (
              <Link
                to="/users"
                className="flex items-center gap-3 p-3 text-white hover:bg-[#8B4513]/50"
              >
                <HiUserGroup className="text-xl" />
                {isNavbarOpen && (
                  <span className="text-sm font-medium">Users</span>
                )}
              </Link>
            )}
            {permissionsID.includes(PERMISSIONS.ACCESS_USERROLES) && (
              <Link
                to="/RoleUser"
                className="flex items-center gap-3 p-3 text-white hover:bg-[#8B4513]/50"
              >
                <HiUser className="text-xl" />
                {isNavbarOpen && (
                  <span className="text-sm font-medium">User Roles</span>
                )}
              </Link>
            )}
            
            {permissionsID.includes(PERMISSIONS.ACCESS_PROJECTTYPES) && (
              <Link
                to="/Project"
                className="flex items-center gap-3 p-3 text-white hover:bg-[#8B4513]/50"
              >
                <FaFileAlt className="text-xl" />
                {isNavbarOpen && (
                  <span className="text-sm font-medium">Project Types</span>
                )}
              </Link>
            )}
          </div>

          <div className="mt-auto mb-14 border-t border-[#8B4513]/30">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 p-3 text-white text-left hover:bg-[#8B4513]/50"
            >
              <HiOutlineLogout className="text-xl" />
              {isNavbarOpen && (
                <span className="text-sm font-medium">Sign Out</span>
              )}
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navigation;
