import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navigation from "./Navigation/navbar";
import Login from "./Pages/Login/Login";
import ForgotPassword from "./Pages/Login/forgotpassword";
import ResetPassword from "./Pages/Login/ResetPassword";
import { LoadingProvider } from "./Context/LoadingContext";
import { UserProvider } from "./Context/userContext";
import DataProvider from "./Context/DataContext";
import { RoleProvider } from "./Context/roleContext";
import { PERMISSIONS } from "./Constants/permissions";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import Dashboard from "./Pages/Dashboard/Dashboard";
import UserForm from "./Pages/User/Userform";
import Users from "./Pages/User/User";
import RoleUser from "./Pages/UserRoles/UserRole";
import RoleUserAddForm from "./Pages/UserRoles/AddRoleForm";
import RoleUserEditForm from "./Pages/UserRoles/EditRoleForm";
import DocumentsDetails from "./Pages/Documents/DocumentsDetails";
import DocumentsList from "./Pages/Documents/DocumentsList";
import Profile from "./Navigation/Profile";
import Settings from "./Navigation/Settings";
import Reference from "./Pages/Reference/Refer";
import Referenceform from "./Pages/Reference/Referform";
import { ReferenceProvider } from "./Context/ReferContext";
import Project from "./Pages/ProjectType/ProjectList";
import ProjectCreation from "./Pages/ProjectType/Project";
import Restricted from "./Pages/Unauth/Restricted";
import AddDocument from "./Pages/Documents/AddDocument";
import Department from "./Pages/Department/department";
const App = () => {
  return (
    <LoadingProvider>
      <UserProvider>
        <DataProvider>
          <RoleProvider>
            <ReferenceProvider>
              <AppWithNavigation />
            </ReferenceProvider>
          </RoleProvider>
        </DataProvider>
      </UserProvider>
    </LoadingProvider>
  );
};

const AppWithNavigation = () => {
  const location = useLocation();
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  // Hide navigation on Login page ("/")
  const showNavigation =
    location.pathname !== "/" &&
    location.pathname !== "/forgot-password" &&
    location.pathname !== "/reset-password";

  return (
    <div className="App flex flex-col min-h-screen">
      {showNavigation && (
        <Navigation
          isNavbarOpen={isNavbarOpen}
          toggleNavbar={() => setIsNavbarOpen(!isNavbarOpen)}
        />
      )}
      <main
        className={`flex-grow bg-gray-100 transition-all duration-300 ${
          showNavigation ? (isNavbarOpen ? "ml-60" : "ml-16") : ""
        }`}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute

              // requiredPermission={PERMISSIONS.VIEW_ORDERS}
              >
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/department"
            element={
              <ProtectedRoute

              // requiredPermission={PERMISSIONS.VIEW_ORDERS}
              >
                <Department />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_USERS}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/userform/:userId"
            element={
              <ProtectedRoute
                requiredPermission={
                  PERMISSIONS.ADD_USER ||
                  PERMISSIONS.EDIT_USER ||
                  PERMISSIONS.DELETE_USER
                }
              >
                <UserForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/RoleUser"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_ROLE}>
                <RoleUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/RoleUserAddform"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.ADD_ROLE}>
                <RoleUserAddForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/RoleUserEditform/:roleId"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.EDIT_ROLE}>
                <RoleUserEditForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documentsDetails/:documentId"
            element={
              <ProtectedRoute

              // requiredPermission={PERMISSIONS.VIEW_FEEDBACKS}
              >
                <DocumentsDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documentsList"
            element={
              <ProtectedRoute

              // requiredPermission={PERMISSIONS.VIEW_FEEDBACKS}
              >
                <DocumentsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Profile"
            element={
              <ProtectedRoute

              // requiredPermission={
              //   PERMISSIONS.VIEW_CUSTOMERS
              // }
              >
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Settings"
            element={
              <ProtectedRoute

              // requiredPermission={
              //   PERMISSIONS.VIEW_CUSTOMERS
              // }
              >
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Reference"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.VEIW_REFERENCES}>
                <Reference />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Referenceform/:ReferId"
            element={
              <ProtectedRoute
                requiredPermission={
                  PERMISSIONS.ADD_REFERENCES ||
                  PERMISSIONS.EDIT_REFERENCES ||
                  PERMISSIONS.DELETE_REFERENCES
                }
              >
                <Referenceform />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ProjectCreation"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.ADD_PROJECT_TYPE}>
                <ProjectCreation />
              </ProtectedRoute>
            }
          />{" "}
          <Route
            path="/Project"
            element={
              <ProtectedRoute
                requiredPermission={PERMISSIONS.VIEW_PROJECT_TYPE}
              >
                <Project />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ProjectCreation/:ProjectTypeID"
            element={
              <ProtectedRoute
                requiredPermission={PERMISSIONS.EDIT_PROJECT_TYPE}
              >
                <ProjectCreation />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<Restricted />} />
          <Route path="/add-document/:documentId" element={<AddDocument />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
