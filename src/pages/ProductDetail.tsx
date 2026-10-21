import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { money, useFetch, api } from "../api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ShimmerButton } from "../components/magic";
import ProductCard from "../components/ProductCard";
import type { Product, Review } from "../types";
import { getCategoryFallback } from "../components/ProductImage";
import { Star, Truck, ShieldCheck, ArrowLeft, Check, Sparkles, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: p, loading, reload } = useFetch<Product & { reviews: Review[] }>(`/products/${id}`);
  const { data: related } = useFetch<Product[]>(`/products/${id}/related`);
  const { add, setOpen } = useCart();
  const navigate = useNavigate();

  // Estados interactivos
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "shipping" | "reviews">("desc");
  const [loupe, setLoupe] = useState({ show: false, x: 0, y: 0 });

  // Estado del formulario de nueva reseña
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Inicializar talle por defecto cuando cargue el producto
  useEffect(() => {
    if (p && p.sizes && p.sizes.length > 0) {
      setSelectedSize(p.sizes[0]);
    }
    setSelectedImage(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [p]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-5 pt-36 pb-20 animate-pulse">
        <div className="h-6 w-32 bg-zinc-800 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-zinc-800 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 w-48 bg-zinc-800 rounded" />
            <div className="h-12 w-80 bg-zinc-800 rounded" />
            <div className="h-6 w-24 bg-zinc-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="mx-auto max-w-md px-5 pt-44 pb-20 text-center">
        <p className="text-2xl font-black uppercase italic text-zinc-300">Producto No Encontrado</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  const images = (p.images && p.images.length > 0) ? p.images : [(p as any).imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"];
  const currentImg = images[selectedImage] || images[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setLoupe({ show: true, x, y });
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Por favor selecciona un talle antes de agregar.");
      return;
    }
    for (let i = 0; i < quantity; i++) {
      add(p, selectedSize);
    }
    toast.success(`${p.name} agregado a la bolsa`, {
      action: {
        label: "Ver bolsa",
        onClick: () => setOpen(true),
      },
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error("Por favor selecciona un talle para comprar.");
      return;
    }
    for (let i = 0; i < quantity; i++) {
      add(p, selectedSize);
    }
    navigate("/checkout");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submittingReview) return;
    setSubmittingReview(true);
    try {
      await api("/reviews", {
        method: "POST",
        body: {
          productId: p.id,
          rating: newRating,
          comment: newComment.trim(),
        },
      });
      setNewComment("");
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
      reload();
    } catch (err: any) {
      alert(err.message || "Error al publicar reseña");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pt-28 pb-32">
      {/* Botón de retroceso */}
      <Link
        to="/#catalogo"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-accent transition mb-8 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span>Volver a siluetas</span>
      </Link>

      {/* Grid Principal: Galería con Lupa + Detalles de Compra */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* ================= Columna Izquierda: Galería ================= */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails laterales */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                  selectedImage === idx
                    ? "border-accent shadow-[0_0_12px_#CCFF00]"
                    : "border-zinc-800 opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`${p.name} thumb ${idx}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = getCategoryFallback(p?.category);
                  }}
                />
              </button>
            ))}
          </div>

          {/* Imagen Principal con Lupa de Zoom en Hover */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setLoupe({ show: false, x: 0, y: 0 })}
            className="relative aspect-square w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 flex items-center justify-center cursor-crosshair select-none"
          >
            <motion.img
              layoutId={`product-img-${p.id}`}
              src={currentImg}
              alt={p.name}
              className="h-full w-full object-cover transition-transform duration-300"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = getCategoryFallback(p?.category);
              }}
            />

            {/* Ventana de zoom aumentada */}
            {loupe.show && (
              <div
                className="pointer-events-none absolute inset-0 z-30 hidden md:block"
                style={{
                  backgroundImage: `url(${currentImg})`,
                  backgroundPosition: `${loupe.x}% ${loupe.y}%`,
                  backgroundSize: "220%",
                  backgroundRepeat: "no-repeat",
                }}
              />
            )}
          </div>
        </div>

        {/* ================= Columna Derecha: Especificaciones y Compra ================= */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
              <span>{p.brand}</span>
              <div className="flex items-center gap-2">
                {p.sku && (
                  <span className="font-mono text-[10px] tracking-normal bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-md font-bold">
                    SKU: {p.sku}
                  </span>
                )}
                <span className="text-accent">{p.category}</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
              {p.name}
            </h1>

            {/* Rating y Reseñas con Contraste Seguro WCAG AA */}
            <div className="mt-4 flex items-center gap-3">
              <div className="badge-rating px-3 py-1.5">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.round(p.rating || 5)
                          ? "fill-amber-400 text-amber-400"
                          : "text-zinc-500"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-xs ml-1">
                  {p.rating?.toFixed(1) || "5.0"}
                </span>
              </div>
              <span className="text-xs text-zinc-500 font-medium">
                ({p.reviews?.length || 2} reseñas certificadas)
              </span>
            </div>

            {/* Precio con Píldora de Alto Contraste */}
            <div className="mt-6 flex items-center gap-3">
              <span className="price-pill text-2xl sm:text-3xl font-black">
                {money(p.price)}
              </span>
              <span className="text-xs uppercase font-bold text-zinc-500 tracking-wider">
                Envío Gratis
              </span>
            </div>

            {/* Selector de Talles */}
            <div className="mt-8">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                <span>Seleccionar Talle</span>
                <span className="text-zinc-500 font-mono">Guía de Talles US</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(p.sizes || ["US 8", "US 9", "US 10", "US 11"]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-2xl py-3 text-xs font-mono font-black transition-all ${
                      selectedSize === size
                        ? "bg-accent text-black border border-accent shadow-[0_0_12px_#CCFF00]"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Stepper de Cantidad y Acciones de Compra (Agregar + Comprar Ahora) */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Cantidad:</span>
                <div className="flex items-center gap-3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-1.5 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-bold px-1"
                    aria-label="Disminuir cantidad"
                  >
                    −
                  </button>
                  <span className="w-5 text-center font-mono font-bold text-zinc-900 dark:text-white text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(p.stock, quantity + 1))}
                    className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-bold px-1"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Botones de Acción (Mobile apilados con Comprar Ahora arriba; Desktop sm:flex-row) */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  disabled={p.stock === 0}
                  onClick={handleAddToCart}
                  className="btn-ghost flex-1 py-4 text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                >
                  Agregar a la Bolsa
                </button>
                <button
                  type="button"
                  disabled={p.stock === 0}
                  onClick={handleBuyNow}
                  className="btn-primary flex-1 py-4 text-xs font-black uppercase tracking-wider shadow-lg disabled:opacity-40"
                >
                  {p.stock === 0 ? "Agotado Temporalmente" : `Comprar Ahora • ${money(Number(p.price) * quantity)}`}
                </button>
              </div>
            </div>

            {/* Garantías de Marca */}
            <div className="mt-8 space-y-2 border-t border-zinc-800/80 pt-6 text-xs text-zinc-400">
              <div className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 text-accent" />
                <span>Envío express gratuito en pedidos superiores a $200</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <span>Garantía de rendimiento SportX de 30 días</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TABS ANIMADOS: Descripción / Envío / Reseñas ================= */}
      <div className="mt-20 border-t border-zinc-800 pt-12">
        <div className="flex gap-4 border-b border-zinc-800 pb-4">
          {[
            { id: "desc", label: "Descripción de Alto Rendimiento" },
            { id: "shipping", label: "Envíos & Devoluciones" },
            { id: "reviews", label: `Reseñas (${p.reviews?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative pb-3 text-xs sm:text-sm font-black uppercase tracking-wider transition-colors ${
                activeTab === tab.id ? "text-accent" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent shadow-[0_0_8px_#CCFF00]"
                />
              )}
            </button>
          ))}
        </div>

        <div className="py-8 min-h-[180px]">
          {activeTab === "desc" && (
            <div className="animate__animated animate__fadeIn max-w-3xl space-y-4 text-zinc-300 text-sm leading-relaxed">
              <p>{p.description}</p>
              <p>
                Cada par ha sido calibrado por el laboratorio SportX para reducir el impacto torsional y maximizar la propulsión mecánica. Los polímeros de amortiguación responden a la temperatura corporal para un calce a medida.
              </p>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="animate__animated animate__fadeIn max-w-2xl space-y-3 text-xs sm:text-sm text-zinc-400">
              <p>• Envíos rápidos asegurados a todo el país vía transporte prioritario.</p>
              <p>• Entrega estándar de 2 a 4 días hábiles.</p>
              <p>• Devoluciones gratuitas sin preguntas durante los primeros 30 días naturales posteriores a la entrega.</p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="animate__animated animate__fadeIn space-y-8">
              {/* Formulario para dejar reseña si está autenticado */}
              {user ? (
                <form
                  onSubmit={handleSubmitReview}
                  className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 max-w-2xl space-y-4"
                >
                  <h4 className="text-sm font-black uppercase tracking-wider text-white">
                    Deja tu Reseña de Atleta
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">Puntaje:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= newRating ? "fill-amber-400 text-amber-400" : "text-zinc-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <textarea
                    required
                    placeholder="Comparte tu experiencia de amortiguación, talle y durabilidad..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full h-24 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-white placeholder-zinc-500 outline-none focus:border-accent"
                  />

                  {reviewSuccess && (
                    <div className="text-xs font-bold text-accent">¡Tu reseña ha sido publicada con éxito!</div>
                  )}

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="rounded-full bg-accent px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-white transition flex items-center gap-2"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{submittingReview ? "Publicando..." : "Publicar Reseña"}</span>
                  </button>
                </form>
              ) : (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 max-w-md text-xs text-zinc-400">
                  <Link to="/login" className="text-accent font-bold underline">
                    Inicia sesión
                  </Link>{" "}
                  para calificar este modelo y dejar tu comentario.
                </div>
              )}

              {/* Lista de reseñas */}
              <div className="space-y-4 max-w-3xl">
                {p.reviews && p.reviews.length > 0 ? (
                  p.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={rev.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb"}
                            alt={rev.userName}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-xs font-bold text-white">{rev.userName}</p>
                            <p className="text-[10px] text-zinc-500">
                              {new Date(rev.createdAt).toLocaleDateString("es")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < rev.rating ? "fill-amber-400 text-amber-400" : "text-zinc-700"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300 pl-11">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500">Aún no hay reseñas para esta silueta. Sé el primero.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= SECCIÓN: TAMBIÉN TE PUEDE GUSTAR (Carrusel) ================= */}
      {related && related.length > 0 && (
        <div className="mt-24 border-t border-zinc-800 pt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-accent">RECOMENDACIONES</span>
              <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                TAMBIÉN TE PUEDE GUSTAR
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.slice(0, 4).map((rel) => (
              <ProductCard key={rel.id} p={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
