/**
 * @file AdminSettingsPage.tsx
 * @description Page Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for AdminSettingsPage operations.
 * 
 * @relations
 * Interacts with: react, ../../lib/apiClient, ../../lib/routes, ../../components/ui/Button, react-hot-toast.
 * 
 * @howItWorks
 * Renders the main page view, fetches necessary data, and composes smaller child components to build the UI. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { useState, useEffect } from "react";
import apiClient from "../../lib/apiClient";
import { API_ROUTES } from "../../lib/routes";
import { Button } from "../../components/ui/Button";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    bankName: "",
    bankAccountName: "",
    bankAccountNo: "",
    whatsappNumber: "",
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await apiClient.get(API_ROUTES.SETTINGS.GET);
        const settings = res.data.data.settings;
        setFormData({
          bankName: settings.bankName || "",
          bankAccountName: settings.bankAccountName || "",
          bankAccountNo: settings.bankAccountNo || "",
          whatsappNumber: settings.whatsappNumber || "",
        });
      } catch (error) {
        toast.error("Failed to fetch settings");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.put(API_ROUTES.ADMIN.SETTINGS, formData);
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Configure your payment details and contact information.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bank Account Details</h2>
          <p className="text-sm text-gray-500 mb-4">
            These details will be shown to customers at checkout for manual bank transfers.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input 
                type="text" 
                name="bankName" 
                value={formData.bankName} 
                onChange={handleChange} 
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-black focus:border-black" 
                placeholder="e.g. BCA, Mandiri, BNI"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
              <input 
                type="text" 
                name="bankAccountName" 
                value={formData.bankAccountName} 
                onChange={handleChange} 
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-black focus:border-black" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input 
                type="text" 
                name="bankAccountNo" 
                value={formData.bankAccountNo} 
                onChange={handleChange} 
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-black focus:border-black" 
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              <p className="text-xs text-gray-500 mb-2">Include country code without the '+' sign (e.g. 628123456789)</p>
              <input 
                type="text" 
                name="whatsappNumber" 
                value={formData.whatsappNumber} 
                onChange={handleChange} 
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-black focus:border-black" 
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 flex justify-end">
          <Button type="submit" isLoading={isSaving}>Save Settings</Button>
        </div>
      </form>
    </div>
  );
}
