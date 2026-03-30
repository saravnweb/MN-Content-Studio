export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* WCAG 2.4.1 — Skip to main content */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  )
}
