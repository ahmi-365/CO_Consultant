import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "@/services/Auth-service";
import { useToast } from "@/components/ui/use-toast";

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
      if (user.is_admin === 1 || user.is_admin === "1") {
        // ✅ Fixed: Check both types
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
  const handleBlur = (fieldName, value) => {
    const error = validateField(fieldName, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Login Failed",
        description: Object.values(newErrors)[0],
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });

      console.log("Login response:", response); // Debug log

      if (response.success) {
        toast({
          title: "Login Successful",
          description: "Redirecting to your dashboard...",
          variant: "default",
        });

        const user = authService.getUser();
        console.log("Retrieved user:", user); // Debug log
        console.log("Is admin?", user.is_admin, typeof user.is_admin); // Debug log

        const from = location.state?.from?.pathname || null;

        setTimeout(() => {
          if (from) {
            navigate(from, { replace: true });
          } else if (user.is_admin === 1 || user.is_admin === "1") {
            // Check both number and string          console.log('Navigating to /dash'); // Debug log
            navigate("/dash", { replace: true });
          } else {
            console.log("Navigating to /filemanager"); // Debug log
            navigate("/filemanager", { replace: true });
          }
        }, 1500);
      }
    } catch (error) {
      console.error("Login error:", error); // Debug log
      toast({
        title: "Unexpected Error",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-white">
      {/* Left Side: Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-slide-in-left">
        <div className="w-full max-w-sm space-y-6">
          {/* Back to Website Link */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
            <a
              href="/"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              ← Back to Website
            </a>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">
                Please log in to access your Project Management Workspace. All
                your files & dashboards. One Secure Portal.
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
                  className={`w-full px-3 py-2 bg-white border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
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
                    className={`w-full px-3 py-2 pr-10 bg-white border rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
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
                  ${
                    isLoading || !email.trim() || !password.trim()
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
          src="/assets/LoginImage.jpg"
          alt="Security Dashboard"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-purple-900/30"></div>

        <div className="absolute top-1/2 right-12 -translate-y-1/2 text-white">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 transform rotate-3"></div>
            <div className="absolute -inset-2 bg-gradient-to-tl from-blue-400/20 to-purple-400/20 backdrop-blur-lg rounded-2xl border border-white/30 transform -rotate-1"></div>
            <div className="absolute top-1/2 right-12 -translate-y-1/2">
              <div className="w-96 h-96 bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 flex items-center justify-center shadow-lg overflow-hidden">
                <img
                  src="/assets/icon.png"
                  alt="CO Consultants Logo"
                  className="w-80 h-80 object-contain"
                />
              </div>
            </div>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-white/30 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-300/50 rounded-full animate-pulse delay-300"></div>
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
