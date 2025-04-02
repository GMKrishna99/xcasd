import { useState, useEffect } from "react";
import DealVisorLogo from "../../assests/Images/Deal visor.png";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { ForgotPassword, VerifyOTP } from "../../Constants/apiRoutes";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import LoadingAnimation from "../../Components/Loading/LoadingAnimation";
import Lottie from "lottie-react";
import animation from "../../assests/animations/Animation-1.json";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const features = [
    {
      icon: "📄",
      title: "Document Upload",
      description: "Securely upload and manage your documents",
    },
    {
      icon: "✍️",
      title: "Digital Signatures",
      description: "Sign documents electronically",
    },
    {
      icon: "👥",
      title: "Collaboration",
      description: "Review and approve documents together",
    },
    {
      icon: "🔒",
      title: "Secure Storage",
      description: "Keep your documents safe and organized",
    },
  ];
  // Handle OTP input changes
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleSendOtp = async () => {
    // Start loading
    setIsLoading(true);

    // Validate the email
    if (!email) {
      setError("Please enter your email");
      setIsLoading(false); // Ensure loading is stopped if validation fails
      return;
    }

    // Reset any previous error messages
    setError("");

    try {
      // Make the API call to send OTP
      const response = await axios.post(ForgotPassword, { Email: email });

      if (response.status === 200 || response.status === 201) {
        console.log("OTP sent successfully", response);
        setIsLoading(true);
        // Show success toast
        toast.success("OTP sent successfully!", {
          position: "top-right",
          autoClose: 3000, // 3 seconds
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        // Show the OTP modal and start countdown timer
        setShowOtpModal(true);
        setTimer(300); // Start countdown
      } else {
        // Handle unexpected status codes
        toast.error("Unexpected response. Please try again later.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (err) {
      console.error("Error sending OTP:", err);

      // Show error toast
      toast.error("Failed to send OTP. Please try again later.", {
        position: "top-right",
        autoClose: 3000, // 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setError("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const enteredOtp = otp.join(""); // Combine OTP digits
    if (enteredOtp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }
    setOtpError("");

    try {
      const response = await axios.post(VerifyOTP, {
        Email: email,
        OTP: enteredOtp,
      });

      console.log("OTP Response:", response); // Log response for debugging

      if (response.status === 200 || response.status === 201) {
        console.log("OTP verified successfully", response);

        // Show success toast
        toast.success("OTP verified successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        // Navigate to reset password page
        navigate("/reset-password", { state: { email: email } });
      } else {
        setOtpError("Invalid OTP. Please try again.");

        // Show error toast
        toast.error("Invalid OTP. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setOtpError("Invalid OTP. Please try again.");

      // Show error toast for API error
      toast.error("Failed to verify OTP. Please try again later.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleResendOtp = () => {
    setTimer(300);
    handleSendOtp();
  };

  // Timer countdown logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div className="min-h-screen bg-[#8B4513] relative overflow-hidden">
      <ToastContainer />
      {/* Background Pattern with Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B4513] via-[#632e0f] to-[#301607] opacity-95" />

        {/* Animation Layer */}
        <div className="absolute inset-0 z-10 opacity-75">
          <Lottie
            animationData={animation}
            loop={true}
            autoplay={true}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Left Side - Title and Features */}
        <div className="w-full lg:w-1/2 text-white p-4 lg:p-12 lg:pr-20 mb-8 lg:mb-0">
          <div className="max-w-xl mx-auto lg:mx-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-center lg:text-left">
              Forgot Password
            </h1>
            <p className="text-lg opacity-80 mb-8 text-center lg:text-left">
              Access your document management portal
            </p>

            {/* Features Grid - Hidden on mobile and tablet */}
            <div className="hidden lg:grid grid-cols-2 gap-6 mt-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 bg-[#8B4513]/15 hover:bg-[#8B4513]/25 rounded-lg p-4 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="text-white text-2xl shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-white/70 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full max-w-md lg:w-1/2 lg:max-w-none lg:pl-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl w-full max-w-[440px] mx-auto">
            <div className="flex justify-center mb-8">
              <img
                src={DealVisorLogo}
                alt="Logo"
                className="h-20 sm:h-24 lg:h-28"
              />
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 pl-12 rounded-xl border-[0.5px] border-gray-200 focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/20 outline-none transition-all duration-300"
                  />
                  <PersonIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm animate-pulse">{error}</p>
              )}

              <button
                onClick={handleSendOtp}
                disabled={isLoading}
                className="w-full py-3 bg-[#8B4513] text-white rounded-xl font-semibold transition-all duration-300 hover:bg-[#632e0f] disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-[400px] transform transition-all duration-300 animate-slideIn relative">
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-[#632e0f] transform transition-transform hover:rotate-90"
            >
              <CloseIcon />
            </button>

            <h3 className="text-xl font-bold text-[#632e0f] text-center mb-6">
              Enter OTP
              <div className="text-sm text-gray-600 mt-2">{email}</div>
            </h3>

            <div className="flex justify-center gap-2 sm:gap-3 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl border-[0.5px] border-gray-200 rounded-xl focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/20 outline-none transition-all duration-300"
                />
              ))}
            </div>

            {otpError && (
              <p className="text-red-500 text-sm text-center animate-pulse mb-4">
                {otpError}
              </p>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 mb-6">
              <span className="text-sm text-gray-600">
                Time remaining: {Math.floor(timer / 60)}:
                {String(timer % 60).padStart(2, "0")}
              </span>
              <button
                onClick={handleResendOtp}
                disabled={timer > 0}
                className={`text-sm font-semibold ${
                  timer === 0
                    ? "text-[#8B4513] hover:underline"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                Resend OTP
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-3 bg-[#8B4513] text-white rounded-xl font-semibold transition-all duration-300 hover:bg-[#632e0f] disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </div>
      )}

      {isLoading && <LoadingAnimation />}
    </div>
  );
};

export default ForgotPasswordPage;
