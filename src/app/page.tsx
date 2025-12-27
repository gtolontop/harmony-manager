import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    // Redirect to dashboard based on role
    redirect("/compta/facture");
  } else {
    redirect("/login");
  }
}
