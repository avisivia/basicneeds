export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-semibold">Basic Needs Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Reflect on Belonging, Power, Freedom, Fun &amp; Survival
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
