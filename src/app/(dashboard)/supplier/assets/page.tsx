"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSellerAssets, useDeleteSellerAsset } from "@/hooks/use-seller-assets";
import type { SellerAsset } from "@/types/seller-asset";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  PAUSED: "bg-orange-100 text-orange-800",
  ARCHIVED: "bg-red-100 text-red-800",
};

export default function SellerAssetsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSellerAssets({
    q: search || undefined,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
    page,
  });

  const deleteMutation = useDeleteSellerAsset();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Asset deleted");
      },
    });
  };

  const columns: ColumnDef<SellerAsset, any>[] = [
    {
      accessorKey: "images",
      header: "Thumbnail",
      cell: ({ row }) => {
        const images = row.original.images;
        const thumb = Array.isArray(images) ? images.find((i: any) => i.isThumbnail) || images[0] : null;
        return thumb ? (
          <img src={thumb.url} alt="" className="h-10 w-10 rounded object-cover" />
        ) : (
          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">N/A</div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <Link href={`/supplier/assets/${row.original.id}`} className="font-medium hover:underline">
          {row.original.title}
        </Link>
      ),
    },
    {
      accessorKey: "mediaType",
      header: "Type",
      cell: ({ row }) => row.original.mediaType || "—",
    },
    {
      accessorKey: "locationCity",
      header: "City",
      cell: ({ row }) => row.original.locationCity || "—",
    },
    {
      accessorKey: "assetStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.assetStatus;
        return <Badge className={STATUS_COLORS[status] || ""}>{status}</Badge>;
      },
    },
    {
      accessorKey: "basePrice",
      header: "Base Price",
      cell: ({ row }) => {
        const price = row.original.basePrice;
        const currency = row.original.currency || "SAR";
        return price ? `${currency} ${price.toLocaleString()}` : "—";
      },
    },
    {
      accessorKey: "dailyImpressions",
      header: "Daily Impressions",
      cell: ({ row }) => row.original.dailyImpressions?.toLocaleString() || "—",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/supplier/assets/${row.original.id}`)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => {
              if (window.confirm("Delete this asset? This can be undone later.")) {
                handleDelete(row.original.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Assets</h1>
          <p className="text-muted-foreground">Manage your media assets</p>
        </div>
        <Button asChild>
          <Link href="/supplier/assets/new">
            <Plus className="h-4 w-4 mr-2" />
            New Asset
          </Link>
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="OUTDOOR">Outdoor</SelectItem>
            <SelectItem value="ONLINE">Online</SelectItem>
            <SelectItem value="TV">TV</SelectItem>
            <SelectItem value="RADIO">Radio</SelectItem>
            <SelectItem value="PRINT">Print</SelectItem>
            <SelectItem value="CINEMA">Cinema</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data || []}
          searchKey="title"
          searchPlaceholder="Search assets..."
        />
      )}
    </div>
  );
}
