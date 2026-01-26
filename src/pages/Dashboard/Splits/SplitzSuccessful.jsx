// src/pages/dashboard/SplitzSuccessful.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useSplit } from '../../../services/queries/split';
import CheckLast from '../../../assets/CheckLast.svg';

function SplitzSuccessful() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    splitId, 
    splitTitle, 
    amount, 
    isCreator, 
    splitData,
    paymentMethod 
  } = location.state || {};

  // Fetch fresh split data
  const { data: freshSplit, isLoading } = useSplit(splitId);

  const split = freshSplit || splitData;

  const handleViewSplit = () => {
    if (splitId) {
      navigate(`/dashboard/splitz-details/${splitId}`, { replace: true });
    }
  };

  const handleGoDashboard = () => {
    navigate('/dashboard', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="shadow-lg max-w-md w-full rounded-2xl p-8 bg-white flex flex-col items-center gap-6 text-center">
        {/* Success Image */}
        <img src={CheckLast} alt="Success" className="w-24 h-24" />

        {/* Message */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isCreator ? 'Split Created!' : 'Successfully Joined!'}
          </h1>
          <p className="text-gray-600">
            {isCreator 
              ? 'Your split has been created and payment confirmed.' 
              : 'You have successfully joined the split.'}
          </p>
        </div>

        {/* Payment Info */}
        {paymentMethod && (
          <div className="w-full p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Payment Method</p>
            <p className="font-medium text-gray-900 capitalize">{paymentMethod}</p>
          </div>
        )}

        {/* Split Info */}
        {split && (
          <div className="w-full p-4 bg-green-50 rounded-lg space-y-2">
            <p className="font-semibold text-gray-900">{split.title || splitTitle}</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-green-600">{formatCurrency(amount || split.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Participants:</span>
              <span className="text-gray-900">{split.max_participants || 1} max</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={handleViewSplit}
            disabled={!splitId}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition"
          >
            View Splitz
          </button>
          <button
            onClick={handleGoDashboard}
            className="flex-1 border-2 border-green-600 text-green-600 hover:bg-green-50 py-3 rounded-lg font-medium transition"
          >
            Go to Dashboard
          </button>
        </div>

        <p className="text-xs text-gray-500">
          This split has been added to your My Splitz page
        </p>
      </div>
    </div>
  );
}

export default SplitzSuccessful;