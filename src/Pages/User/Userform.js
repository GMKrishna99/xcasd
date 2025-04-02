import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { UserContext } from "../../Context/userContext";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import {
  CREATEORUPDATE_USERS_API,
  GETALLROLESS_API,
  GETALLUSERSBYID_API,
  COUNTRIES_API,
} from "../../Constants/apiRoutes";
import LoadingAnimation from "../../Components/Loading/LoadingAnimation";
import { toast, ToastContainer } from "react-toastify";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const genderOptions = [
  { id: "M", name: "Male" },
  { id: "F", name: "Female" },
];
const functionsList = [
  { id: 1, name: "Technical Function" },
  { id: 2, name: "Finance" },
  { id: 3, name: "Human Resources" },
  { id: 4, name: "Marketing" },
  { id: 5, name: "Sales" },
  { id: 6, name: "Projects" },
  { id: 7, name: "Legal" },
  { id: 8, name: "Others" },
];

function Userform() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userDetails, setUserDeatails } = useContext(UserContext);
  const { userId } = useParams();

  const [formData, setFormData] = useState(
    location.state?.userDetails || {
      TenantID: 1,
      FirstName: "",
      LastName: "",
      Email: "",
      Password: "",
      PhoneNumber: "",
      Gender: "",
      RoleID: "",
      CountryID: "",
      ProfileImage: null,
      Function: "",
    }
  );
  const [roles, setRoles] = useState([]);
  const [countries, setCountries] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = Boolean(
    location.state?.userDetails?.user || userDetails?.user
  );

  useEffect(() => {
    fetchRoles();
    fetchCountries();
    if (userId && userId !== "new") {
      fetchUserDetails(userId);
    }
  }, [userId]);

  const fetchRoles = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(GETALLROLESS_API, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to fetch roles.");
    }
  };

  const fetchCountries = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(COUNTRIES_API, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setCountries(response.data.data || []);
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast.error("Failed to fetch countries.");
    }
  };

  const fetchUserDetails = async (userId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${GETALLUSERSBYID_API}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const fetchedUserData = response.data.user;

      // Set form data and fill missing fields
      setFormData((prevData) => ({
        ...prevData,
        ...fetchedUserData, // Merge fetched data into formData
      }));

      // Set selected role based on fetched data
      if (fetchedUserData.RoleID) {
        const role = roles.find((r) => r.RoleID === fetchedUserData.RoleID);
        if (role) {
          setSelectedRole(role);
        }
      }

      // Set selected country based on fetched data
      if (fetchedUserData.CountryID) {
        const country = countries.find(
          (country) => country.CountryID === fetchedUserData.CountryID
        );
        if (country) {
          setSelectedCountry(country);
        }
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to fetch user details.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add another useEffect to set selected role and country when roles and countries are fetched
  useEffect(() => {
    if (userId && userId !== "new") {
      const role = roles.find((r) => r.RoleID === formData.RoleID);
      if (role) {
        setSelectedRole(role);
      }
      console.log(formData.CountryName);
      const country = countries.find(
        (country) => country.CountryName === formData.CountryName
      );
      if (country) {
        setSelectedCountry(country);
      }
    }
  }, [roles, countries, formData.RoleID, formData.CountryID, userId]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        ProfileImage: file,
      });
    }
  };

  const [selectedRole, setSelectedRole] = useState(formData.RoleID || "");
  const [selectedCountry, setSelectedCountry] = useState(
    formData.CountryID || ""
  );

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    const validationError = validateUserData();
    if (validationError) {
      toast.error(validationError, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return; // Exit function if validation fails
    }

    try {
      const isEditMode = Boolean(formData.UserID);

      setIsLoading(true); // Show loading animation

      const formDataToSend = { ...formData }; // Use a regular object instead of FormData

      if (!isEditMode) {
        formDataToSend.TenantID = 1;
      }
      formDataToSend.RoleID = selectedRole?.RoleID || "";
      formDataToSend.CountryID = selectedCountry?.CountryID || "";

      const apiUrl = CREATEORUPDATE_USERS_API; // API URL

      const method = isEditMode ? "post" : "post"; // Choose method based on whether it's an edit or create

      const response = await axios({
        method,
        url: apiUrl,
        data: formDataToSend, // Sending regular JSON data instead of FormData
        headers: {
          "Content-Type": "application/json", // Changed to JSON
          Authorization: `Bearer ${token}`,
        },
      });

      // Check the response status code and message
      if (response.data.StatusCode === "SUCCESS") {
        toast.success(response.data.message);
        setTimeout(() => {
          navigate("/users");
        }, 5500); // Delay before navigation
      } else {
        // Handle other cases like errors or unexpected statuses
        toast.error(response.data.message || "An unexpected error occurred."); // Display backend message
      }
    } catch (error) {
      console.error("User submission failed:", error);

      if (error.response) {
        const errorMessage =
          error.response.data.message || "An error occurred.";

        if (error.response.data.StatusCode === "ERROR" && errorMessage) {
          toast.error(errorMessage); // Display specific error message from backend
        } else {
          toast.error(
            `Failed to ${
              isEditMode ? "update" : "create"
            } user: ${errorMessage}`
          );
        }
      } else if (error.request) {
        toast.error("No response received from server.");
      } else {
        console.error("Error in setting up request:", error.message);
        toast.error("Error: " + error.message);
      }
    } finally {
      setIsLoading(false); // Hide loading animation
    }
  };

  const handleCancel = () => {
    setIsLoading(true);

    // Add a small delay before navigating to show the loader
    setTimeout(() => {
      navigate("/users");
    }, 1500); // Delay by 500ms
  };

  // Validation
  const validateUserData = () => {
    const newErrors = {};
    if (!formData.RoleID) {
      newErrors.RoleIdError = "Role is required.";
    }
    if (!formData.FirstName) {
      newErrors.FirstNameError = "First Name is required.";
    }
    if (!formData.Email) {
      newErrors.EmailError = "Email is required.";
    } else {
      if (!formData.Email.includes("@")) return "Email must include '@'.";
      if (!formData.Email.endsWith(".com")) {
        newErrors.EmailError = "Email must end with '.com'.";
      }
    }
    if (!formData.Password) {
      newErrors.PasswordError = "Password is required.";
    }
    if (!formData.PhoneNumber) {
      newErrors.PhoneNumberError = "Phone Number is required.";
    }
    if (!formData.FunctionID) {
      newErrors.FunctionError = "Function is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length > 0;
  };

  const handleRoleChange = (selectedRole) => {
    setSelectedRole(selectedRole);
    setFormData((prevFormData) => ({
      ...prevFormData,
      RoleID: selectedRole?.RoleID || "",
    }));
    setQuery(""); // Reset the search query after selection
  };

  const handleCountryChange = (selectedCountry) => {
    setSelectedCountry(selectedCountry);
    setFormData((prevFormData) => ({
      ...prevFormData,
      CountryID: selectedCountry?.CountryID || "",
    }));
  };
  const [selectedFunction, setSelectedFunction] = useState(
    functionsList.find((f) => f.id === formData.FunctionID) || null
  );

  const filteredFunctions =
    query === ""
      ? functionsList
      : functionsList.filter((func) =>
          func.name.toLowerCase().includes(query.toLowerCase())
        );

  const handleFunctionChange = (selected) => {
    setSelectedFunction(selected);
    setFormData((prev) => ({ ...prev, FunctionID: selected.id })); // Store as integer
  };

  return (
    <div className="main-container">
      {/* <div className={`main-container ${isExpanded ? 'expanded' : 'collapsed'}`} > */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <ToastContainer />
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50">
            <LoadingAnimation />
          </div>
        )}
        <div className="body-container">
          <form className="w-full" onSubmit={handleFormSubmit}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="heading mb-4 px-24 text-custom-brown">Users</h2>
            </div>
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8 px-16 md:px-24">
              <div className="w-full xl:w-3/4">
                <label
                  htmlFor="RoleID"
                  className="block text-sm font-medium text-gray-700"
                >
                  Role Name <span className="text-red-500">*</span>
                </label>
                <Combobox
                  as="div"
                  value={selectedRole}
                  onChange={handleRoleChange}
                >
                  <div className="relative">
                    <Combobox.Input
                      id="RoleID"
                      name="RoleID"
                      className={`block w-full rounded-md border  py-2 px-4 shadow-sm  sm:text-sm mt-2 mb-1 ${
                        !formData.RoleID && errors.RoleIdError
                          ? "border-red-400"
                          : "border-gray-400"
                      }`}
                      onChange={(event) => setQuery(event.target.value)}
                      displayValue={(role) => role?.RoleName || ""}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </Combobox.Button>

                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full  overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ">
                      {roles
                        .filter((role) =>
                          role.RoleName.toLowerCase().includes(
                            query.toLowerCase()
                          )
                        )
                        .map((role) => (
                          <Combobox.Option
                            key={role.RoleID}
                            value={role}
                            className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white"
                          >
                            <span className="block truncate font-normal group-data-[selected]:font-semibold">
                              {role.RoleName}
                            </span>
                            <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-indigo-600 group-data-[selected]:flex group-data-[focus]:text-white">
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          </Combobox.Option>
                        ))}
                    </Combobox.Options>
                  </div>
                </Combobox>
                {!formData.RoleID && errors.StoreNameError && (
                  <p className="text-red-500 text-sm mt-1 ">
                    {errors.RoleIdError}
                  </p>
                )}
              </div>

              {/* First Name */}
              <div className="flex items-center">
                <div className="w-full ">
                  <label
                    htmlFor="FirstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="FirstName"
                    name="FirstName"
                    value={formData.FirstName || ""}
                    onChange={handleFormChange}
                    required
                    className={`mt-2 mb-1 block w-full xl:w-3/4 rounded-md border  shadow-sm py-2 px-4  sm:text-sm ${
                      !formData.FirstName && errors.FirstNameError
                        ? "border-red-400"
                        : "border-gray-400"
                    }`}
                  />
                  {!formData.FirstName && errors.FirstNameError && (
                    <p className="text-red-500 text-sm mt-1 ">
                      {errors.FirstNameError}
                    </p>
                  )}
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="LastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="LastName"
                  name="LastName"
                  value={formData.LastName || ""}
                  onChange={handleFormChange}
                  required
                  className={`mt-2 mb-1 block w-full xl:w-3/4 rounded-md border shadow-sm py-2 px-4  sm:text-sm border-gray-400
                `}
                />
                {/* {errors.LastNameError && (
                <p className="text-red-500 text-sm mt-1 ">
                  {errors.LastNameError}
                </p>
              )} */}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="Email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="Email"
                  name="Email"
                  value={formData.Email || ""}
                  onChange={handleFormChange}
                  required
                  className={`mt-2 mb-1 block w-full xl:w-3/4 rounded-md border shadow-sm py-2 px-4 sm:text-sm ${
                    errors.EmailError ? "border-red-400" : "border-gray-400"
                  }`}
                />
                {errors.EmailError && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.EmailError}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="xl:w-3/4">
                <label
                  htmlFor="Password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="Password"
                    name="Password"
                    type={showPassword ? "text" : "password"}
                    value={formData.Password || ""}
                    onChange={handleFormChange}
                    className={`mt-2 mb-1 block w-full  rounded-md border shadow-sm py-2 px-4  sm:text-sm ${
                      !formData.Password && errors.PasswordError
                        ? "border-red-400"
                        : "border-gray-400"
                    }`}
                  />
                  <span
                    className="absolute right-2 top-1/2 pb-1 transform -translate-y-1/2 cursor-pointer "
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <VisibilityOffIcon
                        fontSize="small"
                        className="opacity-75"
                      />
                    ) : (
                      <VisibilityIcon fontSize="small" className="opacity-75" />
                    )}
                  </span>
                </div>
                {!formData.Password && errors.PasswordError && (
                  <p className="text-red-500 text-sm mt-1 ">
                    {errors.PasswordError}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="PhoneNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="PhoneNumber"
                  name="PhoneNumber"
                  value={formData.PhoneNumber || ""}
                  onChange={handleFormChange}
                  required
                  className={`mt-2 mb-1 block w-full xl:w-3/4 rounded-md border  shadow-sm py-2 px-4  sm:text-sm ${
                    !formData.PhoneNumber && errors.PhoneNumberError
                      ? "border-red-400"
                      : "border-gray-400"
                  }`}
                />
                {!formData.PhoneNumber && errors.PhoneNumberError && (
                  <p className="text-red-500 text-sm mt-1 ">
                    {errors.PhoneNumberError}
                  </p>
                )}
              </div>

              {/* Country Dropdown */}
              <div className="w-full xl:w-3/4">
                <label
                  htmlFor="CountryID"
                  className="block text-sm font-medium text-gray-700"
                >
                  Country <span className="text-red-500">*</span>
                </label>
                <Combobox
                  as="div"
                  value={selectedCountry}
                  onChange={handleCountryChange}
                >
                  <div className="relative">
                    <Combobox.Input
                      id="CountryID"
                      name="CountryID"
                      className={`block w-full rounded-md border py-2 px-4 shadow-sm sm:text-sm mt-2 mb-1 ${
                        !formData.CountryID && errors.CountryIdError
                          ? "border-red-400"
                          : "border-gray-400"
                      }`}
                      onChange={(event) => setQuery(event.target.value)}
                      displayValue={(country) => country?.CountryName || ""}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </Combobox.Button>

                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ">
                      {countries
                        .filter((country) =>
                          country.CountryName.toLowerCase().includes(
                            query.toLowerCase()
                          )
                        )
                        .map((country) => (
                          <Combobox.Option
                            key={country.CountryID}
                            value={country}
                            className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white"
                          >
                            <span className="block truncate font-normal group-data-[selected]:font-semibold">
                              {country.CountryName}
                            </span>
                            <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-indigo-600 group-data-[selected]:flex group-data-[focus]:text-white">
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          </Combobox.Option>
                        ))}
                    </Combobox.Options>
                  </div>
                </Combobox>
                {!formData.CountryID && errors.CountryIdError && (
                  <p className="text-red-500 text-sm mt-1 ">
                    {errors.CountryIdError}
                  </p>
                )}
              </div>

              <div className="w-full xl:w-3/4">
                <label
                  htmlFor="FunctionID"
                  className="block text-sm font-medium text-gray-700"
                >
                  Function <span className="text-red-500">*</span>
                </label>
                <Combobox
                  as="div"
                  value={selectedFunction}
                  onChange={handleFunctionChange}
                >
                  <div className="relative mt-2">
                    <Combobox.Input
                      id="FunctionID"
                      name="FunctionID"
                      className={`block w-full rounded-md border py-2 px-4 shadow-sm sm:text-sm ${
                        errors.FunctionError
                          ? "border-red-400"
                          : "border-gray-400"
                      }`}
                      onChange={(event) => setQuery(event.target.value)}
                      displayValue={(func) => func?.name || ""}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-2 focus:outline-none">
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
                {errors.FunctionError && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.FunctionError}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="Region"
                  className="block text-sm font-medium text-gray-700"
                >
                Region
                </label>
                <input
                  type="text"
                  id="Region"
                  name="Region"
                  value={formData.Region || ""}
                  onChange={handleFormChange}
                  required
                  className={`mt-2 mb-1 block w-full xl:w-3/4 rounded-md border shadow-sm py-2 px-4  sm:text-sm border-gray-400
                `}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                type="submit"
                className="button-base save-btn"
                onClick={handleFormSubmit}
              >
                {userId !== "new" ? "Update User" : "Create User"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="button-base save-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default Userform;
