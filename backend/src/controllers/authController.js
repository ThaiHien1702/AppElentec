import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/session.js";

const ACCESS_TOKEN_TTL = "90m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;
const REFRESH_COOKIE_NAME = "refreshToken";
const ALLOWED_POSITIONS = [
  "Manager",
  "Assistant Manager",
  "Supervisor",
  "Staff",
];

// Cookie options for the refresh token. `sameSite: "none"` requires
// `secure: true`, so over plain HTTP (e.g. local dev without certs) we fall
// back to lax/insecure instead of silently dropping the cookie.
const getRefreshCookieOptions = () => {
  const useHttps = process.env.USE_HTTPS === "true";
  return {
    httpOnly: true,
    secure: useHttps,
    sameSite: useHttps ? "none" : "lax",
    maxAge: REFRESH_TOKEN_TTL,
  };
};

const signAccessToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });

export const signUp = async (req, res) => {
  try {
    // lấy input
    const { idCompanny, password, email, displayName, role, position } =
      req.body;
    const normalizedIdCompanny = idCompanny?.trim().toLowerCase();
    const normalizedEmail = email?.trim()
      ? email.trim().toLowerCase()
      : undefined;
    const normalizedPosition =
      typeof position === "string" ? position.trim() : undefined;
    // check xem có dữ liệu không
    if (!normalizedIdCompanny || !password || !displayName) {
      return res.status(400).json({
        message: "Không thể thiếu idCompanny, password, displayName ",
      });
    }

    if (normalizedPosition && !ALLOWED_POSITIONS.includes(normalizedPosition)) {
      return res.status(400).json({
        message:
          "Position không hợp lệ. Chỉ chấp nhận: Manager, Assistant Manager, Supervisor, Staff",
      });
    }

    // kiểm tra idCompanny tồn tại chưa
    const duplicate = await User.findOne({
      $or: [
        { idCompanny: normalizedIdCompanny },
        { username: normalizedIdCompanny },
      ],
    });

    if (duplicate) {
      return res.status(409).json({ message: "idCompanny đã tồn tại" });
    }

    // mã hoá password
    const hashedPassword = await bcrypt.hash(password, 10); // salt = 10

    // tạo user mới - chỉ admin mới được truyền role/position
    const isAdminRequest = req.userRole === "admin";
    const createPayload = {
      idCompanny: normalizedIdCompanny,
      hashedPassword,
      displayName,
      role: isAdminRequest && role ? role : "user",
    };

    if (normalizedEmail) {
      createPayload.email = normalizedEmail;
    }

    if (isAdminRequest && normalizedPosition) {
      createPayload.position = normalizedPosition;
    }

    await User.create(createPayload);

    // return
    return res.sendStatus(204);
  } catch (error) {
    if (error?.code === 11000) {
      if (error?.keyPattern?.idCompanny) {
        return res.status(409).json({ message: "idCompanny đã tồn tại" });
      }
      if (error?.keyPattern?.email) {
        return res.status(409).json({ message: "Email đã tồn tại" });
      }
      return res.status(409).json({ message: "Dữ liệu đã tồn tại" });
    }
    console.error("Lỗi khi gọi signUp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signIn = async (req, res) => {
  try {
    // lấy input
    const { idCompanny, password } = req.body;
    const normalizedIdCompanny = idCompanny?.trim().toLowerCase();

    if (!normalizedIdCompanny || !password) {
      return res
        .status(400)
        .json({ message: "idCompanny và password không có dữ liệu" });
    }
    // lấy dữ liệu user trong db
    const user = await User.findOne({
      $or: [
        { idCompanny: normalizedIdCompanny },
        { username: normalizedIdCompanny },
      ],
    });
    // Nếu user không tồn tại, user = null
    if (!user) {
      return res
        .status(401)
        .json({ message: "idCompanny hoặc password không đúng" });
    }
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword); // ❌ CRASH
    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: "idCompanny hoặc password không đúng" });
    }
    const accessToken = signAccessToken(user);
    //tạo refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");
    //tạo session để lưu refesh token
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });
    //trả refresh token về trong cookie
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
    //trả accedd token về res
    return res.status(200).json({
      message: `User ${user.displayName} đã logged in!`,
      accessToken,
      role: user.role,
    });
  } catch (error) {
    console.error("Lỗi khi gọi signIn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signOut = async (req, res) => {
  try {
    //lấy token từ cookie
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (token) {
      //xóa session
      await Session.deleteOne({ refreshToken: token });
    }
    //xóa cookie (options phải khớp với lúc set để xóa được)
    res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
    return res.status(200).json({ message: "Đã logout thành công" });
  } catch (error) {
    console.error("Lỗi khi gọi signOut", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Cấp lại access token mới từ refresh token trong cookie (kèm xoay refresh token)
export const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ message: "Không có refresh token" });
    }

    const session = await Session.findOne({ refreshToken: token });

    // Token không tồn tại hoặc đã hết hạn -> dọn dẹp và từ chối
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await Session.deleteOne({ _id: session._id });
      }
      res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
      return res
        .status(401)
        .json({ message: "Refresh token không hợp lệ hoặc đã hết hạn" });
    }

    const user = await User.findById(session.userId);
    if (!user) {
      await Session.deleteOne({ _id: session._id });
      res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
      return res.status(401).json({ message: "Người dùng không còn tồn tại" });
    }

    // Xoay refresh token: nếu token bị lộ thì lần dùng sau sẽ vô hiệu.
    const newRefreshToken = crypto.randomBytes(64).toString("hex");
    session.refreshToken = newRefreshToken;
    session.expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL);
    await session.save();

    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, getRefreshCookieOptions());

    const accessToken = signAccessToken(user);
    return res.status(200).json({
      message: "Làm mới token thành công",
      accessToken,
      role: user.role,
    });
  } catch (error) {
    console.error("Lỗi khi gọi refreshAccessToken", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
