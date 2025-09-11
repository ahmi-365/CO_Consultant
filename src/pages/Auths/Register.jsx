"use client"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {authService} from "@/services/Auth-service"
export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Form validation function
  const validateForm = () => {
    if (!formData.firstName.trim()) return "First name is required"
    if (!formData.lastName.trim()) return "Last name is required"
    if (!formData.email.trim()) return "Email is required"
    if (!formData.email.includes("@")) return "Please enter a valid email"
    if (formData.password.length < 6) return "Password must be at least 6 characters"
    if (formData.password !== formData.confirmPassword) return "Passwords do not match"
    if (!acceptTerms) return "Please accept the terms and conditions"
    return null
  }
const handleSubmit = async (e) => {
  e.preventDefault()

  const validationError = validateForm()
  if (validationError) {
    toast({
      title: "Registration Error",
      description: validationError,
      variant: "destructive",
    })
    return
  }

  setIsLoading(true)

  try {
    const response = await authService.register({
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      password: formData.password,
    })

    if (response.success) {
      setSuccess(true)
      toast({
        title: "Account Created 🎉",
        description: "Redirecting to dashboard...",
      })

      setTimeout(() => {
        window.location.href = "/filemanager" // ✅ redirect to file manager
      }, 2000)
    } else {
      toast({
        title: "Registration Failed",
        description: response.message || "Something went wrong",
        variant: "destructive",
      })
    }
  } catch (error) {
    toast({
      title: "Unexpected Error",
      description: "Please try again later",
      variant: "destructive",
    })
  } finally {
    setIsLoading(false)
  }
}


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
            {/* Modern diagonal brand container */}
            <div className="relative">
              {/* Background accent */}
              <div className="absolute -inset-4 bg-gradient-to-r from-white/10 to-transparent backdrop-blur-sm rounded-2xl transform -skew-x-12"></div>

              {/* Main content */}
              <div className="relative z-10 space-y-4">
                {/* Compact logo with modern styling */}
                <div className="inline-flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 flex items-center justify-center shadow-xl">
                    <span className="text-white text-xl font-bold">CO</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">CO Consultants</h1>
                    <div className="w-16 h-0.5 bg-white/60 mt-1"></div>
                  </div>
                </div>

                {/* Tagline with modern typography */}
                <p className="text-lg font-medium text-white/90 max-w-xs leading-relaxed">
                  Transforming Business Through Strategic Innovation
                </p>

                {/* Modern accent elements */}
                <div className="flex items-center space-x-3 pt-2">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-white/80 to-transparent"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  <div className="w-4 h-0.5 bg-gradient-to-r from-white/60 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern floating elements */}
        <div className="absolute top-16 right-16 w-20 h-20 border border-white/20 rounded-3xl bg-white/5 backdrop-blur-sm transform rotate-12 animate-pulse"></div>
        <div className="absolute top-1/3 left-8 w-4 h-4 bg-white/40 rounded-full animate-bounce"></div>
      </div>

   <div className="w-full lg:w-1/2 flex items-center justify-center p-3 lg:p-4 animate-slide-in-right bg-white text-black">
  <div className="w-full max-w-md space-y-3">
    <div className="space-y-3">
      <div>
        <h2 className="text-xl font-bold mb-1">Join Our Team</h2>
        <p className="text-xs text-gray-600">
          Create your CO Consultants account to access premium business consulting services
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        {/* First / Last Name */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label htmlFor="firstName" className="text-xs font-medium text-gray-900">
              First Name
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="h-9 bg-white border border-gray-300 rounded-xl px-3 text-sm text-black"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lastName" className="text-xs font-medium text-gray-900">
              Last Name
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="h-9 bg-white border border-gray-300 rounded-xl px-3 text-sm text-black"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="email" className="text-xs font-medium text-gray-900">
            Enter your email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="h-9 bg-white border border-gray-300 rounded-xl px-3 text-sm text-black"
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <Label htmlFor="password" className="text-xs font-medium text-gray-900">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="h-9 bg-white border border-gray-300 rounded-xl px-3 pr-10 text-sm text-black"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
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
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              className="h-9 bg-white border border-gray-300 rounded-xl px-3 pr-10 text-sm text-black"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            >
              {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-center space-x-2 py-1">
          <Checkbox
  id="terms"
  checked={acceptTerms}
  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
  className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
/>

          <Label htmlFor="terms" className="text-xs text-gray-900">
            I agree to the{" "}
            <Link to="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>

        {/* Button */}
        <Button
          type="submit"
          disabled={isLoading || !acceptTerms}
          className="w-full h-9 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors text-sm"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>

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
