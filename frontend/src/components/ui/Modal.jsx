import { X } from "lucide-react";

/**
 * Reusable Modal Component
 * @param {boolean} isOpen - kontroluje viditeľnosť modálu
 * @param {Function} onClose - Callback keď sa dialog zatvorí
 * @param {string} title - Názov modálu
 * @param {React.ReactNode} children - Obsah modálu
 * @param {string} maxW - max-width tailwind class (default: max-w-lg)
 * @param {boolean} closeButton - Zobraziť tlačidlo na zatvorenie (default: true)
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxW = "max-w-lg",
  closeButton = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-lg p-6 ${maxW} w-full mx-4 max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          {closeButton && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};
