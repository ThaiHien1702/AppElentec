import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";

// Bản đồ trạng thái backend -> nhãn hiển thị tiếng Việt.
const statusText = {
  PENDING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CHECKED_IN: "Đã vào cổng",
  CHECKED_OUT: "Đã ra cổng",
  OVERDUE: "Quá giờ",
  CANCELLED: "Đã hủy",
};

const GateConsole = () => {
  // Ô quét duy nhất cho cả verify/check-in/check-out.
  const [scanPayload, setScanPayload] = useState("");
  const scanInputRef = useRef(null);
  // Camera chụp ảnh chân dung.
  const [portraitImageData, setPortraitImageData] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  // Trạng thái loading cho thao tác verify.
  const [loading, setLoading] = useState(false);
  // Lý do từ chối thủ công theo FM-02.
  const [manualReason, setManualReason] = useState("");
  // Hồ sơ hiện tại sau khi verify thành công.
  const [currentVisit, setCurrentVisit] = useState(null);
  // Mã thẻ vật lý có QR cố định được gắn cho khách khi check-in.
  const [gateCardCode, setGateCardCode] = useState("");
  // Danh sách thẻ để vận hành nhanh tại cổng.
  const [gateCards, setGateCards] = useState([]);
  const [newCardCode, setNewCardCode] = useState("");
  const [loadingCards, setLoadingCards] = useState(false);

  const fetchGateCards = async () => {
    try {
      setLoadingCards(true);
      const response = await axiosInstance.get(API_PATHS.GATE_CARDS);
      setGateCards(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      handleApiError(error, "Không thể tải danh sách thẻ");
    } finally {
      setLoadingCards(false);
    }
  };

  useEffect(() => {
    fetchGateCards();
  }, []);

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Khi cameraOpen chuyển sang true, <video> được render và videoRef sẵn sàng.
  useEffect(() => {
    if (cameraOpen && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [cameraOpen]);

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraOpen(false);
  };

  const focusScanInput = () => {
    window.setTimeout(() => {
      if (!scanInputRef.current) return;
      scanInputRef.current.focus();
      scanInputRef.current.select();
    }, 0);
  };

  const startCamera = async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOpen(true);
    } catch {
      setCameraError("Không thể mở camera. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  const capturePortrait = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPortraitImageData(dataUrl);
    stopCamera();
  };

  const verifyWithCode = async (rawCode) => {
    const normalizedCode = String(rawCode || "").trim();

    if (!normalizedCode) {
      handleApiError(
        { response: { data: { message: "" } } },
        "Vui lòng quét QR CCCD, QR thẻ hoặc nhập mã yêu cầu",
      );
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post(API_PATHS.GATE_VERIFY_QR, {
        qrCode: normalizedCode,
      });
      const visit = response.data?.visit || null;
      setCurrentVisit(visit);
      setGateCardCode(visit?.gateCardCode || "");
      setScanPayload(normalizedCode);
      setPortraitImageData(visit?.portraitImageData || "");

      // Sau khi verify thành công, tự mở camera để lễ tân chụp ảnh nhanh ở bước check-in.
      if (visit?.status === "APPROVED" && !visit?.portraitImageData) {
        await startCamera();
      } else if (cameraOpen) {
        stopCamera();
      }

      handleApiSuccess("Xác minh thành công");
      focusScanInput();
    } catch (error) {
      setCurrentVisit(null);
      if (cameraOpen) {
        stopCamera();
      }
      handleApiError(error, "Xác minh thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Bước 1: verify mã tại cổng để lấy hồ sơ cần xử lý.
  const verify = async () => {
    await verifyWithCode(scanPayload);
  };

  const handleScanInputChange = (event) => {
    const incomingValue = event.target.value;

    if (incomingValue.includes("\n") || incomingValue.includes("\r")) {
      const sanitizedCode = incomingValue.replace(/[\r\n]+/g, "").trim();
      setScanPayload(sanitizedCode);

      if (sanitizedCode && !loading) {
        verifyWithCode(sanitizedCode);
      }
      return;
    }

    setScanPayload(incomingValue);
  };

  const handleScanKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (!loading) {
      verifyWithCode(scanPayload);
    }
  };

  // Bước 2: check-in khách, chỉ cho phép khi hồ sơ đã APPROVED.
  const checkIn = async () => {
    if (!currentVisit?._id) return;

    if (!gateCardCode.trim()) {
      handleApiError(
        { response: { data: { message: "" } } },
        "Vui lòng nhập mã thẻ QR cố định trước khi check-in",
      );
      return;
    }

    if (!portraitImageData) {
      handleApiError(
        { response: { data: { message: "" } } },
        "Vui lòng chụp ảnh chân dung khách trước khi check-in",
      );
      return;
    }

    try {
      const response = await axiosInstance.post(API_PATHS.GATE_CHECK_IN, {
        visitId: currentVisit._id,
        gateCardCode: gateCardCode.trim().toUpperCase(),
        cccdQrData: scanPayload,
        portraitImageData,
      });
      const visit = response.data?.visit || currentVisit;
      setCurrentVisit(visit);
      setGateCardCode(visit?.gateCardCode || "");
      setScanPayload("");
      await fetchGateCards();
      handleApiSuccess("Check-in thành công");
      focusScanInput();
    } catch (error) {
      handleApiError(error, "Check-in thất bại");
    }
  };

  // Bước 3: check-out khách, chỉ cho phép khi đã CHECKED_IN/OVERDUE.
  const checkOut = async () => {
    if (!currentVisit?._id) {
      handleApiError(
        { response: { data: { message: "" } } },
        "Hãy verify khách bằng CCCD trước khi check-out",
      );
      return;
    }

    if (!scanPayload.trim()) {
      handleApiError(
        { response: { data: { message: "" } } },
        "Bắt buộc quét QR thẻ khách ở bước check-out",
      );
      return;
    }

    try {
      const response = await axiosInstance.post(API_PATHS.GATE_CHECK_OUT, {
        visitId: currentVisit._id,
        checkoutCardQrCode: scanPayload.trim(),
        cccdQrData: scanPayload,
      });
      const visit = response.data?.visit || currentVisit || null;
      setCurrentVisit(visit);
      setGateCardCode("");
      setScanPayload("");
      await fetchGateCards();
      handleApiSuccess("Check-out thành công");
      focusScanInput();
    } catch (error) {
      handleApiError(error, "Check-out thất bại");
    }
  };

  const registerCard = async () => {
    if (!newCardCode.trim()) {
      handleApiError(
        { response: { data: { message: "" } } },
        "Vui lòng nhập mã thẻ cần tạo",
      );
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.GATE_REGISTER_CARD, {
        cardCode: newCardCode.trim().toUpperCase(),
      });
      setNewCardCode("");
      await fetchGateCards();
      handleApiSuccess("Đã thêm thẻ mới");
    } catch (error) {
      handleApiError(error, "Không thể thêm thẻ");
    }
  };

  const toggleCardStatus = async (cardCode) => {
    try {
      await axiosInstance.patch(API_PATHS.GATE_TOGGLE_CARD, {
        cardCode,
      });
      await fetchGateCards();
      handleApiSuccess("Đã cập nhật trạng thái thẻ");
    } catch (error) {
      handleApiError(error, "Không thể đổi trạng thái thẻ");
    }
  };

  // Trường hợp ngoại lệ: ghi nhận từ chối thủ công để phục vụ audit FM-02.
  const manualDeny = async () => {
    if (!currentVisit?._id) {
      handleApiError(
        { response: { data: { message: "" } } },
        "Hãy xác minh hồ sơ trước",
      );
      return;
    }

    if (!manualReason.trim()) {
      handleApiError(
        { response: { data: { message: "" } } },
        "Vui lòng nhập lý do từ chối",
      );
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.GATE_MANUAL_DENY, {
        visitId: currentVisit._id,
        reason: manualReason.trim(),
      });
      setManualReason("");
      handleApiSuccess("Đã ghi nhận từ chối thủ công");
    } catch (error) {
      handleApiError(error, "Không thể ghi nhận từ chối");
    }
  };

  // Cờ điều khiển trạng thái nút bấm theo trạng thái hồ sơ hiện tại.
  const canCheckIn =
    currentVisit?.status === "APPROVED" && Boolean(gateCardCode.trim());
  const canCheckOut =
    ["CHECKED_IN", "OVERDUE"].includes(currentVisit?.status) &&
    Boolean(scanPayload.trim());

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      {/* Cột trái: thao tác vận hành tại cổng */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3">
        <h1 className="text-xl font-semibold text-slate-800">Gate Console</h1>
        <p className="mt-1 text-sm text-slate-600">
          Dùng để xác minh mã, check-in/check-out và ghi nhận từ chối thủ công
          tại cổng.
        </p>
        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
          <p>
            Check-in: Quét mã để xác minh khách, sau đó chụp ảnh chân dung, gắn
            mã thẻ và bấm Check-in.
          </p>
          <p className="mt-1">
            Check-out: Quét mã để xác minh, kiểm tra thông tin khách, quét QR
            thẻ và bấm Check-out.
          </p>
        </div>

        {/* Khu vực nhập dữ liệu tra cứu */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            ref={scanInputRef}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            placeholder={
              ["CHECKED_IN", "OVERDUE"].includes(currentVisit?.status)
                ? "Quét QR thẻ khách để check-out"
                : "Quét QR/CCCD thẻ hoặc nhập mã yêu cầu (REQ-...)"
            }
            value={scanPayload}
            onChange={handleScanInputChange}
            onKeyDown={handleScanKeyDown}
          />
          <div className="md:col-span-2 rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-800">
              Chụp ảnh chân dung khách (bước check-in)
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                onClick={startCamera}
              >
                Mở camera
              </button>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                onClick={capturePortrait}
                disabled={!cameraOpen}
              >
                Chụp ảnh
              </button>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                onClick={stopCamera}
                disabled={!cameraOpen}
              >
                Tắt camera
              </button>
            </div>
            {cameraError ? (
              <p className="mt-2 text-xs text-rose-600">{cameraError}</p>
            ) : null}
            {cameraOpen ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="mt-3 w-full max-w-md rounded border border-slate-200"
              />
            ) : null}
            {portraitImageData ? (
              <img
                src={portraitImageData}
                alt="Chan dung khach"
                className="mt-3 h-40 w-32 rounded border border-slate-200 object-cover"
              />
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Chưa chụp ảnh chân dung.
              </p>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            placeholder="Mã thẻ gắn cho khách khi check-in (VD: CARD-001)"
            value={gateCardCode}
            onChange={(event) => setGateCardCode(event.target.value)}
          />
        </div>

        {/* Nhóm nút thao tác chính của bảo vệ */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            onClick={verify}
            disabled={loading}
          >
            {loading ? "Đang xác minh..." : "Verify"}
          </button>
          <button
            type="button"
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            onClick={checkIn}
            disabled={!canCheckIn}
          >
            Check-in
          </button>
          <button
            type="button"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            onClick={checkOut}
            disabled={!canCheckOut}
          >
            Check-out (quét QR thẻ)
          </button>
        </div>

        {/* Khối ngoại lệ: ghi nhận từ chối thủ công có lý do */}
        <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-medium text-rose-800">
            Manual Deny (FM-02)
          </p>
          <div className="mt-3 flex flex-col gap-2 md:flex-row">
            <input
              className="w-full rounded-md border border-rose-300 px-3 py-2 text-sm"
              placeholder="Nhập lý do từ chối"
              value={manualReason}
              onChange={(event) => setManualReason(event.target.value)}
            />
            <button
              type="button"
              className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
              onClick={manualDeny}
            >
              Ghi nhận từ chối
            </button>
          </div>
        </div>
      </section>

      {/* Cột phải: hiển thị thông tin hồ sơ sau khi verify */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
        <h2 className="text-lg font-semibold text-slate-800">
          Kết quả xác minh
        </h2>

        {!currentVisit ? (
          <p className="mt-3 text-sm text-slate-500">
            Chưa có dữ liệu. Hãy verify mã để xem chi tiết.
          </p>
        ) : (
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="font-medium text-slate-700">Mã yêu cầu:</span>{" "}
              {currentVisit.requestCode}
            </p>
            <p>
              <span className="font-medium text-slate-700">Khách:</span>{" "}
              {currentVisit.visitorName}
            </p>
            <p>
              <span className="font-medium text-slate-700">SĐT:</span>{" "}
              {currentVisit.visitorPhone}
            </p>
            <p>
              <span className="font-medium text-slate-700">Mục đích:</span>{" "}
              {currentVisit.purpose}
            </p>
            <p>
              <span className="font-medium text-slate-700">Khu vực:</span>{" "}
              {currentVisit.areaAllowed}
            </p>
            <p>
              <span className="font-medium text-slate-700">Trạng thái:</span>{" "}
              {statusText[currentVisit.status] || currentVisit.status}
            </p>
            <p>
              <span className="font-medium text-slate-700">Thẻ QR đã gắn:</span>{" "}
              {currentVisit.gateCardCode || "Chưa gắn"}
            </p>
            <p>
              <span className="font-medium text-slate-700">
                Giờ vào dự kiến:
              </span>{" "}
              {new Date(currentVisit.expectedCheckInAt).toLocaleString("vi-VN")}
            </p>
            <p>
              <span className="font-medium text-slate-700">
                Giờ ra dự kiến:
              </span>{" "}
              {new Date(currentVisit.expectedCheckOutAt).toLocaleString(
                "vi-VN",
              )}
            </p>
            {currentVisit.checkInAt ? (
              <p>
                <span className="font-medium text-slate-700">
                  Check-in thực tế:
                </span>{" "}
                {new Date(currentVisit.checkInAt).toLocaleString("vi-VN")}
              </p>
            ) : null}
            {currentVisit.portraitImageData ? (
              <div>
                <p className="font-medium text-slate-700">Ảnh chân dung:</p>
                <img
                  src={currentVisit.portraitImageData}
                  alt="Chan dung khach"
                  className="mt-2 h-44 w-32 rounded border border-slate-200 object-cover"
                />
              </div>
            ) : null}
            {currentVisit.checkOutAt ? (
              <p>
                <span className="font-medium text-slate-700">
                  Check-out thực tế:
                </span>{" "}
                {new Date(currentVisit.checkOutAt).toLocaleString("vi-VN")}
              </p>
            ) : null}
          </div>
        )}

        <div className="mt-8 border-t border-slate-200 pt-5">
          <h3 className="text-base font-semibold text-slate-800">
            Danh sách thẻ QR
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Quản lý trạng thái thẻ cố định: rảnh, đang dùng, hoặc vô hiệu hóa.
          </p>

          <div className="mt-3 flex gap-2">
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Nhập mã thẻ mới (VD: CARD-001)"
              value={newCardCode}
              onChange={(event) => setNewCardCode(event.target.value)}
            />
            <button
              type="button"
              className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-900"
              onClick={registerCard}
            >
              Thêm thẻ
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {loadingCards ? (
              <p className="text-sm text-slate-500">Đang tải thẻ...</p>
            ) : gateCards.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có thẻ nào</p>
            ) : (
              gateCards.map((card) => {
                const statusColor =
                  card.status === "IN_USE"
                    ? "bg-amber-100 text-amber-800"
                    : card.status === "INACTIVE"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-emerald-100 text-emerald-800";

                return (
                  <div
                    key={card._id}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {card.cardCode}
                      </p>
                      <p className="text-xs text-slate-500">
                        {card.assignedVisit
                          ? `${card.assignedVisit.visitorName} (${card.assignedVisit.requestCode})`
                          : "Chưa gắn cho khách"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor}`}
                      >
                        {card.status}
                      </span>
                      <button
                        type="button"
                        className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={card.status === "IN_USE"}
                        onClick={() => toggleCardStatus(card.cardCode)}
                      >
                        {card.status === "INACTIVE" ? "Kích hoạt" : "Vô hiệu"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default GateConsole;
