import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { realEstateApi, personApi, documentApi } from "@/lib/api";
import { Building2, Home, Users, FileText, Sparkles, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  count: number | undefined;
  loading: boolean;
  to: string;
}

function StatCard({ icon: Icon, label, count, loading, to }: StatCardProps) {
  return (
    <Link to={to} className="card-elevated p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="text-2xl font-semibold text-foreground">
        {loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (count ?? 0)}
      </div>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["realEstateGroups"],
    queryFn: realEstateApi.getGroups,
  });

  const { data: properties, isLoading: propsLoading } = useQuery({
    queryKey: ["realEstates"],
    queryFn: realEstateApi.getAll,
  });

  const { data: persons, isLoading: personsLoading } = useQuery({
    queryKey: ["persons"],
    queryFn: personApi.getAll,
  });

  const { data: docs, isLoading: docsLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: documentApi.getAllMetadata,
  });

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Willkommen, {user?.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Hier ist die Übersicht Ihrer Verwaltung.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Home} label="Immobiliengruppen" count={groups?.length} loading={groupsLoading} to="/immobilien" />
        <StatCard icon={Building2} label="Immobilien" count={properties?.length} loading={propsLoading} to="/immobilien" />
        <StatCard icon={Users} label="Personen" count={persons?.length} loading={personsLoading} to="/personen" />
        <StatCard icon={FileText} label="Dokumente" count={docs?.length} loading={docsLoading} to="/dokumente" />
      </div>

      {/* CTA */}
      <Link
        to="/abrechnung"
        className="card-elevated p-6 flex items-center gap-4 hover:shadow-md transition-shadow group border-primary/20"
      >
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-foreground">Neue Abrechnung erstellen</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Starten Sie den geführten Prozess zur Nebenkostenabrechnung.
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </Link>
    </div>
  );
}
