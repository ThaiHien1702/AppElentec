import { useRef, useState, useEffect, useCallback } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Upload,
  Download,
  ChevronDown,
} from "lucide-react";
import { API_PATHS } from "../../utils/apiPaths";
import { useForm } from "../../hooks/useForm";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";
import { downloadBlob } from "../../utils/downloadBlob";
import { TextAreaField } from "../../components/ui/FormField";
import { Modal } from "../../components/ui/Modal";
import ComputerFormFields from "./ComputerFormFields";

const ComputerManagement = () => {
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingComputer, setEditingComputer] = useState(null);
  const [installedSoftware, setInstalledSoftware] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showKeys, setShowKeys] = useState({
    osKey: false,
    officeKey: false,
  });
  const fileInputRef = useRef(null);

  const computerFormFields = {
    // Phần 1: Information
    stt: "",
    assetCode: "",
    employeeNo: "",
    email: "",
    phone: "",
    userName: "",
    position: "",
    department: "",
    ipAddress: "",
    macAddress: "",
    computerName: "",
    userNamePc: "",
    categories: "Laptop",
    manufacturer: "",
    serviceTag: "",
    systemModel: "",
    cpu: "",
    ram: "",
    hdd: "",
    ssd: "",
    vga: "",
    other: "",

    // Phần 2: OS
    osVersion: "",
    osLicense: "",
    osKey: "",
    osNote: "",

    // Phần 3: MS Office
    officeVersion: "",
    officeLicense: "",
    officeKey: "",
    officeNote: "",

    // Existing fields
    status: "Active",
    notes: "",
  };

  const {
    formData,
    handleChange,
    setMultipleFields,
    reset: resetForm,
  } = useForm(computerFormFields);

  const fetchComputers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        API_PATHS.COMPUTERS_WITH_FILTERS(departmentFilter, statusFilter),
      );
      setComputers(response.data);
    } catch (error) {
      handleApiError(error, "Không thể tải danh sách máy tính");
    } finally {
      setLoading(false);
    }
  }, [departmentFilter, statusFilter]);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.DEPARTMENTS);
      setDepartments(response.data);
    } catch (error) {
      handleApiError(error, "Không thể tải danh sách phòng ban");
    }
  }, []);

  useEffect(() => {
    fetchComputers();
    fetchDepartments();
  }, [fetchComputers, fetchDepartments]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchComputers();
      return;
    }

    try {
      const response = await axiosInstance.get(
        API_PATHS.COMPUTERS_SEARCH(searchTerm),
      );
      setComputers(response.data);
    } catch (error) {
      handleApiError(error, "Lỗi khi tìm kiếm");
    }
  };

  const handleOpenModal = (computer = null) => {
    if (computer) {
      setEditingComputer(computer);
      setMultipleFields(computer);
      setInstalledSoftware(computer.installedSoftware || []);
    } else {
      setEditingComputer(null);
      resetForm();
      setInstalledSoftware([]);
    }
    setShowKeys({ osKey: false, officeKey: false });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingComputer(null);
    resetForm();
    setInstalledSoftware([]);
    setShowKeys({ osKey: false, officeKey: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare payload with installedSoftware
    const payload = {
      ...formData,
      installedSoftware,
    };

    try {
      if (editingComputer) {
        await axiosInstance.put(
          API_PATHS.COMPUTER_BY_ID(editingComputer._id),
          payload,
        );
        handleApiSuccess("Cập nhật thông tin máy tính thành công");
      } else {
        await axiosInstance.post(API_PATHS.COMPUTERS, payload);
        handleApiSuccess("Tạo thông tin máy tính thành công");
      }
      handleCloseModal();
      fetchComputers();
    } catch (error) {
      handleApiError(error, "Lỗi khi lưu thông tin máy tính");
    }
  };

  // Software management handlers
  const handleToggleSoftware = (softwareName) => {
    const existingIndex = installedSoftware.findIndex(
      (sw) => sw.name === softwareName,
    );

    if (existingIndex >= 0) {
      // Remove software
      setInstalledSoftware(
        installedSoftware.filter((sw) => sw.name !== softwareName),
      );
    } else {
      // Add software
      setInstalledSoftware([
        ...installedSoftware,
        {
          name: softwareName,
          version: "",
          license: "",
          key: "",
          note: "",
        },
      ]);
    }
  };

  const handleSoftwareFieldChange = (softwareName, field, value) => {
    setInstalledSoftware(
      installedSoftware.map((sw) =>
        sw.name === softwareName ? { ...sw, [field]: value } : sw,
      ),
    );
  };

  const toggleKeyVisibility = (keyType) => {
    setShowKeys((prev) => ({
      ...prev,
      [keyType]: !prev[keyType],
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa máy tính này?")) {
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.COMPUTER_BY_ID(id));
      handleApiSuccess("Xóa máy tính thành công");
      fetchComputers();
    } catch (error) {
      handleApiError(error, "Lỗi khi xóa máy tính");
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.COMPUTERS_EXPORT(departmentFilter, statusFilter),
        {
          responseType: "blob",
        },
      );

      const date = new Date().toISOString().slice(0, 10);
      downloadBlob(response.data, `computers-${date}.xlsx`);

      handleApiSuccess("Export Excel thành công");
    } catch (error) {
      handleApiError(error, "Lỗi khi export Excel");
    }
  };

  const handleDownloadTemplateExcel = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.COMPUTERS_TEMPLATE, {
        responseType: "blob",
      });

      const date = new Date().toISOString().slice(0, 10);
      downloadBlob(response.data, `computers-template-${date}.xlsx`);

      handleApiSuccess("Tải file mẫu Excel thành công");
    } catch (error) {
      handleApiError(error, "Lỗi khi tải file mẫu Excel");
    }
  };

  const triggerImportFile = () => {
    fileInputRef.current?.click();
  };

  const handleImportExcel = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (extension !== "xlsx" && extension !== "xls") {
      handleApiError(new Error("Chỉ hỗ trợ file Excel .xlsx hoặc .xls"));
      event.target.value = "";
      return;
    }

    try {
      const formDataFile = new FormData();
      formDataFile.append("file", selectedFile);

      const response = await axiosInstance.post(
        API_PATHS.COMPUTERS_IMPORT,
        formDataFile,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const result = response.data?.result;
      if (result) {
        handleApiSuccess(
          `Import xong: thêm ${result.createdCount}, cập nhật ${result.updatedCount}, bỏ qua ${result.skippedCount}`,
        );
      } else {
        handleApiSuccess("Import Excel thành công");
      }

      await fetchComputers();
    } catch (error) {
      handleApiError(error, "Lỗi khi import Excel");
    } finally {
      event.target.value = "";
    }
  };

  const filteredComputers = computers.filter((computer) =>
    [
      computer.employeeNo,
      computer.userName,
      computer.computerName,
      computer.email,
      computer.ipAddress,
    ]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const rowsPerPage = 20;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredComputers.length / rowsPerPage),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startRow = (safeCurrentPage - 1) * rowsPerPage;
  const endRow = startRow + rowsPerPage;
  const paginatedComputers = filteredComputers.slice(startRow, endRow);
  const totalComputers = computers.length;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, statusFilter, computers]);

  return (
    <div className="p-6">
      {/* Tìm kiếm & Bộ lọc */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Tìm kiếm theo nhân viên, máy tính, IP..."
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
            Tổng máy tính: {totalComputers}
          </div>

          <div className="relative">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="h-10 appearance-none rounded-md border border-gray-300 py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả bộ phận</option>
              {departments.map((dept) => (
                <option key={dept._id || dept.name} value={dept.name || dept}>
                  {dept.name || dept}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 appearance-none rounded-md border border-gray-300 py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Active">Hoạt động</option>
              <option value="Inactive">Không hoạt động</option>
              <option value="Under Maintenance">Bảo hành</option>
              <option value="Retired">Ngừng sử dụng</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="h-10 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm Máy
          </button>

          <button
            onClick={triggerImportFile}
            className="h-10 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import Excel
          </button>

          <button
            onClick={handleExportExcel}
            className="h-10 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>

          <button
            onClick={handleDownloadTemplateExcel}
            className="h-10 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Tải mẫu Excel
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImportExcel}
          />
        </div>
      </div>

      {/* Bảng */}
      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-200 border-b-2 border-slate-300">
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    Asset Code
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    ID
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    User Name
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    Computer Name
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    IP Address
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    Department
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    Status
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-extrabold uppercase tracking-wider text-slate-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedComputers.map((computer) => (
                  <tr
                    key={computer._id}
                    className="cursor-pointer transition-colors duration-200 ease-out hover:bg-slate-200"
                    onClick={() => handleOpenModal(computer)}
                  >
                    <td className="px-5 py-3.5 text-sm text-gray-900">
                      {computer.assetCode || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-900">
                      {computer.employeeNo || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-900">
                      {computer.userName || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">
                      {computer.computerName}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {computer.ipAddress || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {computer.department || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          computer.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : computer.status === "Inactive"
                              ? "bg-gray-100 text-gray-800"
                              : computer.status === "Under Maintenance"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {computer.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(computer);
                        }}
                        className="mr-2 rounded-md p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(computer._id);
                        }}
                        className="rounded-md p-2 text-red-600 hover:bg-red-50 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredComputers.length === 0 && (
            <div className="border-t border-gray-100 py-10 text-center text-gray-500">
              Không tìm thấy máy tính nào
            </div>
          )}

          {filteredComputers.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-gray-600">
                {startRow + 1}-{Math.min(endRow, filteredComputers.length)} /{" "}
                {filteredComputers.length}
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

      {/* Modal with Tabs */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingComputer ? "Cập nhật Máy Tính" : "Thêm Máy Tính Mới"}
        maxW="max-w-5xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <ComputerFormFields
            formData={formData}
            handleChange={handleChange}
            showKeys={showKeys}
            toggleKeyVisibility={toggleKeyVisibility}
            installedSoftware={installedSoftware}
            handleToggleSoftware={handleToggleSoftware}
            handleSoftwareFieldChange={handleSoftwareFieldChange}
          />

          {/* General Notes */}
          <div className="pt-4 border-t">
            <TextAreaField
              label="Ghi chú chung"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Ghi chú khác về máy tính này..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              {editingComputer ? "Cập nhật" : "Thêm Máy Tính"}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ComputerManagement;
