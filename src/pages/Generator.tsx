import { Sparkles } from "lucide-react";

export default function Generator() {
  return (
    <div className="page-container animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Abrechnung erstellen</h1>
        <p className="text-muted-foreground mt-1">
          Generieren Sie automatisch eine Nebenkostenabrechnung.
        </p>
      </div>

      <div className="card-elevated p-12 text-center">
        <Sparkles className="h-12 w-12 text-primary/40 mx-auto mb-3" />
        <h3 className="font-medium text-foreground">Bereit zur Generierung</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          Wählen Sie eine Immobilieneinheit, laden Sie die relevanten Belege hoch und 
          lassen Sie die Abrechnung automatisch erstellen.
        </p>
      </div>
    </div>
  );
}
