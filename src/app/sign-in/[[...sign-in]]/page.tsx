import { SignIn } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#f0f6ff]">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <SignIn />
      </div>
    </div>
  );
}
