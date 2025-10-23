import RegisterForm from "@/components/auth/register-form";

export const metadata = {
  title: "Register | Pllumaj Results",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <RegisterForm />
    </main>
  );
}
