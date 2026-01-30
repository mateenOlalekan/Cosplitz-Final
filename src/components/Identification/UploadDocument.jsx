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
      return { text: "Uploading...", color: "text-blue-600", bg: "bg-blue-50", icon: Clock };
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
      description: "Valid driver's license from any country",
      icon: <FileText className="w-5 h-5" />,
      acceptedFormats: "JPG, PNG, PDF (Max 5MB)"
    },
    {
      key: "passport",
      label: "International Passport",
      description: "Current valid passport with photo page",
      icon: <Shield className="w-5 h-5" />,
      acceptedFormats: "JPG, PNG, PDF (Max 5MB)"
    },
    {
      key: "nationalId",
      label: "National ID Card",
      description: "Government-issued national ID card",
      icon: <FileText className="w-5 h-5" />,
      acceptedFormats: "JPG, PNG, PDF (Max 5MB)"
    }
  ];

  return (
    <div className="w-full flex justify-center items-center px-4 py-6">
      <div className="w-full max-w-xl flex flex-col gap-6">
        <div className="mb-2">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Shield className="text-green-600" size={20} />
            Identity Verification
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload your identity documents for verification
          </p>
        </div>

        {/* Requirements Card */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="text-green-600" size={18} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-800 mb-1">Document Requirements</h4>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• Clear, high-quality images or scans</li>
                <li>• All four corners visible</li>
                <li>• No glare or shadows</li>
                <li>• Valid and not expired</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {documentTypes.map((doc) => {
            const file = files[doc.key];
            const status = getFileStatus(file, doc.key);
            const StatusIcon = status.icon;

            return (
              <div key={doc.key} className="rounded-xl border border-gray-200 overflow-hidden hover:border-green-300 transition-all duration-200">
                {/* Header */}
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === doc.key ? null : doc.key)}
                  className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      {doc.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800">{doc.label}</h3>
                      <p className="text-xs text-gray-500">{doc.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color} ${status.bg}`}>
                      <StatusIcon className="inline w-3 h-3 mr-1" />
                      {status.text}
                    </span>
                    <ChevronRight 
                      className={`text-gray-400 transition-transform duration-300 ${openDropdown === doc.key ? "rotate-90" : ""}`}
                    />
                  </div>
                </button>

                {/* Dropdown Content */}
                {openDropdown === doc.key && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                    {/* Upload Progress */}
                    {uploadProgress[doc.key] > 0 && uploadProgress[doc.key] < 100 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress[doc.key]}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[doc.key]}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* File Info */}
                    {file && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="text-green-600" size={16} />
                            <span className="text-sm font-medium text-green-800 truncate max-w-[200px]">
                              {file.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(doc.key)}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                        <div className="text-xs text-green-700 mt-2 flex justify-between">
                          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>{file.type}</span>
                        </div>
                      </div>
                    )}

                    {/* Upload Area */}
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all duration-200 group">
                      <input
                        type="file"
                        className="hidden"
                        accept=".png,.jpg,.jpeg,.pdf"
                        onChange={(e) => handleFileChange(doc.key, e)}
                        disabled={isUploading}
                      />
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <Upload className="text-green-600 w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          {file ? 'Upload different file' : 'Click to upload'}
                        </p>
                        <p className="text-xs text-gray-500">{doc.acceptedFormats}</p>
                      </div>
                    </label>

                    {/* Upload Tips */}
                    <div className="mt-3 text-xs text-gray-500">
                      <p className="flex items-center gap-1">
                        <CheckCircle size={10} className="text-green-500" />
                        Ensure the document is valid and not expired
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Security Assurance */}
          <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Shield className="text-blue-600 flex-shrink-0" size={18} />
              <div>
                <p className="text-xs text-blue-800">
                  <span className="font-semibold">Bank-level security:</span> All documents are encrypted and 
                  stored securely. Your information is protected with 256-bit SSL encryption.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={prev}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 hover:border-gray-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500">
                {Object.values(files).filter(Boolean).length} of {documentTypes.length} documents uploaded
              </div>
              <button
                type="submit"
                className="px-8 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Submit Verification
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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