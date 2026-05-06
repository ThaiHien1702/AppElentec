import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CalendarDays, FileText } from "lucide-react";
import Button from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { overtimeService } from "../../utils/overtimeService";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";

export default function OvertimeRegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    checkInDate: "",
    otPlanStart: "",
    otPlanFinish: "",
    reason: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.checkInDate) {
      newErrors.checkInDate = "Vui lòng chọn ngày làm OT";
    }
    if (!formData.otPlanStart) {
      newErrors.otPlanStart = "Vui lòng chọn giờ bắt đầu OT";
    }
    if (!formData.otPlanFinish) {
      newErrors.otPlanFinish = "Vui lòng chọn giờ kết thúc OT";
    }
    if (formData.otPlanStart && formData.otPlanFinish) {
      if (formData.otPlanStart >= formData.otPlanFinish) {
        newErrors.otPlanFinish = "Giờ kết thúc phải sau giờ bắt đầu";
      }
    }
    if (!formData.reason.trim()) {
      newErrors.reason = "Vui lòng nhập lý do làm thêm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await overtimeService.createOvertimeRequest(formData);
      handleApiSuccess("Đăng ký giờ làm thêm thành công");
      navigate("/overtime");
    } catch (error) {
      handleApiError(error, "Không thể đăng ký giờ làm thêm");
    } finally {
      setLoading(false);
    }
  };

  const calculateOTHours = () => {
    if (!formData.otPlanStart || !formData.otPlanFinish) return null;
    const [sh, sm] = formData.otPlanStart.split(":").map(Number);
    const [eh, em] = formData.otPlanFinish.split(":").map(Number);
    const totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
    if (totalMinutes <= 0) return null;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} giờ ${minutes > 0 ? `${minutes} phút` : ""}`;
  };

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <button
          onClick={() => navigate("/overtime")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#2563EB",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            marginBottom: "16px",
            padding: "4px 0",
          }}
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1a1a2e",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Clock style={{ width: "28px", height: "28px", color: "#2563EB" }} />
          Đăng ký giờ làm thêm
        </h1>
        <p style={{ color: "#6B7280", marginTop: "6px", fontSize: "14px" }}>
          Điền thông tin dưới đây để đăng ký giờ làm thêm (OT)
        </p>
      </div>

      {/* Form */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          padding: "28px",
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Date */}
          <FormField label="Ngày làm OT" required error={errors.checkInDate} icon={CalendarDays}>
            <input
              type="date"
              value={formData.checkInDate}
              onChange={(e) => handleChange("checkInDate", e.target.value)}
              style={inputStyle}
            />
          </FormField>

          {/* Time range */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <FormField label="OT Start (Hr)" required error={errors.otPlanStart} icon={Clock}>
              <input
                type="time"
                value={formData.otPlanStart}
                onChange={(e) => handleChange("otPlanStart", e.target.value)}
                style={inputStyle}
              />
            </FormField>
            <FormField label="OT Finish (Hr)" required error={errors.otPlanFinish} icon={Clock}>
              <input
                type="time"
                value={formData.otPlanFinish}
                onChange={(e) => handleChange("otPlanFinish", e.target.value)}
                style={inputStyle}
              />
            </FormField>
          </div>

          {/* Hours preview */}
          {calculateOTHours() && (
            <div
              style={{
                backgroundColor: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: "8px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Clock style={{ width: "16px", height: "16px", color: "#2563EB" }} />
              <span style={{ fontSize: "14px", color: "#1E40AF" }}>
                <strong>Tổng thời gian OT:</strong> {calculateOTHours()}
              </span>
            </div>
          )}

          {/* Reason */}
          <FormField label="Lý do làm thêm" required error={errors.reason} icon={FileText}>
            <textarea
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              placeholder="VD: Hỗ trợ HR lấy vật tư, trực sự cố ca đêm..."
              rows="4"
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </FormField>

          {/* Notes */}
          <FormField label="Ghi chú (tùy chọn)">
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Thêm ghi chú nếu cần..."
              rows="3"
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </FormField>

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
            <Button
              type="submit"
              disabled={loading}
              isLoading={loading}
              style={{ flex: 1 }}
            >
              {loading ? "Đang đăng ký..." : "Đăng ký OT"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/overtime")}
              disabled={loading}
              style={{ flex: 1 }}
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>

      {/* Info box */}
      <div
        style={{
          marginTop: "20px",
          backgroundColor: "#FEF3C7",
          border: "1px solid #FDE68A",
          borderRadius: "12px",
          padding: "16px 20px",
        }}
      >
        <h3 style={{ fontWeight: "600", color: "#92400E", marginBottom: "8px", fontSize: "14px" }}>
          Lưu ý:
        </h3>
        <ul style={{ fontSize: "13px", color: "#78350F", margin: 0, paddingLeft: "16px", lineHeight: "1.8" }}>
          <li>Yêu cầu OT phải được đăng ký trước ngày làm thêm</li>
          <li>Yêu cầu sẽ được gửi tới quản lý để phê duyệt</li>
          <li>Kết quả OT thực tế sẽ được bảo vệ/quản lý ghi nhận sau khi hoàn thành</li>
          <li>Bạn có thể hủy yêu cầu nếu nó vẫn ở trạng thái chờ duyệt</li>
        </ul>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid #D1D5DB",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};
