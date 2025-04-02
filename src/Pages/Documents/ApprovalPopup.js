import React, { useState, useEffect } from "react";
import axios from "axios";
import { GETALLUSERS_API } from "../../Constants/apiRoutes";

const AddApprovalPopup = ({ isOpen, onClose }) => {
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSearchText(""); // Clear search text when opening
      setSelectedEmail(""); // Clear selected email when opening
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(GETALLUSERS_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Handle search filtering
  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredUsers([]); // Hide list when search is empty
      return;
    }
    const filtered = users.filter(
      (user) =>
        user.FirstName.toLowerCase().includes(searchText.toLowerCase()) ||
        user.LastName.toLowerCase().includes(searchText.toLowerCase()) ||
        user.Email.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchText, users]);

  const handleUserSelect = (user) => {
    setSelectedEmail(user.Email);
    setSearchText(`${user.FirstName} ${user.LastName} (${user.Email})`); // Set user name & email in search bar
    setFilteredUsers([]); // Hide user list after selection
  };

  const handleSendMail = async () => {
    if (!selectedEmail) {
      alert("Please select a user!");
      return;
    }

    try {
      await axios.post("YOUR_SEND_MAIL_API", { email: selectedEmail });
      alert("Mail sent successfully!");
      onClose();
    } catch (error) {
      console.error("Error sending mail:", error);
      alert("Failed to send mail.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Add Approval</h2>

        {/* Search input */}
        <input
          type="text"
          placeholder="Search by name or email..."
          className="w-full p-2 border rounded mb-4"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {/* User list (only shown when typing) */}
        {searchText.trim() !== "" && filteredUsers.length > 0 && (
          <div className="max-h-40 overflow-y-auto border rounded mb-4">
            {filteredUsers.map((user) => (
              <div
                key={user.UserID}
                className={`p-2 cursor-pointer hover:bg-gray-100 ${
                  selectedEmail === user.Email ? "bg-gray-200" : ""
                }`}
                onClick={() => handleUserSelect(user)}
              >
                <p className="text-sm font-medium">
                  {user.FirstName} {user.LastName}
                </p>
                <p className="text-xs text-gray-500">{user.Email}</p>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-opacity-80"
          >
            Cancel
          </button>
          <button
            onClick={handleSendMail}
            className="px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-opacity-90 disabled:opacity-50"
            disabled={!selectedEmail}
          >
            Send Mail
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddApprovalPopup;
