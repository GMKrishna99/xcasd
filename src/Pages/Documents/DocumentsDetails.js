import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DataContext } from "../../Context/DataContext";
import axios from "axios";
import LoadingAnimation from "../../Components/Loading/LoadingAnimation";
import { PencilIcon, ChatBubbleLeftIcon, PhotoIcon } from "@heroicons/react/24/solid";
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
import SignatureModal from "./SignatureModal";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Document as DocxDocument, Packer, Paragraph, TextRun } from "docx";
import mammoth from "mammoth";
import SignaturePad from "signature_pad";
import { FiDownload } from "react-icons/fi";
// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const DocumentsDetails = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [signatureFields, setSignatureFields] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signaturePad, setSignaturePad] = useState(null);
  const [error, setError] = useState(null);
  const signatureRef = useRef();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [signatures, setSignatures] = useState([]);
  const [isPlacingSignature, setIsPlacingSignature] = useState(false);
  const [currentSignature, setCurrentSignature] = useState(null);
  const pdfContainerRef = useRef(null);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [documentComments, setDocumentComments] = useState([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedProjectType, setSelectedProjectType] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [editingMode, setEditingMode] = useState(null); // 'text' or 'drawing'
  const canvasRef = useRef(null);
  const documentNo = documentData?.DocumentNo || ""; // Ensure it exists
  const [signaturePosition, setSignaturePosition] = useState({
    x: 100,
    y: 100,
  });
  const documentContainerRef = useRef(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [tempSignatureData, setTempSignatureData] = useState(null);
  const [tempSignatures, setTempSignatures] = useState([]);
  const [modifiedDocument, setModifiedDocument] = useState(null);
  const [editingSignature, setEditingSignature] = useState(null);
  const [isMarkingPosition, setIsMarkingPosition] = useState(false);
  const [markedPosition, setMarkedPosition] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [signatureType, setSignatureType] = useState("draw");
  const [textSignature, setTextSignature] = useState("");
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState("#000");
  const [fontLoaded, setFontLoaded] = useState(false);
  const [signatureFont, setSignatureFont] = useState("cursive");
  const fileInputRef = useRef(null);
  const colorOptions = [
    { value: "#000000", label: "Black" },
    { value: "#FF0000", label: "Red" },
    { value: "#0000FF", label: "Blue" },
    { value: "#008000", label: "Green" },
    { value: "#800080", label: "Purple" },
  ];
  function handleImageUpload(event) {
    // Handler for uploading signature image
  }

  function clearSignature() {
    // Handler for clearing signature
  }

  function saveSignature() {
    // Handler for saving signature
  }

  const pdfOptions = useMemo(
    () => ({
      cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
      cMapPacked: true,
      standardFontDataUrl:
        "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/",
    }),
    []
  ); // Empty dependency array since these values never change

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
  // Fetch document data
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

  useEffect(() => {
    if (documentData) {
      setDocumentName(documentData.DocumentName || "");
      setCustomerName(documentData.CustomerName || "");
      setSelectedStatus(documentData.StatusId || null);
      setSelectedProjectType(documentData.ProjectTypeName || null);
    }
  }, [documentData]);

  const handleGoBack = () => {
    navigate(-1);
  };
  const addSignatureField = () => {
    const newField = {
      id: uuidv4(),
      x: 50,
      y: 50,
      width: 200,
      height: 80,
      signatureData: null,
      // pageNumber,
      type: signatureType,
      fontSize,
      fontColor,
      textValue: textSignature,
    };
    setSignatureFields([...signatureFields, newField]);
    setActiveField(newField.id);
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
  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleSaveSignature = async () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const signatureImage = signatureRef.current.toDataURL();
      const newSignature = {
        id: Date.now(), // unique id for each signature
        image: signatureImage,
        position: { x: 100, y: 100 }, // default initial position
      };
      setSignatures([...signatures, newSignature]);
      setShowSignatureModal(false);
      toast.success(
        "Signature added successfully. You can now drag it to position."
      );
    } else {
      toast.warning("Please draw your signature first");
    }
  };

  const handleDragStop = (id, e, data) => {
    const updatedSignatures = signatures.map((sig) => {
      if (sig.id === id) {
        // Calculate the relative position based on the container
        const container = pdfContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const relativeX = (data.x / containerRect.width) * 100; // Convert to percentage
        const relativeY = (data.y / containerRect.height) * 100; // Convert to percentage

        return {
          ...sig,
          position: { x: data.x, y: data.y },
          relativePosition: { x: relativeX, y: relativeY },
          pageNumber:
            Math.floor(data.y / (containerRect.height / numPages)) + 1, // Calculate page number
        };
      }
      return sig;
    });
    setSignatures(updatedSignatures);
  };

  const handleDeleteSignature = (id) => {
    setSignatures(signatures.filter((sig) => sig.id !== id));
    setSelectedSignature(null);
    toast.success("Signature removed");
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const handleDownload = async () => {
    if (documentData?.FilePath) {
      try {
        const response = await fetch(documentData.FilePath, {
          mode: "cors",
        });
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.setAttribute(
          "download",
          documentData.DocumentName || "document.pdf"
        ); // Set the filename
        document.body.appendChild(link);
        link.click(); // Programmatically click the link to trigger the download
        document.body.removeChild(link); // Clean up
        window.URL.revokeObjectURL(blobUrl); // Release the blob URL
        toast.success("Download started"); // Optional: Show a success message
      } catch (error) {
        console.error("Error downloading file:", error);
        toast.error("Failed to download file"); // Optional: Show an error message
      }
    } else {
      toast.error("File not found"); // Optional: Show an error message if filePath is invalid
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
        // Refresh comments
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

  const handleUpdateDocument = async () => {
    setIsLoading(true);
    const formData = new FormData();
    const UserID = Number(localStorage.getItem("UserID")); // Ensure it's a number
    const tenantId = Number(localStorage.getItem("TenantID")); // Ensure it's a number

    if (!documentData || !documentData.DocumentNo) {
      toast.error("Invalid document data.");
      setIsLoading(false);
      return;
    }

    try {
      // Append necessary data (Ensure integer fields are valid numbers)
      formData.append("DocumentNo", documentData.DocumentNo);
      formData.append("DocumentName", documentData.DocumentName || ""); // Default empty string if missing
      formData.append("CustomerName", documentData.CustomerName || "");
      formData.append("StatusId", Number(documentData.StatusId) || 0);
      formData.append("ProjectType", Number(documentData.ProjectTypeName) || 0);
      formData.append("UpdatedBy", UserID || 0);
      if (tenantId) {
        formData.append("TenantId", tenantId);
      }

      // Fetch document file if FilePath exists
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

        // Append file
        formData.append("UploadDocument", documentFile);
      }

      // Append signatures if available
      if (signatures && signatures.length > 0) {
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
        fetchDocumentData(); // Refresh the document data
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

  const addSignatureToPDF = async (pdfBytes, signatures) => {
    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPages()[0];
      const { width, height } = page.getSize();

      // Add each signature to the PDF
      for (const sig of signatures) {
        // Convert base64 signature to bytes
        const signatureImageBytes = await fetch(sig.image).then((res) =>
          res.arrayBuffer()
        );
        const signatureImageEmbed = await pdfDoc.embedPng(signatureImageBytes);

        // Calculate position
        const xPos = (sig.position.x / 100) * width;
        const yPos = height - (sig.position.y / 100) * height - 100; // 100 is signature height

        // Draw signature
        page.drawImage(signatureImageEmbed, {
          x: xPos,
          y: yPos,
          width: 200, // signature width
          height: 100, // signature height
        });
      }

      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      return new Blob([modifiedPdfBytes], { type: "application/pdf" });
    } catch (error) {
      console.error("Error adding signatures to PDF:", error);
      throw error;
    }
  };

  const addSignatureToDocx = async (docxBlob, signatures) => {
    try {
      // Convert the signature to a base64 string for embedding
      const signaturePromises = signatures.map(async (sig) => {
        // Convert base64 image URL to binary
        const response = await fetch(sig.image);
        const blob = await response.blob();
        return {
          ...sig,
          blob: blob,
        };
      });

      const processedSignatures = await Promise.all(signaturePromises);

      // Create form data with both document and signatures
      const formData = new FormData();
      formData.append("document", docxBlob, "document.docx");

      // Add each signature with its position
      processedSignatures.forEach((sig, index) => {
        formData.append(
          `signature_${index}`,
          sig.blob,
          `signature_${index}.png`
        );
        formData.append(
          `signature_position_${index}`,
          JSON.stringify({
            x: sig.position.x,
            y: sig.position.y,
            width: 200, // default signature width
            height: 100, // default signature height
          })
        );
      });

      return formData;
    } catch (error) {
      console.error("Error processing DOCX signatures:", error);
      throw error;
    }
  };

  const handleSignatureComplete = async (signatureData) => {
    try {
      const newSignature = {
        id: Date.now(),
        image: signatureData.signatureImage,
        position: signatureData.metadata.position,
        signedBy: signatureData.metadata.signedBy,
        signedDate: signatureData.metadata.signedDate,
      };

      // Add the new signature to the temporary signatures array
      setTempSignatures((prev) => [...prev, newSignature]);

      // If it's a PDF, immediately process the signature
      if (fileType === "pdf") {
        const documentResponse = await fetch(documentData.FilePath);
        const pdfBytes = await documentResponse.arrayBuffer();

        // Load the PDF document
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        const page = pages[0]; // You might want to handle multiple pages

        // Convert signature to proper format
        const signatureImageData = signatureData.signatureImage.split(",")[1];
        const signatureBytes = Uint8Array.from(atob(signatureImageData), (c) =>
          c.charCodeAt(0)
        );

        // Embed the signature image
        const signatureImage = await pdfDoc.embedPng(signatureBytes);

        // Calculate position
        const { width, height } = page.getSize();
        const xPos = (signatureData.metadata.position.x / 100) * width;
        const yPos =
          height - (signatureData.metadata.position.y / 100) * height;

        // Draw the signature
        page.drawImage(signatureImage, {
          x: xPos,
          y: yPos,
          width: 200,
          height: 100,
        });

        // Save the modified PDF
        const modifiedPdfBytes = await pdfDoc.save();
        const modifiedPdfBlob = new Blob([modifiedPdfBytes], {
          type: "application/pdf",
        });

        setModifiedDocument(modifiedPdfBlob);
      }

      toast.success("Signature added successfully");
    } catch (error) {
      console.error("Error processing signature:", error);
      toast.error("Failed to process signature");
    }
  };

  const handleDocumentClick = (e) => {
    if (isMarkingPosition) {
      const container = documentContainerRef.current;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setMarkedPosition({ x, y });
      setIsMarkingPosition(false);
      setShowSignatureModal(true); // Show signature modal after marking position
    }
  };

  // Add this function to handle the OpenSign callback
  const handleOpenSignCallback = async (callbackData) => {
    if (callbackData.status === "completed") {
      try {
        // Get the signed document from OpenSign
        const signedDocResponse = await fetch(callbackData.signedDocumentUrl);
        const signedDocBlob = await signedDocResponse.blob();

        // Create form data for your backend
        const formData = new FormData();
        formData.append(
          "UploadDocument",
          signedDocBlob,
          documentData.DocumentName
        );
        formData.append("DocumentId", documentId);
        formData.append(
          "SignatureMetadata",
          JSON.stringify({
            signedBy: localStorage.getItem("UserName"),
            signedDate: new Date().toISOString(),
            openSignTransactionId: callbackData.transactionId,
          })
        );

        // Update your document with the signed version
        await handleSignatureComplete({
          signatureBlob: signedDocBlob,
          signatureImage: URL.createObjectURL(signedDocBlob),
          metadata: {
            signedBy: localStorage.getItem("UserName"),
            signedDate: new Date().toISOString(),
            position: { x: 100, y: 100 },
          },
        });
        toast.success("Document signed successfully");
      } catch (error) {
        console.error("Error processing signed document:", error);
        toast.error("Failed to process signed document");
      }
    }
  };

  // Add this component for draggable signature
  const SignatureWithControls = ({
    signature,
    onEdit,
    onDelete,
    onPositionChange,
  }) => {
    return (
      <Draggable
        onStop={(e, data) => {
          const container = pdfContainerRef.current;
          const rect = container.getBoundingClientRect();
          const x = (data.x / rect.width) * 100;
          const y = (data.y / rect.height) * 100;
          onPositionChange({ x, y });
        }}
        bounds="parent"
        defaultPosition={{
          x:
            (signature.position.x * pdfContainerRef.current?.clientWidth || 0) /
            100,
          y:
            (signature.position.y * pdfContainerRef.current?.clientHeight ||
              0) / 100,
        }}
      >
        <div className="absolute cursor-move group">
          <img
            src={signature.image}
            alt="signature"
            className="max-w-[200px] max-h-[100px]"
            style={{ transform: `scale(${scale})` }}
          />
          <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(signature);
              }}
              className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <HiPencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(signature.id);
              }}
              className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              <HiTrash className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Draggable>
    );
  };

  // Add save changes button handler
  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token");

      // Get the original document
      const documentResponse = await fetch(documentData.FilePath);
      const documentBlob = await documentResponse.blob();

      // Create form data
      const formData = new FormData();

      // Add the document with signatures
      formData.append(
        "UploadDocument",
        documentBlob,
        documentData.DocumentName
      );

      // Add all signatures data
      signatures.forEach((sig, index) => {
        formData.append(
          `Signature_${index}`,
          sig.blob,
          `signature_${index}.png`
        );
        formData.append(
          `SignatureMetadata_${index}`,
          JSON.stringify({
            signedBy: sig.signedBy,
            signedDate: sig.signedDate,
            position: sig.position,
          })
        );
      });

      // Add other required fields
      formData.append("DocumentId", documentId);
      formData.append("DocumentNo", documentData.DocumentNo);
      formData.append("DocumentName", documentData.DocumentName || "");
      formData.append("CustomerName", documentData.CustomerName || "");
      formData.append("StatusId", documentData.StatusId || 0);
      formData.append("ProjectType", documentData.ProjectTypeName || 0);
      formData.append("UpdatedBy", localStorage.getItem("UserID") || 0);
      formData.append("TenantId", localStorage.getItem("TenantID") || 0);

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
        setUnsavedChanges(false);
        fetchDocumentData();
      } else {
        toast.error(response.data.message || "Failed to update document");
      }
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to update document");
    }
  };

  // Add this function to extract text from PDF
  const extractPDFText = async (pdfBytes) => {
    try {
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = pdf.getPages();
      let text = "";

      // Basic text extraction - note that this is simplified
      // For more accurate text extraction, consider using pdf.js or other PDF parsing libraries
      for (const page of pages) {
        const { width, height } = page.getSize();
        text += page.getText() + "\n";
      }

      return text;
    } catch (error) {
      console.error("Error extracting PDF text:", error);
      throw error;
    }
  };

  // Update handleFinalSubmit to properly define finalDocument
  const handleFinalSubmit = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      // Get the original document
      const documentResponse = await fetch(documentData.FilePath);
      const documentBlob = await documentResponse.blob();
      let finalFormData = new FormData();
      let finalDocument; // Define finalDocument variable

      if (fileType === "pdf") {
        // For PDF files, merge signatures with the document
        const documentArrayBuffer = await documentBlob.arrayBuffer();
        finalDocument = await addSignatureToPDF(
          documentArrayBuffer,
          tempSignatures
        );
        finalFormData.append(
          "UploadDocument",
          finalDocument,
          documentData.DocumentName
        );
      } else if (fileType === "docx") {
        // For DOCX files, send document and signatures separately
        const processedFormData = await addSignatureToDocx(
          documentBlob,
          tempSignatures
        );

        // Copy all entries from processedFormData to finalFormData
        for (let [key, value] of processedFormData.entries()) {
          finalFormData.append(key, value);
        }
      }

      // Add other required fields
      finalFormData.append("DocumentId", documentId);
      finalFormData.append("DocumentNo", documentData.DocumentNo);
      finalFormData.append("DocumentName", documentData.DocumentName || "");
      finalFormData.append("CustomerName", documentData.CustomerName || "");
      finalFormData.append("StatusId", documentData.StatusId || 0);
      finalFormData.append("ProjectType", documentData.ProjectTypeName || 0);
      finalFormData.append("UpdatedBy", localStorage.getItem("UserID") || 0);
      finalFormData.append("TenantId", localStorage.getItem("TenantID") || 0);

      // Send to backend
      const response = await axios.put(
        `${UPDATE_DOCUMENT_API}/${documentId}`,
        finalFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Document updated successfully!");
        setTempSignatures([]);
        fetchDocumentData();
      } else {
        toast.error(response.data.message || "Failed to update document");
      }
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to update document");
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to handle signature editing
  const handleEditSignature = (signature) => {
    setEditingSignature(signature);
    setShowSignatureModal(true);
    setIsEditing(true);
  };
  useEffect(() => {
    if (!canvasRef.current) return; // Prevents running if ref is not assigned

    let pad = null;
    const initializeSignaturePad = async () => {
      try {
        pad = new SignaturePad(canvasRef.current, {
          backgroundColor: "rgba(255, 255, 255, 0)",
          penColor: "rgb(0, 0, 0)",
          minWidth: 0.5,
          maxWidth: 2.5,
          throttle: 16,
        });
        setSignaturePad(pad);

        const resizeCanvas = () => {
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          const canvas = canvasRef.current;
          if (!canvas) return; // Ensure canvas is available before resizing

          canvas.width = canvas.offsetWidth * ratio;
          canvas.height = canvas.offsetHeight * ratio;
          canvas.getContext("2d").scale(ratio, ratio);
          pad.clear();
        };

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        return () => {
          window.removeEventListener("resize", resizeCanvas);
          pad.off();
        };
      } catch (err) {
        console.error("Failed to initialize signature pad:", err);
        setError("Failed to initialize signature pad. Please refresh the page.");
      }
    };

    initializeSignaturePad();
  }, []);
  // Add position marker component
  const PositionMarker = ({ position }) => {
    return (
      <div
        className="absolute border-2 border-dashed border-blue-500 bg-blue-100 bg-opacity-30 w-[200px] h-[100px]"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      >
        <div className="text-center text-blue-600 mt-8">
          Signature will appear here
        </div>
      </div>
    );
  };

  // Add function to handle document editing
  const handleEditDocument = async () => {
    try {
      setIsLoading(true);

      if (fileType === "pdf") {
        // Load PDF for editing
        const response = await fetch(documentData.FilePath);
        const pdfBytes = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();

        // Extract text content for editing
        const textContent = await extractPDFText(pdfBytes);
        setEditableContent(textContent);
      } else if (fileType === "docx") {
        // Load DOCX for editing
        const response = await fetch(documentData.FilePath);
        const docxBuffer = await response.arrayBuffer();

        // Convert DOCX to HTML for editing
        const result = await mammoth.convertToHtml({ arrayBuffer: docxBuffer });
        setEditableContent(result.value);
      }

      setIsEditing(true);
      setEditingMode("text");
    } catch (error) {
      console.error("Error preparing document for edit:", error);
      toast.error("Failed to prepare document for editing");
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to save edited content
  const handleSaveEdit = async () => {
    try {
      setIsLoading(true);
      let modifiedDocument;

      if (fileType === "pdf") {
        // Create new PDF with edited content
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Add edited text to PDF
        page.drawText(editableContent, {
          x: 50,
          y: height - 50,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });

        const pdfBytes = await pdfDoc.save();
        modifiedDocument = new Blob([pdfBytes], { type: "application/pdf" });
      } else if (fileType === "docx") {
        // Create new DOCX with edited content
        const doc = new DocxDocument({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: editableContent,
                    }),
                  ],
                }),
              ],
            },
          ],
        });

        const docxBuffer = await Packer.toBuffer(doc);
        modifiedDocument = new Blob([docxBuffer], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
      }

      // Send to backend
      const formData = new FormData();
      formData.append(
        "UploadDocument",
        modifiedDocument,
        documentData.DocumentName
      );
      formData.append("DocumentId", documentId);
      formData.append("DocumentNo", documentData.DocumentNo);
      formData.append("DocumentName", documentData.DocumentName || "");
      formData.append("CustomerName", documentData.CustomerName || "");
      formData.append("StatusId", documentData.StatusId || 0);
      formData.append("ProjectType", documentData.ProjectTypeName || 0);
      formData.append("UpdatedBy", localStorage.getItem("UserID") || 0);
      formData.append("TenantId", localStorage.getItem("TenantID") || 0);

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
        setIsEditing(false);
        fetchDocumentData();
      } else {
        toast.error(response.data.message || "Failed to update document");
      }
    } catch (error) {
      console.error("Error saving edited document:", error);
      toast.error("Failed to save document changes");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <LoadingAnimation />;
  }

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

  // Update the renderDocumentPreview function
  const renderDocumentPreview = () => {
    if (!documentData?.FilePath) return null;

    if (isEditing) {
      return (
        <div className="relative bg-white p-4 rounded-lg shadow">
          <div className="mb-4 flex justify-between items-center">
            <div className="space-x-2">
              <button
                onClick={() => setEditingMode("text")}
                className={`px-4 py-2 rounded ${editingMode === "text"
                  ? "bg-[#8B4513] text-white"
                  : "bg-gray-200"
                  }`}
              >
                Text Edit
              </button>
              <button
                onClick={() => setEditingMode("drawing")}
                className={`px-4 py-2 rounded ${editingMode === "drawing"
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
                onClick={handleSaveEdit}
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
            <canvas
              ref={canvasRef}
              className="border rounded"
              style={{ width: "100%", height: "600px" }}
            />
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
                  {/* Show position marker */}
                  {isMarkingPosition && markedPosition && (
                    <PositionMarker position={markedPosition} />
                  )}
                  {/* Show existing signatures */}
                  {tempSignatures.map((signature) => (
                    <Draggable
                      key={signature.id}
                      defaultPosition={signature.position}
                      onStop={(e, data) => {
                        const rect =
                          documentContainerRef.current.getBoundingClientRect();
                        const x = (data.x / rect.width) * 100;
                        const y = (data.y / rect.height) * 100;

                        setTempSignatures((prev) =>
                          prev.map((sig) =>
                            sig.id === signature.id
                              ? { ...sig, position: { x, y } }
                              : sig
                          )
                        );
                      }}
                      bounds="parent"
                    >
                      <div className="absolute cursor-move">
                        <img
                          src={signature.image}
                          alt="signature"
                          className="max-w-[200px] max-h-[100px]"
                        />
                      </div>
                    </Draggable>
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
              {/* Similar signature rendering for DOCX */}
            </div>
          )}
        </div>

        {/* Instructions */}
        {isMarkingPosition && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-50">
            Click where you want to place the signature
          </div>
        )}

        {/* Save/Cancel buttons */}
        {tempSignatures.length > 0 && (
          <div className="fixed bottom-4 right-4 z-50 flex gap-2">
            <button
              onClick={() => {
                setTempSignatures([]);
                setMarkedPosition(null);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-lg hover:bg-opacity-90"
            >
              Cancel
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-[#8B4513] text-white rounded-lg shadow-lg hover:bg-opacity-90 flex items-center"
            >
              {isLoading ? (
                <>
                  <LoadingAnimation />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                "Save Document"
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

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
                onClick={() => setShowDialog(true)}
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
                  // onClick={handleDownload}
                  onClick={addSignatureField}
                  className="px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-opacity-90 flex items-center"
                  title="Download Document"
                >
                  <FiDownload className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={handleUpdateDocument}
                  disabled={isLoading}
                  className={`px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-opacity-90 flex items-center ${isLoading ? "opacity-50 cursor-not-allowed" : ""
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

                <button
                  onClick={() => setIsPopupOpen(true)}
                  className="px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-opacity-90 flex items-center"
                >
                  Add Approval
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

      <SignatureModal
        showModal={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        documentData={documentData}
        documentId={documentId}
        onSignatureComplete={handleSignatureComplete}
        markedPosition={markedPosition}
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
                className={`px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-[#8B4513] flex items-center ${isSubmittingComment ? "opacity-50 cursor-not-allowed" : ""
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

      {/* Right Sidebar - Approvals */}
      <div className="w-80 border-l bg-gray-50">
        <div className="p-4">
          <h2 className="font-semibold mb-4 text-gray-800">Approval History</h2>
          <div className="space-y-4">
            {documentData?.Approvals?.map((approval, index) => (
              <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${approval.Status.toLowerCase() === "approved"
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
                    className={`text-sm ${approval.Status.toLowerCase() === "approved"
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
      <div>
        {showDialog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Signature Type</h3>
              <div className="flex gap-2 mb-4">
                {['draw', 'text', 'image'].map(type => (
                  <label
                    key={type}
                    className={`flex-1 cursor-pointer p-3 border rounded-md transition-all ${signatureType === type ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}`}
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
                    <input
                      type="text"
                      value={textSignature}
                      onChange={(e) => setTextSignature(e.target.value)}
                      placeholder="Enter your signature"
                      className="w-full p-2 border rounded-md"
                      style={{ fontFamily: fontLoaded ? signatureFont : "cursive", fontSize: `${fontSize}px`, color: fontColor }}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <input type="range" min="12" max="48" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full" />
                      <span>{fontSize}px</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <label className="min-w-[60px] mr-2 font-bold">Color:</label>
                      <div className="flex items-center gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            className={`w-6 h-6 rounded-full border-2 ${fontColor === color.value ? "border-black" : "border-transparent"
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
                    <button onClick={() => fileInputRef.current.click()} className="bg-teal-500 text-white px-4 py-2 rounded-md">Upload Signature Image</button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <button onClick={clearSignature} className="bg-orange-500 text-white px-4 py-2 rounded-md">Clear</button>
                <button onClick={saveSignature} className="bg-blue-500 text-white px-4 py-2 rounded-md" disabled={!textSignature.trim()}>Save Signature</button>
                <button onClick={() => setShowDialog(false)} className="bg-gray-500 text-white px-4 py-2 rounded-md">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsDetails;
