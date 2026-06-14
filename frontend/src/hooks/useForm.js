import { useState, useCallback, useRef } from "react";

/**
 * Custom hook để quản lý form state
 * @param {Object} initialData - Dữ liệu ban đầu của form
 * @returns {Object} - formData, setFormData, handleChange, setField, reset
 *
 * Các hàm trả về được memoize (useCallback) nên giữ nguyên identity giữa các
 * lần render — an toàn để đưa vào dependency array của useEffect/useCallback
 * mà không gây vòng lặp.
 */
export const useForm = (initialData) => {
  const [formData, setFormData] = useState(initialData);

  // Lưu dữ liệu khởi tạo (chỉ lần đầu) để reset() memoize ổn định mà vẫn
  // "về đúng giá trị ban đầu".
  const initialDataRef = useRef(initialData);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  }, []);

  const setField = useCallback((name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const setMultipleFields = useCallback((fields) => {
    setFormData((prev) => ({
      ...prev,
      ...fields,
    }));
  }, []);

  const reset = useCallback(() => {
    setFormData(initialDataRef.current);
  }, []);

  return {
    formData,
    setFormData,
    handleChange,
    setField,
    setMultipleFields,
    reset,
  };
};
