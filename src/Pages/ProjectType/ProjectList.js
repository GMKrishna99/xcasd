import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { getProjects, deleteProjectType } from "../../Constants/apiRoutes";
import { toast, ToastContainer } from "react-toastify";
import LoadingAnimation from "../../Components/Loading/LoadingAnimation";
import "react-toastify/dist/ReactToastify.css";
import {
  StyledTableCell,
  StyledTableRow,
  TablePaginationActions,
} from "../../Components/CustomTablePagination";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import { AiOutlineEdit } from "react-icons/ai";
import { MdOutlineCancel } from "react-icons/md";

const ProjectTable = () => {
  const [page, setPage] = useState(0);
  const dropdownRef = useRef(null);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paginatedData, setPaginatedData] = useState([]);
  const navigate = useNavigate();
  const handleCreateProject = () => {
    navigate("/ProjectCreation");
  };

  const handleEditProject = (ProjectTypeID) => {
    navigate(`/ProjectCreation/${ProjectTypeID}`);
  };
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDeleteProject = async (ProjectTypeID) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${deleteProjectType}/${ProjectTypeID}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        // Display success toast if the project is deleted successfully
        toast.success(result.message || "Project deleted successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setRefresh((prev) => !prev); // Refresh the data if necessary
      } else {
        // Display error toast if deletion fails
        toast.error(
          result.message || `Failed to delete project with ID ${ProjectTypeID}`,
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
    } catch (error) {
      // Handle any unexpected errors during the request
      console.error("Error:", error);
      toast.error("An error occurred while deleting the project", {
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
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(getProjects, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setProjects(response.data.data);
      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [refresh]);

  useEffect(() => {
    const filteredProjects = projects.filter(
      (project) =>
        (project.ProjectTypeName &&
          project.ProjectTypeName.toLowerCase().includes(
            searchQuery.toLowerCase()
          )) ||
        (project.ProjectTypeID &&
          project.ProjectTypeID.toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
    );

    const paginatedData = filteredProjects.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
    setPaginatedData(paginatedData);
  }, [searchQuery, projects, page, rowsPerPage]);

  return (
    <div ref={dropdownRef} className={`main-container`}>
      <ToastContainer />
      {loading && <LoadingAnimation />}
      <div className="body-container">
        <h2 className="heading">Projects</h2>

        <div className="flex justify-end">
          <ul>
            <li>
              <button
                type="button"
                className="action-button flex items-center space-x-2 px-4 py-2"
                onClick={handleCreateProject}
              >
                <FaPlus aria-hidden="true" className="icon" />
                <span>Create Project</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2 mt-2 mb-4">
        {/* Container for centering search box */}
        <div className="flex justify-center items-center w-full mt-4">
          <div className="relative flex items-center">
            <label htmlFor="searchName" className="sr-only">
              Search
            </label>
            <input
              id="searchName"
              type="text"
              placeholder=" Search by Project Number / Project Name "
              value={searchQuery}
              onChange={handleSearchChange}
              className="p-2 pr-10 border border-gray-400 rounded-md w-full sm:w-[400px] md:w-[500px] text-sm leading-6 h-[40px]"
            />
            <div className="absolute right-3 text-gray-500">
              <IoIosSearch />
            </div>
          </div>
        </div>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((project) => (
              <StyledTableRow key={project.ProjectTypeID}>
                <StyledTableCell>
                  <span>{project.ProjectTypeName || "Unnamed Project"}</span>
                </StyledTableCell>
                <StyledTableCell>
                  <span
                    className={`inline-block min-w-[80px] text-center py-1 px-3 rounded-full text-sm font-medium ${
                      project.Status === "Active"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {project.Status}
                  </span>
                </StyledTableCell>
                <StyledTableCell colSpan={2}>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEditProject(project.ProjectTypeID)}
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
                      onClick={() => handleDeleteProject(project.ProjectTypeID)}
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
                colSpan={3}
                count={projects.length}
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
  );
};

export default ProjectTable;
