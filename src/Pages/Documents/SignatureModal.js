import React, { useRef, useState, useEffect } from "react";
import SignaturePad from "react-signature-canvas";
import { toast } from "react-toastify";
import LoadingAnimation from "../../Components/Loading/LoadingAnimation";

const SignatureModal = ({
  showModal,
  onClose,
  documentData,
  onSignatureComplete,
  documentId,
  editingSignature = null,
}) => {
  const [isSigningInProgress, setIsSigningInProgress] = useState(false);
  const signaturePadRef = useRef(null);

  useEffect(() => {
    if (showModal && editingSignature && signaturePadRef.current) {
      // Clear existing signature
      signaturePadRef.current.clear();
    }
  }, [showModal, editingSignature]);

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const addSignatureToDocx = async (docxBlob, signatureImage, position) => {
    // This is where you'd implement DOCX signature embedding
    // You might need a library like docx-templates or officegen
    // For now, we'll just return the original document
    console.warn("DOCX signature embedding not implemented");
    return docxBlob;
  };

  const handleSaveSignature = async () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      toast.error("Please draw your signature first");
      return;
    }

    try {
      const signatureImage = signaturePadRef.current.toDataURL("image/png");

      const signatureMetadata = {
        signedBy: localStorage.getItem("UserName"),
        signedDate: new Date().toISOString(),
        position: editingSignature?.position || { x: 100, y: 100 },
      };

      onSignatureComplete({
        signatureImage,
        metadata: signatureMetadata,
      });

      onClose();
    } catch (error) {
      console.error("Error processing signature:", error);
      toast.error("Failed to process signature");
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-w-[95%]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Sign Document</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="text-center">
          <p className="mb-4 text-gray-600">Please draw your signature below</p>

          {/* Signature Pad */}
          <div className="border-2 border-gray-300 rounded-lg mb-4">
            <SignaturePad
              ref={signaturePadRef}
              canvasProps={{
                className: "signature-canvas",
                width: 500,
                height: 200,
                style: {
                  width: "100%",
                  height: "200px",
                  border: "none",
                  backgroundColor: "#fff",
                },
              }}
              backgroundColor="rgb(255, 255, 255)"
            />
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleClear}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              disabled={isSigningInProgress}
            >
              Clear
            </button>
            <button
              onClick={handleSaveSignature}
              disabled={isSigningInProgress}
              className="px-6 py-2 bg-[#8B4513] text-white rounded hover:bg-opacity-90 transition-colors flex items-center justify-center"
            >
              {isSigningInProgress ? (
                <>
                  <LoadingAnimation />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                "Save Signature"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;
