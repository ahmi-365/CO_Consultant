import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/Auth-service";
// import { useToast } from "@/components/ui/use-toast";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Auto-redirect if already logged in
  useEffect(() => {
    const token = authService.getToken();
    const user = authService.getUser();

    if (token && user) {
      if (user.is_admin === 1) {
        navigate("/dash", { replace: true });
      } else {
        navigate("/filemanager", { replace: true });
      }
    }
  }, [navigate]);

  // ✅ Email validation regex
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ✅ Professional validation with detailed checks
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!isValidEmail(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  // ✅ Real-time field validation
  const validateField = (fieldName, value) => {
    let error = "";

    if (fieldName === "email") {
      if (!value.trim()) {
        error = "Email address is required";
      } else if (!isValidEmail(value.trim())) {
        error = "Please enter a valid email address";
      }
    }

    if (fieldName === "password") {
      if (!value.trim()) {
        error = "Password is required";
      } else if (value.length < 6) {
        error = "Password must be at least 6 characters";
      }
    }

    return error;
  };

// Custom top-right toast helper
const showToast = (type, title, description) => {
  toast({
    title,
    description,
    className: `${
      type === "success"
        ? "fixed top-6 right-6 bg-green-100 border border-green-400 text-green-800 font-medium"
        : "fixed top-6 right-6 bg-red-100 border border-red-400 text-red-800 font-medium"
    } rounded-lg px-4 py-3 w-[90%] sm:w-[320px] text-left z-[9999] shadow-lg animate-slide-in-right`,
  });
};


 const handleSubmit = async (e) => {
  e.preventDefault();

  const newErrors = validateForm();
  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    // Show first error in toast
    const firstError = Object.values(newErrors)[0];
    showToast("error", "Login Failed", firstError);
    return;
  }

  setIsLoading(true);

  try {
    const response = await authService.login({ email, password });

    if (response.success) {
      showToast("success", " Login Successful", "Redirecting to your dashboard...");

      const user = authService.getUser();
      const from = location.state?.from?.pathname || null;

      setTimeout(() => {
        if (from) {
          navigate(from, { replace: true });
        } else if (user.is_admin === 1) {
          navigate("/dash", { replace: true });
        } else {
          navigate("/filemanager", { replace: true });
        }
      }, 1500);
    } else {
      //  FIXED: now passing 3 parameters correctly
      showToast("error", " Login Failed", response.message || "Invalid credentials");
    }
  } catch (error) {
    showToast("error", "Unexpected Error", "Please try again later");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-white">
      {/* Left Side: Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-slide-in-left">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
              <p className="text-sm text-gray-600 mt-1">
                Access your consulting dashboard and client management tools
              </p>
            </div>

            {/* ✅ Sign-In Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-3">
              {/* Email Field */}
              <div className="space-y-1">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-900"
                >
                  Email Address
                </Label>
                {errors.email && (
                  <p className="text-red-500 text-xs font-medium mb-1">
                    {errors.email}
                  </p>
                )}
                <Input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  onBlur={(e) => handleBlur("email", e.target.value)}
                  placeholder="Enter your email"
                  className={`w-full px-3 py-2 bg-white border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                    }`}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-900"
                >
                  Password
                </Label>
                {errors.password && (
                  <p className="text-red-500 text-xs font-medium mb-1">
                    {errors.password}
                  </p>
                )}
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    onBlur={(e) => handleBlur("password", e.target.value)}
                    placeholder="Enter your password"
                    className={`w-full px-3 py-2 pr-10 bg-white border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              

              

              {/* ✅ Sign-In Button */}
              <button
                type="submit"
                disabled={isLoading || !email.trim() || !password.trim()}
                className={`w-full font-medium py-2.5 px-4 rounded-lg transition-all shadow-sm text-white mt-4
                  ${isLoading || !email.trim() || !password.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 hover:shadow-md active:scale-[0.98]"
                  }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Signup Link */}
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Image / Branding */}
      <div className="hidden lg:flex flex-1 bg-blue-600 relative overflow-hidden animate-fade-in">
        <img
          src="/Assets/LoginImage.jpg"
          alt="Security Dashboard"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-purple-900/30"></div>

        <div className="absolute top-1/2 right-12 -translate-y-1/2 text-white">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 transform rotate-3"></div>
            <div className="absolute -inset-2 bg-gradient-to-tl from-blue-400/20 to-purple-400/20 backdrop-blur-lg rounded-2xl border border-white/30 transform -rotate-1"></div>

            <div className="relative bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/30 p-8 shadow-2xl">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md rounded-3xl border-2 border-white/30 flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl font-bold tracking-wider">
                    CO
                  </span>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-2 tracking-tight">
                  CO Consultants
                </h2>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent mb-3"></div>
                <p className="text-white/90 font-medium text-sm tracking-wide">
                  Excellence in Business Innovation
                </p>
              </div>

              <div className="absolute -top-2 -right-2 w-4 h-4 bg-white/30 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-300/50 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-8 left-8 w-24 h-24 border-2 border-white/20 rounded-full bg-white/5 backdrop-blur-sm"></div>
        <div className="absolute bottom-12 right-20 w-16 h-16 border border-white/30 rounded-2xl bg-white/10 backdrop-blur-md rotate-12"></div>
        <div className="absolute top-20 left-16 w-3 h-3 bg-white/60 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-12 w-2 h-2 bg-blue-300/80 rounded-full animate-pulse delay-500"></div>
      </div>
    </div>
  );
}

