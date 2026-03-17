import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { realEstateApi, generatorApi } from "@/lib/api";
import { Sparkles, Upload, X, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Generator() {
  const [unitId, setUnitId] = useState("");
  const [assignmentYear, setAssignmentYear] = useState(new Date().getFullYear().toString());
  const [periodStart, setPeriodStart] = useState(`${new Date().getFullYear()}-01-01`);
  const [periodEnd, setPeriodEnd] = useState(`${new Date().getFullYear()}-12-31`);
  const [billingStart, setBillingStart] = useState(`${new Date().getFullYear()}-01-01`);
  const [billingEnd, setBillingEnd] = useState(`${new Date().getFullYear()}-12-31`);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: units } = useQuery({
    queryKey: ["realEstateUnits"],
    queryFn: realEstateApi.getUnits,
  });

  const mutation = useMutation({
    mutationFn: () =>
      generatorApi.start({
        files,
        realEstateUnitId: unitId,
        assignmentYear,
        periodOfUseStart: periodStart,
        periodOfUseEnd: periodEnd,
        billingPeriodStart: billingStart,
        billingPeriodEnd: billingEnd,
      }),
    onSuccess: () => {
      toast.success("Abrechnung wurde gestartet!");
      setFiles([]);
    },
    onError: () => toast.error("Fehler beim Starten der Abrechnung"),
  });

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  }

  const canSubmit = unitId && files.length > 0 && assignmentYear;

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Abrechnung erstellen</h1>
        <p className="text-muted-foreground mt-1">
          Generieren Sie automatisch eine Nebenkostenabrechnung.
        </p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
        className="space-y-6 max-w-2xl"
      >
        {/* Unit selection */}
        <div className="card-elevated p-5 space-y-4">
          <h2 className="font-medium text-foreground">1. Einheit auswählen</h2>
          <Select value={unitId} onValueChange={setUnitId}>
            <SelectTrigger><SelectValue placeholder="Einheit auswählen" /></SelectTrigger>
            <SelectContent>
              {units?.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Periods */}
        <div className="card-elevated p-5 space-y-4">
          <h2 className="font-medium text-foreground">2. Zeitraum festlegen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Abrechnungsjahr</Label>
              <Input value={assignmentYear} onChange={(e) => setAssignmentYear(e.target.value)} placeholder="2023" required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nutzungszeitraum Start</Label>
              <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Nutzungszeitraum Ende</Label>
              <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Abrechnungszeitraum Start</Label>
              <Input type="date" value={billingStart} onChange={(e) => setBillingStart(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Abrechnungszeitraum Ende</Label>
              <Input type="date" value={billingEnd} onChange={(e) => setBillingEnd(e.target.value)} required />
            </div>
          </div>
        </div>

        {/* File upload */}
        <div className="card-elevated p-5 space-y-4">
          <h2 className="font-medium text-foreground">3. Belege hochladen</h2>
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Upload className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Klicken oder Dateien hierher ziehen</p>
            <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFiles} accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv" />
          </div>
          {files.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate flex-1">{f.name}</span>
                  <button type="button" onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={!canSubmit || mutation.isPending}>
          <Sparkles className="h-4 w-4 mr-2" />
          {mutation.isPending ? "Wird generiert…" : "Abrechnung starten"}
          {!mutation.isPending && <ChevronRight className="h-4 w-4 ml-1" />}
        </Button>
      </form>
    </div>
  );
}
