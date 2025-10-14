import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/Auth-service"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // Check if user is already logged in
  useEffect(() => {
    const token = authService.getToken();
    const user = authService.getUser();

    if (token && user) {
      // Redirect based on is_admin
      if (user.is_admin === 1) {
        navigate('/dash', { replace: true });
      } else {
        navigate('/filemanager', { replace: true });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });

      if (response.success) {
        toast({
          title: "Login Successful 🎉",
          description: "Redirecting...",
        });

        const user = authService.getUser();
        const from = location.state?.from?.pathname || null;

        setTimeout(() => {
          if (from) {
            navigate(from, { replace: true });
          } else {
            // Redirect based on is_admin flag
            if (user.is_admin === 1) {
              navigate('/dash', { replace: true });
            } else {
              navigate('/filemanager', { replace: true });
            }
          }
        }, 1500);
      } else {
        toast({
          title: "Login Failed",
          description: response.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
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
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-slide-in-left">
        <div className="w-full max-w-sm space-y-6">
          {/* Sign In Form */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
              <p className="text-sm text-gray-600 mt-1">
                Access your consulting dashboard and client management tools
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email Field */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                  Enter your email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm font-medium text-gray-900">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">
                  Remember me for 30 days
                </Label>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full font-medium py-2 px-4 rounded-lg transition-colors shadow-sm bg-red-600 hover:bg-red-700 text-white disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>

            </form>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-blue-600 relative overflow-hidden animate-fade-in">
        <img
          src="/Assets/LoginImage.jpg"
          alt="Security Dashboard"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-purple-900/30"></div>

        <div className="absolute top-1/2 right-12 -translate-y-1/2 text-white">
          {/* Main brand container with enhanced glassmorphism */}
          <div className="relative">
            {/* Geometric background accent */}
            <div className="absolute -inset-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 transform rotate-3"></div>
            <div className="absolute -inset-2 bg-gradient-to-tl from-blue-400/20 to-purple-400/20 backdrop-blur-lg rounded-2xl border border-white/30 transform -rotate-1"></div>

            {/* Content container */}
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/30 p-8 shadow-2xl">
              {/* Logo with enhanced styling */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md rounded-3xl border-2 border-white/30 flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl font-bold tracking-wider">CO</span>
                </div>
              </div>

              {/* Company name with gradient text effect */}
              <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-2 tracking-tight">
                  CO Consultants
                </h2>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent mb-3"></div>
                <p className="text-white/90 font-medium text-sm tracking-wide">Excellence in Business Innovation</p>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-white/30 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-300/50 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        </div>

        {/* Enhanced decorative elements */}
        <div className="absolute top-8 left-8 w-24 h-24 border-2 border-white/20 rounded-full bg-white/5 backdrop-blur-sm"></div>
        <div className="absolute bottom-12 right-20 w-16 h-16 border border-white/30 rounded-2xl bg-white/10 backdrop-blur-md rotate-12"></div>
        <div className="absolute top-20 left-16 w-3 h-3 bg-white/60 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-12 w-2 h-2 bg-blue-300/80 rounded-full animate-pulse delay-500"></div>
      </div>
    </div>
  )
}