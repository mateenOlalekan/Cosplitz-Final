import { useState } from "react";
import { Upload, CheckCircle, XCircle, FileText, Shield, Clock, ChevronRight } from "lucide-react";

function UploadDocument({ next, prev }) {
  const [openDropdown, setOpenDropdown] = useState("driversId");
  const [files, setFiles] = useState({
    driversId: null,
    passport: null,
    nationalId: null
  });

  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (key, e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(prev => ({ ...prev, [key]: progress }));
        
        if (progress >= 100) {
          clearInterval(interval);
          setFiles(prev => ({
            ...prev,
            [key]: file
          }));
          setIsUploading(false);
        }
      }, 100);
    }
  };

  const removeFile = (key) => {
    setFiles(prev => ({
      ...prev,
      [key]: null
    }));
    setUploadProgress(prev => ({
      ...prev,
      [key]: 0
    }));
  };

  const getFileStatus = (file, key) => {
    if (uploadProgress[key] && uploadProgress[key] < 100) {
      return { text: "Uploading", color: "text-blue-600", bg: "bg-blue-50", icon: Clock };
    }
    if (file) {
      return { text: "Uploaded", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle };
    }
    return { text: "Not Uploaded", color: "text-gray-500", bg: "bg-gray-50", icon: FileText };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const uploadedFiles = Object.values(files).filter(file => file !== null);
    
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one document");
      return;
    }

    const fileInfo = {};
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        fileInfo[key] = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        };
      }
    });
    
    localStorage.setItem('kycDocuments', JSON.stringify(fileInfo));
    next();
  };

  const documentTypes = [
    {
      key: "driversId",
      label: "Driver's License",
      description: "Valid driver's license",
      icon: <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      acceptedFormats: "JPG, PNG, PDF (Max 5MB)"
    },
    {
      key: "passport",
      label: "International Passport",
      description: "Valid passport photo page",
      icon: <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      acceptedFormats: "JPG, PNG, PDF (Max 5MB)"
    },
    {
      key: "nationalId",
      label: "National ID Card",
      description: "Government-issued ID",
      icon: <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      acceptedFormats: "JPG, PNG, PDF (Max 5MB)"
    }
  ];

  return (
    <div className="w-full min-h-screen flex justify-center items-start px-3 sm:px-4 py-4 sm:py-6">
      <div className="w-full max-w-xl flex flex-col gap-3 sm:gap-4">
        <div className="mb-1 sm:mb-2">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 flex items-center gap-1.5 sm:gap-2">
            <Shield className="text-green-600" size={18} />
            Identity Verification
          </h2>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
            Upload your identity documents for verification
          </p>
        </div>

        {/* Requirements Card */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-md p-2.5 sm:p-3">
          <div className="flex items-start gap-2">
            <div className="bg-green-100 p-1.5 rounded-md flex-shrink-0">
              <CheckCircle className="text-green-600" size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[10px] sm:text-xs font-semibold text-green-800 mb-0.5">Document Requirements</h4>
              <ul className="text-[9px] sm:text-[10px] text-green-700 space-y-0.5">
                <li>• Clear, high-quality images or scans</li>
                <li>• All four corners visible</li>
                <li>• No glare or shadows</li>
                <li>• Valid and not expired</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:gap-3">
          {documentTypes.map((doc) => {
            const file = files[doc.key];
            const status = getFileStatus(file, doc.key);
            const StatusIcon = status.icon;

            return (
              <div key={doc.key} className="rounded-md border border-gray-200 overflow-hidden hover:border-green-300 transition-all duration-200">
                {/* Header */}
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === doc.key ? null : doc.key)}
                  className="w-full flex items-center justify-between px-2.5 sm:px-3 py-2.5 sm:py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="bg-green-100 p-1.5 rounded-md flex-shrink-0">
                      {doc.icon}
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <h3 className="text-[11px] sm:text-xs font-semibold text-gray-800 truncate">{doc.label}</h3>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">{doc.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-2">
                    <span className={`text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full ${status.color} ${status.bg} whitespace-nowrap`}>
                      <StatusIcon className="inline w-2.5 h-2.5 mr-0.5" />
                      {status.text}
                    </span>
                    <ChevronRight 
                      className={`text-gray-400 transition-transform duration-300 w-4 h-4 flex-shrink-0 ${openDropdown === doc.key ? "rotate-90" : ""}`}
                    />
                  </div>
                </button>

                {/* Dropdown Content */}
                {openDropdown === doc.key && (
                  <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3 border-t border-gray-100 pt-2.5">
                    {/* Upload Progress */}
                    {uploadProgress[doc.key] > 0 && uploadProgress[doc.key] < 100 && (
                      <div className="mb-2.5">
                        <div className="flex justify-between text-[9px] sm:text-[10px] text-gray-600 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress[doc.key]}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[doc.key]}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* File Info */}
                    {file && (
                      <div className="mb-2.5 p-2 sm:p-2.5 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <CheckCircle className="text-green-600 flex-shrink-0" size={12} />
                            <span className="text-[10px] sm:text-xs font-medium text-green-800 truncate">
                              {file.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(doc.key)}
                            className="text-gray-400 hover:text-red-500 p-0.5 flex-shrink-0"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-green-700 mt-1.5 flex justify-between">
                          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          <span className="truncate ml-2">{file.type}</span>
                        </div>
                      </div>
                    )}

                    {/* Upload Area */}
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-3 sm:p-4 cursor-pointer hover:border-green-400 hover:bg-green-50 active:bg-green-100 transition-all duration-200">
                      <input
                        type="file"
                        className="hidden"
                        accept=".png,.jpg,.jpeg,.pdf"
                        onChange={(e) => handleFileChange(doc.key, e)}
                        disabled={isUploading}
                      />
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-2">
                        <Upload className="text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] sm:text-xs font-medium text-gray-700 mb-0.5">
                          {file ? 'Upload different file' : 'Click to upload'}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-gray-500">{doc.acceptedFormats}</p>
                      </div>
                    </label>

                    {/* Upload Tips */}
                    <div className="mt-2 text-[9px] sm:text-[10px] text-gray-500">
                      <p className="flex items-center gap-1">
                        <CheckCircle size={9} className="text-green-500 flex-shrink-0" />
                        Ensure the document is valid and not expired
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Security Assurance */}
          <div className="mt-1 bg-blue-50 border border-blue-100 rounded-md p-2.5 sm:p-3">
            <div className="flex items-center gap-2">
              <Shield className="text-blue-600 flex-shrink-0" size={14} />
              <div className="min-w-0 flex-1">
                <p className="text-[9px] sm:text-[10px] text-blue-800">
                  <span className="font-semibold">Bank-level security:</span> All documents are encrypted and 
                  stored securely. Your information is protected with 256-bit SSL encryption.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={prev}
              className="order-2 sm:order-1 w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-2.5 border border-gray-300 text-gray-700 text-xs sm:text-sm font-medium rounded-md hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-1.5 hover:border-gray-400"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="order-1 sm:order-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="text-[9px] sm:text-[10px] text-gray-500 text-center sm:text-right">
                {Object.values(files).filter(Boolean).length} of {documentTypes.length} documents uploaded
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs sm:text-sm font-medium rounded-md hover:from-green-700 hover:to-emerald-700 active:from-green-800 active:to-emerald-800 transition-all duration-200 shadow-sm hover:shadow-md transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span className="hidden sm:inline">Processing...</span>
                    <span className="sm:hidden">Processing</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Submit Verification</span>
                    <span className="sm:hidden">Submit</span>
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadDocument;