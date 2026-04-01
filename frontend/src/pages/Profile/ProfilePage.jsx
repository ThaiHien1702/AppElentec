import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useForm } from "../../hooks/useForm";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";
import { POSITIONS } from "../../utils/constants";
import { FormField, SelectField } from "../../components/ui/FormField";
import { Modal } from "../../components/ui/Modal";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Building2,
  Phone,
  Shield,
  Key,
  Edit2,
  Save,
  X,
  Calendar,
  CheckCircle,
  Camera,
  Trash2,
} from "lucide-react";

const ProfilePage = () => {
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const avatarInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    _id: "",
    idCompanny: "",
    email: "",
    displayName: "",
    department: "",
    position: "",
    phone: "",
    avatrUrl: "",
    role: "",
    createdAt: "",
  });

  const editFormFields = {
    displayName: "",
    email: "",
    department: "",
    position: "",
    phone: "",
    avatrUrl: "",
  };

  const passwordFields = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const {
    formData: editFormData,
    setField: setEditField,
    setMultipleFields: setEditFormFields,
    reset: resetEditForm,
  } = useForm(editFormFields);
  const {
    formData: passwordData,
    handleChange: handlePasswordChange,
    reset: resetPasswordForm,
  } = useForm(passwordFields);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.GET_PROFILE);
      setProfileData(response.data);
      setEditFormFields({
        displayName: response.data.displayName,
        email: response.data.email,
        department: response.data.department || "",
        position: response.data.position || "",
        phone: response.data.phone || "",
        avatrUrl: response.data.avatrUrl || "",
      });
    } catch {
      handleApiError(new Error("Không thể tải thông tin profile"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditClick = () => {
    setEditFormFields({
      displayName: profileData.displayName,
      email: profileData.email,
      department: profileData.department || "",
      position: profileData.position || "",
      phone: profileData.phone || "",
      avatrUrl: profileData.avatrUrl || "",
    });
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    resetEditForm();
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước ảnh tối đa 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditField("avatrUrl", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axiosInstance.put(API_PATHS.UPDATE_PROFILE, editFormData);
      handleApiSuccess("Cập nhật profile thành công");
      await fetchProfile();
      setIsEditMode(false);
    } catch (error) {
      handleApiError(error, "Không thể cập nhật profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Password mới không khớp");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.CHANGE_PASSWORD, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      handleApiSuccess("Đổi password thành công");
      setShowPasswordModal(false);
      resetPasswordForm();
    } catch (err) {
      handleApiError(err, "Không thể đổi password");
    }
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case "admin":
        return "bg-linear-to-r from-red-500 to-red-600 text-white";
      case "moderator":
        return "bg-linear-to-r from-purple-500 to-purple-600 text-white";
      default:
        return "bg-linear-to-r from-gray-400 to-gray-500 text-white";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Tiêu đề */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Thông tin cá nhân
          </h1>
          <p className="text-gray-600">
            Quản lý và cập nhật thông tin profile của bạn
          </p>
        </div>

        {/* Thẻ hồ sơ chính */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Phần ảnh bìa & Avatar */}
          <div className="relative">
            <div className="h-32 bg-linear-to-r from-blue-500 via-blue-600 to-indigo-600"></div>
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg overflow-hidden">
                  {(
                    isEditMode ? editFormData.avatrUrl : profileData.avatrUrl
                  ) ? (
                    <img
                      src={
                        isEditMode
                          ? editFormData.avatrUrl
                          : profileData.avatrUrl
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>
                {isEditMode && (
                  <>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    {!!editFormData.avatrUrl && (
                      <button
                        type="button"
                        onClick={() => setEditField("avatrUrl", "")}
                        className="absolute bottom-0 left-0 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
                {!isEditMode && (
                  <button
                    onClick={handleEditClick}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Thông tin hồ sơ */}
          <div className="pt-20 px-8 pb-8">
            {/* Tên và vai trò */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {profileData.displayName}
                </h2>
                <p className="text-gray-500 text-sm mb-3">
                  {profileData.idCompanny || profileData.username}
                </p>
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-md ${getRoleBadgeColor()}`}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {profileData.role?.toUpperCase()}
                </span>
              </div>
              {!isEditMode && (
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Đổi mật khẩu
                </button>
              )}
            </div>

            {/* Chế độ xem */}
            {!isEditMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>Email</span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {profileData.email}
                  </p>
                </div>

                {/* Điện thoại */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>Số điện thoại</span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {profileData.phone || "Chưa cập nhật"}
                  </p>
                </div>

                {/* Phòng ban */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Building2 className="w-4 h-4 mr-2" />
                    <span>Phòng ban</span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {profileData.department || "Chưa cập nhật"}
                  </p>
                </div>

                {/* Ngày tạo */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Ngày tạo tài khoản</span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {formatDate(profileData.createdAt)}
                  </p>
                </div>

                {/* Chức vụ */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <span>Chức vụ</span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {profileData.position || "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            )}

            {/* Chế độ chỉnh sửa */}
            {isEditMode && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tên hiển thị */}
                  <FormField
                    label="Tên hiển thị"
                    icon={User}
                    name="displayName"
                    value={editFormData.displayName}
                    onChange={(e) =>
                      setEditField("displayName", e.target.value)
                    }
                    placeholder="Nhập tên hiển thị"
                    required
                  />

                  {/* Email */}
                  <FormField
                    label="Email"
                    icon={Mail}
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={(e) => setEditField("email", e.target.value)}
                    placeholder="Nhập email (không bắt buộc)"
                  />

                  {/* Điện thoại */}
                  <FormField
                    label="Số điện thoại"
                    icon={Phone}
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={(e) => setEditField("phone", e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />

                  {/* Phòng ban */}
                  <FormField
                    label="Phòng ban"
                    icon={Building2}
                    name="department"
                    value={editFormData.department}
                    onChange={(e) => setEditField("department", e.target.value)}
                    placeholder="Nhập phòng ban"
                  />

                  {/* Chức vụ */}
                  <SelectField
                    label="Chức vụ"
                    name="position"
                    value={editFormData.position}
                    onChange={(e) => setEditField("position", e.target.value)}
                    options={POSITIONS}
                    empty="Chọn chức vụ"
                  />
                </div>

                {/* Nút hành động */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Thẻ thông tin bổ sung */}
        {!isEditMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trạng thái tài khoản */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                Trạng thái tài khoản
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trạng thái</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Hoạt động
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quyền truy cập</span>
                  <span className="text-gray-800 font-medium capitalize">
                    {profileData.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Bảo mật */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-500" />
                Bảo mật
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
                >
                  <span className="text-gray-700">Thay đổi mật khẩu</span>
                  <Key className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal thay đổi mật khẩu */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          resetPasswordForm();
        }}
        title={
          <span className="flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Đổi mật khẩu
          </span>
        }
        maxW="max-w-md"
      >
        <form onSubmit={handleChangePassword} className="space-y-5">
          <FormField
            label="Mật khẩu hiện tại"
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            placeholder="Nhập mật khẩu hiện tại"
            required
          />

          <FormField
            label="Mật khẩu mới"
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
            minLength={6}
            required
          />

          <FormField
            label="Xác nhận mật khẩu mới"
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            placeholder="Nhập lại mật khẩu mới"
            minLength={6}
            required
          />

          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Đổi mật khẩu
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPasswordModal(false);
                resetPasswordForm();
              }}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
