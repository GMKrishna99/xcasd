import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingAnimation from "../../Components/Loading/LoadingAnimation";
import {
  createProject,
  updateProject,
  getProjectTypeById,
} from "../../Constants/apiRoutes";
import { GET_ALL_DOCUMENT_API } from "../../Constants/apiRoutes";
import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import {
  FaEdit,
  FaDownload,
  FaTrash,
  FaEye,
  FaFile,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
} from "react-icons/fa";
import {
  ChevronUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";

const AddProject = () => {
  const [formData, setFormData] = useState({
    storeId: "",
    projectName: "",
    isActive: false,
    imageFile: null,
    imagePreview: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { ProjectTypeID } = useParams();
  const [projectType, setProjectType] = useState("");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
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

  const handleCancel = () => {
    navigate("/Project"); // Navigate to the project list page
  };

  const handleDelete = () => {
    setFormData((prevData) => ({
      ...prevData,
      imagePreview: null,
      imageFile: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleView = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors({ ...errors, [name]: "" });
  };
  const validateForm = () => {
    const formErrors = {};

    if (!formData.projectName.trim()) {
      formErrors.projectName = "Project Name is required.";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0; // No errors = valid
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (ProjectTypeID) {
      axios
        .get(`${getProjectTypeById}/${ProjectTypeID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          // Validate that the response structure matches the expected format
          if (
            response.data &&
            response.data.message === "Project Type retrieved successfully"
          ) {
            setProjectType(response.data.data); // Update state with project type data
          } else {
            console.error("Unexpected response structure:", response.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching project type data:", error);
        });
    }
  }, [ProjectTypeID]);
  useEffect(() => {
    if (editMode) {
      setFormData({
        projectName: projectType.ProjectTypeName?.replace(/['"]/g, "") || "",
        isActive: projectType.Status || "",
        imageFile: projectType.FileUrl, // Update if required from store
        imagePreview: projectType.FileUrl, // Update if required from store
      });
    }
  }, [editMode, projectType]);
  const handleSubmit = async () => {
    if (validateForm()) {
      setLoading(true);

      const projectData = {
        ProjectTypeName: String(formData.projectName),
        Status: formData.isActive ? "Active" : "Inactive",
        CreatedBy: "admin",
      };

      const token = localStorage.getItem("token");

      try {
        const response = await axios.post(createProject, projectData, {
          headers: {
            "Content-Type": "application/json", // Changed to JSON
            Authorization: `Bearer ${token}`,
          },
        });

        // Show success toast notification
        toast.success(response.data.message || "Project added successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        // Reset form fields
        setFormData({
          storeId: "", // Clear storeId
          projectName: "", // Clear projectName
          isActive: false, // Reset isActive to false
          imageFile: null, // Clear imageFile
          imagePreview: null, // Clear imagePreview
        });

        // Clear file input field
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        setTimeout(() => {
          handleCancel(); // Call the handleCancel function after the delay
        }, 3000);
      } catch (error) {
        // Show error toast notification
        toast.error(error.response?.data?.message || "Failed to add project!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }

      setLoading(false);
    }
  };

  useEffect(() => {
    if (ProjectTypeID) {
      setEditMode(Boolean(ProjectTypeID)); // Set editMode based on categoryData
    }
  }, [ProjectTypeID]);
  const handleProjectUpdate = async () => {
    setLoading(true);

    const projectData = {
      ProjectTypeName: formData.projectName,
      Status: formData.isActive, // Match backend expectations
      UploadDocument: formData.imageFile, // Ensure backend accepts this as a normal file path or URL
      CreatedBy: "admin",
      UpdatedBy: "admin",
    };

    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        `${updateProject}/${ProjectTypeID}`, // Include project ID in the URL
        projectData,
        {
          headers: {
            "Content-Type": "application/json", // Changed to JSON
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Show success toast notification
      toast.success(response.data.message || "Project updated successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Reset form fields
      setFormData({
        storeId: "", // Clear storeId
        projectName: "", // Clear projectName
        isActive: false, // Reset isActive to false
        imageFile: null, // Clear imageFile
        imagePreview: null, // Clear imagePreview
        projectId: "", // Clear projectId for subsequent submissions
      });

      // Clear file input field
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setTimeout(() => {
        handleCancel(); // Call the handleCancel function after the delay
      }, 3000);
    } catch (error) {
      // Show error toast notification
      toast.error(
        error.response?.data?.message || "Failed to update project!",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
    }

    setLoading(false);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [itemsPerPage] = useState(6);
  const [documents, setDocuments] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Extract query parameters from the URL
      const params = new URLSearchParams(location.search);
      const filter = params.get("filter"); // Get 'filter' from URL

      try {
        const response = await axios.get(
          GET_ALL_DOCUMENT_API,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            params: filter ? { filter } : {}, // Pass filter to API if available
          }
        );

        if (response.data?.data) {
          setDocuments(response.data.data);
        } else {
          toast.error("No documents found");
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch documents"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [location.search]);

  const [documentName, setDocumentName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Calculate pagination values
  const filteredDocuments = documents.filter((doc) => {
    if (!selectedStatus || selectedStatus === "All") return true;
    return doc.StatusId === selectedStatus;
  });

  const totalItems = filteredDocuments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredDocuments.slice(startIndex, endIndex);

  const handleAddDocumentClick = () => {
    navigate("/add-document/new");
  };

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadDocument = () => {
    if (!documentName || !selectedFile) {
      alert("Please enter document name and select a file");
      return;
    }

    const newDocument = {
      id: Date.now(),
      documentName: documentName,
      fileName: selectedFile.name,
      projectType: "New Project",
      status: "Pending",
      uploadDate: new Date().toISOString().split("T")[0],
      fileType: selectedFile.name.split(".").pop(),
    };

    setDocuments([...documents, newDocument]);
    handleCloseModal();
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // Add first page button
    if (startPage > 1) {
      buttons.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span
            key="ellipsis1"
            className="relative inline-flex items-center px-3 py-2 text-sm text-gray-700"
          >
            ...
          </span>
        );
      }
    }

    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`relative inline-flex items-center px-3 py-2 text-sm font-medium ${
            currentPage === i
              ? "z-10 bg-gradient-to-br from-[#8B4513] via-[#A0522D] to-[#D2691E] text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B4513]"
              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
          }`}
        >
          {i}
        </button>
      );
    }

    // Add last page button
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span
            key="ellipsis2"
            className="relative inline-flex items-center px-3 py-2 text-sm text-gray-700"
          >
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };
  const handleNavigation = (documentId) => {
    navigate(`/documentsDetails/${documentId}`);
  };

  const handleEdit = (documentId) => {
    navigate(`/add-document/${documentId}`);
  };
  return (
    <div className="main-container">
      <div className="mt-6 p-6 bg-white">
        <ToastContainer />
        <h2 className="heading">
          {editMode ? "Update Project" : "Add Project"}
        </h2>
        <hr className="border-gray-300 my-4 mb-4" />

        <div>
          {/* Project Name */}
          <div className="mt-8 mb-4 flex items-center">
            <label className="block font-semibold w-1/3 text-right pr-4 mb-6">
              Project Name <span className="text-red-500">*</span>:
            </label>
            <div className="w-2/3">
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                className={`border p-2 w-full sm:w-1/2 rounded-md ${
                  errors.projectName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter Project Name"
              />
              <p
                className={`text-red-500 text-sm h-5 ${
                  errors.projectName ? "visible" : "invisible"
                }`}
              >
                {errors.projectName}
              </p>
            </div>
          </div>

          {/* Is Active */}
          <div className="mb-4 flex items-center">
            <label className="block font-semibold w-1/3 text-right pr-4">
              Is Active:
            </label>
            <div className="w-2/3">
              <div
                onClick={() =>
                  setFormData((prevData) => ({
                    ...prevData,
                    isActive:
                      prevData.isActive === "Active" ? "Inactive" : "Active",
                  }))
                }
                className={`relative w-14 h-6 rounded-full cursor-pointer transition ${
                  formData.isActive === "Active" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                <div
                  className={`absolute top-1/2 left-1 transform -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    formData.isActive === "Active"
                      ? "translate-x-8"
                      : "translate-x-0"
                  }`}
                ></div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex ml-96 justify-center space-x-4">
            <button
              type="button"
              className="button-base save-btn"
              onClick={editMode ? handleProjectUpdate : handleSubmit}
            >
              {editMode ? "Update" : "Save"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="button-base save-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
        {currentItems.map((doc) => (
          <div
            key={doc.DocumentID}
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
          >
            <div className="p-4 sm:p-6">
              <div
                className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0 mb-4"
                onClick={() => handleNavigation(doc.DocumentID)}
              >
                <div className="flex items-start space-x-3 cursor-pointer">
                  {doc.FilePath ? (
                    doc.FilePath.toLowerCase().endsWith(".pdf") ? (
                      <FaFilePdf className="w-5 h-5 text-red-500" />
                    ) : doc.FilePath.toLowerCase().endsWith(".docx") ||
                      doc.FilePath.toLowerCase().endsWith(".doc") ? (
                      <FaFileWord className="w-5 h-5 text-blue-600" />
                    ) : doc.FilePath.toLowerCase().endsWith(".xlsx") ||
                      doc.FilePath.toLowerCase().endsWith(".xls") ? (
                      <FaFileExcel className="w-5 h-5 text-green-600" />
                    ) : (
                      <FaFile className="w-5 h-5 text-gray-500" />
                    )
                  ) : (
                    <FaFile className="w-5 h-5 text-gray-500" />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-800 line-clamp-1 text-sm sm:text-base">
                      {doc.DocumentName}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">
                      {doc.DocumentNo}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    doc.StatusId === 2
                      ? "bg-green-100 text-green-800"
                      : doc.StatusId === 1
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {doc.StatusId === 2
                    ? "Approved"
                    : doc.StatusId === 1
                    ? "Pending"
                    : "Rejected"}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-500">Project Type</span>
                  <span className="text-gray-700 font-medium">
                    {doc.ProjectTypeName}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-500">Customer</span>
                  <span className="text-gray-700 font-medium">
                    {doc.CustomerName}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-500">Upload Date</span>
                  <span className="text-gray-700">
                    {new Date(doc.UploadDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end items-center space-x-1 sm:space-x-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleNavigation(doc.DocumentID)}
                  className="p-1.5 sm:p-2 text-[#8B4513] hover:bg-[#8B4513]/10 rounded-lg transition-colors duration-300"
                  title="View"
                >
                  <FaEye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => handleEdit(doc.DocumentID)}
                  className="p-1.5 sm:p-2 text-[#8B4513] hover:bg-[#8B4513]/10 rounded-lg transition-colors duration-300"
                  title="Edit"
                >
                  <FaEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  className="p-1.5 sm:p-2 text-[#8B4513] hover:bg-[#8B4513]/10 rounded-lg transition-colors duration-300"
                  title="Download"
                >
                  <FaDownload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-300"
                  title="Delete"
                >
                  <FaTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 sm:mt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white px-4 py-3 rounded-lg shadow-sm">
          <div className="text-sm text-gray-700 text-center md:text-left">
            <p className="md:hidden">
              Page {currentPage} of {totalPages}
            </p>
            <p className="hidden md:block">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(endIndex, totalItems)}
              </span>{" "}
              of <span className="font-medium">{totalItems}</span> results
            </p>
          </div>

          {/* Mobile and Tablet Pagination */}
          <div className="flex justify-between md:hidden w-full">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Previous
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                {currentPage} / {totalPages}
              </span>
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>

          {/* Desktop Pagination */}
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-end">
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  currentPage === 1
                    ? "cursor-not-allowed"
                    : "hover:text-gray-700"
                }`}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              {renderPaginationButtons()}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  currentPage === totalPages
                    ? "cursor-not-allowed"
                    : "hover:text-gray-700"
                }`}
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
      {loading && <LoadingAnimation />}
    </div>
  );
};

export default AddProject;
