import { useQuery } from "@tanstack/react-query";
import { documentApi, DocumentOutput } from "@/lib/api";
import { FileText, CheckCircle, Clock } from "lucide-react";
import UploadDocumentDialog from "@/components/dialogs/UploadDocumentDialog";

export default function Dokumente() {
  const { data: docs, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: documentApi.getAllMetadata,
  });

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dokumente</h1>
          <p className="text-muted-foreground mt-1">Belege und Rechnungen verwalten.</p>
        </div>
        <UploadDocumentDialog />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-elevated p-4 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : docs && docs.length > 0 ? (
        <div className="space-y-2">
          {docs.map((doc: DocumentOutput) => (
            <div key={doc.id} className="card-elevated p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.originalname}</p>
                {doc.documentType && (
                  <p className="text-xs text-muted-foreground">{doc.documentType.name}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                {doc.isProcessed ? (
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Verarbeitet
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-warning">
                    <Clock className="h-3.5 w-3.5" />
                    In Bearbeitung
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-elevated p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-medium text-foreground">Keine Dokumente vorhanden</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Laden Sie Belege und Rechnungen hoch.
          </p>
        </div>
      )}
    </div>
  );
}
