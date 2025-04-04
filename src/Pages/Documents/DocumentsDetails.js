import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DataContext } from "../../Context/DataContext";
import axios from "axios";
import LoadingAnimation from "../../Components/Loading/LoadingAnimation";
import {
  PencilIcon,
  ChatBubbleLeftIcon,
  PhotoIcon,
} from "@heroicons/react/24/solid";
import { v4 as uuidv4 } from "uuid";
import {
  GET_DOCUMENT_API,
  ADD_DOCUMENT_COMMENT_API,
  GET_DOCUMENT_COMMENTS_API,
  UPDATE_DOCUMENT_API,
  ADD_DOCUMENT_API,
} from "../../Constants/apiRoutes";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FileViewer from "react-file-viewer";
import {
  HiArrowLeft,
  HiZoomIn,
  HiZoomOut,
  HiPencil,
  HiTrash,
} from "react-icons/hi";
import { FaFileWord, FaFilePdf } from "react-icons/fa";
import Draggable from "react-draggable";
import AddApprovalPopup from "./ApprovalPopup";
import SignaturePad from "signature_pad";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Document as DocxDocument, Packer, Paragraph, TextRun } from "docx";
import mammoth from "mammoth";
import { FiDownload } from "react-icons/fi";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const SignatureDialog = ({ showDialog, setShowDialog, onSaveSignature }) => {
  const [signatureType, setSignatureType] = useState("draw");
  const [textSignature, setTextSignature] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState("#000000");
  const [signatureFont, setSignatureFont] = useState("cursive");
  const [signatureImage, setSignatureImage] = useState(null);
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);
  const fileInputRef = useRef(null);

  const colorOptions = [
    { value: "#000000", label: "Black" },
    { value: "#FF0000", label: "Red" },
    { value: "#0000FF", label: "Blue" },
    { value: "#008000", label: "Green" },
    { value: "#800080", label: "Purple" },
  ];

  const fontOptions = [
    { value: "cursive", label: "Cursive" },
    { value: "Arial", label: "Arial" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Courier New", label: "Courier" },
    { value: "Georgia", label: "Georgia" },
  ];

  useEffect(() => {
    if (showDialog && signatureType === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const signaturePad = new SignaturePad(canvas, {
        backgroundColor: "rgba(255, 255, 255, 0)",
        penColor: "rgb(0, 0, 0)",
        minWidth: 0.5,
        maxWidth: 2.5,
        throttle: 16,
      });
      signaturePadRef.current = signaturePad;

      const resizeCanvas = () => {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad.clear();
      };

      window.addEventListener("resize", resizeCanvas);
      resizeCanvas();

      return () => {
        window.removeEventListener("resize", resizeCanvas);
        if (signaturePadRef.current) {
          signaturePadRef.current.off();
        }
      };
    }
  }, [showDialog, signatureType]);

  const handleClearSignature = () => {
    if (signatureType === "draw" && signaturePadRef.current) {
      signaturePadRef.current.clear();
    } else if (signatureType === "text") {
      setTextSignature("");
    } else if (signatureType === "image") {
      setSignatureImage(null);
    }
  };

  const handleSaveSignature = () => {
    let signatureData = null;

    if (
      signatureType === "draw" &&
      signaturePadRef.current &&
      !signaturePadRef.current.isEmpty()
    ) {
      signatureData = {
        type: "draw",
        data: signaturePadRef.current.toDataURL(),
      };
    } else if (signatureType === "text" && textSignature.trim()) {
      signatureData = {
        type: "text",
        data: textSignature,
        style: {
          fontFamily: signatureFont,
          fontSize: fontSize,
          color: fontColor,
        },
      };
    } else if (signatureType === "image" && signatureImage) {
      signatureData = {
        type: "image",
        data: signatureImage,
      };
    }

    if (signatureData) {
      onSaveSignature(signatureData);
      setShowDialog(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSignatureImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    showDialog && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Signature Type
          </h3>

          <div className="flex gap-2 mb-4">
            {["draw", "text", "image"].map((type) => (
              <label
                key={type}
                className={`flex-1 cursor-pointer p-3 border rounded-md transition-all ${
                  signatureType === type
                    ? "border-blue-500 bg-blue-100"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="signatureType"
                  value={type}
                  checked={signatureType === type}
                  onChange={() => setSignatureType(type)}
                  className="hidden"
                />
                <div className="flex flex-col items-center">
                  <div className="text-2xl mb-1">
                    {type === "draw" ? (
                      <PencilIcon className="w-6 h-6 text-gray-700" />
                    ) : type === "text" ? (
                      <ChatBubbleLeftIcon className="w-6 h-6 text-gray-700" />
                    ) : (
                      <PhotoIcon className="w-6 h-6 text-gray-700" />
                    )}
                  </div>
                  <span className="capitalize">{type}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="space-y-4">
            {signatureType === "draw" && (
              <div className="border p-3 rounded-md">
                <canvas ref={canvasRef} className="w-full h-40 border"></canvas>
              </div>
            )}

            {signatureType === "text" && (
              <div>
                <div className="mb-4">
                  <input
                    type="text"
                    value={textSignature}
                    onChange={(e) => setTextSignature(e.target.value)}
                    placeholder="Enter your signature"
                    className="w-full p-2 border rounded-md"
                    style={{
                      fontFamily: signatureFont,
                      fontSize: `${fontSize}px`,
                      color: fontColor,
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Size
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="12"
                        max="48"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="w-full mr-2"
                      />
                      <span className="text-sm w-10">{fontSize}px</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Family
                    </label>
                    <select
                      value={signatureFont}
                      onChange={(e) => setSignatureFont(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      {fontOptions.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex items-center gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        className={`w-6 h-6 rounded-full border-2 ${
                          fontColor === color.value
                            ? "border-black"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setFontColor(color.value)}
                        title={color.label}
                      />
                    ))}
                    <input
                      type="color"
                      value={fontColor}
                      onChange={(e) => setFontColor(e.target.value)}
                      className="w-8 h-8 p-0 border border-gray-300 rounded-md cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {signatureType === "image" && (
              <div className="flex flex-col items-center">
                {signatureImage ? (
                  <div className="mb-4">
                    <img
                      src={signatureImage}
                      alt="Signature"
                      className="max-h-40 border rounded-md"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center mb-4">
                    <PhotoIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      No image selected
                    </p>
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  {signatureImage ? "Change Image" : "Upload Signature Image"}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6 gap-2">
            <button
              onClick={handleClearSignature}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Clear
            </button>
            <button
              onClick={() => setShowDialog(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSignature}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              disabled={
                (signatureType === "draw" &&
                  (!signaturePadRef.current ||
                    signaturePadRef.current.isEmpty())) ||
                (signatureType === "text" && !textSignature.trim()) ||
                (signatureType === "image" && !signatureImage)
              }
            >
              Save Signature
            </button>
          </div>
        </div>
      </div>
    )
  );
};

const DocumentsDetails = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [documentComments, setDocumentComments] = useState([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [editingMode, setEditingMode] = useState(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatures, setSignatures] = useState([]);
  const [isMarkingPosition, setIsMarkingPosition] = useState(false);
  const [markedPosition, setMarkedPosition] = useState(null);
  const documentContainerRef = useRef(null);
  const pdfContainerRef = useRef(null);

  const pdfOptions = useMemo(
    () => ({
      cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
      cMapPacked: true,
      standardFontDataUrl:
        "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/",
    }),
    []
  );

  const fetchDocumentData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${GET_DOCUMENT_API}/${documentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.data?.data) {
        setDocumentData(response.data.data);
        if (response.data.data.Signatures) {
          setSignatures(JSON.parse(response.data.data.Signatures));
        }
      } else {
        toast.error("Document not found");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      toast.error(error.response?.data?.message || "Failed to fetch document");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentComments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${GET_DOCUMENT_COMMENTS_API}/${documentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDocumentComments(response.data || []);
    } catch (error) {
      console.error("Error fetching document comments", error);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchDocumentData();
      fetchDocumentComments();
    }
  }, [documentId]);

  useEffect(() => {
    if (documentData?.FilePath) {
      const extension = documentData.FilePath.split(".").pop().toLowerCase();
      setFileType(extension);
    }
  }, [documentData]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 2.0));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5));
  };

  const handleAddSignature = () => {
    if (fileType === "pdf" || fileType === "docx") {
      setIsMarkingPosition(true);
      toast.info("Click on the document where you want to add the signature");
    } else {
      toast.error("Unsupported file format for digital signature");
    }
  };

  const handleAddComment = () => {
    setShowCommentModal(true);
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const handleDownload = async () => {
    if (!documentData?.FilePath) {
      toast.error("No document file found");
      return;
    }

    setLoading(true);
    toast.info("Generating signed document...");
    console.log("Starting document signing process");

    try {
      // 1. Debug signatures data
      console.log(`Processing signatures:`, signatures);
      if (signatures.length === 0) {
        toast.warning("No signatures to add");
        return handleSimpleDownload();
      }

      // 2. Fetch PDF with cache busting and CORS handling
      const pdfUrl = documentData.FilePath.includes("?")
        ? `${documentData.FilePath}&t=${Date.now()}`
        : `${documentData.FilePath}?t=${Date.now()}`;

      console.log(`Fetching PDF from: ${pdfUrl}`);
      const pdfResponse = await fetch(pdfUrl, {
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
      });

      if (!pdfResponse.ok) {
        throw new Error(
          `Failed to fetch PDF (${pdfResponse.status}): ${pdfResponse.statusText}`
        );
      }

      // 3. Load PDF with enhanced error handling
      console.log("PDF fetched successfully, loading document");
      const pdfBytes = await pdfResponse.arrayBuffer();
      console.log(`Original PDF size: ${pdfBytes.byteLength} bytes`);

      const pdfDoc = await PDFDocument.load(pdfBytes, {
        ignoreEncryption: false,
        updateMetadata: false,
      });

      if (pdfDoc.isEncrypted) {
        throw new Error("PDF is encrypted/cannot be modified");
      }

      const pages = pdfDoc.getPages();
      if (pages.length === 0) {
        throw new Error("PDF contains no pages");
      }

      // Group signatures by page
      const signaturesByPage = {};
      signatures.forEach((signature) => {
        const pageIndex = signature.pageIndex || 0;
        if (!signaturesByPage[pageIndex]) {
          signaturesByPage[pageIndex] = [];
        }
        signaturesByPage[pageIndex].push(signature);
      });

      console.log(`Signatures grouped by page:`, signaturesByPage);

      // Process each page with its signatures
      const results = [];

      for (const [pageIndexStr, pageSignatures] of Object.entries(
        signaturesByPage
      )) {
        const pageIndex = parseInt(pageIndexStr, 10);

        if (pageIndex >= pages.length) {
          console.warn(
            `Page ${pageIndex} doesn't exist in document with ${pages.length} pages`
          );
          pageSignatures.forEach((sig) => {
            results.push({
              ...sig,
              status: "failed",
              error: `Page ${pageIndex} doesn't exist`,
            });
          });
          continue;
        }

        const page = pages[pageIndex];
        const { width, height } = page.getSize();

        console.log(`Processing page ${pageIndex}: ${width}x${height} points`);

        // Process signatures for this page
        const pageResults = await Promise.all(
          pageSignatures.map(async (signature, index) => {
            try {
              const { type, data, position, style } = signature;

              // Calculate position in PDF coordinates
              const x = (position.x / 100) * width;
              const yPercentage = position.y / 100;

              if (type === "draw" || type === "image") {
                // Handle image data
                let imageData;
                try {
                  if (type === "draw") {
                    if (!data || !data.includes("base64")) {
                      console.error(
                        `Invalid draw data format for signature ${index + 1}`
                      );
                      return {
                        ...signature,
                        status: "failed",
                        error: "Invalid data format",
                      };
                    }

                    const base64Data = data.split(",")[1];
                    imageData = Uint8Array.from(atob(base64Data), (c) =>
                      c.charCodeAt(0)
                    );
                  } else {
                    const imgResponse = await fetch(data);
                    if (!imgResponse.ok) {
                      throw new Error(
                        `Failed to fetch image (${imgResponse.status})`
                      );
                    }
                    imageData = await imgResponse.arrayBuffer();
                  }
                } catch (error) {
                  console.error(
                    `Error processing signature ${index + 1} data:`,
                    error
                  );
                  return {
                    ...signature,
                    status: "failed",
                    error: "Data processing failed",
                  };
                }

                // Embed image
                let image;
                try {
                  image = await pdfDoc.embedPng(imageData);
                } catch (pngError) {
                  try {
                    image = await pdfDoc.embedJpg(imageData);
                  } catch (jpgError) {
                    return {
                      ...signature,
                      status: "failed",
                      error: "Image format not supported",
                    };
                  }
                }

                if (!image) {
                  return {
                    ...signature,
                    status: "failed",
                    error: "Image embedding failed",
                  };
                }

                // Calculate dimensions
                const scale = 0.2;
                const maxWidth = width * 0.15;
                const maxHeight = height * 0.05;

                let imageWidth = image.width * scale;
                let imageHeight = image.height * scale;

                if (imageWidth > maxWidth) {
                  const ratio = maxWidth / imageWidth;
                  imageWidth = maxWidth;
                  imageHeight *= ratio;
                }

                if (imageHeight > maxHeight) {
                  const ratio = maxHeight / imageHeight;
                  imageHeight = maxHeight;
                  imageWidth *= ratio;
                }

                // Convert UI coordinates to PDF coordinates
                // UI coordinates are top-left based, PDF coordinates are bottom-left based
                const pdfX = (position.x / 100) * width;
                const pdfY = height - (position.y / 100) * height - imageHeight;

                // Ensure signature stays within page bounds
                const finalX = Math.max(0, Math.min(width - imageWidth, pdfX));
                const finalY = Math.max(
                  0,
                  Math.min(height - imageHeight, pdfY)
                );

                console.log(
                  `Drawing signature at PDF coordinates: (${finalX}, ${finalY}) with size ${imageWidth}x${imageHeight}`
                );

                page.drawImage(image, {
                  x: finalX,
                  y: finalY,
                  width: imageWidth,
                  height: imageHeight,
                });

                return {
                  ...signature,
                  status:
                    finalX === pdfX && finalY === pdfY ? "added" : "adjusted",
                };
              } else if (type === "text") {
                // Handle text signature
                const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                const fontSize = style?.fontSize || 16;

                // Convert UI coordinates to PDF coordinates for text
                const pdfX = (position.x / 100) * width;
                const pdfY = height - (position.y / 100) * height;

                console.log(
                  `Drawing text at PDF coordinates: (${pdfX}, ${pdfY})`
                );

                page.drawText(data, {
                  x: pdfX,
                  y: pdfY,
                  size: fontSize,
                  font,
                  color: rgb(0, 0, 0),
                });

                return { ...signature, status: "added" };
              } else {
                return {
                  ...signature,
                  status: "skipped",
                  error: "Unknown type",
                };
              }
            } catch (error) {
              console.error(`Error processing signature ${index + 1}:`, error);
              return {
                ...signature,
                status: "failed",
                error: error.message,
              };
            }
          })
        );

        results.push(...pageResults);
      }

      // Verify results
      const failed = results.filter((r) => r.status === "failed");
      const added = results.filter(
        (r) => r.status === "added" || r.status === "adjusted"
      );

      console.log(
        `Signatures processed: ${added.length} added, ${failed.length} failed`
      );

      if (failed.length > 0) {
        toast.warning(`${failed.length} signatures failed to add`);
      }

      // Generate final PDF
      const modifiedPdfBytes = await pdfDoc.save({
        updateFieldAppearances: true,
        addDefaultPage: false,
        useObjectStreams: false,
      });

      // Create download
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);

      const filename = documentData.DocumentName
        ? `${documentData.DocumentName.replace(/\.pdf$/i, "")}_signed.pdf`
        : "signed-document.pdf";

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      }, 2000);

      toast.success(`Downloaded with ${added.length} signatures`);
    } catch (error) {
      console.error("PDF signing failed:", error);
      toast.error(`Failed: ${error.message}`);
      handleSimpleDownload();
    } finally {
      setLoading(false);
    }
  };

  // Simple download fallback
  const handleSimpleDownload = async () => {
    console.log("Attempting simple download");
    try {
      const response = await fetch(documentData.FilePath, {
        cache: "no-cache", // Ensure we get the latest version
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch (${response.status}): ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const filename = documentData.DocumentName || "document.pdf";
      console.log(`Simple download: ${filename}`);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log("Simple download element cleaned up");
      }, 1000);

      toast.info("Downloaded original document");
    } catch (error) {
      console.error("Simple download failed:", error);
      toast.error("Failed to download document");
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setIsSubmittingComment(true);
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("UserID");
    const tenantId = localStorage.getItem("TenantID");

    try {
      const response = await axios.post(
        ADD_DOCUMENT_COMMENT_API,
        {
          DocumentID: documentId,
          UserID: userId,
          CommentText: commentText,
          TenantId: tenantId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Comment added successfully");
        setCommentText("");
        setShowCommentModal(false);
        fetchDocumentComments();
      } else {
        toast.error(response.data.message || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSaveSignature = (signatureData) => {
    const newSignature = {
      id: uuidv4(),
      type: signatureData.type,
      data: signatureData.data,
      position: markedPosition || { x: 50, y: 50 },
      size: { width: 200, height: 100 },
      ...(signatureData.style && { style: signatureData.style }),
    };

    setSignatures([...signatures, newSignature]);
    setIsMarkingPosition(false);
    setMarkedPosition(null);

    // Immediately update document data with signatures
    setDocumentData((prev) => ({
      ...prev,
      Signatures: JSON.stringify([...signatures, newSignature]),
    }));
  };

  const handleDocumentClick = (e) => {
    if (isMarkingPosition) {
      const container = documentContainerRef.current;
      const rect = container.getBoundingClientRect();

      // Get the click position relative to the container
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Convert to percentage of container size
      const x = (clickX / rect.width) * 100;
      const y = (clickY / rect.height) * 100;

      console.log(`Clicked at: ${x}%, ${y}%`);
      setMarkedPosition({ x, y });
      setIsMarkingPosition(false);
      setShowSignatureDialog(true);
    }
  };

  const handleUpdateDocument = async () => {
    setIsLoading(true);
    const formData = new FormData();
    const UserID = Number(localStorage.getItem("UserID"));
    const tenantId = Number(localStorage.getItem("TenantID"));

    if (!documentData || !documentData.DocumentNo) {
      toast.error("Invalid document data.");
      setIsLoading(false);
      return;
    }

    try {
      formData.append("DocumentNo", documentData.DocumentNo);
      formData.append("DocumentName", documentData.DocumentName || "");
      formData.append("CustomerName", documentData.CustomerName || "");
      formData.append("StatusId", Number(documentData.StatusId) || 0);
      formData.append("ProjectType", Number(documentData.ProjectTypeName) || 0);
      formData.append("UpdatedBy", UserID || 0);
      if (tenantId) {
        formData.append("TenantId", tenantId);
      }

      if (documentData.FilePath) {
        const documentResponse = await fetch(documentData.FilePath);
        if (!documentResponse.ok) {
          throw new Error("Failed to fetch the document file.");
        }
        const documentBlob = await documentResponse.blob();
        const fileName = documentData.FilePath.split("/").pop();
        const documentFile = new File([documentBlob], fileName, {
          type: documentBlob.type,
        });
        formData.append("UploadDocument", documentFile);
      }

      if (signatures.length > 0) {
        formData.append("Signatures", JSON.stringify(signatures));
      }

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${UPDATE_DOCUMENT_API}/${documentId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Document updated successfully!");
        fetchDocumentData();
      } else {
        toast.error(response.data.message || "Failed to update document");
      }
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("An error occurred while updating the document");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSignature = (id) => {
    setSignatures(signatures.filter((sig) => sig.id !== id));
    toast.success("Signature removed");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1:
        return "text-yellow-600";
      case 2:
        return "text-green-600";
      case 3:
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const renderDocumentPreview = () => {
    if (!documentData?.FilePath) return null;

    if (isEditing) {
      return (
        <div className="relative bg-white p-4 rounded-lg shadow">
          <div className="mb-4 flex justify-between items-center">
            <div className="space-x-2">
              <button
                onClick={() => setEditingMode("text")}
                className={`px-4 py-2 rounded ${
                  editingMode === "text"
                    ? "bg-[#8B4513] text-white"
                    : "bg-gray-200"
                }`}
              >
                Text Edit
              </button>
              <button
                onClick={() => setEditingMode("drawing")}
                className={`px-4 py-2 rounded ${
                  editingMode === "drawing"
                    ? "bg-[#8B4513] text-white"
                    : "bg-gray-200"
                }`}
              >
                Draw/Annotate
              </button>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDocument}
                className="px-4 py-2 bg-[#8B4513] text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </div>

          {editingMode === "text" ? (
            <textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="w-full h-[600px] p-4 border rounded"
              style={{ fontFamily: "monospace" }}
            />
          ) : (
            <div
              className="border rounded"
              style={{ width: "100%", height: "600px" }}
            >
              {/* Drawing canvas would go here */}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className="relative"
        ref={documentContainerRef}
        onClick={handleDocumentClick}
        style={{ cursor: isMarkingPosition ? "crosshair" : "default" }}
      >
        <div className="document-container">
          {fileType === "pdf" ? (
            <Document
              file={documentData.FilePath}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<LoadingAnimation />}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <div key={`page_${index + 1}`} className="relative mb-4">
                  <Page
                    pageNumber={index + 1}
                    scale={scale}
                    className="shadow-lg bg-white"
                  />
                  {isMarkingPosition && markedPosition && (
                    <div
                      className="absolute border-2 border-dashed border-blue-500 bg-blue-100 bg-opacity-30 w-[200px] h-[100px]"
                      style={{
                        left: `${markedPosition.x}%`,
                        top: `${markedPosition.y}%`,
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                      }}
                    >
                      <div className="text-center text-blue-600 mt-8">
                        Signature will appear here
                      </div>
                    </div>
                  )}
                  {signatures.map((signature) => (
                    <div
                      key={signature.id}
                      className="absolute"
                      style={{
                        left: `${signature.position.x}%`,
                        top: `${signature.position.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {signature.type === "draw" ||
                      signature.type === "image" ? (
                        <img
                          src={signature.data}
                          alt="signature"
                          className="max-w-[200px] max-h-[100px]"
                          style={{ transform: `scale(${scale})` }}
                        />
                      ) : (
                        <div
                          className="text-signature"
                          style={{
                            fontFamily:
                              signature.style?.fontFamily || "cursive",
                            fontSize: `${signature.style?.fontSize || 24}px`,
                            color: signature.style?.color || "#000000",
                            transform: `scale(${scale})`,
                          }}
                        >
                          {signature.data}
                        </div>
                      )}
                      <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSignature(signature.id);
                          }}
                          className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </Document>
          ) : (
            <div className="relative">
              <FileViewer
                fileType={fileType}
                filePath={documentData.FilePath}
              />
              {signatures.map((signature) => (
                <div
                  key={signature.id}
                  className="absolute"
                  style={{
                    left: `${signature.position.x}%`,
                    top: `${signature.position.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {signature.type === "draw" || signature.type === "image" ? (
                    <img
                      src={signature.data}
                      alt="signature"
                      className="max-w-[200px] max-h-[100px]"
                      style={{ transform: `scale(${scale})` }}
                    />
                  ) : (
                    <div
                      className="text-signature"
                      style={{
                        fontFamily: signature.style?.fontFamily || "cursive",
                        fontSize: `${signature.style?.fontSize || 24}px`,
                        color: signature.style?.color || "#000000",
                        transform: `scale(${scale})`,
                      }}
                    >
                      {signature.data}
                    </div>
                  )}
                  <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSignature(signature.id);
                      }}
                      className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isMarkingPosition && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-50">
            Click where you want to place the signature
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="flex h-screen bg-white mt-10">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <HiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-medium flex items-center">
              {fileType === "pdf" ? (
                <FaFilePdf className="w-5 h-5 text-red-500 mr-2" />
              ) : fileType === "docx" ? (
                <FaFileWord className="w-5 h-5 text-blue-600 mr-2" />
              ) : null}
              {documentData?.DocumentName || "Document Details"}
            </h1>
            <span className="text-gray-500 text-sm">
              Document No: {documentData?.DocumentNo}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {(fileType === "pdf" || fileType === "docx") && (
              <button
                onClick={handleAddSignature}
                className="px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-[#8B4513] flex items-center"
              >
                <HiPencil className="w-4 h-4 mr-2" />
                Add Signature
              </button>
            )}
            <button
              onClick={handleAddComment}
              className="px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-[#8B4513] flex items-center"
            >
              <HiPencil className="w-4 h-4 mr-2" />
              Add Comment
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-100 rounded"
                title="Zoom Out"
              >
                <HiZoomOut className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-100 rounded"
                title="Zoom In"
              >
                <HiZoomIn className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 p-8 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Document Details */}
            <div className="mb-4 bg-white rounded-lg shadow-sm p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Document No</p>
                  <p className="font-medium">{documentData?.DocumentNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Document Name</p>
                  <p className="font-medium">{documentData?.DocumentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer Name</p>
                  <p className="font-medium">{documentData?.CustomerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Project Type</p>
                  <p className="font-medium">{documentData?.ProjectTypeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p
                    className={`font-medium ${getStatusColor(
                      documentData?.StatusId
                    )}`}
                  >
                    {documentData?.StatusId === 1
                      ? "Pending"
                      : documentData?.StatusId === 2
                      ? "Approved"
                      : documentData?.StatusId === 3
                      ? "Rejected"
                      : "Unknown"}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-4">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-opacity-90 flex items-center"
                  title="Download Document"
                >
                  <FiDownload className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={handleUpdateDocument}
                  disabled={isLoading}
                  className={`px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-opacity-90 flex items-center ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    "Update Document"
                  )}
                </button>
              </div>
            </div>

            {/* Document Preview */}
            <div
              className="flex-1 bg-gray-100 rounded-lg shadow-sm overflow-auto relative"
              ref={pdfContainerRef}
            >
              {renderDocumentPreview()}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Approvals and Comments */}
      <div className="w-80 border-l bg-gray-50">
        <div className="p-4">
          <h2 className="font-semibold mb-4 text-gray-800">Approval History</h2>
          <div className="space-y-4">
            {documentData?.Approvals?.map((approval, index) => (
              <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      approval.Status.toLowerCase() === "approved"
                        ? "bg-green-500"
                        : approval.Status.toLowerCase() === "rejected"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  ></span>
                  <span className="font-medium text-gray-800">
                    {approval.UserName}
                  </span>
                  <span
                    className={`text-sm ${
                      approval.Status.toLowerCase() === "approved"
                        ? "text-green-500"
                        : approval.Status.toLowerCase() === "rejected"
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {approval.Status}
                  </span>
                </div>
                {approval.Comments && (
                  <p className="text-sm text-gray-600 mt-2">
                    {approval.Comments}
                  </p>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  <p>Level: {approval.ApprovalLevel}</p>
                  <p>Date: {new Date(approval.CreatedDate).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4">
          <h2 className="font-semibold mb-4 text-gray-800 mt-6">Comments</h2>
          <div className="space-y-4">
            {documentComments.length > 0 ? (
              documentComments.map((comment, index) => (
                <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">
                      {comment.User?.FirstName || "Unknown User"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.CreatedDate).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {comment.CommentText}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No comments available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Signature Dialog */}
      <SignatureDialog
        showDialog={showSignatureDialog}
        setShowDialog={setShowSignatureDialog}
        onSaveSignature={handleSaveSignature}
      />

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] max-w-[90%]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Comment</h2>
              <button
                onClick={() => setShowCommentModal(false)}
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
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full h-32 p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your comment here..."
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitComment}
                disabled={isSubmittingComment}
                className={`px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-[#8B4513] flex items-center ${
                  isSubmittingComment ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmittingComment ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Comment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsDetails;
