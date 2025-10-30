"use client"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/Auth-service"
import { useNavigate } from "react-router-dom"

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  // ✅ Email validation regex
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user types
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  // ✅ Professional validation with detailed checks
  const validateForm = () => {
    const newErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!isValidEmail(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm Password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms validation
    if (!acceptTerms) {
      newErrors.terms = "Please accept the terms and conditions";
    }

    return newErrors;
  };

  // ✅ Real-time field validation on blur
  const validateField = (fieldName, value) => {
    let error = "";

    if (fieldName === "firstName") {
      if (!value.trim()) {
        error = "First name is required";
      } else if (value.trim().length < 2) {
        error = "First name must be at least 2 characters";
      }
    }

    if (fieldName === "lastName") {
      if (!value.trim()) {
        error = "Last name is required";
      } else if (value.trim().length < 2) {
        error = "Last name must be at least 2 characters";
      }
    }

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

    if (fieldName === "confirmPassword") {
      if (!value.trim()) {
        error = "Please confirm your password";
      } else if (formData.password !== value) {
        error = "Passwords do not match";
      }
    }

    return error;
  };

  // ✅ Handle field blur for validation
  const handleBlur = (fieldName, value) => {
    const error = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  // ✅ Check if form is valid for button enable/disable
  const isFormValid = () => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      formData.password.trim() &&
      formData.confirmPassword.trim() &&
      acceptTerms
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Show first error in toast
      const firstError = Object.values(newErrors)[0];
      toast({
        title: "Validation Error",
        description: firstError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
      });

      // ✅ Check success
      const isSuccess =
        response?.status?.toLowerCase() === "success" ||
        response?.success === true ||
        response?.message?.toLowerCase()?.includes("success");

      if (isSuccess) {
        // ✅ Extract correct token and user
        const token =
          response?.authorisation?.token ||
          response?.authorisation?.access_token ||
          response?.data?.authorisation?.token ||
          response?.data?.authorisation?.access_token ||
          response?.token ||
          response?.data?.token;

        const user = response?.user || response?.data?.user;

        // ✅ Save to localStorage
        if (token && user) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          setSuccess(true);
          toast({
            title: "Account Created 🎉",
            description: "Redirecting to file manager...",
          });

          setTimeout(() => {
            navigate("/filemanager", { replace: true });
          }, 1500);
        } else {
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 1500);
        }
      } else {
        console.log("❌ Registration failed with response:", response);
        toast({
          title: "Registration Failed",
          description:
            response?.message ||
            response?.data?.message ||
            "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log("Registration error:", error);
      toast({
        title: "Unexpected Error",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="/Assets/ai-technology-network-security.jpg"
          alt="AI Technology Security"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/40 via-blue-600/30 to-purple-600/40"></div>

        <div className="absolute inset-0 flex items-end justify-start p-12">
          <div className="text-white transform hover:scale-105 transition-transform duration-300">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-white/10 to-transparent backdrop-blur-sm rounded-2xl transform -skew-x-12"></div>

              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 flex items-center justify-center shadow-xl">
                    <span className="text-white text-xl font-bold">CO</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">CO Consultants</h1>
                    <div className="w-16 h-0.5 bg-white/60 mt-1"></div>
                  </div>
                </div>

                <p className="text-lg font-medium text-white/90 max-w-xs leading-relaxed">
                  Transforming Business Through Strategic Innovation
                </p>

                <div className="flex items-center space-x-3 pt-2">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-white/80 to-transparent"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  <div className="w-4 h-0.5 bg-gradient-to-r from-white/60 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-16 right-16 w-20 h-20 border border-white/20 rounded-3xl bg-white/5 backdrop-blur-sm transform rotate-12 animate-pulse"></div>
        <div className="absolute top-1/3 left-8 w-4 h-4 bg-white/40 rounded-full animate-bounce"></div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-3 lg:p-4 animate-slide-in-right bg-white text-black">
        <div className="w-full max-w-md space-y-3">
          <div className="space-y-3">
            <div>
              <h2 className="text-xl font-bold mb-1">Join Our Team</h2>
              <p className="text-xs text-gray-600">
                Create your CO Consultants account for premium consulting.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
              {/* First / Last Name */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label htmlFor="firstName" className="text-xs font-medium text-gray-900">
                    First Name
                  </Label>
                  {errors.firstName && (
                    <p className="text-red-500 text-xs font-medium mb-1">{errors.firstName}</p>
                  )}
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    onBlur={(e) => handleBlur("firstName", e.target.value)}
                    className={`h-9 bg-white border rounded-xl px-3 text-sm text-black transition-all ${
                      errors.firstName ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName" className="text-xs font-medium text-gray-900">
                    Last Name
                  </Label>
                  {errors.lastName && (
                    <p className="text-red-500 text-xs font-medium mb-1">{errors.lastName}</p>
                  )}
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    onBlur={(e) => handleBlur("lastName", e.target.value)}
                    className={`h-9 bg-white border rounded-xl px-3 text-sm text-black transition-all ${
                      errors.lastName ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-medium text-gray-900">
                  Email Address
                </Label>
                {errors.email && (
                  <p className="text-red-500 text-xs font-medium mb-1">{errors.email}</p>
                )}
                <Input
                  id="email"
                  type="text"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={(e) => handleBlur("email", e.target.value)}
                  className={`h-9 bg-white border rounded-xl px-3 text-sm text-black transition-all ${
                    errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                  }`}
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-medium text-gray-900">
                  Password
                </Label>
                {errors.password && (
                  <p className="text-red-500 text-xs font-medium mb-1">{errors.password}</p>
                )}
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onBlur={(e) => handleBlur("password", e.target.value)}
                    className={`h-9 bg-white border rounded-xl px-3 pr-10 text-sm text-black transition-all ${
                      errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-xs font-medium text-gray-900">
                  Confirm Password
                </Label>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs font-medium mb-1">{errors.confirmPassword}</p>
                )}
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
                    className={`h-9 bg-white border rounded-xl px-3 pr-10 text-sm text-black transition-all ${
                      errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
             <div className="space-y-1">
  {errors.terms && (
    <p className="text-red-500 text-xs font-medium mb-1">{errors.terms}</p>
  )}

  <div className="flex items-center space-x-2 py-1">
    <Checkbox
      id="terms"
      checked={acceptTerms}
      onCheckedChange={(checked) => {
        setAcceptTerms(checked === true);
        setErrors((prev) => ({ ...prev, terms: "" }));
      }}
      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
    />

    <Label htmlFor="terms" className="text-xs text-gray-800 leading-tight">
      I agree to the{" "}
      <Link
        to="/terms-and-conditions"
        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
      >
        Terms & Conditions
      </Link>{" "}
      and{" "}
      <Link
        to="/privacy-policy"
        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
      >
        Privacy Policy
      </Link>
      .
    </Label>
  </div>
</div>


              {/* Button */}
              <button
                type="submit"
                disabled={isLoading || !isFormValid()}
                className={`w-full h-9 font-medium rounded-xl transition-all text-sm mt-2 ${
                  isLoading || !isFormValid()
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-red-600 hover:bg-red-700 text-white hover:shadow-md active:scale-[0.98]"
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
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>

              {/* Login Redirect */}
              <div className="text-center pt-1">
                <span className="text-xs text-gray-600">Already have an account? </span>
                <Link to="/login" className="text-xs text-blue-600 hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}