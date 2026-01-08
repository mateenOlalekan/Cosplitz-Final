import { useState } from "react";
import { Check, Plus } from "lucide-react";
import paymenticon from "../../assets/paymentcard.svg";


export default function Wallet() {
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "Payments", "Refunds", "Deposits"];

  const transactions = [
    {
      title: "Groceries Split - Walmart",
      meta: "Oct 11, 10:30 AM • 4 People",
      amount: "-$50.10",
      type: "Payments",
    },
    {
      title: "Cancelled: Movie Night",
      meta: "Oct 15, 12:30 PM • 3 People",
      sub: "Refunded",
      amount: "+$25.10",
      type: "Refunds",
    },
    {
      title: "Uber Ride Downtown",
      meta: "Oct 19, 10:30 PM • 2 People",
      amount: "-$12.10",
      type: "Payments",
    },
    {
      title: "Wallet Top-up",
      meta: "Oct 20, 12:30 AM",
      amount: "+$1000.00",
      type: "Deposits",
    },
    {
      title: "Netflix Subscription",
      meta: "Oct 22, 8:00 PM • 4 People",
      amount: "-$5.08",
      type: "Payments",
    },
  ];

  const filteredTransactions =
    activeTab === "All"
      ? transactions
      : transactions.filter((t) => t.type === activeTab);

  return (
    <div className="min-h-screen  md:px-6 md:py-6">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Wallet Balance */}
        <div className="bg-white rounded-2xl p-4">
          <div className="bg-gradient-to-r from-[#014205] via-[#1B7920] to-[#014205] rounded-2xl p-6 text-white space-y-4">
            <p className="text-sm text-green-100 text-center">
              Available Balance
            </p>

            <h1 className="text-3xl font-bold text-center">$500.30</h1>

            <p className="text-sm text-green-200 text-center">
              $58.00 Pending
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="bg-white rounded-xl p-4 text-gray-800 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                  <span className="text-sm font-medium">
                    Total Saved
                  </span>
                </div>
                <p className="text-lg font-semibold">$1500.39</p>
              </div>

              <div className="bg-white rounded-xl p-4 text-gray-800 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                  <span className="text-sm font-medium">
                    Saved This Month
                  </span>
                </div>
                <p className="text-lg font-semibold">$200.12</p>
              </div>
            </div>

            <button className="w-full mt-2 bg-white text-green-700 rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:bg-green-50 transition">
              <Plus className="w-5 h-5" />
              Add Money to Wallet
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-green-700">
              Payment Methods
            </h2>
            <button className="flex items-center gap-1 text-green-600 font-medium">
              <Plus className="w-4 h-4" />
              Add Card
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 border rounded-xl">
              <div className="flex items-center gap-3">
                <img src={paymenticon} className="w-10 h-10" />
                <div>
                  <p className="font-medium">VISA •••• 4242</p>
                  <p className="text-sm text-gray-500">
                    Synced with escrow
                  </p>
                </div>
              </div>
              <span className="text-sm text-green-600 font-medium">
                Default
              </span>
            </div>

            <div className="flex items-center p-4 border rounded-xl gap-3">
              <img src={paymenticon} className="w-10 h-10" />
              <div>
                <p className="font-medium">Mastercard •••• 8182</p>
                <p className="text-sm text-gray-500">
                  Synced with escrow
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl py-6 px-4 space-y-4">
          <h2 className="text-lg font-semibold">
            Transaction History
          </h2>

          {/* Tabs - Button Style Navigation with Gray Background */}
          <div className="w-full bg-gray-100 p-1 rounded-xl ">
            <div className="flex justify-between gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === tab
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions */}
          <div className="space-y-4 pt-2">
            {filteredTransactions.map((tx, index) => (
              <div
                key={index}
                className="flex w-full justify-between items-start py-3 border-b last:border-none"
              >
                <div>
                  <p className="font-medium">{tx.title}</p>
                  <p className="text-sm text-gray-500">{tx.meta}</p>
                  {tx.sub && (
                    <p className="text-sm text-gray-400">
                      {tx.sub}
                    </p>
                  )}
                </div>
                <p
                  className={`font-medium ${
                    tx.amount.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {tx.amount}
                </p>
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-6">
                No transactions found.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}