import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-blue-700/80 border border-blue-400/30 rounded-2xl p-8 max-w-md w-full text-white shadow-2xl relative">
        <button
          className="absolute top-3 right-3 text-blue-200 hover:text-white text-3xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {title && (
          <h2 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            {title}
          </h2>
        )}
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal; 