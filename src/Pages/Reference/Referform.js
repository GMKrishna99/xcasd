import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  createParentOrChindreference, PostSubReference, GetAllReference, GetReferenceById, updateParentOrChindreference, GetAllParentReference
} from "../../Constants/apiRoutes";
import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { useReference } from "../../Context/ReferContext";
import { toast,ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const ReferenceSubReferenceForm = ({onClose}) => {
  // const [selectedOption, setSelectedOption] = useState("Reference");
  const [referenceInput, setReferenceInput] = useState("");
  const [subReferenceInput, setSubReferenceInput] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [parentId, setParentId] = useState(null);
  const [referNames, setReferNames] = useState(null);
  const [data, setData] = useState(null);

  const { referenceId } = useReference();
  const handleClose = () => {
    onClose(); // Close the modal
  };
  const [referenceOptions, setReferenceOptions] = useState([]); // All references
  const [filteredReferences, setFilteredReferences] = useState([]); // Filtered references
  const [query, setQuery] = useState(""); // Search query
  const [selectedReference, setSelectedReference] = useState([]); // Selected value
  const [references, setReferences] = useState([]);

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const token=localStorage.getItem("token");
        const response = await axios.get(
          GetAllParentReference,
          {
            headers:{
              Authorization:`Bearer ${token}`,
              "Content-Type": "application/json",
            }
          }
        
        );

        // Extract the data array
        const referenceData = Array.isArray(response.data.data) ? response.data.data : [];
        setReferences(referenceData);
        setFilteredReferences(referenceData); // Set initial filtered references
      } catch (error) {
        console.error("Error fetching references:", error);
        setReferences([]);
        setFilteredReferences([]);
      }
    };

    fetchReferences();
  }, []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [referencesWithParent, setReferencesWithParent] = useState([]);

  useEffect(() => {
    // Fetch reference data only if the referenceId is not "new"
    if (referenceId && referenceId !== "new") {
      const fetchReferences = async () => {
        const token=localStorage.getItem("token");
        try {
          const response = await axios.get(`${GetReferenceById}/${referenceId}`,{
            headers:{
              Authorization:`Bearer ${token}`,
              "Content-Type": "application/json",
            }
          });
          const fetchedData = response.data.data;
          setReferNames(fetchedData.name);
          setIsActive(fetchedData.isActive);
          setSelectedReference({
            name: fetchedData.parentName,
          });
          setParentId(fetchedData.parentId); // Ensure the parentId is updated
          console.log(fetchedData.parentId); // Debug log to check the value
        } catch (err) {
          console.error("Error fetching references:", err);
        }
      };
      fetchReferences();
    } else {
      // Clear the states for a new reference
      setReferNames("");
      setIsActive(false);
      setSelectedReference(null);
      setParentId(null);
    }
  }, [referenceId]);
  const handleSave = async () => {
    // Use the parentId from the selectedReference or fallback to the one fetched earlier
    const resolvedParentId = selectedReference?.id || parentId || 0;
    const token=localStorage.getItem("token");
    // Data to be sent to the API
    const requestData = {
      name: referNames,
      isActive: isActive,
      parentId: resolvedParentId, // Use the resolved parentId
    };

    try {
      let response;

      if (referenceId === "new") {
        // Create new reference
        response = await axios.post(createParentOrChindreference, requestData, {
          headers: {
            "Content-Type": "application/json",
            Authorization:`Bearer ${token}`,
          },
        });

        // Check for success response
        if (response.data.success) {
          toast.success("Reference created successfully!");
        } else {
          toast.error(response.data.message || "Failed to create reference.");
        }
      } else if (referenceId) {
        // Update existing reference
        response = await axios.put(
          `${updateParentOrChindreference}/${referenceId}`,
          requestData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization:`Bearer ${token}`,
            },
          }
        );
        if (response.data.success) {
          toast.success("Reference updated successfully!");
        } else {
          toast.error(response.data.message || "Failed to update reference.");
        }
      }

      // Close the modal after successful save
      // onClose();

      // Reload the page after a slight delay to show the toast
      setTimeout(() => {
        onClose()
      }, 2000);
    } catch (error) {
      console.error("Error saving reference:", error);

      // If there's an error, check if the error response has a message
      const errorMessage = error.response?.data?.message || "Failed to save reference. Please try again.";
      toast.error(errorMessage);
    }
  };
  const handleReferenceChange = (selected) => {
    setSelectedReference(selected);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50">
      <ToastContainer />
      {/* Increased width using max-w-xl */}
      <div className="p-6 max-w-xl w-full mx-auto mt-20 bg-white rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Reference</h2>
        <div className="mb-8">

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={referNames}
              onChange={(e) => setReferNames(e.target.value)}
              placeholder="Enter reference"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring focus:ring-blue-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Reference
            </label>
            <div className="relative w-full">
              <Combobox value={selectedReference} onChange={handleReferenceChange} by="id">
                <Combobox.Input
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring focus:ring-blue-300"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search or select a reference"
                  displayValue={(ref) => ref?.name || ""}
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-lg px-2 focus:outline-none">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </Combobox.Button>
                <Combobox.Options className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {filteredReferences.length > 0 ? (
                    filteredReferences.map((ref) => (
                      <Combobox.Option
                        key={ref.id}
                        value={ref}
                        className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
                      >
                        <span className="block truncate group-data-[selected]:font-semibold">
                          {ref.name || "Unnamed Reference"}
                        </span>
                        {selectedReference?.id === ref.id && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </Combobox.Option>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500 text-center">
                      No references match your search.
                    </div>
                  )}
                </Combobox.Options>
              </Combobox>
            </div>
          </div>

          
          <div className="mb-4 flex items-center">
            <label className="flex items-center text-gray-700 font-semibold">
              Is Active:
            </label>
            <div
              onClick={() => setIsActive(!isActive)}
              className={`ml-2 relative w-14 h-6 rounded-full cursor-pointer transition ${isActive ? "bg-green-500" : "bg-red-500"
                }`}
            >
              <div
                className={`absolute top-1/2 left-1 transform -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${isActive ? "translate-x-8" : "translate-x-0"
                  }`}
              ></div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={handleSave}
            // className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-500 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
            className="button-base save-btn"
          >
            {referenceId === "new" ? "Save" : "Update"}
          </button>
          <button
            type="button"
            onClick={handleClose}
           className="button-base save-btn"
          >
            Cancel
          </button>
        </div>
      </div>

    </div>

  );
};

export default ReferenceSubReferenceForm;
