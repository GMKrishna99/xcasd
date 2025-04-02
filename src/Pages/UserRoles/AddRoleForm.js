import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingAnimation from "../../Components/Loading/LoadingAnimation";
// import Popup from "../../components/Popup/Popup";
import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import Select from "react-select";
import { FETCH_PERMISSION_URL } from "../../Constants/apiRoutes";
import { CREATE_OR_UPDATE_ROLE_URL } from "../../Constants/apiRoutes";
import { DataContext } from "../../Context/DataContext";
import { toast, ToastContainer } from "react-toastify";
const functions = [
  { id: 1, name: "Technical Function" },
  { id: 2, name: "Finance" },
  { id: 3, name: "Human Resources" },
  { id: 4, name: "Marketing" },
  { id: 5, name: "Sales" },
  { id: 6, name: "Projects" },
  { id: 7, name: "Legal" },
  { id: 8, name: "Others" },
];
const AddRoleForm = () => {
  const [roleName, setRoleName] = useState("");
  const [storeId, setStoreId] = useState("0");
  const [permissionsByModule, setPermissionsByModule] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [companyName, setCompanyName] = useState("");
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [query, setQuery] = useState("");

  const navigate = useNavigate();
  const filteredFunctions =
    query === ""
      ? functions
      : functions.filter((func) =>
          func.name.toLowerCase().includes(query.toLowerCase())
        );

  const handleFunctionChange = (func) => {
    setSelectedFunction(func);
  };
  useEffect(() => {
    const fetchPermissions = async () => {
      const token = localStorage.getItem("token");
      try {
        setLoading(true);

        const response = await axios.get(FETCH_PERMISSION_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data;
        const categorizedPermissions = {};

        if (data.Permissions && Array.isArray(data.Permissions)) {
          data.Permissions.forEach((permission) => {
            if (!categorizedPermissions[permission.Module]) {
              categorizedPermissions[permission.Module] = [];
            }
            categorizedPermissions[permission.Module].push(permission);
          });
        }

        setPermissionsByModule(categorizedPermissions);
      } catch (err) {
        setError("Failed to fetch permissions");
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  let roleData = {
    roleId: 0,
    roleName: roleName,
    permissions: [],
  };
  const handleCheckboxChange = (moduleName, permissionId) => {
    setPermissionsByModule((prevState) => {
      const updatedPermissions = { ...prevState };
      updatedPermissions[moduleName] = updatedPermissions[moduleName].map(
        (permission) =>
          permission.ID === permissionId
            ? { ...permission, IsChecked: !permission.IsChecked }
            : permission
      );
      return updatedPermissions;
    });
  };

  const handleSelectAllChange = (moduleName, isChecked) => {
    setPermissionsByModule((prevState) => {
      const updatedPermissions = { ...prevState };
      updatedPermissions[moduleName] = updatedPermissions[moduleName].map(
        (permission) => ({
          ...permission,
          IsChecked: isChecked,
        })
      );
      return updatedPermissions;
    });
  };

  const handleClose = () => {
    navigate("/RoleUser");
  };

  if (error) return <div>{error}</div>;

  const handleSaveRole = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    let roleData = {
      roleId: 0,
      roleName: roleName,
      permissions: [],
    };

    // Validation
    const validateRoleDataSubmit = () => {
      const newErrors = {};
      if (!roleData.roleName) {
        newErrors.RoleNameError = "Role Name is required.";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length > 0; // Return true if there are errors
    };

    const validationError = validateRoleDataSubmit();
    if (validationError) {
      return; // Exit function if validation fails
    }

    Object.keys(permissionsByModule).forEach((module) => {
      permissionsByModule[module].forEach((permission) => {
        roleData.permissions.push({
          permissionId: permission.ID,
          isChecked: permission.IsChecked,
        });
      });
    });

    try {
      setLoading(true);
      const response = await axios.post(CREATE_OR_UPDATE_ROLE_URL, roleData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Handle successful role saving here (e.g., navigate or update state)
      setTimeout(() => {
        navigate("/roleuser");
      }, 5500);
    } catch (error) {
      setErrors({ saveError: "Error saving role. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`main-container`}>
      <div className=" p-6 rounded-lg ">
        <ToastContainer />
        {loading && <LoadingAnimation />}

        {/* <div className="mt-6 bg-white p-6 rounded-lg shadow-md"> */}
        <h2 className="heading">Add Role</h2>
        <hr className="border-gray-300 my-4 mb-4" />
        <div className="mb-4 flex flex-col sm:flex-row items-center justify-center w-full">
          {/* Role Name Field */}
          <div className="flex flex-col sm:flex-row items-center w-full sm:w-1/2">
            <label className="block font-semibold mr-[14px] min-w-[150px] text-right whitespace-nowrap">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className={`border ${
                errors.RoleNameError && !roleData.roleName
                  ? "border-red-500"
                  : "border-gray-300"
              } p-2 w-full rounded-md`}
              placeholder="Enter Role Name"
            />
          </div>

          {/* Company Name Field */}
          <div className="flex flex-col sm:flex-row items-center w-full sm:w-1/2">
            <label className="block font-semibold mr-[14px] min-w-[150px] text-right whitespace-nowrap">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={`border ${
                errors.CompanyNameError && !companyName
                  ? "border-red-500"
                  : "border-gray-300"
              } p-2 w-full rounded-md`}
              placeholder="Enter Company Name"
            />
          </div>
        </div>

        {/* Function Field (Now has the same width as Role & Company Name) */}
        <div className="flex flex-col sm:flex-row items-center w-full sm:w-1/2">
          <label className="block font-semibold mr-[14px] min-w-[150px] text-right whitespace-nowrap">
            Function <span className="text-red-500">*</span>
          </label>
          <Combobox
            as="div"
            value={selectedFunction}
            onChange={handleFunctionChange}
            className="w-full"
          >
            <div className="relative w-full">
              <Combobox.Input
                id="FunctionID"
                name="FunctionID"
                className="block w-full border border-gray-300 p-2 rounded-md shadow-sm sm:text-sm focus:outline-none"
                onChange={(event) => setQuery(event.target.value)}
                displayValue={(func) => func?.name || ""}
                placeholder="Select Function"
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Combobox.Button>
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {filteredFunctions.map((func) => (
                  <Combobox.Option
                    key={func.id}
                    value={func}
                    className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white"
                  >
                    <span className="block truncate font-normal group-data-[selected]:font-semibold">
                      {func.name}
                    </span>
                    <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-indigo-600 group-data-[selected]:flex group-data-[focus]:text-white">
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>

        <hr className="border-gray-300 my-4 mb-6" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(permissionsByModule).map((moduleName) => {
            const isAllSelected = permissionsByModule[moduleName].every(
              (permission) => permission.IsChecked
            );

            return (
              <div
                key={moduleName}
                className="border-[0.5px] border-[#ce8c5d] p-4 rounded-lg bg-white shadow-md"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-[#8B4513]">
                    {moduleName}
                  </h2>
                  <label className="text-sm flex items-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) =>
                        handleSelectAllChange(moduleName, e.target.checked)
                      }
                      className="mr-2 form-checkbox h-[12px] w-[12px] text-[#8B4513] border-[#8B4513]"
                    />
                    Select All
                  </label>
                </div>
                <hr className="border-[#8B4513] opacity-20 my-4 mt-2 mb-4" />

                {permissionsByModule[moduleName].map((permission) => (
                  <div key={permission.ID} className="flex items-center mb-2">
                    <label className="flex items-center text-gray-700">
                      <input
                        type="checkbox"
                        checked={permission.IsChecked}
                        onChange={() =>
                          handleCheckboxChange(moduleName, permission.ID)
                        }
                        className="mr-2 form-checkbox h-[12px] w-[12px] text-[#8B4513] border-[#8B4513]"
                      />
                      {permission.Name}
                    </label>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleClose}
            className="flex items-center justify-center px-4 py-2 bg-gradient-to-br from-[#8B4513] to-[#D2691E] text-white rounded-lg hover:from-[#A0522D] hover:to-[#D2691E] transition-all duration-300 w-full sm:w-auto"
          >
            Close
          </button>

          <button
            onClick={handleSaveRole}
            className="flex items-center justify-center px-4 py-2 bg-gradient-to-br from-[#8B4513] to-[#D2691E] text-white rounded-lg hover:from-[#A0522D] hover:to-[#D2691E] transition-all duration-300 w-full sm:w-auto"
          >
            Save Role
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRoleForm;
