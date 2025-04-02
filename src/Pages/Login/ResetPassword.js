import { useState, useEffect } from "react";
import DealVisorLogo from "../../assests/Images/Deal visor.png";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useLocation, useNavigate } from "react-router-dom";
import { ResetPassword } from "../../Constants/apiRoutes";
import axios from "axios";
import PersonIcon from "@mui/icons-material/Person";
import { toast, ToastContainer } from "react-toastify";
import LoadingAnimation from "../../Components/Loading/LoadingAnimation";
import Lottie from "lottie-react";
import animation from "../../assests/animations/Animation-1.json";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(location.state?.email || "");

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

  useEffect(() => {
    setEmail(location.state?.email || "");
  }, [location.state?.email]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    } else if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    } else if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordError("");
    setIsLoading(true);

    try {
      const response = await axios.post(ResetPassword, {
        Email: email,
        NewPassword: newPassword,
        ConfirmPassword: confirmPassword,
      });

      if (
        response.status === 200 ||
        response.status === 201 ||
        response.StatusCode === "SUCCESS"
      ) {
        toast.success("Password reset successfully!");
        navigate("/");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setPasswordError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#8B4513] relative overflow-hidden">
      <ToastContainer />

      {/* Background Pattern with Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B4513] via-[#632e0f] to-[#301607] opacity-95" />

        {/* Animation Layer */}
        <div className="absolute inset-0 z-10 opacity-75 align-center">
          <Lottie
            animationData={animation}
            loop={true}
            autoplay={true}
            className="absolute inset-0 h-full w-full object-contain shadow-sm"
          />
        </div>

        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-pattern opacity-10" />
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col lg:flex-row w-full min-h-screen">
        {/* Left Side - Now visible on all screens */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 lg:p-12">
          {/* Reset Password Text */}
          <div className="text-white max-w-xl mx-auto lg:mx-0 mt-8 lg:mt-20 text-center lg:text-left mb-8 lg:mb-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="block">Reset</span>
              <span className="block mt-1">
                <br className="hidden lg:block" />
                Password
              </span>
            </h1>
            <p className="text-lg opacity-80 mb-8">
              Access your document management portal
            </p>

            {/* Features Grid - Hidden on mobile and tablet */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-6 mt-8">
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
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-[400px] shadow-xl backdrop-blur-lg">
            <div className="flex justify-center mb-8">
              <img
                src={DealVisorLogo}
                alt="Logo"
                className="h-20 sm:h-24 lg:h-28"
              />
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full px-4 py-3 pl-12 rounded-xl border-[0.5px] border-gray-200 bg-gray-50 focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/20 outline-none transition-all duration-300"
                  />
                  <PersonIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pl-12 pr-12 rounded-xl border-[0.5px] border-gray-200 focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/20 outline-none transition-all duration-300"
                    placeholder="Enter new password"
                  />
                  <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pl-12 rounded-xl border-[0.5px] border-gray-200 focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/20 outline-none transition-all duration-300"
                    placeholder="Confirm new password"
                  />
                  <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {passwordError && (
                <p className="text-red-500 text-sm animate-pulse text-center">
                  {passwordError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#8B4513] text-white rounded-xl font-semibold transition-all duration-300 hover:bg-[#632e0f] disabled:opacity-50"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {isLoading && <LoadingAnimation />}
    </div>
  );
};

export default ResetPasswordPage;
