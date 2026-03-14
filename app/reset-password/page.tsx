"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success">("error")

  // ✅ Solo accedemos a searchParams en el useEffect, que se ejecuta solo en el cliente
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const t = searchParams.get("token")
    setToken(t)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      setMessage("Token no válido")
      setMessageType("error")
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage("Las contraseñas no coinciden")
      setMessageType("error")
      return
    }
    setLoading(true)
    setMessage("")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.detail || "Error al actualizar contraseña")
        setMessageType("error")
        return
      }
      setMessage("Contraseña actualizada correctamente. Redirigiendo al login...")
      setMessageType("success")
      setTimeout(() => router.push("/login"), 2000)
    } catch (err: any) {
      setMessage(err.message || "Error al conectar con el backend")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full p-8 space-y-6 shadow-2xl">
        <h1 className="text-2xl font-bold text-foreground">Restablecer contraseña</h1>
        {message && (
          <p
            className={`text-sm mt-2 ${
              messageType === "error" ? "text-red-500" : "text-accent"
            }`}
          >
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Nueva contraseña</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Confirmar contraseña</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full h-12" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Actualizar contraseña"}
          </Button>
        </form>
      </Card>
    </div>
  )
}