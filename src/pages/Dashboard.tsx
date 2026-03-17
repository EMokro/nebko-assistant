import { useAuth } from "@/contexts/AuthContext";
import { Building2, Home, Users, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const quickActions = [
  {
    to: "/immobilien",
    icon: Home,
    title: "Immobilien",
    description: "Verwalten Sie Ihre Immobilien und Einheiten",
  },
  {
    to: "/personen",
    icon: Users,
    title: "Personen",
    description: "Mieter und Eigentümer verwalten",
  },
  {
    to: "/dokumente",
    icon: FileText,
    title: "Dokumente",
    description: "Belege und Rechnungen hochladen",
  },
  {
    to: "/generator",
    icon: Building2,
    title: "Abrechnung erstellen",
    description: "Neue Nebenkostenabrechnung generieren",
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Willkommen, {user?.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Verwalten Sie Ihre Nebenkostenabrechnungen schnell und einfach.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="card-elevated p-5 hover:shadow-md transition-shadow group"
          >
            <action.icon className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium text-foreground">{action.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
