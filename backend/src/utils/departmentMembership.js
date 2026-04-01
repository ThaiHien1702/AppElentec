import Department from "../models/Department.js";
import User from "../models/User.js";

export const normalizeDepartmentName = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const createMembershipError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const setUserDepartmentMembership = async (
  userId,
  nextDepartmentName,
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw createMembershipError("User không tồn tại", 404);
  }

  const normalizedNextDepartment = normalizeDepartmentName(nextDepartmentName);
  const normalizedCurrentDepartment = normalizeDepartmentName(user.department);

  if (normalizedNextDepartment) {
    const targetDepartment = await Department.findOne({
      name: normalizedNextDepartment,
    }).select("_id name");

    if (!targetDepartment) {
      throw createMembershipError("Department không tồn tại", 404);
    }
  }

  if (normalizedCurrentDepartment === normalizedNextDepartment) {
    return {
      changed: false,
      user,
      previousDepartmentName: normalizedCurrentDepartment,
      nextDepartmentName: normalizedNextDepartment,
    };
  }

  if (normalizedCurrentDepartment) {
    await Department.updateOne(
      { name: normalizedCurrentDepartment },
      { $pull: { users: user._id } },
    );
  }

  if (normalizedNextDepartment) {
    await Department.updateOne(
      { name: normalizedNextDepartment },
      { $addToSet: { users: user._id } },
    );
  }

  user.department = normalizedNextDepartment;
  await user.save();

  return {
    changed: true,
    user,
    previousDepartmentName: normalizedCurrentDepartment,
    nextDepartmentName: normalizedNextDepartment,
  };
};
