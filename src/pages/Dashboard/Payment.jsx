// src/pages/dashboard/Payment.jsx
import React, { useState } from 'react';
import { ChevronLeft, Check, Copy, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useJoinSplit } from '../../services/queries/split';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const joinSplit = useJoinSplit();

  // Get data from navigation state
  const {
    splitId,
    splitTitle,
    amount,
    totalAmount,
    maxParticipants,
    isCreator,
    createdSplitData, // For creator flow (from create split)
    splitData, // For joiner flow (from split detail)
  } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [cardType, setCardType] = useState('debit');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    saveCard: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: 'wallet', label: 'Wallet', icon: '👛' },
    { id: 'cards', label: 'Cards', icon: '💳' },
    { id: 'transfer', label: 'Transfer', icon: '💸' },
  ];

  const cardOptions = [
    { id: 'debit', label: 'Debit card' },
    { id: 'credit', label: 'Credit card' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Validate based on payment method
    if (paymentMethod === 'cards') {
      if (!formData.cardNumber || !formData.expiryDate || !formData.cvv) {
        alert('Please fill all card details');
        setIsProcessing(false);
        return;
      }
    }

    try {
      // Prepare payment method info
      const paymentMethodInfo = {
        method: paymentMethod,
        ...(paymentMethod === 'cards' && {
          card_type: cardType,
          card_last4: formData.cardNumber.slice(-4),
        }),
      };

      let resultData;

      if (isCreator) {
        // CREATOR FLOW: Split already created, just simulate payment confirmation
        // In real app, you might update split status here
        resultData = createdSplitData;
      } else {
        // JOINER FLOW: Call join endpoint with payment method
        const joinResponse = await joinSplit.mutateAsync({
          splitId: splitId,
          paymentData: {
            payment_method: paymentMethod,
            amount: amount,
            ...paymentMethodInfo,
          },
        });
        resultData = joinResponse;
      }

      // Navigate to success page with all necessary data
      navigate('/dashboard/splitz-success', {
        state: {
          splitId: splitId,
          splitTitle: splitTitle || resultData?.title,
          amount: amount,
          isCreator: isCreator,
          splitData: resultData || createdSplitData || splitData,
          paymentMethod: paymentMethod,
        },
        replace: true,
      });
    } catch (error) {
      alert(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // If no state data, redirect back
  if (!splitId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No payment information found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-6">
      <main className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4"
          >
            <ChevronLeft size={20} /> Back
          </button>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 text-center">
            {isCreator ? 'Confirm Payment' : 'Join & Pay'}
          </h1>
          <p className="text-center text-gray-500 mt-2">{splitTitle}</p>
        </div>

        {/* Cost Summary */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 space-y-4">
          <CostRow 
            label={isCreator ? "Your Contribution" : "Amount to Pay"} 
            value={formatCurrency(amount)} 
          />
          {!isCreator && totalAmount && (
            <>
              <div className="h-px bg-green-200" />
              <CostRow 
                label="Total Split Value" 
                value={formatCurrency(totalAmount)} 
                small
              />
            </>
          )}
          {maxParticipants && (
            <p className="text-xs text-green-700 text-center">
              {isCreator ? 'You are the creator' : `Joining as participant (${maxParticipants} max)`}
            </p>
          )}
        </div>

        {/* Payment Method Tabs */}
        <PaymentTabs
          paymentMethods={paymentMethods}
          selected={paymentMethod}
          onSelect={setPaymentMethod}
        />

        {/* Payment Method Forms */}
        {paymentMethod === 'cards' && (
          <CardsPayment
            cardType={cardType}
            setCardType={setCardType}
            formData={formData}
            handleInputChange={handleInputChange}
            cardOptions={cardOptions}
          />
        )}

        {paymentMethod === 'transfer' && <BankTransfer amount={amount} />}

        {paymentMethod === 'wallet' && <WalletPayment amount={amount} />}

        {/* Confirm Payment Button */}
        <button 
          onClick={handlePayment} 
          disabled={isProcessing}
          className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition mt-6 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isCreator ? 'Confirming...' : 'Joining...'}
            </>
          ) : (
            isCreator ? `Confirm ${formatCurrency(amount)} Payment` : `Pay ${formatCurrency(amount)} & Join`
          )}
        </button>

        {/* Security Info */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-xs text-gray-600">
            🔒 This is a secure payment. {isCreator ? 'Your split will be activated after confirmation.' : 'You will be added as a participant after payment.'}
          </p>
        </div>

      </main>
    </div>
  );
};

/* ================== Components ================== */

const CostRow = ({ label, value, small }) => (
  <div className="flex items-center justify-between">
    <span className={`text-gray-700 font-medium ${small ? 'text-sm' : ''}`}>{label}</span>
    <span className={`font-bold text-gray-900 ${small ? 'text-lg' : 'text-2xl'}`}>{value}</span>
  </div>
);

const PaymentTabs = ({ paymentMethods, selected, onSelect }) => (
  <div>
    <div className="flex items-center justify-center gap-8 mb-4">
      <div className="h-px flex-1 bg-gray-300" />
      <span className="font-semibold text-gray-700">Pay With</span>
      <div className="h-px flex-1 bg-gray-300" />
    </div>
    <div className="flex gap-4 justify-evenly mb-6 border p-1 rounded-md border-slate-300">
      {paymentMethods.map(method => (
        <button
          key={method.id}
          onClick={() => onSelect(method.id)}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            selected === method.id
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {method.label}
        </button>
      ))}
    </div>
  </div>
);

const CardsPayment = ({ cardType, setCardType, formData, handleInputChange, cardOptions }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center w-full gap-4 mb-4">
      {cardOptions.map(option => (
        <button
          key={option.id}
          onClick={() => setCardType(option.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition flex-1 ${
            cardType === option.id
              ? 'border-green-600 bg-green-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            cardType === option.id ? 'bg-green-600 border-green-600' : 'border-gray-400'
          }`}>
            {cardType === option.id && <Check size={16} className="text-white" />}
          </div>
          <span className={`font-medium ${cardType === option.id ? 'text-gray-900' : 'text-gray-700'}`}>
            {option.label}
          </span>
        </button>
      ))}
    </div>

    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Card Information</h3>
      <InputField label="Card Number" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} placeholder="0000 0000 0000 0000" />
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Expiry Date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} placeholder="MM/YY" />
        <InputField label="CVV" name="cvv" value={formData.cvv} onChange={handleInputChange} placeholder="123" />
      </div>
    </div>
  </div>
);

const InputField = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
    />
  </div>
);

const BankTransfer = ({ amount }) => {
  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3 text-sm">
      <h3 className="font-semibold text-blue-900 mb-2">Bank Transfer Details</h3>
      <p className="text-blue-700 text-xs mb-4">
        Transfer exactly <strong>{formatCurrency(amount)}</strong> to:
      </p>
      <TransferRow label="Bank Name" value="First Bank of Nigeria" />
      <TransferRow label="Account Number" value="0123456789" />
      <TransferRow label="Account Name" value="Cosplitz Nigeria Ltd" />
      <p className="text-xs text-blue-600 mt-4 bg-blue-100 p-2 rounded">
        ⚠️ Use <strong>"SPLIT-{Math.random().toString(36).substr(2, 6).toUpperCase()}"</strong> as reference
      </p>
    </div>
  );
};

const TransferRow = ({ label, value }) => (
  <div className="flex items-center justify-between p-3 bg-white rounded border border-blue-200">
    <span className="text-gray-700 text-sm">{label}:</span>
    <div className="flex items-center gap-2">
      <span className="font-mono font-semibold text-gray-900">{value}</span>
      <button 
        onClick={() => navigator.clipboard.writeText(value)}
        className="p-1 hover:bg-gray-100 rounded transition"
      >
        <Copy size={16} className="text-blue-600" />
      </button>
    </div>
  </div>
);

const WalletPayment = ({ amount }) => {
  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'DOR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
      <h3 className="font-semibold text-green-900 mb-2">Cosplitz Wallet</h3>
      <div className="p-4 bg-white rounded border border-green-200">
        <p className="text-sm text-gray-700 mb-1">Available Balance</p>
        <p className="text-2xl font-bold text-green-600">₦25,000</p>
      </div>
      <div className="flex justify-between items-center p-3 bg-white rounded border border-green-200">
        <span className="text-sm text-gray-700">Amount to Deduct:</span>
        <span className="font-bold text-green-600">{formatCurrency(amount)}</span>
      </div>
      <p className="text-xs text-green-700 bg-green-100 p-2 rounded">
        ✅ Sufficient balance. Click confirm to proceed.
      </p>
    </div>
  );
};

export default PaymentPage;