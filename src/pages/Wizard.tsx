import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { realEstateApi, documentApi, generatorApi, DocumentOutput, NebkoAssignment, NebkoPosition, nebkoApi } from "@/lib/api";
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
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Step 2 — periods
  const [assignmentYear, setAssignmentYear] = useState(new Date().getFullYear().toString());
  const [periodStart, setPeriodStart] = useState(`${new Date().getFullYear()}-01-01`);
  const [periodEnd, setPeriodEnd] = useState(`${new Date().getFullYear()}-12-31`);
  const [billingStart, setBillingStart] = useState(`${new Date().getFullYear()}-01-01`);
  const [billingEnd, setBillingEnd] = useState(`${new Date().getFullYear()}-12-31`);

  // Step 3+4 — result
  const [assignments, setAssignments] = useState<NebkoAssignment[]>([]);

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
    onSuccess: async () => {
      toast.success("Abrechnung erfolgreich generiert!");
      try {
        const data = await nebkoApi.getAssignmentsForUnit(unitId);
        setAssignments(Array.isArray(data) ? data : [data]);
      } catch {
        setAssignments([]);
      }
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
    if (step === 0) return !!unitId && extraFiles.length > 0;
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
          {/* Unit selection via cascading selector */}
          <WizardUnitSelector unitId={unitId} onUnitSelected={setUnitId} />

          <div className="card-elevated p-5 space-y-4">
            <h2 className="text-lg font-medium text-foreground">Dokumente hochladen</h2>
            <p className="text-sm text-muted-foreground">
              Laden Sie die Belege und Rechnungen für die Abrechnung hoch.
            </p>

            <div>
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
              Einheit: <span className="text-foreground font-medium">{unitId}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Dokumente: <span className="text-foreground font-medium">{extraFiles.length} hochgeladen</span>
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
        <div className="space-y-6 max-w-4xl">
          <div className="card-elevated p-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-foreground">Abrechnung erstellt</h2>
                <p className="text-sm text-muted-foreground">
                  Einheit: {unitId} · Jahr: {assignmentYear}
                </p>
              </div>
            </div>

            {assignments.length > 0 ? (
              <div className="space-y-6">
                {assignments.map((assignment, ai) => (
                  <div key={assignment.id ?? ai} className="space-y-4">
                    {/* Assignment summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Abrechnungsjahr</p>
                        <p className="text-sm font-medium text-foreground">{assignment.assignmentYear}</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">CO₂-Kosten</p>
                        <p className="text-sm font-medium text-foreground">{assignment.co2Costs?.toFixed(2) ?? "–"} €</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Nutzungszeitraum</p>
                        <p className="text-sm font-medium text-foreground">{assignment.periodOfUseStart} – {assignment.periodOfUseEnd}</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Abrechnungszeitraum</p>
                        <p className="text-sm font-medium text-foreground">{assignment.billingPeriodStart} – {assignment.billingPeriodEnd}</p>
                      </div>
                    </div>

                    {/* NebkoPositions table */}
                    {assignment.nebkoPositions && assignment.nebkoPositions.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                          Nebenkostenpositionen ({assignment.nebkoPositions.length})
                        </h3>
                        <div className="border rounded-lg overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-muted/40">
                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Kostenart</th>
                                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Verteilschlüssel</th>
                                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Gesamtkosten</th>
                                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Eigenanteil</th>
                                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Gesamt-Einheiten</th>
                                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Eigen-Einheiten</th>
                              </tr>
                            </thead>
                            <tbody>
                              {assignment.nebkoPositions.map((pos: NebkoPosition) => (
                                <tr key={pos.id} className="border-t hover:bg-muted/20 transition-colors">
                                  <td className="px-4 py-3 font-medium text-foreground">{pos.nebkoPositionTypeName}</td>
                                  <td className="px-4 py-3 text-muted-foreground">{pos.allocationKeyType ?? "–"}</td>
                                  <td className="px-4 py-3 text-right text-foreground">{pos.totalCosts.toFixed(2)} €</td>
                                  <td className="px-4 py-3 text-right font-medium text-primary">{pos.ownCosts.toFixed(2)} €</td>
                                  <td className="px-4 py-3 text-right text-muted-foreground">{pos.totalUnits ?? "–"}</td>
                                  <td className="px-4 py-3 text-right text-muted-foreground">{pos.ownUnits ?? "–"}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t bg-muted/20 font-medium">
                                <td className="px-4 py-3 text-foreground" colSpan={2}>Summe</td>
                                <td className="px-4 py-3 text-right text-foreground">
                                  {assignment.nebkoPositions.reduce((s: number, p: NebkoPosition) => s + p.totalCosts, 0).toFixed(2)} €
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-primary">
                                  {assignment.nebkoPositions.reduce((s: number, p: NebkoPosition) => s + p.ownCosts, 0).toFixed(2)} €
                                </td>
                                <td colSpan={2}></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Keine Nebenkostenpositionen vorhanden.</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-muted/30 rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Keine Abrechnungsdaten gefunden.
                </p>
              </div>
            )}
          </div>

          <Button onClick={() => { setStep(0); setAssignments([]); setUnitId(""); setSelectedDocIds([]); setExtraFiles([]); }} variant="outline" className="w-full">
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
