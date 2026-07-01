import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin/super" className="text-2xl font-bold text-blue-600">
                Sistema Madisa
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Super Admin</span>
              <form
                action={async () => {
                  "use server";
                  const { signOut } = await import("@/lib/auth");
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
                  Salir
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <aside className="bg-white border-r border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4">
            <Link
              href="/admin/super"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/super/negocios"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Negocios
            </Link>
            <Link
              href="/admin/super/usuarios"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Usuarios Admin
            </Link>
          </nav>
        </div>
      </aside>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
