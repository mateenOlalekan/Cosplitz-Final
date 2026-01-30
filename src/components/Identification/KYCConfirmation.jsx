// KYCConfirmation.jsx
import { CheckCircle, FileText, ArrowLeft, ArrowRight } from "lucide-react";

function KYCConfirmation({ prev, onDashboard, isLoading }) {
  const handleDownloadReceipt = () => {
    const receiptContent = `
      KYC Verification Receipt
      ========================
      Date: ${new Date().toLocaleDateString()}
      Time: ${new Date().toLocaleTimeString()}
      Status: Submitted for Review
      Reference ID: KYC-${Date.now()}
      
      This is a demo receipt. In a real application,
      this would be a PDF with your verification details.
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kyc-receipt-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex justify-center items-center bg-white px-4 py-6">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <div className="flex justify-center">
          <CheckCircle className="w-20 h-20 text-green-600 animate-pulse" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold text-center text-green-700">
          KYC Verification Submitted
        </h1>

        <p className="text-center text-gray-600 text-sm sm:text-base leading-relaxed">
          Your KYC verification details have been successfully submitted.  
          Our compliance team is currently reviewing your documents to ensure 
          they meet regulatory standards.  
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <FileText className="text-green-600 w-6 h-6" />
          <p className="text-sm text-green-800">
            The review process typically takes <span className="font-semibold">24–48 hours</span>.  
            You will receive an email notification once your verification is complete.
          </p>
        </div>

        <div className="flex flex-col gap-4 border border-gray-200 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-800">Summary of Submitted Information</h2>

          <div className="text-sm text-gray-700 flex flex-col gap-1">
            <p><span className="font-semibold">• Personal Information:</span> Submitted</p>
            <p><span className="font-semibold">• Proof of Address:</span> Submitted</p>
            <p><span className="font-semibold">• Identity Document:</span> Uploaded</p>
            <p><span className="font-semibold">• Status:</span> <span className="text-green-600 font-semibold">Pending Review</span></p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-2">
          <button
            onClick={prev}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            <ArrowLeft size={18} /> Previous
          </button>

          <button
            onClick={handleDownloadReceipt}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all disabled:opacity-50"
          >
            <FileText size={18} /> Download Receipt
          </button>

          <button
            onClick={onDashboard}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Go to Dashboard <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        <p className="text-center text-gray-500 text-xs mt-4">
          If you believe any information submitted was incorrect,  
          please contact support immediately.
        </p>
      </div>
    </div>
  );
}

export default KYCConfirmation;