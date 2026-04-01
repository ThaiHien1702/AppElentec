import toast from "react-hot-toast";

/**
 * Xử lý lỗi API và hiển thị toast
 * @param {Error} error - Error object từ API
 * @param {string} defaultMsg - Thông báo mặc định nếu không có lỗi chi tiết
 * @returns {string} - Thông báo lỗi
 */
export const handleApiError = (error, defaultMsg = "Có lỗi xảy ra") => {
  const message = error.response?.data?.message || error.message || defaultMsg;
  toast.error(message);
  return message;
};

/**
 * Hiển thị thông báo thành công
 * @param {string} message - Thông báo thành công
 */
export const handleApiSuccess = (message = "Thành công") => {
  toast.success(message);
};

/**
 * Wrapper cho try-catch API calls
 * @param {Function} apiCall - Hàm API call
 * @param {string} successMsg - Thông báo thành công
 * @param {string} errorMsg - Thông báo lỗi mặc định
 * @returns {Promise} - Kết quả của API call
 */
export const executeApi = async (
  apiCall,
  successMsg = "Thành công",
  errorMsg = "Có lỗi xảy ra",
) => {
  try {
    const result = await apiCall();
    handleApiSuccess(successMsg);
    return { success: true, data: result };
  } catch (error) {
    handleApiError(error, errorMsg);
    return { success: false, error };
  }
};
