import { useState } from "react";

/**
 * Custom hook để quản lý form state
 * @param {Object} initialData - Dữ liệu ban đầu của form
 * @returns {Object} - formData, setFormData, handleChange, setField, reset
 */
export const useForm = (initialData) => {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const setField = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const setMultipleFields = (fields) => {
    setFormData((prev) => ({
      ...prev,
      ...fields,
    }));
  };

  const reset = () => {
    setFormData(initialData);
  };

  return {
    formData,
    setFormData,
    handleChange,
    setField,
    setMultipleFields,
    reset,
  };
};
