

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
    const token = authService.getToken()
    const user = authService.getUser()
    
    if (token && user) {
      // Redirect based on role
      const userRoles = user.roles || []
      if (userRoles.includes('admin')) {
        navigate('/dash', { replace: true })
      } else {
        navigate('/filemanager', { replace: true })
      }
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await authService.login({ email, password })

      if (response.success) {
        toast({
          title: "Login Successful 🎉",
          description: "Redirecting to dashboard...",
        })

        // Get user data after successful login
        const user = authService.getUser()
        const from = location.state?.from?.pathname || null

        setTimeout(() => {
          if (from) {
            // Redirect to the page they were trying to access
            navigate(from, { replace: true })
          } else {
            // Redirect based on user role
            const userRoles = user?.roles || []
            if (userRoles.includes('admin')) {
              navigate('/dash', { replace: true })
            } else {
              navigate('/filemanager', { replace: true })
            }
          }
        }, 1500)
      } else {
        toast({
          title: "Login Failed",
          description: response.message || "Invalid credentials",
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
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8  animate-slide-in-left">
        <div className="w-full max-w-sm space-y-6">
          {/* Sign In Form */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Access your consulting dashboard and client management tools
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email Field */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Enter your email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2  border border-border rounded-lg  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10  border border-border rounded-lg text-black placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                  className="w-4 h-4 text-blue-600 bg-panel border-border rounded focus:ring-blue-500"
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground">
                  Remember me for 30 days
                </Label>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-panel hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">Or sign in with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                className="bg-blue-900 border border-border text-white hover:bg-blue-800 text-xs sm:text-sm"
              >
                <svg className="w-4 h-4 mr-1 sm:mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>

              <Button
                type="button"
                className="bg-blue-900 border border-border text-white hover:bg-blue-800 text-xs sm:text-sm"
              >
                <svg className="w-4 h-4 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
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