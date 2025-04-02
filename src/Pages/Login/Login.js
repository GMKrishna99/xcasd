import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { LOGIN } from "../../Constants/apiRoutes";
import LoadingAnimation from "../../Components/Loading/LoadingAnimation";
import Lottie from "lottie-react";
import animation from "../../assests/animations/Main-Scene.gif";
import { HiMail, HiLockClosed } from "react-icons/hi";
import DealVisorLogo from "../../assests/Images/Deal visor.png";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Email: email, Password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { token } = data;

        const decodedToken = jwtDecode(token);
        const roleID = decodedToken.RoleID;
        const userID = decodedToken.UserID;
        const TenantID = decodedToken.TenantID;

        localStorage.setItem("UserID", userID);
        localStorage.setItem("TenantID", TenantID);
        login(token, roleID, userID);

        // Now that all data is loaded, navigate to the dashboard
        navigate("/dashboard");
      } else {
        console.error("Login failed:", data.message);
        setError(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login");
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 10000); // 5 seconds delay
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  const handleForgotPassword = () => {
    setIsLoading(true); // Start loading
    setTimeout(() => {
      navigate("/forgot-password"); // Navigate after a delay
      setIsLoading(false); // Stop loading after navigation
    }, 500); // Simulate a small loading delay (500ms)
  };

  return (
    <div className="min-h-screen relative flex overflow-hidden">
      {/* Background Pattern with Gradient */}{" "}
      {isLoading && <LoadingAnimation />}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#8B4513] opacity-80" />

        {/* Animation Layer - Using GIF */}
        <div className="absolute inset-0 z-10 opacity-75 align-center">
          <DotLottieReact
            src="https://lottie.host/79fbfbdd-bf0f-4478-9136-b101cd217fe8/T7NlAlJBhK.lottie"
            loop={true}
            autoplay={true}
            className="absolute inset-0 h-full w-full object-contain shadow-sm"
          />
        </div>

        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-pattern opacity-10" />
      </div>
      {/* Content */}
      <div className="relative z-20 flex w-full">
        {/* Left Side - Visible on tablet and desktop */}
        <div className="flex-1 p-8 lg:p-12 hidden sm:block">
          {/* Login Text */}
          <div className="text-[#301607] max-w-xl mt-20">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">
              Login into
              <br />
              your account
            </h1>

            {/* Features Grid - Updated background and text colors */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 bg-[#ffff] rounded-lg p-4 transition-all duration-300 backdrop-blur-sm 
      border border-[#8B4513]" // Add border here
                >
                  <div className="text-[#8B4513] text-2xl shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-[#8B4513] font-semibold text-lg mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-[#8B4513] text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-[400px] shadow-xl backdrop-blur-lg">
            <div className="flex justify-center items-center mb-2">
              <img src={DealVisorLogo} alt="B2Y" className="h-28 w-auto" />
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-gray-600 text-sm sm:block hidden">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 pl-10 bg-[#F1F5F9] rounded-lg text-gray-700"
                    placeholder="admin@example.com"
                  />
                  <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-gray-600 text-sm sm:block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pl-10 bg-[#F1F5F9] rounded-lg text-gray-700"
                    placeholder="••••••••"
                  />
                  <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-[#8B4513] text-sm hover:underline"
                >
                  Forgot your Password?
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-[#8B4513] hover:bg-[#632e0f] text-white py-3 rounded-lg font-medium transition-colors"
                disabled={isLoading}
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
