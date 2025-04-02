import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import { FaPlus } from "react-icons/fa";
import { AiOutlineEdit } from "react-icons/ai";
import { MdOutlineCancel } from "react-icons/md";
import { IoIosSearch } from "react-icons/io";
import axios from "axios";
import { UserContext } from "../../Context/userContext";
import {
  GETALLUSERS_API,
  DELETEUSERSBYID_API,
} from "../../Constants/apiRoutes";
import "../../style.css";
import {
  StyledTableCell,
  StyledTableRow,
  TablePaginationActions,
} from "../../Components/CustomTablePagination";
import LoadingAnimation from "../../Components/Loading/LoadingAnimation";
import { DataContext } from "../../Context/DataContext";
import * as XLSX from "xlsx";

function User() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchName, setSearchName] = useState("");
  const navigate = useNavigate();
  const { setUserDetails } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const { storesData } = useContext(DataContext);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");

  useEffect(() => {
    if (storesData) {
      setStores(storesData);
      if (storesData.length === 1) {
        setSelectedStore(storesData[0]);
      }
    }
  }, [storesData]);

  const handleStoreChange = (newStore) => {
    setSelectedStore(newStore);
    setPage(0);
  };

  const getAllUsers = async (pageNum, pageSize, search = "", storeIDs = []) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(GETALLUSERS_API, {
        params: {
          pageNumber: pageNum + 1,
          pageSize: pageSize,
          SearchText: search,
          StoreIDs: storeIDs,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return {
        users: response.data.users,
        totalCount: response.data.totalItems,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, searchName]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(GETALLUSERS_API, {
        params: {
          pageNumber: page + 1,
          pageSize: rowsPerPage,
          SearchText: searchName,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setUsers(response.data.users);
      setTotalUsers(response.data.totalItems);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditClick = (userId) => {
    navigate(`/userform/${userId}`);
  };

  const handleDeleteClick = async (userId) => {
    setIsLoading(true);
    try {
      await deleteUserById(userId);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUserById = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.delete(`${DELETEUSERSBYID_API}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  const handleAddUserClick = () => {
    setUserDetails(null);
    navigate("/userform/new");
  };
  const exportToExcel = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const handleExportUsersData = async () => {
    try {
      const { users } = await getAllUsers(0, totalUsers); // Fetch all users for export
      exportToExcel(users, "Customers");
    } catch (error) {
      console.error("Error exporting users data:", error);
    }
  };

  const searchItems = (searchValue) => {
    setSearchName(searchValue);
  };

  return (
    <div className="main-container">
      {isLoading && <LoadingAnimation />}
      <div className="mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="body-container">
          <h2 className="heading text-brown-700">User's</h2>

          <div className="flex justify-end">
            <ul>
              <li>
                <button
                  type="button"
                  className="action-button flex items-center space-x-2 px-4 py-2"
                  onClick={handleAddUserClick}
                >
                  <FaPlus aria-hidden="true" className="icon" />
                  <span>Add User</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex items-center mb-4 mt-4">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search"
              value={searchName}
              onChange={(e) => searchItems(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
            <IoIosSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Roles</StyledTableCell>
                <StyledTableCell>Function</StyledTableCell>
                <StyledTableCell>Country</StyledTableCell>
                <StyledTableCell>Region</StyledTableCell>
                <StyledTableCell>Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <StyledTableRow key={user.UserID}>
                  <StyledTableCell>
                    <div className="flex items-center">
                      <span>{`${user.FirstName} ${user.LastName}`}</span>
                    </div>
                  </StyledTableCell>
                  <StyledTableCell>
                    <span
                      className={`inline-block min-w-[100px] text-center py-1 px-3 rounded-full text-sm font-medium ${getRoleColor(
                        user.RoleName
                      )}`}
                    >
                      {user.RoleName}
                    </span>
                  </StyledTableCell>
                  <StyledTableCell>{user.Function}</StyledTableCell>
                  <StyledTableCell>{user.CountryName}</StyledTableCell>
                  <StyledTableCell>South Asia</StyledTableCell>
                  <StyledTableCell colSpan={2}>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(user.UserID)}
                        className="button edit-button "
                      >
                        <AiOutlineEdit
                          aria-hidden="true"
                          className="h-4 w-4 mr-1"
                        />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteClick(user.UserID)}
                        className="button delete-button "
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
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 20, 25]}
                  colSpan={6}
                  count={totalUsers}
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

const getRoleColor = (role) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return "bg-[#FF3B3066] text-[#FF2D55]";
    case "user":
      return "bg-[#34C75966] text-[#34C759]";
    case "department 1":
      return "bg-[#FFF4E5] text-[#FFA113]";
    case "department 2":
      return "bg-[#E8FFE3] text-[#57CA22]";
    case "department 3":
      return "bg-[#F4E5FF] text-[#A113FF]";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default User;
