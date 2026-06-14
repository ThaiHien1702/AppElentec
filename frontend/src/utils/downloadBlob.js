// Tải một Blob về máy dưới dạng file. Gom logic tạo object URL + thẻ <a> ẩn
// + revoke URL vốn bị lặp ở nhiều trang export Excel.
const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const downloadBlob = (data, filename, mimeType = XLSX_MIME) => {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

export default downloadBlob;
