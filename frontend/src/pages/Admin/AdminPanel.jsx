import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, ChevronDown } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useForm } from "../../hooks/useForm";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";
import { POSITIONS, ROLES } from "../../utils/constants";
import { FormField, SelectField } from "../../components/ui/FormField";
import { Modal } from "../../components/ui/Modal";

const AdminPanel = () => {
  const { isAdmin, role } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [filterRole, setFilterRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const profileFormFields = {
    idCompanny: "",
    displayName: "",
    email: "",
    department: "",
    position: "",
    phone: "",
    role: "user",
    newPassword: "",
  };

  const newUserFields = {
    idCompanny: "",
    password: "",
    email: "",
    displayName: "",
    position: "",
    role: "user",
  };

  const {
    formData: profileFormData,
    handleChange: handleProfileChange,
    setMultipleFields: setProfileFields,
  } = useForm(profileFormFields);
  const {
    formData: newUserData,
    handleChange: handleNewUserChange,
    reset: resetNewUserForm,
  } = useForm(newUserFields);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole, role]);

  const sortUsersByRolePriority = (usersList) => {
    const rolePriority = {
      admin: 0,
      moderator: 1,
      user: 2,
    };

    return [...usersList].sort((firstUser, secondUser) => {
      const firstPriority = rolePriority[firstUser.role] ?? 99;
      const secondPriority = rolePriority[secondUser.role] ?? 99;

      if (firstPriority !== secondPriority) {
        return firstPriority - secondPriority;
      }

      return (firstUser.displayName || "").localeCompare(
        secondUser.displayName || "",
      );
    });
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const isAdminUser = isAdmin();

      let response;
      if (isAdminUser) {
        response =
          filterRole === "all"
            ? await axiosInstance.get(API_PATHS.ADMIN_ALL_USERS)
            : await axiosInstance.get(
                API_PATHS.ADMIN_USERS_BY_ROLE(filterRole),
              );
      } else {
        response =
          filterRole === "all"
            ? await axiosInstance.get(API_PATHS.MODERATOR_USERS)
            : await axiosInstance.get(
                API_PATHS.MODERATOR_USERS_BY_ROLE(filterRole),
              );
      }

      setUsers(sortUsersByRolePriority(response.data));
    } catch (error) {
      handleApiError(error, "Không thể tải danh sách users");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfileModal = async (userId) => {
    if (!isAdmin()) return;

    try {
      const response = await axiosInstance.get(
        API_PATHS.ADMIN_USER_BY_ID(userId),
      );
      const user = response.data;
      setProfileUser(user);
      setProfileFields({
        idCompanny: user.idCompanny || "",
        displayName: user.displayName || "",
        email: user.email || "",
        department: user.department || "",
        position: user.position || "",
        phone: user.phone || "",
        role: user.role || "user",
        newPassword: "",
      });
    } catch (error) {
      handleApiError(error, "Không thể tải profile user");
    }
  };

  const handleUpdateUserProfile = async (e) => {
    e.preventDefault();
    if (!profileUser?._id) return;

    setSavingProfile(true);
    try {
      await axiosInstance.put(
        API_PATHS.ADMIN_UPDATE_USER_BY_ID(profileUser._id),
        profileFormData,
      );
      handleApiSuccess("Cập nhật profile user thành công");
      setProfileUser(null);
      fetchUsers();
    } catch (error) {
      handleApiError(error, "Không thể cập nhật profile user");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!isAdmin()) {
      handleApiError(new Error("Chỉ Admin mới có thể xóa user"));
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn xóa user này?")) {
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.ADMIN_DELETE_USER, {
        data: { userId },
      });
      handleApiSuccess("Đã xóa user thành công");
      fetchUsers();
    } catch (error) {
      handleApiError(error, "Không thể xóa user");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!isAdmin()) {
      handleApiError(new Error("Chỉ Admin mới có thể tạo user"));
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.ADMIN_CREATE_USER, newUserData);
      handleApiSuccess("Tạo user thành công");
      setShowCreateModal(false);
      resetNewUserForm();
      fetchUsers();
    } catch (error) {
      handleApiError(error, "Không thể tạo user");
    }
  };

  const handleRowClick = (userId) => {
    if (!isAdmin()) return;
    handleOpenProfileModal(userId);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "moderator":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, users]);

  const filteredUsers = users.filter((user) => {
    const keyword = searchTerm.toLowerCase().trim();
    if (!keyword) return true;

    return [
      user.idCompanny,
      user.username,
      user.displayName,
      user.email,
      user.department,
      user.position,
      user.role,
    ]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(keyword));
  });

  const rowsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startRow = (safeCurrentPage - 1) * rowsPerPage;
  const endRow = startRow + rowsPerPage;
  const paginatedUsers = filteredUsers.slice(startRow, endRow);
  const totalUsers = users.length;

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex-1 flex gap-2"
          >
            <input
              type="text"
              placeholder="Search by ID, name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="h-10 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Tìm
            </button>
          </form>

          <div className="inline-flex h-10 items-center self-start rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 whitespace-nowrap md:self-center">
            Tổng users: {totalUsers}
          </div>

          <div className="relative">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="h-10 appearance-none rounded-md border border-gray-300 py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả role</option>
              {ROLES.map((r) => (
                <option key={r} value={r.toLowerCase()}>
                  {r}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>

          {isAdmin() && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="h-10 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tạo User
            </button>
          )}
        </div>
      </div>

      {/* Bảng người dùng */}
      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-200 border-b-2 border-slate-300">
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    ID
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    Name
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    Email
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    Department
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    Position
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    Role
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedUsers.map((user) => (
                  <tr
                    key={user._id}
                    className={`transition-colors duration-200 ease-out hover:bg-slate-200 ${
                      isAdmin() ? "cursor-pointer" : ""
                    }`}
                    onClick={() => handleRowClick(user._id)}
                  >
                    <td className="px-5 py-3.5 text-sm text-gray-900">
                      {user.idCompanny || user.username || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">
                      {user.displayName || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {user.email || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {user.department || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {user.position || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                          user.role,
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {isAdmin() ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenProfileModal(user._id);
                            }}
                            className="mr-2 rounded-md p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {user.role !== "admin" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(user._id);
                              }}
                              className="rounded-md p-2 text-red-600 hover:bg-red-50 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="border-t border-gray-100 py-10 text-center text-gray-500">
              Không tìm thấy user nào
            </div>
          )}

          {filteredUsers.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-gray-600">
                Hiển thị {startRow + 1}-{Math.min(endRow, filteredUsers.length)}{" "}
                / {filteredUsers.length} dòng
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={safeCurrentPage === 1}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;
                    const isActive = page === safeCurrentPage;

                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 min-w-8 rounded-md px-2 text-sm ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={safeCurrentPage === totalPages}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal chỉnh sửa hồ sơ người dùng */}
      <Modal
        isOpen={!!profileUser}
        onClose={() => setProfileUser(null)}
        title={`Chỉnh sửa profile: ${profileUser?.displayName}`}
        maxW="max-w-lg"
      >
        <form onSubmit={handleUpdateUserProfile} className="space-y-4">
          <FormField
            label="ID"
            name="idCompanny"
            value={profileFormData.idCompanny}
            onChange={handleProfileChange}
            required
          />
          <FormField
            label="Display Name"
            name="displayName"
            value={profileFormData.displayName}
            onChange={handleProfileChange}
            required
          />
          <FormField
            label="Email"
            type="email"
            name="email"
            value={profileFormData.email}
            onChange={handleProfileChange}
          />
          <FormField
            label="Department"
            name="department"
            value={profileFormData.department}
            onChange={handleProfileChange}
          />
          <FormField
            label="Phone"
            type="tel"
            name="phone"
            value={profileFormData.phone}
            onChange={handleProfileChange}
          />
          <SelectField
            label="Position"
            name="position"
            value={profileFormData.position}
            onChange={handleProfileChange}
            options={POSITIONS}
            empty="Chưa cập nhật"
          />
          <SelectField
            label="Role"
            name="role"
            value={profileFormData.role}
            onChange={handleProfileChange}
            options={ROLES}
            required
          />
          <FormField
            label="Mật khẩu mới"
            type="password"
            name="newPassword"
            value={profileFormData.newPassword}
            onChange={handleProfileChange}
            minLength={6}
            placeholder="Để trống nếu không đổi mật khẩu"
          />

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {savingProfile ? "Đang lưu..." : "Lưu profile"}
            </button>
            <button
              type="button"
              onClick={() => setProfileUser(null)}
              disabled={savingProfile}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 disabled:opacity-50"
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal tạo người dùng */}
      <Modal
        isOpen={showCreateModal && isAdmin()}
        onClose={() => {
          setShowCreateModal(false);
          resetNewUserForm();
        }}
        title="Tạo User Mới"
        maxW="max-w-md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <FormField
            label="ID"
            name="idCompanny"
            value={newUserData.idCompanny}
            onChange={handleNewUserChange}
            placeholder="Nhập ID"
            required
          />
          <FormField
            label="Display Name"
            name="displayName"
            value={newUserData.displayName}
            onChange={handleNewUserChange}
            placeholder="Nhập tên hiển thị"
            required
          />
          <FormField
            label="Password"
            type="password"
            name="password"
            value={newUserData.password}
            onChange={handleNewUserChange}
            placeholder="Nhập password (tối thiểu 6 ký tự)"
            minLength={6}
            required
          />
          <FormField
            label="Email"
            type="email"
            name="email"
            value={newUserData.email}
            onChange={handleNewUserChange}
            placeholder="Nhập email (không bắt buộc)"
          />
          <SelectField
            label="Position"
            name="position"
            value={newUserData.position}
            onChange={handleNewUserChange}
            options={POSITIONS}
            empty="Chưa cập nhật"
          />
          <SelectField
            label="Role"
            name="role"
            value={newUserData.role}
            onChange={handleNewUserChange}
            options={ROLES}
            required
          />

          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Tạo User
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                resetNewUserForm();
              }}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPanel;
