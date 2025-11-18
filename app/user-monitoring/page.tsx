"use client"

import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  Monitor,
  Info,
  Zap,
  Settings,
  Shield,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Download,
  Chrome,
  Firefox,
  Globe,
  ArrowRight,
  Lock,
  Database,
  Eye,
  EyeOff,
  Power,
  RefreshCw,
} from "lucide-react"
import { 
  ResizableAppShell, 
  ResizablePageSheet,
  PageHeader,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/context/auth-context"

export default function UserMonitoringPage() {
  const { currentOrg, user } = useAuth()
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "setup" | "privacy">("overview")

  const handleExtensionDownload = (browser: "chrome" | "edge" | "firefox") => {
    // Placeholder URLs - replace with actual extension store URLs when available
    const urls = {
      chrome: "https://chrome.google.com/webstore", // Replace with actual Chrome extension URL
      edge: "https://microsoftedge.microsoft.com/addons", // Replace with actual Edge extension URL
      firefox: "https://addons.mozilla.org", // Replace with actual Firefox extension URL
    }
    window.open(urls[browser], "_blank", "noopener,noreferrer")
  }

  const handleRefresh = () => {
    // Refresh monitoring status - placeholder for future API call
    console.log("Refreshing monitoring status...")
    // In the future: fetch actual status from API
  }

  return (
    <ResizableAppShell>
      <ResizablePageSheet
        header={
          <PageHeader>
            <div className="flex items-center justify-between w-full h-full" style={{ paddingLeft: '28px', paddingRight: '20px' }}>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-500">Discovery</span>
                <span className="text-[14px] text-gray-400">›</span>
                <span className="text-[14px] font-medium">User monitoring</span>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={handleRefresh}
                  title="Actualizar estado"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </PageHeader>
        }
      >
        <div className="-mx-5 -mt-4">
          {/* Hero Section */}
          <div
            className="border-b border-stroke bg-gray-50/30"
            style={{ paddingLeft: "28px", paddingRight: "20px", paddingTop: "var(--header-padding-y)", paddingBottom: "var(--header-padding-y)" }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gray-100 shrink-0">
                <Monitor className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-lg font-semibold text-gray-900">User monitoring</h1>
                  <Badge variant="outline" className="text-xs px-2 py-0 bg-gray-50 text-gray-700 border-gray-200">
                    Extensión del navegador
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Rastrea automáticamente la actividad de los usuarios para generar insights sobre patrones de trabajo, 
                  oportunidades de automatización y cuellos de botella operativos.
                </p>
              </div>
            </div>

            {/* Status Card */}
            <div className="border border-gray-200 rounded-lg bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${isMonitoringEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {isMonitoringEnabled ? (
                      <Power className="h-5 w-5 text-green-600" />
                    ) : (
                      <Power className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {isMonitoringEnabled ? "Monitoreo activo" : "Monitoreo inactivo"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {isMonitoringEnabled 
                        ? "La extensión está registrando eventos de usuario" 
                        : "Activa la extensión para comenzar a rastrear actividad"}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={isMonitoringEnabled}
                  onCheckedChange={(checked) => {
                    setIsMonitoringEnabled(checked)
                    // Placeholder: In the future, this will call an API to enable/disable monitoring
                    console.log(`Monitoring ${checked ? "enabled" : "disabled"}`)
                  }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ paddingLeft: '28px', paddingRight: '20px', paddingTop: '24px', paddingBottom: '24px' }}>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="mb-6 h-auto -space-x-px bg-background p-0 shadow-sm shadow-black/5">
                <TabsTrigger 
                  value="overview"
                  className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary text-xs px-4"
                >
                  Descripción
                </TabsTrigger>
                <TabsTrigger 
                  value="setup"
                  className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary text-xs px-4"
                >
                  Setup
                </TabsTrigger>
                <TabsTrigger 
                  value="privacy"
                  className="relative overflow-hidden rounded-none border border-border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-primary text-xs px-4"
                >
                  Privacidad
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Qué es */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                  <div className="p-6 border-b" style={{ borderColor: 'var(--stroke)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100">
                        <Info className="h-4 w-4 text-gray-600" />
                      </div>
                      <h2 className="text-base font-semibold text-gray-900">¿Qué es User monitoring?</h2>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      User monitoring es una extensión de navegador que captura eventos de usuario de forma privada y segura. 
                      La extensión registra interacciones como clicks, navegaciones, tiempo de enfoque y cambios de aplicación 
                      para analizar patrones de trabajo y generar insights accionables.
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Todos los datos se procesan de forma anónima y agregada para identificar tendencias organizacionales 
                      sin comprometer la privacidad individual de los usuarios.
                    </p>
                  </div>
                </div>

                {/* Cómo funciona */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                  <div className="p-6 border-b" style={{ borderColor: 'var(--stroke)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100">
                        <Zap className="h-4 w-4 text-gray-600" />
                      </div>
                      <h2 className="text-base font-semibold text-gray-900">¿Cómo funciona?</h2>
                    </div>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="flex items-start gap-4 pb-5 border-b" style={{ borderColor: 'var(--stroke)' }}>
                      <div className="flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Captura de eventos</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          La extensión registra eventos de forma local en tu navegador (clicks, navegaciones, tiempo de enfoque, 
                          cambios de aplicación). Los datos se almacenan temporalmente en tu dispositivo antes de sincronizarse.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 pb-5 border-b" style={{ borderColor: 'var(--stroke)' }}>
                      <div className="flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Sincronización segura</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Los eventos se envían de forma encriptada a Sapira OS solo cuando estás autenticado y activas el monitoreo. 
                          La sincronización ocurre en tiempo real o en lotes según tu configuración de privacidad.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 pb-5 border-b" style={{ borderColor: 'var(--stroke)' }}>
                      <div className="flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold shrink-0 mt-0.5">
                        3
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Análisis inteligente</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Nuestro sistema analiza los patrones para identificar workflows repetitivos, oportunidades de automatización 
                          y áreas de mejora. Los algoritmos de machine learning detectan comportamientos significativos sin exponer 
                          información personal.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold shrink-0 mt-0.5">
                        4
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Insights accionables</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Recibe recomendaciones personalizadas sobre cómo optimizar tu flujo de trabajo y ahorrar tiempo. 
                          Los insights se muestran en la página de Insights con métricas detalladas y sugerencias concretas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Beneficios */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                  <div className="p-6 border-b" style={{ borderColor: 'var(--stroke)' }}>
                    <h2 className="text-base font-semibold text-gray-900">Beneficios</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50/50 transition-colors">
                        <CheckCircle2 className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 mb-1">Identificación de patrones</h3>
                          <p className="text-xs text-gray-600 leading-relaxed">Descubre workflows repetitivos que pueden automatizarse</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50/50 transition-colors">
                        <CheckCircle2 className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 mb-1">Optimización de tiempo</h3>
                          <p className="text-xs text-gray-600 leading-relaxed">Reduce el tiempo perdido en tareas repetitivas</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50/50 transition-colors">
                        <CheckCircle2 className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 mb-1">Mejora continua</h3>
                          <p className="text-xs text-gray-600 leading-relaxed">Obtén métricas objetivas sobre tu productividad</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50/50 transition-colors">
                        <CheckCircle2 className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 mb-1">Visibilidad organizacional</h3>
                          <p className="text-xs text-gray-600 leading-relaxed">Los administradores pueden ver tendencias agregadas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="setup" className="mt-6 space-y-6">
                {/* Paso 1: Instalar extensión */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                  <div className="p-6 border-b" style={{ borderColor: 'var(--stroke)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold shrink-0">
                        1
                      </div>
                      <h2 className="text-base font-semibold text-gray-900">Instalar la extensión</h2>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Descarga la extensión User monitoring desde la tienda de extensiones de tu navegador. 
                      La extensión está disponible para Chrome, Edge y Firefox.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      <Button 
                        variant="outline" 
                        className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-gray-50 border-dashed"
                        onClick={() => handleExtensionDownload("chrome")}
                      >
                        <Chrome className="h-6 w-6 text-gray-600" />
                        <span className="text-xs font-medium text-gray-900">Chrome Web Store</span>
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-gray-50 border-dashed"
                        onClick={() => handleExtensionDownload("edge")}
                      >
                        <Globe className="h-6 w-6 text-gray-600" />
                        <span className="text-xs font-medium text-gray-900">Edge Add-ons</span>
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-gray-50 border-dashed"
                        onClick={() => handleExtensionDownload("firefox")}
                      >
                        <Firefox className="h-6 w-6 text-gray-600" />
                        <span className="text-xs font-medium text-gray-900">Firefox Add-ons</span>
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Paso 2: Autenticarse */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                  <div className="p-6 border-b" style={{ borderColor: 'var(--stroke)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold shrink-0">
                        2
                      </div>
                      <h2 className="text-base font-semibold text-gray-900">Autenticarse en Sapira OS</h2>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Abre la extensión haciendo clic en su icono en la barra de herramientas de tu navegador. 
                      Haz clic en "Conectar con Sapira OS" e inicia sesión con tu cuenta de organización.
                    </p>
                    
                    <div className="border border-amber-200 rounded-lg bg-amber-50/50 p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 mb-1.5">Nota importante</h3>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Asegúrate de estar autenticado en la misma organización en la extensión y en Sapira OS. 
                            La extensión solo puede sincronizar datos con la organización activa en tu sesión.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paso 3: Activar monitoreo */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                  <div className="p-6 border-b" style={{ borderColor: 'var(--stroke)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold shrink-0">
                        3
                      </div>
                      <h2 className="text-base font-semibold text-gray-900">Activar el monitoreo</h2>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Una vez autenticado, activa el toggle "Iniciar monitoreo" en la extensión. 
                      Los eventos comenzarán a registrarse automáticamente y se sincronizarán con Sapira OS.
                    </p>
                    
                    <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Power className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">Estado del monitoreo</div>
                            <div className="text-xs text-gray-500">Activa o desactiva el rastreo de eventos</div>
                          </div>
                        </div>
                        <Switch
                          checked={isMonitoringEnabled}
                          onCheckedChange={(checked) => {
                            setIsMonitoringEnabled(checked)
                            // Placeholder: In the future, this will call an API to enable/disable monitoring
                            console.log(`Monitoring ${checked ? "enabled" : "disabled"}`)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paso 4: Ver insights */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                  <div className="p-6 border-b" style={{ borderColor: 'var(--stroke)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold shrink-0">
                        4
                      </div>
                      <h2 className="text-base font-semibold text-gray-900">Ver tus insights</h2>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Después de unas horas de uso, visita la página de Insights para ver tus patrones de trabajo 
                      y recomendaciones personalizadas. Los datos se actualizan automáticamente mientras usas la extensión.
                    </p>
                    
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => window.location.href = '/insights'}
                      >
                        Ir a Insights
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="privacy" className="mt-6 space-y-6">
                {/* Privacidad y seguridad */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                  <div className="p-6 border-b" style={{ borderColor: 'var(--stroke)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100">
                        <Shield className="h-4 w-4 text-gray-600" />
                      </div>
                      <h2 className="text-base font-semibold text-gray-900">Privacidad y seguridad</h2>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-5">
                    <div className="flex items-start gap-4 pb-5 border-b" style={{ borderColor: 'var(--stroke)' }}>
                      <Database className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Datos locales</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Los eventos se almacenan localmente en tu navegador antes de sincronizarse. 
                          Puedes revisar y eliminar estos datos en cualquier momento desde la configuración de la extensión.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 pb-5 border-b" style={{ borderColor: 'var(--stroke)' }}>
                      <Lock className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Encriptación</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Todos los datos se transmiten mediante conexiones HTTPS encriptadas. 
                          Nunca enviamos información sin cifrar a través de la red.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 pb-5 border-b" style={{ borderColor: 'var(--stroke)' }}>
                      <Power className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Control total</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Puedes pausar o detener el monitoreo en cualquier momento desde la extensión. 
                          Los datos ya sincronizados permanecen en Sapira OS según las políticas de retención de tu organización.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <EyeOff className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Sin contenido sensible</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          La extensión NO captura contraseñas, datos de formularios, contenido de páginas web, 
                          información de tarjetas de crédito ni ningún otro dato sensible. Solo registra metadatos 
                          de interacción (qué página visitaste, cuándo, cuánto tiempo estuviste enfocado, etc.).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Política de datos */}
                <div className="border border-gray-200 rounded-lg bg-gray-50/50 overflow-hidden">
                  <div className="p-6 border-b" style={{ borderColor: 'var(--stroke)' }}>
                    <h2 className="text-base font-semibold text-gray-900">Política de retención de datos</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-600 mt-1.5 shrink-0" />
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Los datos de eventos se retienen durante 90 días para análisis y generación de insights.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-600 mt-1.5 shrink-0" />
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Los insights agregados se mantienen indefinidamente para análisis de tendencias organizacionales.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-600 mt-1.5 shrink-0" />
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Puedes solicitar la eliminación de tus datos personales en cualquier momento contactando a tu administrador.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ResizablePageSheet>
    </ResizableAppShell>
  )
}

