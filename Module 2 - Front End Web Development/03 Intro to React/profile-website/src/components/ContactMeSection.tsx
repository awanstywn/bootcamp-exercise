/**
 * ContactMeSection Component
 *
 * Provides contact information and a contact form:
 * - Email and LinkedIn contact cards with icons
 * - Contact form (Name, Email, Message fields)
 * - Form submission opens email client with pre-filled data
 * - Footer with copyright
 *
 * Features:
 * - Two-column layout on desktop (contact info + form)
 * - Single column on mobile
 * - Form validation (required fields)
 * - Interactive hover effects on contact cards
 * - Font Awesome icon for LinkedIn
 */

import { useState } from 'react'

interface ContactMeSectionProps {
  email?: string;
  linkedin?: string;
}

export function ContactMeSection({
  email,
  linkedin
}: ContactMeSectionProps) {
  // Form state management - stores user input
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  /**
   * Handles form submission
   * Currently opens email client with pre-filled subject and body
   * In production, this would send data to a backend API
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // TODO: Send form data to backend API
    console.log('Form submitted:', formData)
    // Opens email client with pre-filled information
    window.location.href = `mailto:${email}?subject=Contact from ${formData.name}&body=${encodeURIComponent(formData.message)}`
  }

  /**
   * Handles input field changes
   * Updates form state when user types
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section id="contact" className="flex flex-col items-center justify-center min-h-fit bg-gray-950 text-white py-12 md:py-16 px-6 sm:px-8 md:px-12 lg:px-4">
      <div className="max-w-6xl w-full">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-3">Get In Touch</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">Contact Me</h2>
        </div>

        {/* Two-column Grid: Contact Info (left) + Form (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 mb-12 md:mb-16">
          {/* Contact Info Column - 2/5 width on large screens */}
          <div className="lg:col-span-2 space-y-4">
            {/* Email Contact Card */}
            {email && (
              <a
                href={`mailto:${email}`}
                className="group flex items-center p-4 md:p-5 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-600 transition-all duration-300"
              >
                {/* Email Icon */}
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mr-4 group-hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                  <p className="text-sm text-gray-300 group-hover:text-white transition-colors break-all">{email}</p>
                </div>
              </a>
            )}

            {/* LinkedIn Contact Card */}
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit my LinkedIn profile"
                className="group flex items-center p-4 md:p-5 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-600 transition-all duration-300"
              >
                {/* LinkedIn Icon - Using Font Awesome */}
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mr-4 group-hover:bg-gray-700 transition-colors">
                  <i className="fa fa-linkedin text-gray-400 group-hover:text-white transition-colors" style={{fontSize: '20px'}}></i>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">LinkedIn</p>
                  <p className="text-sm text-gray-300 group-hover:text-white transition-colors">Connect with me</p>
                </div>
              </a>
            )}
          </div>

          {/* Contact Form Column - 3/5 width on large screens */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name and Email Inputs - Side by side on tablet+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs text-gray-400 uppercase tracking-wide mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors text-sm"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs text-gray-400 uppercase tracking-wide mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors text-sm"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Message Textarea - Full width */}
              <div>
                <label htmlFor="message" className="block text-xs text-gray-400 uppercase tracking-wide mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors resize-none text-sm"
                  placeholder="Tell me about your project, timeline, or how I can help."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition-all duration-300"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-600 text-sm px-4">
          <p>© {new Date().getFullYear()} Aries Setiawan. All rights reserved.</p>
        </footer>
      </div>
    </section>
  )
}
