import axiosInstance from "./axiosInstance";
import API_PATHS from "./apiPaths";
import toast from "react-hot-toast";

/**
 * Download Excel file from URL
 * @param {string} url - API endpoint URL
 * @param {string} filename - Name of the file to download
 */
export const downloadExcelFile = async (url, filename) => {
  try {
    const response = await axiosInstance.get(url, {
      responseType: "blob",
    });

    // Create URL object from blob
    const urlObject = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = urlObject;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(urlObject);

    toast.success("Tải file thành công!");
  } catch (error) {
    console.error("Error downloading file:", error);
    toast.error("Lỗi khi tải file Excel");
  }
};

/**
 * Upload Excel file and import data
 * @param {string} url - API endpoint URL
 * @param {File} file - Excel file to upload
 * @returns {Promise} Response from server
 */
export const uploadExcelFile = async (url, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

/**
 * Download leave template
 */
export const downloadLeaveTemplate = () => {
  downloadExcelFile(
    API_PATHS.LEAVES_TEMPLATE,
    `leave-template-${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
};

/**
 * Download overtime template
 */
export const downloadOvertimeTemplate = () => {
  downloadExcelFile(
    API_PATHS.OVERTIME_TEMPLATE,
    `overtime-template-${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
};

/**
 * Export leave data to Excel
 * @param {string} status - Filter by status (optional)
 */
export const exportLeaveData = (status = "") => {
  const url = API_PATHS.LEAVES_EXPORT(status);
  downloadExcelFile(
    url,
    `leave-export-${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
};

/**
 * Export overtime data to Excel
 * @param {string} status - Filter by status (optional)
 * @param {string} from - Start date (optional)
 * @param {string} to - End date (optional)
 */
export const exportOvertimeData = (status = "", from = "", to = "") => {
  const url = API_PATHS.OVERTIME_EXPORT(status, from, to);
  downloadExcelFile(
    url,
    `overtime-export-${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
};

/**
 * Import leave data from Excel
 * @param {File} file - Excel file
 */
export const importLeaveData = async (file) => {
  return uploadExcelFile(API_PATHS.LEAVES_IMPORT, file);
};

/**
 * Import overtime data from Excel
 * @param {File} file - Excel file
 */
export const importOvertimeData = async (file) => {
  return uploadExcelFile(API_PATHS.OVERTIME_IMPORT, file);
};

/**
 * Format import results for display
 * @param {object} result - Result from import API
 * @returns {Array} Formatted results
 */
export const formatImportResults = (result) => {
  return {
    success: result.successCount || 0,
    error: result.errorCount || 0,
    total: (result.successCount || 0) + (result.errorCount || 0),
    message: result.message,
    details: result.results || [],
  };
};
