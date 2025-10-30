import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeaderDuplicated from "./HeaderDuplicated";
const TermsAndConditions = () => {
   return (

      <section >
         <HeaderDuplicated />
         <div className="container mx-auto px-10 py-16 mt-10 text-gray-700"
         >
            <h1 className="text-3xl font-bold text-blue-900 mb-6">Terms & Conditions</h1>
            <p className="mb-4">
               Welcome to <strong>CO Consultants</strong>. By accessing our website or using our services, you agree to comply with and be bound by
               the following terms and conditions.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">1. Use of Services</h2>
            <p className="mb-4">
               Our services are designed for professional construction and consultancy use. You agree not to misuse our tools or engage in
               activities that could disrupt operations or compromise security.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">2. Intellectual Property</h2>
            <p className="mb-4">
               All website content, logos, visuals, and text are the property of CO Consultants. Reproduction or distribution without written
               consent is strictly prohibited.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">3. Limitation of Liability</h2>
            <p className="mb-4">
               While we aim to provide accurate and reliable project insights, CO Consultants shall not be held liable for any indirect damages
               or data loss resulting from the use of our platform.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">4. Changes to Terms</h2>
            <p className="mb-4">
               CO Consultants reserves the right to modify these terms at any time. Continued use of our services following updates
               constitutes acceptance of the revised terms.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">5. Contact Us</h2>
            <p className="mb-4">
               For any questions about these Terms & Conditions, please contact us at{" "}
               <a href="mailto:info@thecoconsultants.com" className="text-blue-700 underline">
                  info@thecoconsultants.com
               </a>.
            </p>

            <p className="mt-8 text-sm text-gray-500">
               Last updated: {new Date().getFullYear()}
            </p>
         </div>
         <Footer />


      </section>
   );
};

export default TermsAndConditions;
