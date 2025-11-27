import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    projectType: "",
    message: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();


  const BASE_URL = "https://co-consultant.majesticsofts.com/api";

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" })); // Clear error on change
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required.";

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // ✅ Phone number now compulsory
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Phone number must contain digits only.";
    } else if (formData.phone.length < 7 || formData.phone.length > 15) {
      newErrors.phone = "Phone number should be between 7–15 digits.";
    }

    // ❌ Message is optional now (no validation)

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Form not submitted!",
        description: "Please fix the highlighted errors and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data to match your API structure
      const apiData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company || "",
        project_type: formData.projectType || "",
        subject: `${formData.projectType || "General"} Inquiry`,
        message: formData.message || ""
      };

      const response = await fetch(`${BASE_URL}/contact-us`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      toast({
        title: "Message Sent!",
        description: "Thank you for reaching us. Expect to hear from us shortly.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        projectType: "",
        message: "",
      });

    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Unable to send your message. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      info: "admin@thecoconsultants.com",
      subinfo: "We respond within 24hrs"
    },
  ];

  return (
    <section id="contact" className="py-4 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ready to start your next construction project? Contact us today for a free consultation and quote.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Contact Form */}
          <div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h3>
                <p className="text-gray-600 mb-6">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${errors.name ? "border-red-500" : "border-gray-300"
                          }`}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${errors.email ? "border-red-500" : "border-gray-300"
                          }`}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        id="phone"
                        type="number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${errors.phone ? "border-red-500" : "border-gray-300"
                          }`}
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    {/* Company */}
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                      <input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                      />
                    </div>
                  </div>

                  {/* Project Type */}
                  {/* <div>
                    <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                    <select
                      onChange={(e) => handleInputChange("projectType", e.target.value)}
                      value={formData.projectType}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-200 bg-white"
                    >
                      <option value="">Select project type</option>
                      <option value="commercial">Commercial Construction</option>
                      <option value="residential">Residential Development</option>
                      <option value="infrastructure">Infrastructure Project</option>
                      <option value="renovation">Renovation/Remodeling</option>
                      <option value="other">Other</option>
                    </select>
                  </div> */}

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message: </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Tell us about your project requirements, timeline, and any specific needs..."
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-200 min-h-32 ${errors.message ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
                <div className="mt-12 text-center">
  <div
    className="
      inline-flex items-center gap-2 sm:gap-3 
      bg-white rounded-xl shadow-lg border border-gray-100 
      px-4 py-3 sm:px-8 sm:py-4 
      max-w-full
    "
  >
    <div className="p-2 sm:p-3 bg-blue-400/10 rounded-full">
      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
    </div>

    <div className="text-left">
      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">
        Email Us
      </h3>

      <p className="text-black font-medium text-sm sm:text-base break-all">
        admin@thecoconsultants.com
      </p>
    </div>
  </div>
</div>

              </div>
            </div>
          </div>

          {/* Email Contact Info at Bottom */}

        </div>
      </div>
    </section>
  );
};

export default ContactSection;