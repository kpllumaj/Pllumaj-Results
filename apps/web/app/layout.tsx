import "../app/globals.css";
import Providers from "@/components/providers";
import Navbar from "@/components/layout/navbar";
import AuthProviderClient from "@/components/AuthProviderClient";

export const metadata = {
  title: "Pllumaj Results",
  description: "Universal life-solutions platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Providers>
          <AuthProviderClient>
            <Navbar />
            <main>{children}</main>
          </AuthProviderClient>
        </Providers>
      </body>
    </html>
  );
}
