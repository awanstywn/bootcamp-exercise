/**
 * @file useAddresses.ts
 * @description Custom React Hook for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for useAddresses operations.
 * 
 * @relations
 * Interacts with: react, ../lib/apiClient, react-hot-toast.
 * 
 * @howItWorks
 * Executes core logic by exporting necessary functions, hooks, or components. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { useState, useEffect } from "react";
import apiClient from "../lib/apiClient";
import toast from "react-hot-toast";

export interface Address {
  id: string;
  title: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/users/addresses");
      setAddresses(res.data.data.addresses);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch addresses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const addAddress = async (data: Omit<Address, "id" | "isDefault">) => {
    try {
      await apiClient.post("/users/addresses", data);
      toast.success("Address added successfully");
      await fetchAddresses();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add address");
      return false;
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await apiClient.delete(`/users/addresses/${id}`);
      toast.success("Address deleted");
      await fetchAddresses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete address");
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      await apiClient.put(`/users/addresses/${id}/default`);
      toast.success("Default address updated");
      await fetchAddresses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to set default address");
    }
  };

  return {
    addresses,
    isLoading,
    addAddress,
    deleteAddress,
    setDefaultAddress,
    refresh: fetchAddresses,
  };
}
