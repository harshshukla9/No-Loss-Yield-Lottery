type NotConnectedModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const NotConnectedModal = ({ isOpen, onClose }: NotConnectedModalProps) => {
  return (
    <dialog
      className={`fixed top-0 left-0 w-full h-full bg-transparent backdrop-blur-sm flex items-center justify-center z-50 ${
        isOpen ? "block" : "hidden"
      }`}
      open={isOpen}
      onClose={onClose}
    >
      <div className="bg-white rounded-lg p-8 max-w-md w-full flex flex-col items-center justify-center shadow-lg">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">
          Not Connected
        </h2>
        <p className="text-slate-600 mb-6 text-center">
          You need to be connected to the network to use this application.
        </p>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-md cursor-pointer"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </dialog>
  );
};

export default NotConnectedModal;
