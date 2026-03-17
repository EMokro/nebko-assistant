import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { realEstateApi, documentApi, generatorApi, DocumentOutput } from "@/lib/api";
import {
  Building2, FileText, Upload, X, ChevronRight, ChevronLeft,
  Sparkles, Check, Loader2, AlertCircle,
} from "lucide-react";
import WizardUnitSelector from "@/components/wizard/WizardUnitSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const STEPS = [
  { label: "Einheit & Dokumente", icon: Building2 },
  { label: "Zeitraum", icon: FileText },
  { label: "Generierung", icon: Sparkles },
  { label: "Ergebnis", icon: Check },
];

export default function Wizard() {
  const [step, setStep] = useState(0);

  // Step 1 — unit + docs
  const [unitId, setUnitId] = useState("");
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Step 2 — periods
  const [assignmentYear, setAssignmentYear] = useState(new Date().getFullYear().toString());
  const [periodStart, setPeriodStart] = useState(`${new Date().getFullYear()}-01-01`);
  const [periodEnd, setPeriodEnd] = useState(`${new Date().getFullYear()}-12-31`);
  const [billingStart, setBillingStart] = useState(`${new Date().getFullYear()}-01-01`);
  const [billingEnd, setBillingEnd] = useState(`${new Date().getFullYear()}-12-31`);

  // Step 3+4 — result
  const [result, setResult] = useState<unknown[] | null>(null);

  const { data: docs, isLoading: docsLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: documentApi.getAllMetadata,
  });

  const mutation = useMutation({
    mutationFn: () =>
      generatorApi.start({
        files: extraFiles,
        realEstateUnitId: unitId,
        assignmentYear,
        periodOfUseStart: periodStart,
        periodOfUseEnd: periodEnd,
        billingPeriodStart: billingStart,
        billingPeriodEnd: billingEnd,
      }),
    onSuccess: (data) => {
      setResult(data as unknown[]);
      toast.success("Abrechnung erfolgreich generiert!");
      setStep(3);
    },
    onError: () => toast.error("Fehler beim Generieren der Abrechnung"),
  });

  function toggleDoc(docId: string) {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setExtraFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  }

  function canProceed(): boolean {
    if (step === 0) return !!unitId && (selectedDocIds.length > 0 || extraFiles.length > 0);
    if (step === 1) return !!assignmentYear;
    return true;
  }

  function handleNext() {
    if (step === 1) {
      setStep(2);
      // auto-start generation
      setTimeout(() => mutation.mutate(), 400);
    } else {
      setStep((s) => s + 1);
    }
  }

  const selectedUnitName = unitId; // display the ID for now

  return (
    <div className="page-container animate-fade-in">
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && (
                <div className={`h-px w-8 sm:w-12 ${done ? "bg-primary" : "bg-border"}`} />
              )}
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : done
                    ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <s.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Step 0: Unit + Documents */}
      {step === 0 && (
        <div className="space-y-6 max-w-3xl">
          {/* Unit selection */}
          <div className="card-elevated p-5 space-y-4">
            <h2 className="text-lg font-medium text-foreground">Mietobjekt auswählen</h2>
            <p className="text-sm text-muted-foreground">Welche Einheit soll abgerechnet werden?</p>
            {unitsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Einheiten werden geladen…
              </div>
            ) : units && units.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {units.map((u: RealEstateUnit) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUnitId(u.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-colors ${
                      unitId === u.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <Building2 className={`h-5 w-5 flex-shrink-0 ${unitId === u.id ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-medium text-foreground">{u.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-warning">
                <AlertCircle className="h-4 w-4" />
                Keine Einheiten vorhanden. Bitte legen Sie zuerst eine Immobilie an.
              </div>
            )}
          </div>

          {/* Document selection */}
          <div className="card-elevated p-5 space-y-4">
            <h2 className="text-lg font-medium text-foreground">Dokumente auswählen</h2>
            <p className="text-sm text-muted-foreground">
              Wählen Sie vorhandene Belege oder laden Sie neue hoch.
            </p>

            {/* Existing docs */}
            {docsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Dokumente werden geladen…
              </div>
            ) : docs && docs.length > 0 ? (
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {docs.map((doc: DocumentOutput) => (
                  <label
                    key={doc.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedDocIds.includes(doc.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      checked={selectedDocIds.includes(doc.id)}
                      onCheckedChange={() => toggleDoc(doc.id)}
                    />
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{doc.originalname}</p>
                      {doc.documentType && (
                        <p className="text-xs text-muted-foreground">{doc.documentType.name}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Noch keine Dokumente vorhanden.</p>
            )}

            {/* Upload new files */}
            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-foreground mb-2">Oder neue Dateien hochladen</p>
              <div
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="h-6 w-6 text-muted-foreground/40 mx-auto mb-1" />
                <p className="text-sm text-muted-foreground">Klicken oder Dateien hierher ziehen</p>
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFiles}
                  accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv"
                />
              </div>
              {extraFiles.length > 0 && (
                <div className="space-y-1.5 mt-3 max-h-36 overflow-y-auto">
                  {extraFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate flex-1">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => setExtraFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Periods */}
      {step === 1 && (
        <div className="space-y-6 max-w-2xl">
          <div className="card-elevated p-5 space-y-4">
            <h2 className="text-lg font-medium text-foreground">Zeitraum festlegen</h2>
            <p className="text-sm text-muted-foreground">
              Für welchen Zeitraum soll die Abrechnung erstellt werden?
            </p>
            <div className="space-y-2">
              <Label>Abrechnungsjahr</Label>
              <Input value={assignmentYear} onChange={(e) => setAssignmentYear(e.target.value)} placeholder="2023" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nutzungszeitraum Start</Label>
                <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Nutzungszeitraum Ende</Label>
                <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Abrechnungszeitraum Start</Label>
                <Input type="date" value={billingStart} onChange={(e) => setBillingStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Abrechnungszeitraum Ende</Label>
                <Input type="date" value={billingEnd} onChange={(e) => setBillingEnd(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="card-elevated p-5 space-y-2 bg-muted/30">
            <h3 className="text-sm font-medium text-foreground">Zusammenfassung</h3>
            <p className="text-sm text-muted-foreground">
              Einheit: <span className="text-foreground font-medium">{selectedUnit?.name || unitId}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Dokumente: <span className="text-foreground font-medium">{selectedDocIds.length + extraFiles.length} ausgewählt</span>
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Generating */}
      {step === 2 && (
        <div className="max-w-2xl">
          <div className="card-elevated p-12 text-center space-y-4">
            {mutation.isPending ? (
              <>
                <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
                <h2 className="text-lg font-medium text-foreground">Abrechnung wird generiert…</h2>
                <p className="text-sm text-muted-foreground">
                  Ihre Belege werden analysiert und die Nebenkostenabrechnung erstellt.
                </p>
              </>
            ) : mutation.isError ? (
              <>
                <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                <h2 className="text-lg font-medium text-foreground">Fehler bei der Generierung</h2>
                <p className="text-sm text-muted-foreground">
                  Bitte versuchen Sie es erneut oder prüfen Sie Ihre Eingaben.
                </p>
                <Button onClick={() => mutation.mutate()} variant="outline">
                  Erneut versuchen
                </Button>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 3 && (
        <div className="space-y-6 max-w-3xl">
          <div className="card-elevated p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-foreground">Abrechnung erstellt</h2>
                <p className="text-sm text-muted-foreground">
                  Einheit: {selectedUnit?.name || unitId} · Jahr: {assignmentYear}
                </p>
              </div>
            </div>

            {result && Array.isArray(result) && result.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Ergebnis-Positionen</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40">
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">#</th>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.map((item, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                          <td className="px-4 py-3">
                            <pre className="text-xs text-foreground whitespace-pre-wrap break-all">
                              {JSON.stringify(item, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-muted/30 rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Die Abrechnung wurde gestartet. Das Ergebnis wird verarbeitet.
                </p>
              </div>
            )}
          </div>

          <Button onClick={() => { setStep(0); setResult(null); setUnitId(""); setSelectedDocIds([]); setExtraFiles([]); }} variant="outline" className="w-full">
            Neue Abrechnung starten
          </Button>
        </div>
      )}

      {/* Navigation */}
      {step < 2 && (
        <div className="flex items-center justify-between mt-8 max-w-3xl">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Zurück
          </Button>
          <Button onClick={handleNext} disabled={!canProceed()}>
            {step === 1 ? (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                Abrechnung generieren
              </>
            ) : (
              <>
                Weiter
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
