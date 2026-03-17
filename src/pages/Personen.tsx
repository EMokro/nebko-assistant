import { useQuery } from "@tanstack/react-query";
import { personApi, PersonOutput } from "@/lib/api";
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Personen() {
  const { data: persons, isLoading } = useQuery({
    queryKey: ["persons"],
    queryFn: personApi.getAll,
  });

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Personen</h1>
          <p className="text-muted-foreground mt-1">Mieter und Eigentümer verwalten.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Person hinzufügen
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-elevated p-4 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : persons && persons.length > 0 ? (
        <div className="card-elevated overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Name</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Typ</th>
              </tr>
            </thead>
            <tbody>
              {persons.map((p: PersonOutput) => (
                <tr key={p.personID} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-foreground">{p.legalName}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                      {p.personTypeName}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card-elevated p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-medium text-foreground">Keine Personen vorhanden</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Fügen Sie Mieter oder Eigentümer hinzu.
          </p>
        </div>
      )}
    </div>
  );
}
