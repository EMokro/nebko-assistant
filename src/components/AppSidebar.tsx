import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2,
  LayoutDashboard,
  Home,
  Users,
  FileText,
  Sparkles,
  LogOut,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/abrechnung", label: "Abrechnung", icon: Sparkles },
  { to: "/immobilien", label: "Immobilien", icon: Home },
  { to: "/personen", label: "Personen", icon: Users },
  { to: "/dokumente", label: "Dokumente", icon: FileText },
];

export default function AppSidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-60 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
        <Building2 className="h-6 w-6 text-sidebar-primary" />
        <span className="text-lg font-semibold text-sidebar-primary-foreground">NebkoAI</span>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-medium text-sidebar-accent-foreground">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground truncate">{user?.email}</p>
          </div>
          <button onClick={logout} className="text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
