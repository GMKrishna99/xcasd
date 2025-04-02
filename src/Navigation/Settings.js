import React, { useState, useRef, useEffect } from "react";
import { FiTrash, FiEye } from "react-icons/fi";
import { RiCloseLine } from "react-icons/ri";
import { FaRegFileImage } from "react-icons/fa";
import { FiUpload } from "react-icons/fi";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingAnimation from "../Components/Loading/LoadingAnimation";
import { createTenantSettings, updateTenantSettings, getTenantSettings } from "../Constants/apiRoutes";

const AddProject = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    imageFile: null,
    logoFile: null,
    imagePreview: null,
    logoPreview: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const imageInputRef = useRef(null);
  const logoInputRef = useRef(null);

 // Fetch Tenant Settings on page load
useEffect(() => {
  const fetchTenantSettings = async () => {
    setIsLoading(true); // Show loading animation during fetch

    try {
      // Get TenantID from local storage
      const tenantID = localStorage.getItem("TenantID");
      if (!tenantID) {
        throw new Error("TenantID not found in local storage");
      }

      const response = await axios.get(`${getTenantSettings}/${tenantID}`);
      // Access response.data to get the API data
      const { CompanyName, CompanyLogo, CompanyImage } = response.data.tenantSettings;
      
      setFormData({
        companyName: CompanyName || "",
        imagePreview: CompanyImage || null,
        logoPreview: CompanyLogo || null,
        imageFile: null,
        logoFile: null,
      });
      

      // toast.success("Tenant settings loaded successfully!");
    } catch (error) {
      console.error("Error fetching tenant settings:", error);
      // toast.error("Failed to load tenant settings.");
    } finally {
      setIsLoading(false); // Hide loading animation
    }
  };

  fetchTenantSettings();
}, []); // Empty dependency array ensures it runs only once on page load

  const handleProjectImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevData) => ({
          ...prevData,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
      setFormData((prevData) => ({
        ...prevData,
        imageFile: file,
      }));
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevData) => ({
          ...prevData,
          logoPreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
      setFormData((prevData) => ({
        ...prevData,
        logoFile: file,
      }));
    }
  };

  const handleSubmit = async () => {
    const tenantID = localStorage.getItem("TenantID"); // Fetch TenantID dynamically
    if (!tenantID) {
      toast.error("Tenant ID is missing. Please try again.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found.");
      return;
    }
    const formPayload = new FormData();
    formPayload.append("TenantID", tenantID); // Use the TenantID dynamically
    formPayload.append("CompanyName", formData.companyName);
    formPayload.append("CompanyLogo", formData.logoFile); // Add the logo file
    formPayload.append("CompanyImage", formData.imageFile); // Add the image file
  
    setIsLoading(true);
    try {
      // Use the update settings API with TenantID as a query parameter
      const response = await axios.put(`${updateTenantSettings}/${tenantID}`, formPayload, {
        
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
      });
  
      console.log(response.data);
  
      toast.success("Tenant settings updated successfully!");
    } catch (error) {
      console.error("Error updating tenant settings:", error);
      toast.error("Error updating tenant settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleView = (imageType) => {
    const imageToShow =
      imageType === "image" ? formData.imagePreview : formData.logoPreview;
    setSelectedImage(imageToShow);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };
   // Retrieve the navbar-collapsed value from localStorage
    const storedCollapsed = localStorage.getItem('navbar-collapsed') === 'true';
  
    // Set the initial state based on the stored value
    const [isExpanded, setIsExpanded] = useState(!storedCollapsed);
  
    // Toggle the expanded/collapsed state and update localStorage
    const toggleExpandCollapse = () => {
      setIsExpanded(!isExpanded);
      // Save the state to localStorage
      localStorage.setItem('navbar-collapsed', !isExpanded);
    };
  
    useEffect(() => {
      // Set the initial state based on the localStorage value
      const storedCollapsed = localStorage.getItem('navbar-collapsed');
      if (storedCollapsed !== null) {
        setIsExpanded(storedCollapsed === 'false');
      }
    }, []); // Only run this once on component mount

  return (
    // <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:ml-10 lg:ml-56 w-auto mt-4 p-6 rounded-lg">
    // <div className="main-container">
    <div
    className={`main-container ${isExpanded ? 'expanded' : 'collapsed'}`}
  >
      <ToastContainer /> {isLoading && <LoadingAnimation />}
      <div className="mt-6 p-6 bg-white">
        {/* Modal for Image Preview */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative bg-white p-4 rounded-lg">
              <img
                src={selectedImage}
                alt="Preview"
                className="max-w-full max-h-[80vh]"
              />
              <button
                onClick={handleCloseModal}
                className="absolute top-2 right-2 flex items-center justify-center text-red-600 bg-red-50 rounded-md hover:bg-red-100 p-2"
              >
                <RiCloseLine size={18} />
              </button>
            </div>
          </div>
        )}

        <h2 className="heading">Settings</h2>
        <hr className="border-gray-300 my-4 mb-4" />

        {/* Company Name */}
        <div className="mt-8 mb-4 flex items-center">
          <label className="block font-semibold w-1/3 text-right pr-4 mb-6">
            Company Name <span className="text-red-500">*</span>:
          </label>
          <div className="w-2/3">
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              className="border p-2 w-full sm:w-1/2 rounded-md"
              placeholder="Enter Company Name"
            />
          </div>
        </div>
      
<div className="mb-4 flex items-center justify-center space-x-8">
  
  <div className="w-1/4">
    <label className="block font-semibold mb-2 text-center">Upload Image:</label>
    <div>
      <label
        htmlFor="project-image-upload"
        className={`rounded-lg flex items-center justify-center cursor-pointer ${
          formData.imagePreview
            ? "p-0 border-none"
            : "border-dashed border-2 border-gray-300 p-4"
        }`}
      >
        {formData.imagePreview ? (
          <div className="relative w-60 h-48 z-28 group overflow-hidden border rounded-md">
            <img
              src={formData.imagePreview}
              alt="Preview"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={() =>
                  setFormData((prevData) => ({
                    ...prevData,
                    imagePreview: null,
                    imageFile: null,
                  }))
                }
                className="text-white bg-red-600 p-1 rounded-full mr-2"
              >
                <FiTrash size={14} title="Delete" />
              </button>
              <button
                onClick={() => handleView("image")}
                className="text-white bg-blue-600 p-1 rounded-full"
              >
                <FiEye size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <FaRegFileImage size={30} className="text-gray-400 mb-2" />
            <p className="text-gray-700 text-sm">Upload Image</p>
          </div>
        )}
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleProjectImageUpload}
        className="hidden"
        id="project-image-upload"
      />
    </div>
  </div>

  
  <div className="w-1/4">
    <label className="block font-semibold mb-2 text-center">Upload Logo:</label>
    <div>
      <label
        htmlFor="logo-upload"
        className={`rounded-lg flex items-center justify-center cursor-pointer ${
          formData.logoPreview
            ? "p-0 border-none"
            : "border-dashed border-2 border-gray-300 p-4"
        }`}
      >
        {formData.logoPreview ? (
          <div className="relative w-60 h-48 z-28 group overflow-hidden border rounded-md">
            <img
              src={formData.logoPreview}
              alt="Logo Preview"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={() =>
                  setFormData((prevData) => ({
                    ...prevData,
                    logoPreview: null,
                    logoFile: null,
                  }))
                }
                className="text-white bg-red-600 p-1 rounded-full mr-2"
              >
                <FiTrash size={14} title="Delete" />
              </button>
              <button
                onClick={() => handleView("logo")}
                className="text-white bg-blue-600 p-1 rounded-full"
              >
                <FiEye size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <FiUpload size={30} className="text-gray-400 mb-2" />
            <p className="text-gray-700 text-sm">Upload Logo</p>
          </div>
        )}
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleLogoUpload}
        className="hidden"
        ref={logoInputRef}
        id="logo-upload"
      />
    </div>
  </div>
</div>

        {/* Submit Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSubmit}
            className="inline-flex justify-center rounded-md border border-transparent bg-custom-darkblue py-2 px-4 text-sm font-medium text-white hover:text-black shadow-sm hover:bg-custom-lightblue focus:outline-none"
          >
            Update Company
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProject;