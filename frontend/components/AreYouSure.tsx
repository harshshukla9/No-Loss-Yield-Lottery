type AreYouSureProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const AreYouSure = ({ isOpen, onClose, onConfirm }: AreYouSureProps) => {
  return (
    <dialog
      className={`fixed top-0 left-0 w-full h-screen bg-transparent backdrop-blur-sm flex items-center justify-center z-50 ${
        isOpen ? "block" : "hidden"
      }`}
      open={isOpen}
      onClose={onClose}
    >
      <div className="bg-white rounded-lg p-8 max-w-md w-full h-fit flex flex-col items-center justify-center shadow-lg">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">
          Are you sure?
        </h2>
        <p className="text-slate-600 mb-6 text-center">
          You are about to withdraw all your tickets. This action is
          irreversible.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-md cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default AreYouSure;
