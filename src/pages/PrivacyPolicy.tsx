import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Card className="rounded-xl">
          <CardContent className="prose dark:prose-invert max-w-none p-6">
            <h1>Privacy Policy</h1>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>Information We Collect</h2>
            <p>This portfolio website may collect basic analytics information about your visit, such as pages viewed and time spent on the site.</p>
            
            <h2>How We Use Information</h2>
            <p>Any information collected is used solely to improve the user experience and understand website traffic patterns.</p>
            
            <h2>Contact Form</h2>
            <p>If you use the contact form, your message and email address will be used solely to respond to your inquiry and will not be shared with third parties.</p>
            
            <h2>Cookies</h2>
            <p>This website may use cookies to enhance user experience and remember your theme preferences.</p>
            
            <h2>Contact Information</h2>
            <p>If you have any questions about this Privacy Policy, please contact us through the contact form on this website.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
