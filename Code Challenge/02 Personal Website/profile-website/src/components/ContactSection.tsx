/**
 * ContactSection.tsx — Contact Form & Social Links
 *
 * Contact form with mailto handler.
 * Neo-Brutalist form fields with thick borders.
 */

import { useState } from "react";
import { Send, Mail } from "lucide-react";
import type { ContactInfo } from "../types";

// Brand icons not available in lucide-react — using inline SVGs
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);


interface ContactSectionProps {
  contact: ContactInfo;
}

export function ContactSection({ contact }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    
    if (!accessKey) {
      console.error("Web3Forms Access Key is missing in .env");
      setStatus("error");
      return;
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          ...formData,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setStatus("error");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const socialLinks = [
    {
      label: "Email",
      href: `mailto:${contact.email}`,
      icon: <Mail size={16} />,
      value: contact.email,
    },
    {
      label: "LinkedIn",
      href: contact.linkedin,
      icon: <LinkedinIcon />,
      value: "Connect on LinkedIn",
    },
    {
      label: "GitHub",
      href: contact.github,
      icon: <GithubIcon />,
      value: "View on GitHub",
    },
  ];

  return (
    <section
      id="contact"
      className="below-fold py-16 md:py-24 px-4 sm:px-6 md:px-8"
      style={{ background: "var(--color-bg-card)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-12">
          <p className="section-label">Get In Touch</p>
          <h2 className="section-title">Contact</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Contact Info — 2/5 */}
          <div className="lg:col-span-2 space-y-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.label !== "Email" ? "_blank" : undefined}
                rel={link.label !== "Email" ? "noopener noreferrer" : undefined}
                className="card-brutal flex items-center gap-4 group"
                aria-label={`${link.label}: ${link.value}`}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center border-2 border-border group-hover:bg-accent transition-colors"
                  style={{ background: "var(--color-bg-primary)" }}
                >
                  {link.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[10px] uppercase tracking-wider mb-0.5"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
                  >
                    {link.label}
                  </p>
                  <p
                    className="text-xs font-bold truncate"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {link.value}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {/* Contact Form — 3/5 */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="card-brutal">
              <h3
                className="text-sm font-bold uppercase tracking-wider mb-6"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Send Message
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Name */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-[10px] uppercase tracking-wider mb-2 font-bold"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Name <span style={{ color: "var(--color-accent)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={status === "submitting"}
                    placeholder="Your name"
                    className="w-full px-4 py-3 border-2 border-border bg-transparent text-sm focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                    style={{ fontFamily: "var(--font-mono)" }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-[10px] uppercase tracking-wider mb-2 font-bold"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Email <span style={{ color: "var(--color-accent)" }}>*</span>
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={status === "submitting"}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border-2 border-border bg-transparent text-sm focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                    style={{ fontFamily: "var(--font-mono)" }}
                  />
                </div>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label
                  htmlFor="contact-message"
                  className="block text-[10px] uppercase tracking-wider mb-2 font-bold"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Message <span style={{ color: "var(--color-accent)" }}>*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  disabled={status === "submitting"}
                  placeholder="Tell me about your project..."
                  className="w-full px-4 py-3 border-2 border-border bg-transparent text-sm focus:outline-none focus:border-accent transition-colors resize-none disabled:opacity-50"
                  style={{ fontFamily: "var(--font-mono)" }}
                />
              </div>

              {status === "success" && (
                <div className="mb-4 p-3 bg-green-100 border-2 border-green-500 text-green-800 text-xs font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                  Message sent successfully! I'll get back to you soon.
                </div>
              )}
              {status === "error" && (
                <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-800 text-xs font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                  Failed to send message. Please try again or email directly. Ensure Web3Forms access key is configured.
                </div>
              )}

              {/* Submit */}
              <button 
                type="submit" 
                disabled={status === "submitting"}
                className="btn-accent w-full justify-center disabled:opacity-75 disabled:cursor-not-allowed" 
                id="contact-submit-btn"
              >
                <Send size={14} />
                {status === "submitting" ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
