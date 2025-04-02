import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableFooter,
  TablePagination,
} from "@mui/material";
import { FaPlus } from "react-icons/fa";
import { AiOutlineEdit } from "react-icons/ai";
import { IoIosSearch } from "react-icons/io";
import axios from "axios";
import { UserRoleContext } from "../../Context/roleContext";
import {
  GETALLROLESS_API,
  DELETEROLESBYID_API,
} from "../../Constants/apiRoutes";
import { MdOutlineCancel } from "react-icons/md";
import "../../style.css";
import {
  StyledTableCell,
  StyledTableRow,
  TablePaginationActions,
} from "../../Components/CustomTablePagination";
import LoadingAnimation from "../../Components/Loading/LoadingAnimation";

function UserRoles() {
  const [roles, setRoles] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchName, setSearchName] = useState("");
  const [totalRoles, setTotalRoles] = useState(0);
  const navigate = useNavigate();
  const { setRoleDetails } = useContext(UserRoleContext);
  const [loading, setLoading] = useState(true);

  const getAllRoles = async (pageNum, pageSize, search = "") => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(GETALLROLESS_API, {
        params: {
          page: pageNum + 1,
          limit: pageSize,
          SearchText: search,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return {
        roles: response.data.roles,
        totalCount: response.data.totalItems,
      };
    } catch (error) {}
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const { roles, totalCount } = await getAllRoles(
        page, // Page number
        rowsPerPage, // Page size
        searchName // Search text
      );

      // Update roles and total count
      setRoles(roles);
      setTotalRoles(totalCount);
    } catch (error) {
      console.error("Failed to fetch roles", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [page, rowsPerPage, searchName]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle the deletion of a role
  const deleteRoleById = async (roleId) => {
    try {
      const response = await axios.delete(`${DELETEROLESBYID_API}/${roleId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error;
    }
  };

  // Handle edit button click
  const handleEditClick = async (
    roleId,
    roleName,
    storeId,
    company,
    storeMap,
    functionName
  ) => {
    navigate(`/RoleUserEditform/${roleId}`, {
      state: { roleId, roleName, storeId, company, storeMap, functionName },
    });
  };

  // Handle delete button click
  const handleDeleteClick = async (roleId) => {
    try {
      await deleteRoleById(roleId);
      fetchRoles(); // Refresh the user list after deletion
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleAddUserRoleClick = () => {
    setRoleDetails(null);
    navigate("/RoleUserAddform");
  };

  const searchItems = (searchValue) => {
    setSearchName(searchValue);
    fetchRoles();
  };

  return (
    <div className="main-container">
      {loading && <LoadingAnimation />}
      <div className="mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="body-container">
          <h2 className="heading text-brown-700">Roles</h2>

          <div className="flex justify-end">
            <ul>
              <li>
                <button
                  type="button"
                  className="action-button flex items-center space-x-2 px-4 py-2"
                  onClick={handleAddUserRoleClick}
                >
                  <FaPlus aria-hidden="true" className="icon" />
                  <span>Add Roles</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex-container">
          <div className="search-container-c-u w-1/4">
            <label htmlFor="searchName" className="sr-only">
              Search
            </label>
            <input
              id="searchName"
              type="text"
              placeholder="Search by ID / Name / Status "
              value={searchName}
              onChange={(e) => searchItems(e.target.value)}
              className="search-input w-full pr-10 "
            />
            <div className="search-icon-container-c-u">
              <IoIosSearch className="text-gray-500" />
            </div>
          </div>
        </div>

        <TableContainer
          component={Paper}
          className="mt-4"
          sx={{ width: "100%", margin: "0 auto", marginTop: "1rem" }}
        >
          <Table sx={{ width: "100%", tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                {/* <StyledTableCell align="left">Role ID</StyledTableCell> */}
                <StyledTableCell align="left">Name</StyledTableCell>
                <StyledTableCell align="center">Company Name</StyledTableCell>
                <StyledTableCell align="center">Status</StyledTableCell>
                <StyledTableCell align="center" colSpan={2}>
                  Actions
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? ( // Show loading animation while fetching
                <StyledTableRow></StyledTableRow>
              ) : (
                roles.map((row) => (
                  <StyledTableRow key={row.RoleID}>
                    {/* <StyledTableCell align="left">{row.RoleID}</StyledTableCell> */}
                    <StyledTableCell align="left">
                      {row.RoleName}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {row.CompanyName}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <span
                        className={`status-pill ${
                          row.Status === "Active"
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {row.Status}
                      </span>
                    </StyledTableCell>
                    <StyledTableCell align="center" colSpan={2}>
                      <div className="flex justify-center space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEditClick(
                              row.RoleID,
                              row.RoleName,
                              row.StoreID,
                              row.CompanyName,
                              row.StoreMap,
                              row.Function
                            )
                          }
                          className="button edit-button text-white"
                        >
                          <AiOutlineEdit
                            aria-hidden="true"
                            className="h-4 w-4 mr-1"
                          />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteClick(row.RoleID)}
                          className="button delete-button text-white"
                        >
                          <MdOutlineCancel
                            aria-hidden="true"
                            className="h-4 w-4 mr-1"
                          />
                          Delete
                        </button>
                      </div>
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 20, 25]}
                  colSpan={4}
                  count={totalRoles}
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
      </div>
    </div>
  );
}

export default UserRoles;
