import { useQuery } from "@tanstack/react-query";
import { realEstateApi, RealEstateGroup, RealEstate } from "@/lib/api";
import { Home, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Immobilien() {
  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["realEstateGroups"],
    queryFn: realEstateApi.getGroups,
  });

  const { data: properties, isLoading: propsLoading } = useQuery({
    queryKey: ["realEstates"],
    queryFn: realEstateApi.getAll,
  });

  const isLoading = groupsLoading || propsLoading;

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Immobilien</h1>
          <p className="text-muted-foreground mt-1">Verwalten Sie Ihre Immobiliengruppen und Objekte.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Immobilie hinzufügen
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-elevated p-5 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/3 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {groups && groups.length > 0 ? (
            groups.map((group: RealEstateGroup) => (
              <div key={group.id} className="card-elevated p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{group.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {group.addressLineText}
                    </div>
                    {properties && (
                      <div className="mt-3 space-y-2">
                        {properties
                          .filter((p: RealEstate) => p.realEstateGroupId === group.id)
                          .map((p: RealEstate) => (
                            <div
                              key={p.id}
                              className="flex items-center gap-2 text-sm bg-muted/50 rounded-md px-3 py-2"
                            >
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              {p.name}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card-elevated p-12 text-center">
              <Home className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-medium text-foreground">Keine Immobilien vorhanden</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Fügen Sie Ihre erste Immobilie hinzu, um zu beginnen.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
