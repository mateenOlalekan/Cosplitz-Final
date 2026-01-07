import { CheckCircle, FileText, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function KYCConfirmation({ prev }) {
  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-white px-4 py-10">
      <div className="w-full max-w-lg p-6 sm:p-8 border border-slate-200 shadow-xl rounded-xl flex flex-col gap-6">

        {/* Success Icon */}
        <div className="flex justify-center">
          <CheckCircle className="w-20 h-20 text-green-600 animate-pulse" />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-semibold text-center text-green-700">
          KYC Verification Submitted
        </h1>

        {/* Description */}
        <p className="text-center text-gray-600 text-sm sm:text-base leading-relaxed">
          Your KYC verification details have been successfully submitted.  
          Our compliance team is currently reviewing your documents to ensure 
          they meet regulatory standards.  
        </p>

        {/* Review Time Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <FileText className="text-green-600 w-6 h-6" />
          <p className="text-sm text-green-800">
            The review process typically takes <span className="font-semibold">24–48 hours</span>.  
            You will receive an email notification once your verification is complete.
          </p>
        </div>

        {/* Summary Section */}
        <div className="flex flex-col gap-4 border border-gray-200 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-800">Summary of Submitted Information</h2>

          <div className="text-sm text-gray-700 flex flex-col gap-1">
            <p><span className="font-semibold">• Personal Information:</span> Submitted</p>
            <p><span className="font-semibold">• Proof of Address:</span> Submitted</p>
            <p><span className="font-semibold">• Identity Document:</span> Uploaded</p>
            <p><span className="font-semibold">• Status:</span> <span className="text-green-600 font-semibold">Pending Review</span></p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-2">

          {/* Previous */}
          <button
            onClick={prev}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
          >
            <ArrowLeft size={18} /> Previous
          </button>

          {/* Download Receipt */}
          <button
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
          >
            <FileText size={18} /> Download Receipt
          </button>

          {/* Dashboard */}
          {/* <button onClick={gotoDashboard}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-all"
          >
            Go to Dashboard <ArrowRight size={18} />
          </button> */}
        </div>

        {/* Footer Info */}
        <p className="text-center text-gray-500 text-xs mt-4">
          If you believe any information submitted was incorrect,  
          please contact support immediately.
        </p>
      </div>
    </div>
  );
}

export default KYCConfirmation;
