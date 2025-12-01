import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeaderDuplicated from "./HeaderDuplicated";



const PrivacyPolicy = () => {
   return (

      <section>
         <HeaderDuplicated />
         <div className="container mx-auto px-10 py-16 mt-10 text-gray-700"
         >

            <h1 className="text-3xl font-bold text-blue-900 mb-6">Privacy Policy</h1>
            <p className="mb-4">
               At <strong>CO Consultants</strong>, we value your privacy and are committed to protecting your personal information.
               This Privacy Policy outlines how we collect, use, and safeguard your data when you interact with our website or services.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
            <p className="mb-4">
               We may collect personal details such as your name, email address, contact number, company information, and project details
               when you fill out forms, request consultations, or subscribe to updates.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
            <p className="mb-4">
               The information we collect is used to improve our services, respond to inquiries, process project requests, and share updates
               related to our construction consultancy and project management services.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">3. Data Security</h2>
            <p className="mb-4">
               We implement industry-standard security measures and cloud encryption to protect your personal data against unauthorized access,
               loss, or disclosure.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">4. Third-Party Sharing</h2>
            <p className="mb-4">
               We do not sell or rent your personal information. Limited data may be shared with trusted partners who assist us in operating
               our services — all under strict confidentiality agreements.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-2">5. Your Rights</h2>
            <p className="mb-4">
               You have the right to access, modify, or delete your personal data at any time by contacting us at{" "}
               <a href="mailto:admin@thecoconsultants.com" className="text-blue-700 underline">
                  admin@thecoconsultants.com
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

export default PrivacyPolicy;
