import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";

const ApprovalInbox = () => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [rejectingId, setRejectingId] = useState(null);
  const [reasonMap, setReasonMap] = useState({});

  const fetchInbox = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.APPROVAL_INBOX);
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      handleApiError(error, "Không thể tải inbox phê duyệt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const approve = async (requestId) => {
    try {
      await axiosInstance.post(API_PATHS.APPROVE_REQUEST(requestId));
      handleApiSuccess("Phê duyệt thành công");
      fetchInbox();
    } catch (error) {
      handleApiError(error, "Phê duyệt thất bại");
    }
  };

  const reject = async (requestId) => {
    const reason = reasonMap[requestId]?.trim();
    if (!reason) {
      handleApiError(
        { response: { data: { message: "" } } },
        "Vui lòng nhập lý do từ chối",
      );
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.REJECT_REQUEST(requestId), { reason });
      handleApiSuccess("Đã từ chối yêu cầu");
      setRejectingId(null);
      setReasonMap((prev) => ({ ...prev, [requestId]: "" }));
      fetchInbox();
    } catch (error) {
      handleApiError(error, "Từ chối thất bại");
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Approval Inbox
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Danh sách yêu cầu chờ phê duyệt theo SOP.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          onClick={fetchInbox}
        >
          Tải lại
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Đang tải danh sách...</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-slate-500">
          Không có yêu cầu nào đang chờ duyệt.
        </p>
      ) : (
        <div className="space-y-4">
          {requests.map((item) => (
            <article
              key={item._id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    {item.requestCode}
                  </h2>
                  <p className="text-sm text-slate-700">
                    {item.visitorName} - {item.visitorPhone}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.visitorCompany || "Không có công ty"}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>Requester: {item.requestedBy?.displayName || "N/A"}</p>
                  <p>Khu vực: {item.areaAllowed}</p>
                </div>
              </div>

              <p className="mt-2 text-sm text-slate-700">
                Mục đích: {item.purpose}
              </p>
              <p className="text-xs text-slate-500">
                Thời gian:{" "}
                {new Date(item.expectedCheckInAt).toLocaleString("vi-VN")} -{" "}
                {new Date(item.expectedCheckOutAt).toLocaleString("vi-VN")}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                  onClick={() => approve(item._id)}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="rounded-md border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                  onClick={() =>
                    setRejectingId(rejectingId === item._id ? null : item._id)
                  }
                >
                  Reject
                </button>
              </div>

              {rejectingId === item._id ? (
                <div className="mt-3 flex flex-col gap-2 md:flex-row">
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Nhập lý do từ chối..."
                    value={reasonMap[item._id] || ""}
                    onChange={(event) =>
                      setReasonMap((prev) => ({
                        ...prev,
                        [item._id]: event.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="rounded-md bg-rose-600 px-3 py-2 text-xs font-medium text-white hover:bg-rose-700"
                    onClick={() => reject(item._id)}
                  >
                    Xác nhận từ chối
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ApprovalInbox;
