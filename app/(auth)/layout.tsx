// Layout for authentication pages (clean, no sidebar)
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
      {/* Decorative bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large bubble - top left */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-br from-gray-700/20 to-gray-600/10 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '8s' }} />
        
        {/* Medium bubble - bottom right */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-br from-gray-600/15 to-gray-700/10 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '10s', animationDelay: '2s' }} />
        
        {/* Small bubble - top right */}
        <div className="absolute top-32 right-20 w-64 h-64 bg-gradient-to-br from-gray-500/15 to-gray-600/10 rounded-full blur-2xl animate-pulse" 
             style={{ animationDuration: '7s', animationDelay: '1s' }} />
        
        {/* Small bubble - middle left */}
        <div className="absolute top-1/2 -left-16 w-48 h-48 bg-gradient-to-br from-gray-700/20 to-gray-600/10 rounded-full blur-2xl animate-pulse" 
             style={{ animationDuration: '9s', animationDelay: '3s' }} />
        
        {/* Tiny bubble - center right */}
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-br from-gray-600/20 to-gray-500/15 rounded-full blur-xl animate-pulse" 
             style={{ animationDuration: '6s', animationDelay: '4s' }} />
      </div>
      
      {children}
    </div>
  )
}

