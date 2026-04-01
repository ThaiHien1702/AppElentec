import { FORM_CLASSES } from "../../utils/constants";
import { ChevronDown } from "lucide-react";

/**
 * Reusable Form Input Field Component
 * @param {string} label - Label text
 * @param {React.Component} icon - Lucide icon component
 * @param {string} type - Input type (text, email, tel, password, etc)
 * @param {boolean} required - Required field
 * @param {object} props - Other input props (value, onChange, name, etc)
 */
export const FormField = ({
  label,
  icon: Icon,
  type = "text",
  required = false,
  error,
  ...props
}) => (
  <div>
    <label className={FORM_CLASSES.label}>
      {Icon && <Icon className="w-4 h-4 inline mr-2" />}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      required={required}
      {...props}
      className={`${FORM_CLASSES.input} ${error ? "border-red-500" : ""}`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

/**
 * Reusable Form Select Field Component
 * @param {string} label - Label text
 * @param {Array} options - Array of option values or objects with value/label
 * @param {string} empty - Empty option text (e.g., "Chọn chức vụ")
 * @param {boolean} required - Required field
 * @param {object} props - Other select props (value, onChange, name, etc)
 */
export const SelectField = ({
  label,
  options = [],
  empty,
  required = false,
  error,
  ...props
}) => {
  const renderOptions = () => {
    return options.map((opt) => {
      // Hỗ trợ cả chuỗi đơn giản và đối tượng với value/label
      const value = typeof opt === "string" ? opt : opt.value;
      const displayLabel = typeof opt === "string" ? opt : opt.label;
      return (
        <option key={value} value={value}>
          {displayLabel}
        </option>
      );
    });
  };

  return (
    <div>
      <label className={FORM_CLASSES.label}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          required={required}
          {...props}
          className={`${FORM_CLASSES.select} appearance-none pr-10 ${error ? "border-red-500" : ""}`}
        >
          {empty && <option value="">{empty}</option>}
          {renderOptions()}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

/**
 * Reusable Textarea Field Component
 * @param {string} label - Label text
 * @param {object} props - Textarea props (value, onChange, name, etc)
 */
export const TextAreaField = ({ label, required = false, error, ...props }) => (
  <div>
    <label className={FORM_CLASSES.label}>
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      required={required}
      {...props}
      className={`${FORM_CLASSES.input} resize-none`}
      rows="4"
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);
