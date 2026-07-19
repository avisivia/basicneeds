import Image from "next/image";
export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-baseline bg-muted/30 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={100}
            className="mx-auto mb-2"
          />
          <h1 className="text-lg font-semibold">Basic Needs Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Reflect on Belonging, Power, Freedom, Fun &amp; Survival
          </p>
        </div>
        {children}
        <Image
          src="/school_logo.png"
          alt="Logo"
          width={40}
          height={40}
          className="mx-auto m-5"
        />
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2026 Rochester School. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
