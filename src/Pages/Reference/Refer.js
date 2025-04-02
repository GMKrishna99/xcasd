import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import { FaPlus } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { AiOutlineEdit } from "react-icons/ai";
import axios from "axios";
import {
  GetAllReference,
  DeleteReference,
} from "../../Constants/apiRoutes";
import { MdOutlineCancel } from "react-icons/md";
import "../../style.css";
import {
  StyledTableCell,
  TablePaginationActions,
} from "../../Components/CustomTablePagination";
import LoadingAnimation from "../../Components/Loading/LoadingAnimation";
import ReferenceSubReferenceForm from "../../Pages/Reference/Referform";
import { useReference } from "../../Context/ReferContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function Reference() {
  const [refresh, setRefresh] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchName, setSearchName] = useState("");
  const navigate = useNavigate();
  const [paginatedPeople, setPaginatedPeople] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [references, setReferences] = useState([]); // Holds the references list
  const [filteredReferences, setFilteredReferences] = useState([]); // Holds filtered references
  const [totalReferences, setTotalReferences] = useState(0);
  const location = useLocation();
  const { setReferenceId } = useReference();

  const getAllReferences = async (pageNum, pageSize, search = "") => {
    try {
      const token=localStorage.getItem("token");
      const response = await axios.get(GetAllReference, {
        params: {
          UserID: 1,
          pageNumber: pageNum + 1,
          pageSize: pageSize,
          SearchText: search, // Changed `searchName` to `search` for consistency
        },
        headers:{
          Authorization:`Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      return {
        references: response.data || [], // Changed `Stores` to `references`
        totalCount: response.data.totalItems || 0,
      };
    } catch (error) {
      console.error("Error fetching references:", error);
      throw error;
    }
  };
  const fetchReferences = async () => {
    setIsLoading(true);
    try {
      const { references, totalCount } = await getAllReferences(
        page,
        rowsPerPage,
        searchName
      );

      // Ensure the `references` object and `data` key exist
      const data = references?.data || []; // Safely access the `data` array from the response

      setPaginatedPeople(data); // Corrected variable for paginated people
      setReferences(data); // Set references directly
      setTotalReferences(totalCount); // Update total reference count

      if (!isSearching) {
        setFilteredReferences(data); // Update filtered references when not searching
      }

      setTotalReferences(totalCount); // Update total references count again (may not be necessary)
    } catch (error) {
      console.error("Failed to fetch references", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferences();
  }, [page, rowsPerPage, searchName, refresh]); // The dependency array remains unchanged

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const deleteReferenceById = async (ReferId) => {
    setIsLoading(true);
    try {
      const response = await axios.delete(`${DeleteReference}/${ReferId}`);
      console.log("Delete successful, triggering toast...");
      toast.success("Reference deleted successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setRefresh((prev) => !prev);
      return response.data;
    } catch (error) {
      console.error("Error deleting reference:", error);
      toast.error("An error occurred while deleting the reference", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
 
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [resetForm, setResetForm] = useState(false);

  const isReferencePage = location.pathname === "/Reference";
  const handleAddStoreClick = () => {
    setReferenceId("new"); // Set the reference ID as "new" when adding a new reference
    setIsModalOpen(true); // Open the modal
  };

  const handleEditClick = (ReferId) => {
    // navigate(`/Referenceform/${ReferId}`);
    // window.history.pushState({}, "", `/Referenceform/${ReferId}`);
    setReferenceId(ReferId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setRefresh((prev) => !prev);
    navigate("/Reference"); // Reset the URL to "/Reference" when the modal is closed
  };

  const searchItems = (searchValue) => {
    setSearchName(searchValue);

    if (searchValue === "") {
      setIsSearching(false);
      
    } else {
      setIsSearching(true); // Enable search mode
      const filteredData = paginatedPeople.filter((item) => {
        return Object.values(item)
          .join("")
          .toLowerCase()
          .includes(searchValue.toLowerCase());
      });
    
    }
  };

  return (
    <div>
      <div className="main-container">
          <ToastContainer />
        <div className="body-container">
          <h2 className="heading">Document Trial</h2>
          <div className="search-button-group">
            <div className="search-container">
              <label htmlFor="searchName" className="sr-only">
                Search
              </label>
              <input
                id="searchName"
                type="text"
                placeholder="Search by Reference"
                value={searchName}
                onChange={(e) => searchItems(e.target.value)}
                className="mt-1 p-2 pr-10 border border-gray-300 rounded-md w-full "
              />
              <div className="search-icon-container text-gray-500">
                <IoIosSearch />
              </div>
            </div>

            <ul className="button-list">
              <li>
                <button
                  type="button"
                  className="action-button"
                  onClick={handleAddStoreClick}
                >
                  <FaPlus aria-hidden="true" className="icon" />
                  Add Document Trial
                </button>
              </li>
            
            </ul>
          </div>
        </div>
        <TableContainer component={Paper} className="mt-4 rounded-lg shadow">
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>ID</StyledTableCell>
                <StyledTableCell>Document Trial</StyledTableCell>
                <StyledTableCell>Sub-Document Trial</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(references) && references.length > 0 ? (
                references.map((reference) => (
                  <TableRow key={reference.id}>
                    <StyledTableCell>{reference.id}</StyledTableCell>
                    <StyledTableCell>
                      {reference.parentId === null
                        ? reference.name
                        : reference.parentName}
                    </StyledTableCell>
                    <StyledTableCell>
                      {reference.parentId !== null ? reference.name : "N/A"}
                    </StyledTableCell>
                    <StyledTableCell>
                      <span
                        className={`status-pill ${
                          reference.isActive
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {reference.isActive ? "Active" : "Inactive"}
                      </span>
                    </StyledTableCell>
                    <StyledTableCell>
                      <div className="button-container">
                        <button
                          type="button"
                          onClick={() => handleEditClick(reference.id)}
                          className="button edit-button"
                        >
                          <AiOutlineEdit
                            aria-hidden="true"
                            className="h-4 w-4"
                          />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteReferenceById(reference.id)}
                          className="button delete-button"
                        >
                          <MdOutlineCancel
                            aria-hidden="true"
                            className="h-4 w-4"
                          />
                          Delete
                        </button>
                      </div>
                    </StyledTableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <StyledTableCell colSpan={5}>
                    No references available.
                  </StyledTableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 20, 25]}
                  colSpan={6}
                  count={references.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>

        {isModalOpen && (
          <ReferenceSubReferenceForm
            isModalOpen={isModalOpen}
            resetForm={resetForm}
            onClose={closeModal}
          />
        )}

        {isLoading && <LoadingAnimation />}
      </div>
    </div>
  );
}

export default Reference;
