import { Eye, EyeOff } from "lucide-react";
import {
  COMPUTER_TYPES,
  COMPUTER_STATUS,
  POSITIONS,
  OS_VERSIONS,
  OS_LICENSE_TYPES,
  OFFICE_VERSIONS,
  OFFICE_LICENSE_TYPES,
  SOFTWARE_LIST,
} from "../../utils/constants";
import {
  FormField,
  SelectField,
  TextAreaField,
} from "../../components/ui/FormField";
import Tabs from "../../components/ui/Tabs";

// Thân form (tabs) của modal Thêm/Sửa máy tính. Tách khỏi ComputerManagement
// để file trang gọn hơn. Toàn bộ state vẫn do trang cha quản lý và truyền xuống.
const ComputerFormFields = ({
  formData,
  handleChange,
  showKeys,
  toggleKeyVisibility,
  installedSoftware,
  handleToggleSoftware,
  handleSoftwareFieldChange,
}) => {
  return (
    <Tabs
      defaultTab="computerInfo"
      tabs={[
        {
          id: "computerInfo",
          label: "Thông tin máy tính",
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                  Thông tin
                </h3>
                <FormField
                  label="Mã tài sản"
                  type="text"
                  name="assetCode"
                  value={formData.assetCode}
                  onChange={handleChange}
                  placeholder="ELT-LAP-001"
                />
                <FormField
                  label="Tên máy tính *"
                  type="text"
                  name="computerName"
                  value={formData.computerName}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="Địa chỉ IP"
                  type="text"
                  name="ipAddress"
                  value={formData.ipAddress}
                  onChange={handleChange}
                  placeholder="192.168.1.100"
                />
                <FormField
                  label="Địa chỉ MAC"
                  type="text"
                  name="macAddress"
                  value={formData.macAddress}
                  onChange={handleChange}
                  placeholder="00:1A:2B:3C:4D:5E"
                />
                <FormField
                  label="Name User PC"
                  type="text"
                  name="userNamePc"
                  value={formData.userNamePc}
                  onChange={handleChange}
                />
                <FormField
                  label="Nhà sản xuất"
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="Dell, HP, Lenovo..."
                />
                <SelectField
                  label="Desktop / Laptop"
                  name="categories"
                  value={formData.categories}
                  onChange={handleChange}
                  options={COMPUTER_TYPES}
                />
                <SelectField
                  label="Trạng thái"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={COMPUTER_STATUS}
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                  Cấu hình PC
                </h3>
                <FormField
                  label="Model máy"
                  type="text"
                  name="systemModel"
                  value={formData.systemModel}
                  onChange={handleChange}
                />
                <FormField
                  label="serial number "
                  type="text"
                  name="serviceTag"
                  value={formData.serviceTag}
                  onChange={handleChange}
                />
                <FormField
                  label="CPU"
                  type="text"
                  name="cpu"
                  value={formData.cpu}
                  onChange={handleChange}
                />
                <FormField
                  label="RAM"
                  type="text"
                  name="ram"
                  value={formData.ram}
                  onChange={handleChange}
                />
                <FormField
                  label="Ổ cứng SSD"
                  type="text"
                  name="ssd"
                  value={formData.ssd}
                  onChange={handleChange}
                />
                <FormField
                  label="Ổ cứng HDD"
                  type="text"
                  name="hdd"
                  value={formData.hdd}
                  onChange={handleChange}
                />
                <FormField
                  label="VGA"
                  type="text"
                  name="vga"
                  value={formData.vga}
                  onChange={handleChange}
                />
                <FormField
                  label="Khác"
                  type="text"
                  name="other"
                  value={formData.other}
                  onChange={handleChange}
                />
              </div>
            </div>
          ),
        },
        {
          id: "userInfo",
          label: "Thông tin người dùng",
          content: (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="ID (Employee No.)"
                type="text"
                name="employeeNo"
                value={formData.employeeNo}
                onChange={handleChange}
                required
              />

              <FormField
                label="Full Name"
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                required
              />
              <FormField
                label="Bộ phận"
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
              <FormField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <FormField
                label="Điện thoại"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <SelectField
                label="Chức vụ"
                name="position"
                value={formData.position}
                onChange={handleChange}
                options={POSITIONS}
              />
            </div>
          ),
        },
        {
          id: "os",
          label: "Hệ điều hành",
          content: (
            <div className="space-y-4">
              <SelectField
                label="Phiên bản hệ điều hành"
                name="osVersion"
                value={formData.osVersion}
                onChange={handleChange}
                options={OS_VERSIONS}
              />
              <SelectField
                label="Giấy phép hệ điều hành"
                name="osLicense"
                value={formData.osLicense}
                onChange={handleChange}
                options={OS_LICENSE_TYPES}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key
                </label>
                <div className="flex gap-2">
                  <input
                    type={showKeys.osKey ? "text" : "password"}
                    name="osKey"
                    value={formData.osKey}
                    onChange={handleChange}
                    placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility("osKey")}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {showKeys.osKey ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <TextAreaField
                label="Note"
                name="osNote"
                value={formData.osNote}
                onChange={handleChange}
                rows="3"
              />
            </div>
          ),
        },
        {
          id: "office",
          label: "MS Office",
          content: (
            <div className="space-y-4">
              <SelectField
                label="Version Office"
                name="officeVersion"
                value={formData.officeVersion}
                onChange={handleChange}
                options={OFFICE_VERSIONS}
              />
              <SelectField
                label="MS License"
                name="officeLicense"
                value={formData.officeLicense}
                onChange={handleChange}
                options={OFFICE_LICENSE_TYPES}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key
                </label>
                <div className="flex gap-2">
                  <input
                    type={showKeys.officeKey ? "text" : "password"}
                    name="officeKey"
                    value={formData.officeKey}
                    onChange={handleChange}
                    placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility("officeKey")}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {showKeys.officeKey ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <TextAreaField
                label="Note"
                name="officeNote"
                value={formData.officeNote}
                onChange={handleChange}
                rows="3"
              />
            </div>
          ),
        },
        {
          id: "software",
          label: "Software",
          badge: installedSoftware.length || null,
          content: (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Chọn phần mềm đã cài đặt trên máy tính này
              </p>
              {SOFTWARE_LIST.map((software) => {
                const installed = installedSoftware.find(
                  (sw) => sw.name === software.name,
                );
                const isChecked = !!installed;

                return (
                  <div
                    key={software.name}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        id={`sw-${software.name}`}
                        checked={isChecked}
                        onChange={() => handleToggleSoftware(software.name)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`sw-${software.name}`}
                        className="ml-3 flex-1 cursor-pointer"
                      >
                        <span className="font-medium text-gray-900">
                          {software.name}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({software.category})
                        </span>
                        <p className="text-sm text-gray-600">
                          {software.description}
                        </p>
                      </label>
                    </div>

                    {isChecked && installed && (
                      <div className="ml-7 grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200">
                        <FormField
                          label="Version"
                          type="text"
                          value={installed.version}
                          onChange={(e) =>
                            handleSoftwareFieldChange(
                              software.name,
                              "version",
                              e.target.value,
                            )
                          }
                          placeholder="2024, 2023..."
                        />
                        <FormField
                          label="License"
                          type="text"
                          value={installed.license}
                          onChange={(e) =>
                            handleSoftwareFieldChange(
                              software.name,
                              "license",
                              e.target.value,
                            )
                          }
                          placeholder="Commercial, Educational..."
                        />
                        <div className="col-span-2">
                          <FormField
                            label="Key"
                            type="text"
                            value={installed.key}
                            onChange={(e) =>
                              handleSoftwareFieldChange(
                                software.name,
                                "key",
                                e.target.value,
                              )
                            }
                            placeholder="Product Key"
                          />
                        </div>
                        <div className="col-span-2">
                          <TextAreaField
                            label="Note"
                            value={installed.note}
                            onChange={(e) =>
                              handleSoftwareFieldChange(
                                software.name,
                                "note",
                                e.target.value,
                              )
                            }
                            rows="2"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ),
        },
      ]}
    />
  );
};

export default ComputerFormFields;
