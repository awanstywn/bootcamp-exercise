/**
 * @file AdminProductEditPage.tsx
 * @description Page Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for AdminProductEditPage operations.
 * 
 * @relations
 * Interacts with: react, react-router-dom, ../../lib/apiClient, ../../lib/routes, ../../components/ui/Button.
 * 
 * @howItWorks
 * Renders the main page view, fetches necessary data, and composes smaller child components to build the UI. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../lib/apiClient";
import { API_ROUTES } from "../../lib/routes";
import { Button } from "../../components/ui/Button";
import { ArrowLeft, Upload, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "MEN",
    scentFamily: "WOODY",
    notesTop: "",
    notesHeart: "",
    notesBase: "",
    concentration: "EDP",
    price: "",
    volumeMl: "",
    stock: "",
    status: "ACTIVE",
    description: "",
  });

  useEffect(() => {
    if (!isNew) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await apiClient.get(API_ROUTES.ADMIN.PRODUCT_BY_ID(id!));
      const p = res.data.data.product;
      setFormData({
        name: p.name,
        brand: p.brand,
        category: p.category,
        scentFamily: p.scentFamily,
        notesTop: p.notesTop,
        notesHeart: p.notesHeart,
        notesBase: p.notesBase,
        concentration: p.concentration,
        price: p.price.toString(),
        volumeMl: p.volumeMl.toString(),
        stock: p.stock.toString(),
        status: p.status,
        description: p.description || "",
      });
      setImages(p.images || []);
    } catch (error) {
      toast.error("Failed to load product");
      navigate("/admin/products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dataToSubmit = {
        ...formData,
        price: parseFloat(formData.price),
        volumeMl: parseInt(formData.volumeMl, 10),
        stock: parseInt(formData.stock, 10),
      };

      if (isNew) {
        // Create new product (multipart form data required if we support direct image upload here)
        // For simplicity, we just submit JSON and require the user to upload images after creation
        const res = await apiClient.post(API_ROUTES.ADMIN.PRODUCTS, dataToSubmit);
        toast.success("Product created! You can now add images.");
        navigate(`/admin/products/${res.data.data.product.id}`);
      } else {
        await apiClient.put(API_ROUTES.ADMIN.PRODUCT_BY_ID(id!), dataToSubmit);
        toast.success("Product updated successfully");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || isNew) return;
    
    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append("images", e.target.files[i]);
    }

    try {
      await apiClient.post(API_ROUTES.ADMIN.PRODUCT_IMAGES(id!), formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Images uploaded successfully");
      fetchProduct(); // reload images
    } catch (error) {
      toast.error("Failed to upload images");
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await apiClient.delete(`${API_ROUTES.ADMIN.PRODUCT_IMAGES(id!)}/${imageId}`);
      toast.success("Image deleted");
      fetchProduct();
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl pb-12">
      <div className="mb-8 flex items-center gap-4">
        <button onClick={() => navigate("/admin/products")} className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isNew ? "New Product" : "Edit Product"}</h1>
        </div>
      </div>

      <div className="space-y-8">
        
        <form id="product-form" onSubmit={handleSubmit} className="bg-white shadow-sm rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-black focus:border-black" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input type="text" name="brand" required value={formData.brand} onChange={handleChange} className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-black focus:border-black" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-black focus:border-black">
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="sm:col-span-2 grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (IDR)</label>
                <input type="number" name="price" required min="0" step="1000" value={formData.price} onChange={handleChange} className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-black focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volume (ml)</label>
                <input type="number" name="volumeMl" required min="1" value={formData.volumeMl} onChange={handleChange} className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-black focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input type="number" name="stock" required min="0" value={formData.stock} onChange={handleChange} className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-black focus:border-black" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-black focus:border-black">
                <option value="MEN">Men</option>
                <option value="WOMEN">Women</option>
                <option value="UNISEX">Unisex</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scent Family</label>
              <select name="scentFamily" value={formData.scentFamily} onChange={handleChange} className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-black focus:border-black">
                <option value="FLORAL">Floral</option>
                <option value="WOODY">Woody</option>
                <option value="FRESH">Fresh</option>
                <option value="ORIENTAL">Oriental</option>
                <option value="CITRUS">Citrus</option>
                <option value="GOURMAND">Gourmand</option>
                <option value="AQUATIC">Aquatic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Concentration</label>
              <select name="concentration" value={formData.concentration} onChange={handleChange} className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-black focus:border-black">
                <option value="EDP">Eau de Parfum (EDP)</option>
                <option value="EDT">Eau de Toilette (EDT)</option>
                <option value="PARFUM">Parfum</option>
                <option value="EDC">Eau de Cologne (EDC)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Top Notes (comma separated)</label>
              <input type="text" name="notesTop" required value={formData.notesTop} onChange={handleChange} placeholder="e.g. Bergamot, Lemon, Apple" className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-black focus:border-black" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Heart Notes (comma separated)</label>
              <input type="text" name="notesHeart" required value={formData.notesHeart} onChange={handleChange} placeholder="e.g. Jasmine, Rose, Lavender" className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-black focus:border-black" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Notes (comma separated)</label>
              <input type="text" name="notesBase" required value={formData.notesBase} onChange={handleChange} placeholder="e.g. Vanilla, Musk, Sandalwood" className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-black focus:border-black" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-black focus:border-black resize-none"></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button type="submit" isLoading={isSaving}>{isNew ? "Create Product" : "Save Changes"}</Button>
          </div>
        </form>

        {!isNew && (
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                  <Upload size={16} /> Upload Images
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            {images.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">No images uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden group">
                    <img src={img.url} alt="Product" className="w-full h-full object-contain p-2 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => handleDeleteImage(img.id)}
                        className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
