import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, PlusCircle, BarChart3, LogOut, User, Sparkles } from "lucide-react"
import { auth, signOut } from "@/auth"

export default async function CommercialLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    return (
        <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-accent/5">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r border-border/50 bg-card/50 backdrop-blur-sm md:flex">
                <div className="flex h-16 items-center gap-2 border-b border-border/50 px-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <Link className="flex items-center gap-2 font-semibold text-lg" href="/commercial">
                        <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">AI Platform</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-4">
                    <nav className="grid items-start px-3 text-sm font-medium gap-1">
                        <Link
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-foreground transition-all hover:bg-primary/10 hover:text-primary"
                            href="/commercial"
                        >
                            <FileText className="h-4 w-4" />
                            My Requests
                        </Link>
                        <Link
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                            href="/commercial/new"
                        >
                            <PlusCircle className="h-4 w-4" />
                            New Request
                        </Link>
                        <Link
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                            href="/commercial/reports"
                        >
                            <BarChart3 className="h-4 w-4" />
                            Reports
                        </Link>
                    </nav>
                </div>
                <div className="mt-auto border-t border-border/50 p-4">
                    <div className="mb-3 px-3 py-2 rounded-xl bg-accent/50">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-primary" />
                            <span className="font-medium truncate">{session?.user?.name || session?.user?.email}</span>
                        </div>
                    </div>
                    <form
                        action={async () => {
                            "use server"
                            await signOut({ redirectTo: "/login" })
                        }}
                    >
                        <Button variant="ghost" className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive">
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                <header className="flex h-16 items-center gap-4 border-b border-border/50 bg-card/30 backdrop-blur-sm px-6">
                    <div className="w-full flex-1">
                        <h2 className="text-lg font-semibold text-foreground">Commercial Dashboard</h2>
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
