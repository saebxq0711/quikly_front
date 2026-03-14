"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useKiosco } from "../../layout";

const money = (n: number) => `$${n.toLocaleString()}`;

const LATAM_COUNTRIES = [
  { code: "co", label: "Colombia", dialCode: "+57", flag: "🇨🇴" },
  { code: "pe", label: "Perú", dialCode: "+51", flag: "🇵🇪" },
  { code: "mx", label: "México", dialCode: "+52", flag: "🇲🇽" },
  { code: "ar", label: "Argentina", dialCode: "+54", flag: "🇦🇷" },
  { code: "cl", label: "Chile", dialCode: "+56", flag: "🇨🇱" },
  { code: "uy", label: "Uruguay", dialCode: "+598", flag: "🇺🇾" },
  { code: "br", label: "Brasil", dialCode: "+55", flag: "🇧🇷" },
];

type Invoice = {
  id: string;
  number: number;
  date?: string;
  customer?: any;
  items?: any[];
  total?: number;
};

export default function CheckoutPage() {
  const router = useRouter();

  const { cart, getTotal, restaurante, clearCart } = useKiosco();

  const [form, setForm] = useState({
    tipoDocumento: "",
    numeroDocumento: "",
    nombres: "",
    correo: "",
    telefono: "",
    dialCode: "+57",
  });

  const [qrData, setQrData] = useState<{
    qr_id: string;
    qr_image: string;
  } | null>(null);

  const [invoiceData, setInvoiceData] = useState<Invoice | null>(null);

  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);

  const [pedidoPayload, setPedidoPayload] = useState<any>(null);

  const [totalFinal, setTotalFinal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const selectedCountry =
    LATAM_COUNTRIES.find((c) => c.dialCode === form.dialCode) ||
    LATAM_COUNTRIES[0];

  /**
   * SI NO HAY CARRITO → VOLVER AL KIOSCO
   */
  useEffect(() => {
    if ((!cart || cart.length === 0) && !qrData && !invoiceData) {
      router.replace("/kiosco");
    }
  }, [cart, qrData, invoiceData, router]);

  /**
   * TIMEOUT DE FACTURA (1 MINUTO)
   */
  useEffect(() => {
    if (!invoiceData) return;

    const timer = setTimeout(() => {
      clearCart();
      router.replace("/kiosco");
    }, 60000);

    return () => clearTimeout(timer);
  }, [invoiceData, router, clearCart]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildCartPayload = () => {
    return cart.map((item) => ({
      producto_id: item.id_producto,
      nombre: item.nombre,
      precio: item.precio,
      cantidad: item.cantidad,
      seleccion:
        item.seleccion?.map((op) => ({
          tipo_opcion: op.grupo_nombre ?? "opcion",
          nombre_opcion: op.opcion_nombre,
          precio_adicional: op.precio_adicional ?? 0,
        })) ?? [],
    }));
  };

  /**
   * GENERAR QR
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        restaurante_id: restaurante?.id ?? 0,

        customer: {
          documentType: form.tipoDocumento,
          documentNumber: form.numeroDocumento.replace(/\D/g, ""),
          name: form.nombres.trim(),
          email: form.correo.trim(),
          phone: `${form.dialCode}${form.telefono.replace(/\D/g, "")}`,
        },

        cart: buildCartPayload(),
      };

      setPedidoPayload(payload);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kiosco/codigo-qr/generate-qr`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text);
      }

      const data = JSON.parse(text);

      setQrData({
        qr_id: data.qr_id,
        qr_image: data.qr_image,
      });
    } catch (err: any) {
      console.error(err);
      setError("Error generando QR: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * CREAR FACTURA
   */
  const handleCreateInvoice = async () => {
    if (!pedidoPayload) return;

    if (creatingInvoice) return;

    try {
      setCreatingInvoice(true);

      const total = getTotal();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kiosco/factura/crear`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer: pedidoPayload.customer,
            cart: pedidoPayload.cart,
            total: total,
          }),
        },
      );

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text);
      }

      const data: Invoice = JSON.parse(text);

      setTotalFinal(total);

      setInvoiceItems(pedidoPayload.cart);

      setInvoiceData(data);

      clearCart();

      setQrData(null);
    } catch (err: any) {
      console.error(err);
      alert("Error creando factura: " + err.message);
    } finally {
      setCreatingInvoice(false);
    }
  };

  const handleFinish = () => {
    clearCart();
    router.replace("/kiosco");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-secondary/50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8 flex items-center gap-4 animate-fade-in-up">
          <button
            onClick={() => router.push("/kiosco/categorias")}
            className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-[#5CCFE6] hover:shadow-md hover:shadow-[#5CCFE6]/10 active:scale-95"
          >
            <i className="fa-solid fa-arrow-left text-muted-foreground transition-colors group-hover:text-[#5CCFE6]"></i>
          </button>

          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Finalizar Pedido
            </h1>
            <p className="text-sm text-muted-foreground">
              Completa tus datos para continuar
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
          {/* Formulario */}
          <section className="animate-fade-in-left rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5CCFE6]/10">
                <i className="fa-solid fa-user text-[#5CCFE6]"></i>
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Datos de Contacto
              </h2>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Tipo de Documento */}
              <div className="group relative">
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Tipo de Documento
                </label>
                <div className="relative">
                  <i className="fa-solid fa-id-card absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60"></i>
                  <select
                    name="tipoDocumento"
                    value={form.tipoDocumento}
                    onChange={handleChange}
                    required
                    className="h-14 w-full appearance-none rounded-xl border border-border bg-secondary/50 pl-12 pr-10 text-foreground transition-all duration-200 focus:border-[#5CCFE6] focus:bg-card focus:ring-2 focus:ring-[#5CCFE6]/20 focus:outline-none"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="NIT">NIT</option>
                    <option value="PAS">Pasaporte</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"></i>
                </div>
              </div>

              {/* Número de Documento */}
              <div className="group">
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Número de Documento
                </label>
                <div className="relative">
                  <i className="fa-solid fa-hashtag absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60"></i>
                  <input
                    type="text"
                    name="numeroDocumento"
                    placeholder="Ej: 1234567890"
                    value={form.numeroDocumento}
                    onChange={handleChange}
                    required
                    className="h-14 w-full rounded-xl border border-border bg-secondary/50 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:border-[#5CCFE6] focus:bg-card focus:ring-2 focus:ring-[#5CCFE6]/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Nombre Completo */}
              <div className="group">
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Nombre Completo
                </label>
                <div className="relative">
                  <i className="fa-solid fa-user-pen absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60"></i>
                  <input
                    type="text"
                    name="nombres"
                    placeholder="Ingresa tu nombre completo"
                    value={form.nombres}
                    onChange={handleChange}
                    required
                    className="h-14 w-full rounded-xl border border-border bg-secondary/50 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:border-[#5CCFE6] focus:bg-card focus:ring-2 focus:ring-[#5CCFE6]/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div className="group">
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60"></i>
                  <input
                    type="email"
                    name="correo"
                    placeholder="correo@ejemplo.com"
                    value={form.correo}
                    onChange={handleChange}
                    required
                    className="h-14 w-full rounded-xl border border-border bg-secondary/50 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:border-[#5CCFE6] focus:bg-card focus:ring-2 focus:ring-[#5CCFE6]/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Teléfono con Bandera */}
              <div className="group">
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Teléfono
                </label>
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      value={form.dialCode}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          dialCode: e.target.value,
                        }))
                      }
                      className="h-14 w-[130px] appearance-none rounded-xl border border-border bg-secondary/50 pl-4 pr-8 text-foreground transition-all duration-200 focus:border-[#5CCFE6] focus:bg-card focus:ring-2 focus:ring-[#5CCFE6]/20 focus:outline-none"
                    >
                      {LATAM_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.dialCode}>
                          {c.flag} {c.dialCode}
                        </option>
                      ))}
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/60 pointer-events-none"></i>
                  </div>

                  <div className="relative flex-1">
                    <i className="fa-solid fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60"></i>
                    <input
                      type="tel"
                      name="telefono"
                      placeholder="300 123 4567"
                      value={form.telefono}
                      onChange={handleChange}
                      required
                      className="h-14 w-full rounded-xl border border-border bg-secondary/50 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:border-[#5CCFE6] focus:bg-card focus:ring-2 focus:ring-[#5CCFE6]/20 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Botón de Confirmar */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-6 flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#5CCFE6] font-semibold text-black shadow-lg shadow-[#5CCFE6]/25 transition-all duration-300 hover:bg-[#4BC5DD] hover:shadow-xl hover:shadow-[#5CCFE6]/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Generando QR...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-qrcode text-lg transition-transform group-hover:scale-110"></i>
                    <span className="text-lg">Confirmar y Pagar</span>
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-destructive">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </form>
          </section>

          {/* Resumen del Pedido */}
          <aside className="animate-fade-in-right rounded-3xl border border-border bg-card p-6 shadow-lg lg:sticky lg:top-6 lg:self-start">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5CCFE6]/10">
                <i className="fa-solid fa-receipt text-[#5CCFE6]"></i>
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Resumen del Pedido
              </h2>
            </div>

            <div className="space-y-3">
              {cart.map((item) => {
                const extras =
                  item.seleccion?.reduce(
                    (acc, op) => acc + (op.precio_adicional ?? 0),
                    0,
                  ) || 0;

                const subtotal = (item.precio + extras) * item.cantidad;

                return (
                  <div
                    key={item.id}
                    className="flex items-start justify-between rounded-xl bg-secondary/50 p-4 transition-colors hover:bg-secondary"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#5CCFE6]/20 text-sm font-semibold text-[#5CCFE6]">
                        {item.cantidad}
                      </span>
                      <div>
                        <span className="font-medium text-foreground">
                          {item.nombre}
                        </span>
                        {item.seleccion && item.seleccion.length > 0 && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.seleccion
                              .map((s) => s.opcion_nombre)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-semibold text-foreground">
                      {money(subtotal)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-border pt-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span className="text-foreground">Total a Pagar</span>
                <span className="text-2xl text-[#5CCFE6]">
                  {money(getTotal())}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* MODAL QR */}
      {qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="animate-scale-in w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5CCFE6]/10">
                <i className="fa-solid fa-qrcode text-3xl text-[#5CCFE6]"></i>
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                Escanea para pagar
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Usa tu app de pagos favorita
              </p>
            </div>

            <div className="mx-auto mb-6 w-fit rounded-2xl border-4 border-[#5CCFE6]/20 bg-white p-4">
              <img
                src={qrData.qr_image}
                alt="Código QR de pago"
                className="h-56 w-56 object-contain"
              />
            </div>

            <button
              onClick={handleCreateInvoice}
              disabled={creatingInvoice}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#5CCFE6] font-semibold text-black shadow-lg shadow-[#5CCFE6]/25 transition-all duration-300 hover:bg-[#4BC5DD] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {creatingInvoice ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Procesando pago...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check-circle"></i>
                  <span>Confirmar Pago</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MODAL FACTURA */}
      {invoiceData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="animate-scale-in w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-2xl">
            {/* Animación de éxito */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 animate-bounce-soft">
                <i className="fa-solid fa-circle-check text-5xl text-green-500"></i>
              </div>
              <h2 className="text-3xl font-bold text-foreground">
                ¡Pago Exitoso!
              </h2>
              <p className="mt-2 text-muted-foreground">
                Tu factura ha sido generada correctamente
              </p>
            </div>

            {/* Detalles de la factura */}
            <div className="rounded-2xl bg-secondary/50 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Factura No.</span>
                <span className="text-lg font-bold text-[#5CCFE6]">
                  #{invoiceData.number}
                </span>
              </div>

              <div className="space-y-2 border-b border-border pb-3">
                {invoiceItems.map((item, i) => {
                  const extras =
                    item.seleccion?.reduce(
                      (acc: number, op: any) =>
                        acc + (op.precio_adicional ?? 0),
                      0,
                    ) || 0;

                  const subtotal = (item.precio + extras) * item.cantidad;

                  return (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-foreground">
                        {item.nombre}{" "}
                        <span className="text-muted-foreground">
                          x{item.cantidad}
                        </span>
                      </span>
                      <span className="font-medium text-foreground">
                        {money(subtotal)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-[#5CCFE6]">{money(totalFinal)}</span>
              </div>

              <div className="space-y-2 border-t border-border pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    <i className="fa-solid fa-user mr-2"></i>Cliente
                  </span>
                  <span className="font-medium text-foreground">
                    {form.nombres}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    <i className="fa-solid fa-envelope mr-2"></i>Correo
                  </span>
                  <span className="font-medium text-foreground">
                    {form.correo}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#5CCFE6] font-semibold text-black shadow-lg shadow-[#5CCFE6]/25 transition-all duration-300 hover:bg-[#4BC5DD] hover:shadow-xl active:scale-[0.98]"
            >
              <i className="fa-solid fa-house"></i>
              <span>Volver al Inicio</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
