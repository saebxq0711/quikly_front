"use client"

import type React from "react"
import { useState } from "react"
import { saveSession } from "@/lib/auth"
import Guard from "@/lib/guards"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Eye, EyeOff, Loader2, Shield, Zap, Users } from "lucide-react"
import { Header } from "@/components/header"

export default function LoginPage() {
  return (
    <Guard>
      <LoginForm />
    </Guard>
  )
}

function LoginForm() {
  const [correo, setCorreo] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [forgotPassword, setForgotPassword] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [feedbackType, setFeedbackType] = useState<"error" | "info">("error") // nuevo

  const handleLogin = async () => {
    setLoading(true)
    setFeedback("")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFeedback(data.detail || "Credenciales inválidas")
        setFeedbackType("error")
        setLoading(false)
        return
      }

      saveSession(data.access_token, data.rol)
      switch (data.rol) {
        case "superadmin":
          return (window.location.href = "/superadmin")
        case "admin_restaurante":
          return (window.location.href = "/admin")
        case "kiosco":
          return (window.location.href = "/kiosco")
        default:
          return (window.location.href = "/login")
      }
    } catch (err: any) {
      setFeedback(err.message || "Error al conectar con el backend")
      setFeedbackType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!correo) {
      setFeedback("Por favor ingresa tu correo")
      setFeedbackType("error")
      return
    }
    setLoading(true)
    setFeedback("")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFeedback(data.detail || "Error al enviar el correo")
        setFeedbackType("error")
      } else {
        setFeedback("Se envió un correo con las instrucciones para restablecer tu contraseña")
        setFeedbackType("info") // color turquesa
      }
    } catch (err: any) {
      setFeedback(err.message || "Error al conectar con el backend")
      setFeedbackType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (forgotPassword) {
      handleForgotPassword()
    } else {
      handleLogin()
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col lg:flex-row">
        {/* Lado izquierdo decorativo */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden items-center justify-center p-12">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          </div>
          <div className="relative z-10 max-w-xl space-y-8 animate-fade-in">
            <div className="text-center space-y-4 animate-fade-in-up delay-200">
              <h2 className="text-4xl font-bold text-white text-balance">Gestiona tu negocio de forma inteligente</h2>
              <p className="text-lg text-white/70 text-pretty">
                Accede a tu panel de administración y controla todos los aspectos de tu restaurante desde un solo lugar
              </p>
            </div>
            <div className="grid gap-6 mt-12 animate-fade-in-up delay-300">
              <div className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Rápido y eficiente</h3>
                  <p className="text-white/60 text-sm">Optimiza tus procesos con nuestra tecnología de autoatención</p>
                </div>
              </div>
              <div className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Seguro y confiable</h3>
                  <p className="text-white/60 text-sm">Tus datos protegidos con los más altos estándares de seguridad</p>
                </div>
              </div>
              <div className="flex items-start gap-4 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Fácil de usar</h3>
                  <p className="text-white/60 text-sm">Interfaz intuitiva diseñada para maximizar tu productividad</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-background relative pt-20 lg:pt-20">
          <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          </div>

          <Card className="w-full max-w-md p-8 relative bg-card shadow-2xl border-border animate-fade-in-up">
            <div className="flex justify-center mb-8 lg:hidden">
              <div className="relative w-40 h-16">
                <Image src="/images/logo.png" alt="Quikly Autoatención" fill className="object-contain" priority />
              </div>
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {forgotPassword ? "Recuperar contraseña" : "Iniciar Sesión"}
              </h1>
              <p className="text-sm text-foreground/60">
                {forgotPassword
                  ? "Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña"
                  : "Ingresa tus credenciales para acceder"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="correo" className="text-sm font-medium text-foreground">Correo electrónico</label>
                <Input
                  id="correo"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="h-12 bg-input border-border focus:border-accent focus:ring-accent/20 transition-all"
                  required
                />
              </div>

              {!forgotPassword && (
                <div className="space-y-2">
                  <label htmlFor="contrasena" className="text-sm font-medium text-foreground">Contraseña</label>
                  <div className="relative">
                    <Input
                      id="contrasena"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      className="h-12 pr-12 bg-input border-border focus:border-accent focus:ring-accent/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p
                    className="text-xs text-accent hover:underline cursor-pointer mt-1"
                    onClick={() => setForgotPassword(true)}
                  >
                    ¿Olvidaste tu contraseña?
                  </p>
                </div>
              )}

              {feedback && (
                <p
                  className={`text-xs mt-1 ${
                    feedbackType === "error" ? "text-red-500" : "text-accent"
                  }`}
                >
                  {feedback}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6"
              >
                {loading
                  ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {forgotPassword ? "Enviando..." : "Ingresando..."}
                    </>
                  )
                  : forgotPassword
                  ? "Enviar enlace"
                  : "Ingresar"}
              </Button>

              {forgotPassword && (
                <p
                  className="text-xs text-foreground/60 hover:underline cursor-pointer mt-2 text-center"
                  onClick={() => setForgotPassword(false)}
                >
                  Volver al login
                </p>
              )}
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-foreground/50">
                ¿Problemas para acceder?{" "}
                <a href="#" className="text-accent hover:underline font-medium transition-colors">
                  Contactar soporte
                </a>
              </p>
            </div>
          </Card>
        </div>
      </main>
    </>
  )
}
