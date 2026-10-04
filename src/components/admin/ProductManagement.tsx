"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPKR } from "@/lib/format";
import { saveProductAction, deleteProductAction } from "@/actions/admin";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Upload,
  Check,
  Loader2,
  Box,
  Star,
  ExternalLink,
  Image as ImageIcon,
  ArrowUp,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Shield,
  Eye,
} from "lucide-react";

interface ProductManagementProps {
  initialProducts: Product[];
}

const LUXURY_IMAGE_PRESETS = [
  {
    name: "Classic Gold & Tan Leather",
    url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80",
  },
  {
    name: "Minimalist Black Mesh",
    url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80",
  },
  {
    name: "Rose Gold Chrono",
    url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
  },
  {
    name: "Sport Steel Chronograph",
    url: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80",
  },
  {
    name: "Emerald Green Dial",
    url: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80",
  },
  {
    name: "Prestige Skeleton Automatic",
    url: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80",
  },
  {
    name: "Vintage Navy Leather",
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
  },
  {
    name: "Matte Black Diver",
    url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
  },
];

const CATEGORY_OPTIONS = [
  "Classic",
  "Sport",
  "Minimal",
  "Luxe",
  "Gifting",
  "Luxury",
  "Minimalist",
  "Sports",
  "Women",
];

export function ProductManagement({ initialProducts }: ProductManagementProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showPresetsDrawer, setShowPresetsDrawer] = useState(false);

  // Form states for modal
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState<number>(18500);
  const [formDiscount, setFormDiscount] = useState<number | null>(null);
  const [formCategory, setFormCategory] = useState("Classic");
  const [formStock, setFormStock] = useState<number>(15);
  const [formFeatured, setFormFeatured] = useState<boolean>(true);
  const [formImages, setFormImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");

  // 3D Colors
  const [caseColor, setCaseColor] = useState("#C6A15B");
  const [dialColor, setDialColor] = useState("#0B0B0F");
  const [strapColor, setStrapColor] = useState("#2C1810");
  const [accentsColor, setAccentsColor] = useState("#C6A15B");

  // Specs
  const [caseSize, setCaseSize] = useState("41mm");
  const [movement, setMovement] = useState("Precision Japanese Quartz");
  const [strap, setStrap] = useState("Genuine Calfskin Leather");
  const [waterResistance, setWaterResistance] = useState("5 ATM (50m)");
  const [warranty, setWarranty] = useState("1-Year Official Warranty");

  const openEditModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormName(product.name);
      setFormSlug(product.slug);
      setFormDesc(product.description || "");
      setFormPrice(product.price);
      setFormDiscount(product.discount_price ?? null);
      setFormCategory(product.category || "Classic");
      setFormStock(product.stock ?? 10);
      setFormFeatured(Boolean(product.featured));
      setFormImages(product.images && product.images.length > 0 ? product.images : [
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80"
      ]);
      setCaseColor(product.model_config?.case_color || "#C6A15B");
      setDialColor(product.model_config?.dial_color || "#0B0B0F");
      setStrapColor(product.model_config?.strap_color || "#2C1810");
      setAccentsColor(product.model_config?.accents || "#C6A15B");
      setCaseSize(product.specs?.case_size || "41mm");
      setMovement(product.specs?.movement || "Precision Japanese Quartz");
      setStrap(product.specs?.strap || "Genuine Calfskin Leather");
      setWaterResistance(product.specs?.water_resistance || "5 ATM");
      setWarranty(product.specs?.warranty || "1-Year Official Warranty");
    } else {
      setEditingProduct({});
      setFormName("");
      setFormSlug("");
      setFormDesc("Handcrafted with architectural precision, featuring sapphire glass and a premium strap.");
      setFormPrice(18500);
      setFormDiscount(null);
      setFormCategory("Classic");
      setFormStock(15);
      setFormFeatured(true);
      setFormImages([
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80",
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80"
      ]);
      setCaseColor("#C6A15B");
      setDialColor("#0B0B0F");
      setStrapColor("#2C1810");
      setAccentsColor("#C6A15B");
      setCaseSize("41mm");
      setMovement("Precision Japanese Quartz");
      setStrap("Genuine Italian Leather");
      setWaterResistance("5 ATM");
      setWarranty("1-Year Official Warranty");
    }
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingProduct?.id) {
      setFormSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  const handleAddImage = () => {
    const trimmed = imageInput.trim();
    if (trimmed) {
      if (!formImages.includes(trimmed)) {
        setFormImages([...formImages, trimmed]);
      }
      setImageInput("");
    }
  };

  const handleAddPresetImage = (url: string) => {
    if (!formImages.includes(url)) {
      setFormImages([...formImages, url]);
      setActionMessage("Photo added to timepiece gallery.");
      setTimeout(() => setActionMessage(null), 2500);
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    const item = formImages[index];
    const remaining = formImages.filter((_, i) => i !== index);
    setFormImages([item, ...remaining]);
  };

  const handleMoveImage = (from: number, to: number) => {
    if (to < 0 || to >= formImages.length) return;
    const updated = [...formImages];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setFormImages(updated);
  };

  const handleRemoveImage = (index: number) => {
    setFormImages(formImages.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormImages((prev) => [...prev, dataUrl]);
        setActionMessage("Photo uploaded successfully.");
        setTimeout(() => setActionMessage(null), 2500);
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert("Failed to read image file.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Please provide a name for this timepiece.");
      return;
    }

    setIsSaving(true);

    const payload = {
      id: editingProduct?.id,
      name: formName.trim(),
      slug: (formSlug || formName).trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-"),
      description: formDesc.trim(),
      price: Number(formPrice),
      discount_price: formDiscount ? Number(formDiscount) : null,
      category: formCategory,
      images: formImages.length > 0 ? formImages : ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80"],
      stock: Number(formStock),
      featured: Boolean(formFeatured),
      specs: {
        case_size: caseSize,
        movement: movement,
        strap: strap,
        water_resistance: waterResistance,
        warranty: warranty,
        glass: "Scratch-Resistant Sapphire Crystal",
      },
      model_config: {
        case_color: caseColor,
        dial_color: dialColor,
        strap_color: strapColor,
        accents: accentsColor,
      },
    };

    const res = await saveProductAction(payload);
    if (res.success && res.product) {
      setActionMessage(`"${res.product.name}" has been saved and synced to the live storefront!`);
      setTimeout(() => setActionMessage(null), 4500);

      // Instant state update
      setProducts((prev) => {
        const exists = prev.some((p) => p.id === res.product.id || p.slug === res.product.slug);
        if (exists) {
          return prev.map((p) => (p.id === res.product.id || p.slug === res.product.slug ? res.product : p));
        }
        return [res.product, ...prev];
      });

      setEditingProduct(null);
    } else {
      alert("Failed to save product: " + (res.error || "Unknown error"));
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string, slug: string, name: string) => {
    if (!confirm(`Are you sure you wish to delete "${name}" from the catalog? This will remove it from the store.`)) {
      return;
    }
    const res = await deleteProductAction(id, slug);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id && p.slug !== slug));
      setActionMessage(`"${name}" was deleted from the catalog.`);
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      alert("Failed to delete product: " + res.error);
    }
  };

  const filtered = products.filter((p) => {
    const matchesCategory =
      categoryFilter === "All" ||
      (p?.category || "").toLowerCase() === categoryFilter.toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (p?.name || "").toLowerCase().includes(q) ||
      (p?.slug || "").toLowerCase().includes(q) ||
      (p?.category || "").toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Alert banner */}
      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2.5 animate-in fade-in">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C6A15B]">
              Horological Catalog &amp; Inventory
            </span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-serif text-[#F5F1E8]">
            Product Management
          </h1>
          <p className="text-xs text-[#F5F1E8]/50 mt-1">
            Change watch pictures, edit names, update pricing &amp; introduce new timepieces.
          </p>
        </div>

        <button
          onClick={() => openEditModal()}
          className="px-5 py-2.5 rounded-xl bg-[#C6A15B] hover:bg-[#dfc299] text-[#0B0B0F] font-mono text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Timepiece</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#14151B] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {["All", "Classic", "Sport", "Minimal", "Luxe", "Gifting"].map((cat) => {
            const isSelected = categoryFilter.toLowerCase() === cat.toLowerCase();
            const count =
              cat === "All"
                ? products.length
                : products.filter((p) => (p.category || "").toLowerCase() === cat.toLowerCase()).length;

            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#C6A15B] text-[#0B0B0F] font-semibold shadow-sm"
                    : "bg-[#0E0F13] text-[#F5F1E8]/70 hover:text-white border border-white/5"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-black/20 text-[#0B0B0F]" : "bg-white/10 text-[#F5F1E8]/60"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#F5F1E8]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search timepiece by model, slug, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0E0F13] border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-[#F5F1E8] placeholder:text-[#F5F1E8]/30 focus:outline-none focus:border-[#C6A15B]"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl bg-[#14151B] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#0E0F13]/70 text-[#F5F1E8]/50 uppercase font-mono text-[10px]">
                <th className="py-3.5 px-5">Timepiece</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price (PKR)</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Photos</th>
                <th className="py-3.5 px-4">Homepage</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((product) => {
                const img = product.images?.[0] || "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80";
                const totalPhotos = product.images?.length || 0;

                return (
                  <tr key={product.id || product.slug} className="hover:bg-white/[0.02] transition-colors">
                    {/* Watch Preview */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                          <Image
                            src={img}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <span className="font-serif text-sm text-[#F5F1E8] block font-medium">
                            {product.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#F5F1E8]/40 block">
                            /{product.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#C6A15B]/10 border border-[#C6A15B]/20 font-mono text-[10px] text-[#C6A15B] font-medium">
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 font-mono font-medium text-[#F5F1E8] whitespace-nowrap">
                      {formatPKR(product.price)}
                    </td>

                    {/* Discount */}
                    <td className="py-4 px-4 font-mono text-[#F5F1E8]/70 whitespace-nowrap">
                      {product.discount_price ? (
                        <span className="text-emerald-400">{formatPKR(product.discount_price)}</span>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] whitespace-nowrap ${
                          product.stock <= 0
                            ? "bg-red-500/10 text-red-300 border border-red-500/20"
                            : product.stock < 10
                            ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>

                    {/* Photos Count */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 font-mono text-[10px] text-[#F5F1E8]/60">
                        <ImageIcon className="w-3 h-3" />
                        {totalPhotos} {totalPhotos === 1 ? "photo" : "photos"}
                      </span>
                    </td>

                    {/* Featured */}
                    <td className="py-4 px-4">
                      {product.featured ? (
                        <div className="flex items-center gap-1 text-[#C6A15B]">
                          <Star className="w-3.5 h-3.5 fill-[#C6A15B]" />
                          <span className="text-[10px] font-mono">Spotlight</span>
                        </div>
                      ) : (
                        <span className="text-[#F5F1E8]/20 text-[10px] font-mono">Standard</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/watches/${product.slug}`}
                        target="_blank"
                        className="inline-flex p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#F5F1E8]/60 hover:text-white transition-colors"
                        title="View on Live Storefront"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => openEditModal(product)}
                        className="inline-flex p-1.5 rounded-lg bg-[#C6A15B]/10 hover:bg-[#C6A15B] text-[#C6A15B] hover:text-[#0B0B0F] transition-colors"
                        title="Edit Watch Details & Pictures"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(product.id, product.slug, product.name)}
                        className="inline-flex p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete Timepiece"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {editingProduct !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#14151B] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C6A15B]">
                  {editingProduct.id ? "Edit Timepiece Dossier" : "Catalog Creator"}
                </span>
                <h3 className="font-serif text-2xl text-[#F5F1E8] mt-0.5">
                  {editingProduct.id ? `Edit: ${formName || "Timepiece"}` : "Create New Timepiece"}
                </h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#F5F1E8]/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6 text-xs">
              {/* Product Pictures Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0E0F13] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#C6A15B]" />
                    <label className="font-mono text-xs uppercase tracking-wider text-[#F5F1E8] font-semibold">
                      Product Pictures ({formImages.length})
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPresetsDrawer(!showPresetsDrawer)}
                    className="text-[11px] font-mono text-[#C6A15B] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{showPresetsDrawer ? "Hide Presets" : "Luxury Watch Photo Presets"}</span>
                  </button>
                </div>

                {/* Preset Luxury Photos Drawer */}
                {showPresetsDrawer && (
                  <div className="p-3 rounded-xl bg-[#14151B] border border-[#C6A15B]/30 space-y-2 animate-in fade-in">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#C6A15B] block">
                      Click any photo below to instantly add it to this watch:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {LUXURY_IMAGE_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddPresetImage(preset.url)}
                          className="group relative h-20 rounded-lg overflow-hidden border border-white/10 hover:border-[#C6A15B] text-left transition-all"
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                            <span className="text-[9px] font-mono text-white/90 truncate">
                              {preset.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Photo Input & Upload */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL (https://...)..."
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImage();
                      }
                    }}
                    className="flex-1 bg-[#14151B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#F5F1E8] placeholder:text-[#F5F1E8]/30 focus:outline-none focus:border-[#C6A15B]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-medium transition-colors"
                    >
                      Add URL
                    </button>
                    <label className="px-4 py-2.5 rounded-xl bg-[#16161D] border border-white/10 hover:border-[#C6A15B] cursor-pointer flex items-center gap-1.5 text-xs font-mono font-medium transition-colors">
                      {isUploading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C6A15B]" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-[#C6A15B]" />
                      )}
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Current Photos Grid */}
                {formImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {formImages.map((img, i) => (
                      <div
                        key={i}
                        className={`relative rounded-xl overflow-hidden border group bg-black/40 aspect-square flex flex-col justify-between p-1.5 ${
                          i === 0 ? "border-[#C6A15B] ring-1 ring-[#C6A15B]/50" : "border-white/10"
                        }`}
                      >
                        <img
                          src={img}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                        />

                        {/* Top Badge: Cover or Reorder */}
                        <div className="relative z-10 flex items-center justify-between">
                          {i === 0 ? (
                            <span className="px-2 py-0.5 rounded bg-[#C6A15B] text-[#0B0B0F] font-mono text-[9px] font-bold tracking-wider uppercase shadow-md">
                              Primary Cover
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(i)}
                              className="px-2 py-0.5 rounded bg-black/70 hover:bg-[#C6A15B] text-white hover:text-black font-mono text-[9px] tracking-wider transition-colors backdrop-blur-sm"
                            >
                              Make Cover
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(i)}
                            className="p-1 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                            title="Remove Photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Bottom Reorder arrows */}
                        <div className="relative z-10 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 rounded-lg p-1 backdrop-blur-sm">
                          <button
                            type="button"
                            disabled={i === 0}
                            onClick={() => handleMoveImage(i, i - 1)}
                            className="p-1 text-white hover:text-[#C6A15B] disabled:opacity-30"
                            title="Move Left"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] font-mono text-white/70">
                            #{i + 1}
                          </span>
                          <button
                            type="button"
                            disabled={i === formImages.length - 1}
                            onClick={() => handleMoveImage(i, i + 1)}
                            className="p-1 text-white hover:text-[#C6A15B] disabled:opacity-30"
                            title="Move Right"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-[#F5F1E8]/40 border border-dashed border-white/10 rounded-xl">
                    No images added yet. Click &quot;Luxury Watch Photo Presets&quot; or upload a file.
                  </div>
                )}
              </div>

              {/* Product Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#F5F1E8]/70 mb-1 font-mono">Watch Model Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Aurelian Classic"
                    className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div>
                  <label className="block text-[#F5F1E8]/70 mb-1 font-mono">Storefront Slug *</label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. aurelian-classic"
                    className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F5F1E8] font-mono focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#F5F1E8]/70 mb-1 font-mono">Short Description</label>
                <textarea
                  required
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describes the silhouette, dial aesthetics, strap and craftsmanship..."
                  className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              {/* Pricing, Category & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[#F5F1E8]/70 mb-1 font-mono">Regular Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={100}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F5F1E8] font-mono focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div>
                  <label className="block text-[#F5F1E8]/70 mb-1 font-mono">Discount Price (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={formDiscount ?? ""}
                    onChange={(e) => setFormDiscount(e.target.value ? Number(e.target.value) : null)}
                    placeholder="Optional"
                    className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F5F1E8] font-mono focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div>
                  <label className="block text-[#F5F1E8]/70 mb-1 font-mono">Collection Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#F5F1E8]/70 mb-1 font-mono">Inventory Stock *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full bg-[#0E0F13] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#F5F1E8] font-mono focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="p-4 rounded-2xl bg-[#0E0F13] border border-white/5 space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C6A15B] block font-semibold">
                  Technical Specifications
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#F5F1E8]/60 mb-1 font-mono">Case Size</label>
                    <input
                      type="text"
                      value={caseSize}
                      onChange={(e) => setCaseSize(e.target.value)}
                      placeholder="e.g. 41mm"
                      className="w-full bg-[#14151B] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#F5F1E8]/60 mb-1 font-mono">Movement</label>
                    <input
                      type="text"
                      value={movement}
                      onChange={(e) => setMovement(e.target.value)}
                      placeholder="e.g. Precision Quartz"
                      className="w-full bg-[#14151B] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#F5F1E8]/60 mb-1 font-mono">Strap Material</label>
                    <input
                      type="text"
                      value={strap}
                      onChange={(e) => setStrap(e.target.value)}
                      placeholder="e.g. Italian Leather"
                      className="w-full bg-[#14151B] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#F5F1E8]/60 mb-1 font-mono">Water Resistance</label>
                    <input
                      type="text"
                      value={waterResistance}
                      onChange={(e) => setWaterResistance(e.target.value)}
                      placeholder="e.g. 5 ATM"
                      className="w-full bg-[#14151B] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#F5F1E8]/60 mb-1 font-mono">Official Warranty</label>
                    <input
                      type="text"
                      value={warranty}
                      onChange={(e) => setWarranty(e.target.value)}
                      placeholder="e.g. 1-Year Official"
                      className="w-full bg-[#14151B] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>
                </div>
              </div>

              {/* 3D Color Configurator */}
              <div className="p-4 rounded-2xl bg-[#0E0F13] border border-white/5 space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C6A15B] flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5" />
                  Procedural 3D Material Colors
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] text-[#F5F1E8]/60 mb-1">Case &amp; Bezel</label>
                    <input
                      type="color"
                      value={caseColor}
                      onChange={(e) => setCaseColor(e.target.value)}
                      className="w-full h-9 rounded-lg bg-transparent cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#F5F1E8]/60 mb-1">Dial Face</label>
                    <input
                      type="color"
                      value={dialColor}
                      onChange={(e) => setDialColor(e.target.value)}
                      className="w-full h-9 rounded-lg bg-transparent cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#F5F1E8]/60 mb-1">Strap Material</label>
                    <input
                      type="color"
                      value={strapColor}
                      onChange={(e) => setStrapColor(e.target.value)}
                      className="w-full h-9 rounded-lg bg-transparent cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#F5F1E8]/60 mb-1">Hands &amp; Indices</label>
                    <input
                      type="color"
                      value={accentsColor}
                      onChange={(e) => setAccentsColor(e.target.value)}
                      className="w-full h-9 rounded-lg bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Featured checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="accent-[#C6A15B] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-[#F5F1E8] font-mono">
                  Feature on Homepage Spotlight &amp; Bestsellers
                </span>
              </label>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-[#F5F1E8]/70 hover:text-white font-mono text-xs transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#C6A15B] hover:bg-[#dfc299] text-[#0B0B0F] font-mono text-xs uppercase tracking-wider font-semibold flex items-center gap-2 shadow-md transition-colors"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingProduct.id ? "Save & Sync Watch" : "Add Timepiece to Store"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
