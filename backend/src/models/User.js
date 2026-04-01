// import mongoose from "mongoose";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    idCompanny: {
      type: String, //chuỗi
      required: true, //bắt buộc
      unique: true, //không trùng lặp
      trim: true, //xóa khoảng trắng ở đầu và cuối
      lowercase: true, //chuyển về chữ thường
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatrUrl: {
      type: String, //link ảnh đại diện, có thể là URL hoặc đường dẫn đến file trên server
    },
    avatarId: {
      type: String, //ID của ảnh đại diện trong hệ thống lưu trữ (nếu sử dụng dịch vụ lưu trữ đám mây như Cloudinary)
    },
    department: {
      type: String,
    },
    position: {
      type: String,
      enum: ["Manager", "Assistant Manager", "Supervisor", "Staff"],
      default: "Staff",
      trim: true,
    },
    phone: {
      type: String,
      sparse: true, //cho phép null và không bắt buộc, nhưng vẫn đảm bảo tính duy nhất nếu có giá trị
    },
    role: {
      type: String,
      enum: ["admin", "moderator", "user"],
      default: "user",
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
