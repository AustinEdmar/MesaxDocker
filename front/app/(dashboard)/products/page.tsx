"use client"
import { useState, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { AxiosError } from "axios"
import { StatCard } from "@/components/dashboard/StatCard"

// ── Types ──────────────────────────────────────────────────
interface Category {
    id: number
    name: string
}

interface Product {
    id: number
    name: string
    description: string | null
    price: number
    iva: number
    stock: number
    image_url: string | null
    category: Category | null
}

// ── API functions ──────────────────────────────────────────
async function fetchProducts(): Promise<Product[]> {
    const response = await api.get("/products")
    return response.data.data
}

async function fetchCategories(): Promise<Category[]> {
    const response = await api.get("/categories")
    return response.data.data
}

async function createProduct(data: FormData): Promise<Product> {
    const response = await api.post("/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data.data
}

async function updateProduct({ id, data }: { id: number; data: FormData }): Promise<Product> {
    data.append("_method", "PUT")
    const response = await api.post(`/products/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data.data
}

async function deleteProduct(id: number): Promise<void> {
    await api.delete(`/products/${id}`)
}

// ── Helpers ────────────────────────────────────────────────
function fmtPrice(price: number) {
    return "Kz " + price.toLocaleString("pt-AO", { minimumFractionDigits: 2 })
}

function getStockStatus(stock: number): { label: string; className: string } {
    if (stock === 0) return { label: "Esgotado", className: "bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]" }
    if (stock <= 5) return { label: `Baixo (${stock})`, className: "bg-[#FFF7ED] text-[#F97316] border-[#FED7AA]" }
    return { label: `${stock} un`, className: "bg-[#ECFDF5] text-[#059669] border-[#D1FAE5]" }
}

// ── Image Picker ───────────────────────────────────────────
function ImagePicker({
    current,
    preview,
    onChange,
}: {
    current?: string | null
    preview: string | null
    onChange: (file: File) => void
}) {
    const ref = useRef<HTMLInputElement>(null)
    const src = preview ?? current ?? null

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-semibold text-[#78716C]">Imagem do Produto *</label>
            <div
                onClick={() => ref.current?.click()}
                className="relative w-full h-[140px] rounded-[10px] border-2 border-dashed border-[#E7E5E4] hover:border-[#F97316] transition-colors cursor-pointer overflow-hidden bg-[#FAFAF9] flex items-center justify-center"
            >
                {src ? (
                    <>
                        <img
                            src={src}
                            width={300}
                            height={200}
                            alt="preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-[12px] font-semibold">Alterar imagem</span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-[#C4C0BB]">
                        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                        </svg>
                        <span className="text-[12px]">Clique para adicionar imagem</span>
                        <span className="text-[11px]">JPG, PNG, WEBP — máx. 2MB</span>
                    </div>
                )}
            </div>
            <input
                ref={ref}
                type="file"
                accept="image/jpg,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) onChange(file)
                }}
            />
        </div>
    )
}

// ── Product Card (Grid) ────────────────────────────────────
function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
    const stock = getStockStatus(product.stock)

    return (
        <button
            onClick={onClick}
            className="w-full text-left bg-white rounded-[16px] border-2 border-[#F0EDEB] hover:border-[#F97316] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.09)] cursor-pointer overflow-hidden"
        >
            {/* Image */}
            <div className="w-full h-[120px] bg-[#F5F4F0] flex items-center justify-center overflow-hidden relative">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <svg width="32" height="32" fill="none" stroke="#D6D3D1" strokeWidth="1.5" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                    </svg>
                )}
                {product.stock === 0 && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold bg-[#FEF2F2] text-[#EF4444] px-2 py-[2px] rounded-full border border-[#FECACA]">
                        Esgotado
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <p className="text-[14px] font-bold text-[#1C1917] truncate">{product.name}</p>
                <p className="text-[11px] text-[#A8A29E] mt-[2px] mb-3 truncate">{product.category?.name ?? "—"}</p>
                <div className="flex items-center justify-between">
                    <span className="text-[15px] font-bold text-[#1C1917]">{fmtPrice(product.price)}</span>
                    <span className={`text-[11px] font-semibold px-2 py-[2px] rounded-full border ${stock.className}`}>
                        {stock.label}
                    </span>
                </div>
                <div className="mt-2 pt-2 border-t border-[#F5F4F0] flex justify-between text-[11px] text-[#9CA3AF]">
                    <span>IVA: <strong className="text-[#1C1917]">{product.iva}%</strong></span>
                    <span className="text-[#10B981] font-semibold">Activo</span>
                </div>
            </div>
        </button>
    )
}

// ── Product Form Modal ─────────────────────────────────────
function ProductFormModal({
    product,
    categories,
    onClose,
}: {
    product?: Product | null
    categories: Category[]
    onClose: () => void
}) {
    const queryClient = useQueryClient()
    const isEdit = !!product

    const [name, setName] = useState(product?.name ?? "")
    const [description, setDescription] = useState(product?.description ?? "")
    const [categoryId, setCategoryId] = useState<string>(product?.category?.id?.toString() ?? "")
    const [price, setPrice] = useState(product?.price?.toString() ?? "")
    const [iva, setIva] = useState(product?.iva?.toString() ?? "14")
    const [stock, setStock] = useState(product?.stock?.toString() ?? "")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})

    function handleImageChange(file: File) {
        setImageFile(file)
        setPreview(URL.createObjectURL(file))
    }

    const createMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["products"] }); onClose() },
        onError: (err: AxiosError<{ message?: string }>) => {
            const msg = err?.response?.data?.message ?? "Erro ao criar produto"
            setErrors({ general: msg })
        },
    })

    const updateMutation = useMutation({
        mutationFn: updateProduct,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["products"] }); onClose() },
        onError: (err: AxiosError<{ message?: string }>) => {
            const msg = err?.response?.data?.message ?? "Erro ao actualizar produto"
            setErrors({ general: msg })
        },
    })

    const isPending = createMutation.isPending || updateMutation.isPending

    function validate() {
        const e: Record<string, string> = {}
        if (!name.trim()) e.name = "Nome é obrigatório"
        if (!categoryId) e.category = "Categoria é obrigatória"
        if (!price || isNaN(Number(price)) || Number(price) < 0) e.price = "Preço inválido"
        if (!stock || isNaN(Number(stock)) || Number(stock) < 0) e.stock = "Estoque inválido"
        if (!isEdit && !imageFile) e.image = "Imagem é obrigatória"
        setErrors(e)
        return Object.keys(e).length === 0
    }

    function handleSubmit() {
        if (!validate()) return
        const formData = new FormData()
        formData.append("name", name.trim())
        formData.append("description", description.trim())
        formData.append("category_id", categoryId)
        formData.append("price", price)
        formData.append("iva", iva)
        formData.append("stock", stock)
        if (imageFile) formData.append("image", imageFile)

        if (isEdit && product) {
            updateMutation.mutate({ id: product.id, data: formData })
        } else {
            createMutation.mutate(formData)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(28,25,23,0.55)] backdrop-blur-[2px]"
            style={{ animation: "fadeIn 0.18s ease" }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[18px] w-full max-w-[480px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden max-h-[90vh] flex flex-col"
                style={{ animation: "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)" }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-center justify-between shrink-0">
                    <h3 className="text-[16px] font-bold text-[#1C1917]">
                        {isEdit ? "Editar Produto" : "Novo Produto"}
                    </h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#E7E5E4] text-[#9CA3AF] hover:border-[#EF4444] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-all bg-transparent cursor-pointer">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Form — scrollable */}
                <div className="px-5 py-4 flex flex-col gap-4 overflow-y-auto">

                    {/* General error */}
                    {errors.general && (
                        <div className="text-[12px] text-[#EF4444] bg-[#FEF2F2] border border-[#FECACA] rounded-[8px] px-3 py-2">
                            {errors.general}
                        </div>
                    )}

                    {/* Image */}
                    <div className="flex flex-col gap-1.5">
                        <ImagePicker
                            current={product?.image_url}
                            preview={preview}
                            onChange={handleImageChange}
                        />
                        {errors.image && <span className="text-[11.5px] text-red-500">{errors.image}</span>}
                    </div>

                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12.5px] font-semibold text-[#78716C]">Nome do Produto *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ex: Pho Vietnamita"
                            className={`border rounded-[9px] px-3 py-[9px] text-[13.5px] text-[#1C1917] outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all ${errors.name ? "border-red-400" : "border-[#E7E5E4]"}`}
                        />
                        {errors.name && <span className="text-[11.5px] text-red-500">{errors.name}</span>}
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12.5px] font-semibold text-[#78716C]">Descrição</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Descreva o produto..."
                            rows={3}
                            className="border border-[#E7E5E4] rounded-[9px] px-3 py-[9px] text-[13.5px] text-[#1C1917] outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all resize-none"
                        />
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12.5px] font-semibold text-[#78716C]">Categoria *</label>
                        <select
                            value={categoryId}
                            onChange={e => setCategoryId(e.target.value)}
                            className={`border rounded-[9px] px-3 py-[9px] text-[13.5px] text-[#1C1917] outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all bg-white ${errors.category ? "border-red-400" : "border-[#E7E5E4]"}`}
                        >
                            <option value="">Selecione uma categoria</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {errors.category && <span className="text-[11.5px] text-red-500">{errors.category}</span>}
                    </div>

                    {/* Price + IVA */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12.5px] font-semibold text-[#78716C]">Preço (Kz) *</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                placeholder="0.00"
                                className={`border rounded-[9px] px-3 py-[9px] text-[13.5px] text-[#1C1917] outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all ${errors.price ? "border-red-400" : "border-[#E7E5E4]"}`}
                            />
                            {errors.price && <span className="text-[11.5px] text-red-500">{errors.price}</span>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12.5px] font-semibold text-[#78716C]">IVA (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={iva}
                                onChange={e => setIva(e.target.value)}
                                placeholder="14"
                                className="border border-[#E7E5E4] rounded-[9px] px-3 py-[9px] text-[13.5px] text-[#1C1917] outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all"
                            />
                        </div>
                    </div>

                    {/* Stock */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12.5px] font-semibold text-[#78716C]">Estoque *</label>
                        <input
                            type="number"
                            min="0"
                            value={stock}
                            onChange={e => setStock(e.target.value)}
                            placeholder="0"
                            className={`border rounded-[9px] px-3 py-[9px] text-[13.5px] text-[#1C1917] outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all ${errors.stock ? "border-red-400" : "border-[#E7E5E4]"}`}
                        />
                        {errors.stock && <span className="text-[11.5px] text-red-500">{errors.stock}</span>}
                    </div>
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 flex gap-2 border-t border-[#F5F4F0] pt-4 shrink-0">
                    <button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="flex-1 flex items-center justify-center gap-2 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F97316] text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)] hover:bg-[#EA6C0A] disabled:opacity-50 transition-colors border-none cursor-pointer"
                    >
                        {isPending ? (
                            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25" />
                                <path d="M21 12a9 9 0 01-9 9" />
                            </svg>
                        ) : (
                            <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        )}
                        {isPending ? "Salvando..." : isEdit ? "Salvar Alterações" : "Criar Produto"}
                    </button>
                    <button onClick={onClose} className="flex items-center gap-2 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F5F4F0] text-[#78716C] border border-[#E7E5E4] hover:bg-[#ECEAE7] transition-colors cursor-pointer">
                        Cancelar
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
            `}</style>
        </div>
    )
}

// ── Product Detail Modal ───────────────────────────────────
function ProductDetailModal({
    product,
    onClose,
    onEdit,
}: {
    product: Product
    onClose: () => void
    onEdit: () => void
}) {
    const queryClient = useQueryClient()

    const deleteMutation = useMutation({
        mutationFn: () => deleteProduct(product.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] })
            onClose()
        },
    })

    //const stock = getStockStatus(product.stock)

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(28,25,23,0.55)] backdrop-blur-[2px]"
            style={{ animation: "fadeIn 0.18s ease" }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[18px] w-full max-w-[420px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden"
                style={{ animation: "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)" }}
                onClick={e => e.stopPropagation()}
            >
                {/* Image header */}
                <div className="relative w-full h-[180px] bg-[#F5F4F0] flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                        <svg width="48" height="48" fill="none" stroke="#D6D3D1" strokeWidth="1.5" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                        </svg>
                    )}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 border border-[#E7E5E4] text-[#9CA3AF] hover:border-[#EF4444] hover:text-[#EF4444] transition-all cursor-pointer"
                    >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Info rows */}
                <div className="px-5 py-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                        <span className="text-[12.5px] text-[#A8A29E] font-medium">Nome</span>
                        <span className="text-[13.5px] font-bold text-[#1C1917] text-right">{product.name}</span>
                    </div>
                    {product.description && (
                        <div className="flex items-start justify-between gap-2">
                            <span className="text-[12.5px] text-[#A8A29E] font-medium shrink-0">Descrição</span>
                            <span className="text-[12.5px] text-[#78716C] text-right max-w-[240px]">{product.description}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-[12.5px] text-[#A8A29E] font-medium">Categoria</span>
                        <span className="text-[13.5px] font-semibold text-[#1C1917]">{product.category?.name ?? "—"}</span>
                    </div>
                </div>

                {/* Metric grid */}
                <div className="px-5 pb-4 grid grid-cols-3 gap-3">
                    {[
                        { label: "Preço", value: fmtPrice(product.price), color: "text-[#1C1917]" },
                        { label: "IVA", value: `${product.iva}%`, color: "text-[#F97316]" },
                        { label: "Estoque", value: `${product.stock} un`, color: product.stock === 0 ? "text-[#EF4444]" : product.stock <= 5 ? "text-[#F97316]" : "text-[#10B981]" },
                    ].map((d, i) => (
                        <div key={i} className="bg-[#FAFAF9] rounded-[10px] p-3 text-center border border-[#F0EDEB]">
                            <div className="text-[10.5px] text-[#A8A29E] uppercase tracking-wider mb-1">{d.label}</div>
                            <div className={`text-[13px] font-bold ${d.color}`}>{d.value}</div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 flex gap-2 border-t border-[#F5F4F0] pt-4">
                    <button
                        onClick={onEdit}
                        className="flex-1 flex items-center justify-center gap-2 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F97316] text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)] hover:bg-[#EA6C0A] transition-colors border-none cursor-pointer"
                    >
                        <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Editar
                    </button>
                    <button
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                        className="flex items-center gap-2 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA] hover:bg-[#FEE2E2] disabled:opacity-50 transition-colors cursor-pointer"
                    >
                        {deleteMutation.isPending ? (
                            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25" /><path d="M21 12a9 9 0 01-9 9" />
                            </svg>
                        ) : (
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                            </svg>
                        )}
                        Excluir
                    </button>
                    <button onClick={onClose} className="flex items-center gap-2 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F5F4F0] text-[#78716C] border border-[#E7E5E4] hover:bg-[#ECEAE7] transition-colors cursor-pointer">
                        Fechar
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
            `}</style>
        </div>
    )
}

// ── Page ──────────────────────────────────────────────────
export default function ProductsPage() {
    const [search, setSearch] = useState("")
    const [categoryFilter, setCategoryFilter] = useState<string>("Todos")
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [editingProduct, setEditingProduct] = useState<Product | null | undefined>(undefined)
    const [view, setView] = useState<"grid" | "list">("grid")

    const { data: products = [], isLoading } = useQuery({
        queryKey: ["products"],
        queryFn: fetchProducts,
        staleTime: 5 * 60 * 1000,
    })

    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
        staleTime: 10 * 60 * 1000,
    })

    // Derive unique category names from products
    const categoryNames = ["Todos", ...Array.from(new Set(products.map(p => p.category?.name).filter(Boolean) as string[]))]

    const filtered = products
        .filter(p => categoryFilter === "Todos" || p.category?.name === categoryFilter)
        .filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.description ?? "").toLowerCase().includes(search.toLowerCase())
        )

    const total = products.length
    const available = products.filter(p => p.stock > 0).length
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length
    const outOfStock = products.filter(p => p.stock === 0).length

    const STATS = [
        {
            label: "Total", value: String(total), change: "", up: true,
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>,
            iconColor: "#F97316", iconBg: "#FFF4ED",
        },
        {
            label: "Disponíveis", value: String(available), change: "", up: true,
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>,
            iconColor: "#10B981", iconBg: "#ECFDF5",
        },
        {
            label: "Estoque Baixo", value: String(lowStock), change: "", up: false,
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
            iconColor: "#F97316", iconBg: "#FFF7ED",
        },
        {
            label: "Esgotados", value: String(outOfStock), change: "", up: false,
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
            iconColor: "#EF4444", iconBg: "#FEF2F2",
        },
    ]

    return (
        <div className="flex flex-col gap-5 font-sans min-h-full">

            {/* ── Top bar ── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-[22px] font-bold text-[#1C1917] tracking-tight">Produtos</h1>
                    <p className="text-[13px] text-[#9CA3AF] mt-[2px]">Gestão de produtos, preços e estoque</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* View toggle */}
                    <div className="flex bg-white border border-[#E7E5E4] rounded-[8px] overflow-hidden">
                        {(["grid", "list"] as const).map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-3 py-[7px] flex items-center gap-1.5 text-[12.5px] font-medium transition-colors cursor-pointer border-none ${view === v ? "bg-[#1C1917] text-white" : "bg-transparent text-[#78716C] hover:bg-[#F5F4F0]"}`}
                            >
                                {v === "grid" ? (
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                                ) : (
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                                )}
                                {v === "grid" ? "Grid" : "Lista"}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setEditingProduct(null)}
                        className="flex items-center gap-[6px] text-[12.5px] font-semibold px-4 py-[7px] rounded-[8px] bg-[#F97316] text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)] hover:bg-[#EA6C0A] transition-colors border-none cursor-pointer"
                    >
                        <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Novo Produto
                    </button>
                </div>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-[14px]">
                {STATS.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* ── Products section ── */}
            <div className="bg-white rounded-[14px] border border-[#F0EDEB] overflow-hidden">

                {/* Header + search + filters */}
                <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <h2 className="text-[14px] font-semibold text-[#1C1917]">Lista de Produtos</h2>
                        <p className="text-[12px] text-[#A8A29E] mt-[2px]">
                            {filtered.length} produto{filtered.length !== 1 ? "s" : ""} exibido{filtered.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Category filters */}
                        <div className="flex gap-2 flex-wrap">
                            {categoryNames.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setCategoryFilter(c)}
                                    className={`text-[11.5px] font-medium px-3 py-[4px] rounded-full border transition-all cursor-pointer ${categoryFilter === c
                                        ? "bg-[#1C1917] border-[#1C1917] text-white"
                                        : "bg-white border-[#E7E5E4] text-[#9CA3AF] hover:border-[#D6D3D1]"
                                        }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4C0BB]" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar produto..."
                                className="pl-8 pr-3 py-[6px] text-[12.5px] border border-[#E7E5E4] rounded-[8px] outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all w-[200px] text-[#1C1917]"
                            />
                        </div>
                    </div>
                </div>

                {/* Loading skeleton */}
                {isLoading && (
                    <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="h-[220px] bg-[#F5F4F0] rounded-[16px] animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && filtered.length === 0 && (
                    <div className="p-10 flex flex-col items-center gap-3 text-center">
                        <div className="w-12 h-12 rounded-[14px] bg-[#F5F4F0] flex items-center justify-center">
                            <svg width="22" height="22" fill="none" stroke="#C4C0BB" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                            </svg>
                        </div>
                        <p className="text-[13.5px] font-semibold text-[#78716C]">Nenhum produto encontrado</p>
                        <p className="text-[12px] text-[#A8A29E]">
                            {search ? "Tente outro termo de busca." : "Crie o seu primeiro produto clicando em \"Novo Produto\"."}
                        </p>
                    </div>
                )}

                {/* Grid view */}
                {!isLoading && view === "grid" && filtered.length > 0 && (
                    <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {filtered.map(product => (
                            <ProductCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
                        ))}
                    </div>
                )}

                {/* List view */}
                {!isLoading && view === "list" && filtered.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[650px]">
                            <thead>
                                <tr>
                                    {["Produto", "Categoria", "Preço", "IVA", "Estoque", "Ações"].map(h => (
                                        <th key={h} className="text-[10.5px] font-semibold text-[#C4C0BB] uppercase tracking-wider text-left px-4 py-3 border-b border-[#F5F4F0]">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(product => {
                                    const stock = getStockStatus(product.stock)
                                    return (
                                        <tr
                                            key={product.id}
                                            className="cursor-pointer hover:[&>td]:bg-[#FDFCFC] transition-colors"
                                            onClick={() => setSelectedProduct(product)}
                                        >
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-[8px] overflow-hidden bg-[#F5F4F0] flex items-center justify-center shrink-0">
                                                        {product.image_url ? (
                                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <svg width="16" height="16" fill="none" stroke="#D6D3D1" strokeWidth="1.5" viewBox="0 0 24 24">
                                                                <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="text-[13.5px] font-bold text-[#1C1917]">{product.name}</span>
                                                        <span className="ml-2 text-[11.5px] text-[#C4C0BB]">#{product.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9] text-[12.5px] text-[#78716C]">
                                                {product.category?.name ?? "—"}
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <span className="text-[13px] font-bold text-[#1C1917]">{fmtPrice(product.price)}</span>
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9] text-[12.5px] text-[#78716C]">
                                                {product.iva}%
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <span className={`text-[11.5px] font-semibold px-2 py-[3px] rounded-full border ${stock.className}`}>
                                                    {stock.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => setEditingProduct(product)}
                                                        className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-transparent border border-[#E7E5E4] text-[#78716C] hover:bg-[#FFF4ED] hover:border-[#FED7AA] hover:text-[#F97316] transition-all cursor-pointer"
                                                        title="Editar"
                                                    >
                                                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedProduct(product)}
                                                        className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-transparent border border-[#E7E5E4] text-[#C4C0BB] hover:bg-[#F5F4F0] hover:text-[#78716C] transition-all cursor-pointer"
                                                        title="Ver detalhes"
                                                    >
                                                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            {selectedProduct && (
                <ProductDetailModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onEdit={() => {
                        setEditingProduct(selectedProduct)
                        setSelectedProduct(null)
                    }}
                />
            )}

            {editingProduct !== undefined && (
                <ProductFormModal
                    product={editingProduct}
                    categories={categories}
                    onClose={() => setEditingProduct(undefined)}
                />
            )}
        </div>
    )
}