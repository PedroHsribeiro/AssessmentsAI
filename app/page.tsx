import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Redirect based on role
  const roles = session.user.roles || []
  if (roles.includes("ADMIN") || roles.includes("APPROVER")) {
    redirect("/admin")
  } else {
    redirect("/commercial")
  }
}
