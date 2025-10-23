import LoginForm from "@/components/auth/login-form";

export const metadata = {
  title: "Login | Pllumaj Results",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoginForm />
    </main>
  );
}
