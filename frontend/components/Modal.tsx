"use client"
import React, { useState, useEffect } from 'react';
import { usePurchaseTickets } from '../hooks/purchaseTickets';
import config from '../config';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  onPurchase?: (numTickets: number) => void;
}

const TICKET_PRICE_LINK = 5; // Each ticket is 5 LINK
const LINK_DECIMALS = 18;

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, onPurchase }) => {
  const [numTickets, setNumTickets] = useState(1);

  const { approveLink, isApproving, isApproved, approveError, purchase, isPending, isConfirming, isSuccess, error, reset } = usePurchaseTickets();

  const amount = BigInt(numTickets) * BigInt(TICKET_PRICE_LINK) * BigInt(10 ** LINK_DECIMALS);

  const handleApprove = () => {
    approveLink(amount);
  };

  const handlePurchase = () => {
    purchase(amount);
  };

  // Close modal on successful purchase
  useEffect(() => {
    if (isSuccess) {
      onClose();
      reset();
    }
  }, [isSuccess, onClose, reset]);

  // Also reset when modal is closed manually
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

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
        <div className="flex flex-col gap-4">
          <label className="font-semibold">
            Number of Tickets:
            <input
              type="number"
              min={1}
              value={numTickets}
              onChange={e => setNumTickets(Number(e.target.value))}
              className="ml-2 px-3 py-2 rounded border border-blue-300 text-black"
            />
          </label>
          <div>
            Total: <span className="font-bold">{numTickets * TICKET_PRICE_LINK} LINK</span>
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
            onClick={handleApprove}
            disabled={isApproving || isApproved}
          >
            {isApproving ? "Approving..." : isApproved ? "Approved" : "Approve LINK"}
          </button>
          {approveError && <div className="text-red-600">{approveError.message}</div>}
          {isApproved && (
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded"
              onClick={handlePurchase}
              disabled={isPending || isConfirming}
            >
              {isPending ? "Confirm in Wallet..." : isConfirming ? "Waiting for Confirmation..." : "Purchase"}
            </button>
          )}
          {isSuccess && <div className="text-green-600 font-bold">Purchase successful!</div>}
          {error && <div className="text-red-600">{error.message}</div>}
        </div>
      </div>
    </div>
  );
};

export default Modal; 