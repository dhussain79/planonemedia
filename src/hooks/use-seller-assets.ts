"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SellerAssetsResponse } from "@/types/seller-asset";

export function useSellerAssets(filters: {
  q?: string;
  type?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.type) params.set("type", filters.type);
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

  return useQuery<SellerAssetsResponse>({
    queryKey: ["seller-assets", filters],
    queryFn: async () => {
      const res = await fetch(`/api/supplier/assets?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch assets");
      return res.json();
    },
  });
}

export function useSellerAsset(id: string) {
  return useQuery({
    queryKey: ["seller-asset", id],
    queryFn: async () => {
      const res = await fetch(`/api/supplier/assets/${id}`);
      if (!res.ok) throw new Error("Failed to fetch asset");
      const json = await res.json();
      return json.data;
    },
    enabled: !!id,
  });
}

export function useCreateSellerAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await fetch("/api/supplier/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create asset");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-assets"] });
      toast.success("Asset created successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useUpdateSellerAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      const res = await fetch(`/api/supplier/assets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update asset");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-assets"] });
      toast.success("Asset updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useDeleteSellerAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/supplier/assets/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete asset");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-assets"] });
      toast.success("Asset deleted successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
