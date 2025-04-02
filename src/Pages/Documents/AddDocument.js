import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import {
  getProjects,
  GET_DOCUMENT_API,
  ADD_DOCUMENT_API,
  UPDATE_DOCUMENT_API,
} from "../../Constants/apiRoutes";

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
const AddDocument = () => {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const [documentNo, setDocumentNo] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [statusId, setStatusId] = useState("");
  const [projectTypeId, setProjectTypeId] = useState("");
  const [statuses] = useState([
    { id: 1, name: "Approved" },
    { id: 2, name: "Pending" },
    { id: 3, name: "Rejected" },
  ]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // State for combo dropdowns
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [statusQuery, setStatusQuery] = useState("");
  const [selectedProjectType, setSelectedProjectType] = useState(null);
  const [projectTypeQuery, setProjectTypeQuery] = useState("");
  const [FunctionID, setFunctionID] = useState("");
  const [documentFile, setDocumentFile] = useState(null); // New state for the uploaded document file

  const handleUploadDocument = async () => {
    if (
      !documentName ||
      !customerName ||
      !selectedStatus ||
      !selectedProjectType ||
      (!documentFile && (!documentId || documentId === "new")) // Only require file for new documents
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const formData = new FormData();
    const UserID = localStorage.getItem("UserID");

    if (documentId && documentId !== "new") {
      formData.append("DocumentNo", documentNo);
    }
    formData.append("CreatedBy", UserID);
    formData.append("DocumentName", documentName);
    formData.append("CustomerName", customerName);
    formData.append("StatusId", selectedStatus.id);
    formData.append("ProjectType", selectedProjectType.ProjectTypeID);
    // formData.append("FunctionID", selectedFunction.id);

    // Only append file if a new file is selected
    if (documentFile instanceof File) {
      formData.append("UploadDocument", documentFile);
    }

    const tenantId = localStorage.getItem("TenantID");
    if (tenantId) {
      formData.append("TenantId", tenantId);
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      let response;
      if (documentId && documentId !== "new") {
        response = await axios.put(
          `${UPDATE_DOCUMENT_API}/${documentId}`,
          formData,
          { headers }
        );
      } else {
        response = await axios.post(ADD_DOCUMENT_API, formData, { headers });
      }

      if (response.data.status === "success") {
        toast.success(
          documentId && documentId !== "new"
            ? "Document updated successfully!"
            : "Document added successfully!"
        );
        navigate("/documentsList");
      } else {
        toast.error(response.data.message || "Failed to save document");
      }
    } catch (error) {
      console.error("Error saving document", error);
      toast.error("An error occurred while saving the document");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const fetchProjectTypes = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(getProjects, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const projectTypesData = response.data.data || [];
        setProjectTypes(projectTypesData);

        // Fetch document data after setting project types
        if (documentId && documentId !== "new") {
          fetchDocumentData(projectTypesData); // Pass project types
        }
      } catch (error) {
        console.error("Error fetching project types", error);
      }
    };

    const fetchDocumentData = async (projectTypesData) => {
      if (documentId && documentId !== "new") {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `${GET_DOCUMENT_API}/${documentId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const documentData = response.data?.data;

          if (documentData) {
            setDocumentNo(documentData.DocumentNo || "");
            setDocumentName(documentData.DocumentName || "");
            setCustomerName(documentData.CustomerName || "");

            const status = statuses.find((s) => s.id === documentData.StatusId);
            setSelectedStatus(status || null);
            setStatusId(documentData.StatusId);

            // Use passed project types instead of dependency on state
            if (documentData.ProjectTypeName) {
              const projectType = projectTypesData.find(
                (pt) => pt.ProjectTypeName === documentData.ProjectTypeName
              );
              if (projectType) {
                setSelectedProjectType(projectType);
                setProjectTypeId(documentData.ProjectTypeName);
              }
            }

            if (documentData.FilePath) {
              setDocumentFile(documentData.FilePath);
            }

            if (documentData.FunctionID) {
              const func = functionsList.find(
                (f) => f.id === documentData.FunctionID
              );
              setSelectedFunction(func || null);
              setFunctionID(documentData.FunctionID);
            }
          }
        } catch (error) {
          console.error("Error fetching document data", error);
          toast.error("Failed to fetch document details");
        }
      }
    };

    fetchProjectTypes();
  }, [documentId]); // Remove projectTypes from dependencies

  const [selectedFunction, setSelectedFunction] = useState(
    functionsList.find((f) => f.id === FunctionID) || null
  );
  const [query, setQuery] = useState("");

  const filteredFunctions =
    query === ""
      ? functionsList
      : functionsList.filter((func) =>
          func.name.toLowerCase().includes(query.toLowerCase())
        );

  const handleFunctionChange = (selected) => {
    setSelectedFunction(selected);
    setFunctionID((prev) => ({ ...prev, FunctionID: selected.id })); // Store as integer
  };

  return (
    <div className="main-container">
      <h2 className="text-lg font-semibold mb-4">
        {documentId !== "new" ? "Update Document" : "Add New Document"}
      </h2>

      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8 px-16 md:px-24 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter document name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter customer name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8 px-16 md:px-24 mb-4">
        {/* Status Dropdown */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <Combobox value={selectedStatus} onChange={setSelectedStatus}>
            <div className="relative">
              <Combobox.Input
                className="block w-full rounded-md border border-gray-400 py-2 px-4 shadow-sm sm:text-sm"
                onChange={(event) => setStatusQuery(event.target.value)}
                displayValue={(status) => status?.name || ""}
                placeholder="Select Status"
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Combobox.Button>
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {statuses.map((status) => (
                  <Combobox.Option
                    key={status.id}
                    value={status}
                    className="cursor-default select-none py-2 px-4 text-gray-900 hover:bg-indigo-600 hover:text-white"
                  >
                    {status.name}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>

        {/* Project Type Dropdown */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Type <span className="text-red-500">*</span>
          </label>
          <Combobox
            value={selectedProjectType}
            onChange={setSelectedProjectType}
          >
            <div className="relative">
              <Combobox.Input
                className="block w-full rounded-md border border-gray-400 py-2 px-4 shadow-sm sm:text-sm"
                onChange={(event) => setProjectTypeQuery(event.target.value)}
                displayValue={(projectType) =>
                  projectType?.ProjectTypeName || ""
                }
                placeholder="Select Project Type"
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Combobox.Button>
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {projectTypes.map((projectType) => (
                  <Combobox.Option
                    key={projectType.ProjectTypeID}
                    value={projectType}
                    className="cursor-default select-none py-2 px-4 text-gray-900 hover:bg-indigo-600 hover:text-white"
                  >
                    {projectType.ProjectTypeName}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>

        {/* Upload Document */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Document{" "}
            {!documentId || documentId === "new" ? (
              <span className="text-red-500">*</span>
            ) : null}
          </label>
          <input
            type="file"
            onChange={(e) => setDocumentFile(e.target.files[0])}
            className="block w-full rounded-md border border-gray-400 py-2 px-4 shadow-sm sm:text-sm"
            required={!documentId || documentId === "new"}
          />
          {documentId &&
            documentId !== "new" &&
            documentFile &&
            typeof documentFile === "string" && (
              <p className="text-sm text-gray-600 mt-1">
                Current file: {documentFile.split("/").pop()}
              </p>
            )}
        </div>

        {/* Function Dropdown */}
        <div className="w-full">
          <label
            htmlFor="FunctionID"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Function <span className="text-red-500">*</span>
          </label>
          <Combobox
            as="div"
            value={selectedFunction}
            onChange={handleFunctionChange}
          >
            <div className="relative">
              <Combobox.Input
                id="FunctionID"
                name="FunctionID"
                className="block w-full rounded-md border border-gray-400 py-2 px-4 shadow-sm sm:text-sm"
                onChange={(event) => setQuery(event.target.value)}
                displayValue={(func) => func?.name || ""}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Combobox.Button>
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {filteredFunctions.map((func) => (
                  <Combobox.Option
                    key={func.id}
                    value={func}
                    className="cursor-default select-none py-2 px-4 text-gray-900 hover:bg-indigo-600 hover:text-white"
                  >
                    {func.name}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleUploadDocument}
          className="flex items-center px-4 py-2 bg-[#8B4513] text-white rounded-lg"
        >
          <span>{documentId !== "new" ? "Update" : "Upload"}</span>
        </button>
      </div>
    </div>
  );
};

export default AddDocument;
