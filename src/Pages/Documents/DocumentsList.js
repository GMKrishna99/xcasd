import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Combobox } from "@headlessui/react";
import {
  ChevronUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";
// import Datepicker from "react-tailwindcss-datepicker";
import axios from "axios";
import LoadingAnimation from "../../Components/Loading/LoadingAnimation";
import { GET_ALL_DOCUMENT_API } from "../../Constants/apiRoutes";
import {
  FaEdit,
  FaDownload,
  FaPlus,
  FaTrash,
  FaEye,
  FaFile,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";
const DocumentsList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
        const response = await axios.get(GET_ALL_DOCUMENT_API, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: filter ? { filter } : {}, // Pass filter to API if available
        });

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

  // Document upload modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDocumentName("");
    setSelectedFile(null);
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

  const handleDownload = async (filePath) => {
    if (filePath) {
      try {
        const response = await fetch(filePath, {
          mode: "cors", // Ensure CORS is handled if necessary
        });
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const blob = await response.blob(); // Get the file as a blob
        const blobUrl = window.URL.createObjectURL(blob); // Create a URL for the blob
        const link = document.createElement("a");
        link.href = blobUrl;
        link.setAttribute(
          "download",
          filePath.split("/").pop() || "document.pdf"
        ); // Set the filename
        document.body.appendChild(link);
        link.click(); // Programmatically click the link to trigger the download
        document.body.removeChild(link); // Clean up
        window.URL.revokeObjectURL(blobUrl); // Release the blob URL
        toast.success("Download started"); // Optional: Show a success message
      } catch (error) {
        console.error("Error downloading file:", error);
        toast.error("Failed to download file"); // Optional: Show an error message
      }
    } else {
      toast.error("File not found"); // Optional: Show an error message if filePath is invalid
    }
  };

  return (
    <div className="main-container">
      {/* <div className="max-w-7xl mx-auto"> */}
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h2 className="heading">Documents</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={handleAddDocumentClick}
            className="flex items-center justify-center px-4 py-2 bg-gradient-to-br from-[#8B4513] via-[#A0522D] to-[#D2691E] text-white rounded-lg hover:from-[#A0522D] hover:to-[#D2691E] transition-all duration-300 w-full sm:w-auto"
          >
            <FaPlus className="mr-2" />
            Add Document
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8">
        <div className="w-full sm:w-64">
          <Combobox value={selectedStatus} onChange={setSelectedStatus}>
            <div className="relative">
              <Combobox.Input
                className="w-full p-2.5 text-sm border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
                displayValue={(status) => status || "Filter by Status"}
                placeholder="Filter by Status"
                readOnly
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-3">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
              </Combobox.Button>
              <Combobox.Options className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-60 overflow-auto">
                {["All", "Approved", "Pending", "Rejected"].map((status) => (
                  <Combobox.Option
                    key={status}
                    value={status}
                    className={({ active }) =>
                      `cursor-pointer p-2.5 text-sm ${
                        active ? "bg-[#8B4513] text-white" : "text-gray-900"
                      }`
                    }
                  >
                    {status}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                  onClick={() => handleDownload(doc.FilePath)}
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

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-[#8B4513] mb-4">
              Upload New Document
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="w-full p-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
                  placeholder="Enter document name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload File
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadDocument}
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-br from-[#8B4513] via-[#A0522D] to-[#D2691E] text-white rounded-lg hover:from-[#A0522D] hover:to-[#D2691E] transition-all duration-300"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <LoadingAnimation />}
    </div>
  );
};

export default DocumentsList;
