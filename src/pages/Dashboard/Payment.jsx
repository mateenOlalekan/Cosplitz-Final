import React, { useState } from 'react';
import { ChevronLeft, Check, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState('cards');
  const [cardType, setCardType] = useState('debit');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    saveCard: false,
  });


  const paymentMethods = [
    { id: 'cards', label: 'Cards', icon: '💳' },
    { id: 'transfer', label: 'Transfer', icon: '💸' },
    { id: 'wallet', label: 'Wallet', icon: '👛' },
  ];

  const cardOptions = [
    { id: 'debit', label: 'Debit card', icon: '✓' },
    { id: 'credit', label: 'Credit card', icon: '☐' },
  ];

  const navigate = useNavigate();

  const gotoWallet=()=>{
    navigate("/dashboard/wallet")
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-6">
      <main className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <Header title="Payment" />

        {/* Cost Summary */}
        <CostSummary total="₦10,000" perPerson="₦2,000" />

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
            setFormData={setFormData}
            cardOptions={cardOptions}
          />
        )}

        {paymentMethod === 'transfer' && <BankTransfer />}

        {paymentMethod === 'wallet' && <WalletPayment />}

        {/* Make Payment Button */}
        <button onClick={gotoWallet} className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition mt-6">
          Make Payment
        </button>

        {/* Security Info */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-xs text-gray-600">
            🔒 Your payment information is encrypted and secure. We never store your full card details.
          </p>
        </div>

      </main>
    </div>
  );
};

/* ================== Components ================== */

const Header = ({ title }) => (
  <div>
    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4">
      <ChevronLeft size={20} /> Back
    </button>
    <h1 className="text-4xl font-semibold text-gray-900 text-center">{title}</h1>
  </div>
);

const CostSummary = ({ total, perPerson }) => (
  <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4">
    <CostRow label="Total cost" value={total} />
    <div className="h-px bg-gray-300" />
    <CostRow label="Per-person cost" value={perPerson} />
  </div>
);

const CostRow = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-700 font-medium">{label}</span>
    <span className="text-2xl font-bold text-gray-900">{value}</span>
  </div>
);

const PaymentTabs = ({ paymentMethods, selected, onSelect }) => (
  <div>
    <div className="flex items-center justify-center gap-8 mb-4">
      <div className="h-px flex-1 bg-gray-300" />
      <span className="font-semibold text-gray-700">Pay With</span>
      <div className="h-px flex-1 bg-gray-300" />
    </div>
    <div className="flex gap-4 justify-evenly mb-6 border-1 p-1 rounded-md border-slate-300">
      {paymentMethods.map(method => (
        <button
          key={method.id}
          onClick={() => onSelect(method.id)}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            selected === method.id
              ? 'bg-gray-300 text-gray-900'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {method.label}
        </button>
      ))}
    </div>
  </div>
);

const CardsPayment = ({ cardType, setCardType, formData, handleInputChange, setFormData, cardOptions }) => (
  <div className="space-y-6">
    {/* Card Type */}
    <div className="flex justify-between items-center w-full gap-4 mb-4">
      {cardOptions.map(option => (
        <button
          key={option.id}
          onClick={() => setCardType(option.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition ${
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

    {/* Card Information Form */}
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Card Information</h3>
      <InputField label="Card Number" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} placeholder="Enter card number" />
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Expiry Date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} placeholder="MM/YY" />
        <InputField label="CVV" name="cvv" value={formData.cvv} onChange={handleInputChange} placeholder="XXX" />
      </div>
      <CheckboxField label="Save this card" checked={formData.saveCard} onChange={(e) => setFormData(prev => ({ ...prev, saveCard: e.target.checked }))} />
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

const CheckboxField = ({ label, checked, onChange }) => (
  <div className="flex items-center gap-3 pt-2">
    <input type="checkbox" checked={checked} onChange={onChange} className="w-4 h-4 accent-green-600 rounded cursor-pointer" />
    <label className="text-sm text-gray-600 cursor-pointer">{label}</label>
  </div>
);

const BankTransfer = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3 text-sm">
    <h3 className="font-semibold text-blue-900 mb-2">Bank Transfer Details</h3>
    <TransferRow label="Account Number" value="1234567890" />
    <TransferRow label="Bank Name" value="First Bank Nigeria" />
  </div>
);

const TransferRow = ({ label, value }) => (
  <div className="flex items-center justify-between p-3 bg-white rounded border border-blue-200">
    <span className="text-gray-700">{label}:</span>
    <div className="flex items-center gap-2">
      <span className="font-mono font-semibold text-gray-900">{value}</span>
      <button className="p-1 hover:bg-gray-100 rounded transition">
        <Copy size={16} className="text-blue-600" />
      </button>
    </div>
  </div>
);

const WalletPayment = () => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
    <h3 className="font-semibold text-green-900 mb-2">Cosplitz Wallet</h3>
    <div className="p-4 bg-white rounded border border-green-200">
      <p className="text-sm text-gray-700 mb-1">Wallet Balance</p>
      <p className="text-2xl font-bold text-green-600">₦5,500</p>
    </div>
    <p className="text-xs text-green-700">Sufficient balance available. Click Make Payment to proceed.</p>
  </div>
);

export default PaymentPage;
