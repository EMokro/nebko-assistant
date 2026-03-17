import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { nebkoApi, NebkoAssignment, NebkoPosition } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2, Clock, ChevronDown, ChevronUp, FileText, Building2,
} from "lucide-react";

export default function Abrechnungen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["allAssignments"],
    queryFn: nebkoApi.getAll,
  });

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const isComplete = (a: NebkoAssignment) =>
    a.nebkoPositions && a.nebkoPositions.length > 0;

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Abrechnungen</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Übersicht aller Nebenkostenabrechnungen
          </p>
        </div>
      </div>

      {isLoading || !assignments ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Noch keine Abrechnungen vorhanden.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Starten Sie eine neue Abrechnung über den Wizard.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((a, idx) => {
            const complete = isComplete(a);
            const expanded = expandedId === (a.id ?? String(idx));
            const key = a.id ?? String(idx);

            return (
              <Card key={key} className="overflow-hidden">
                <button
                  onClick={() => toggle(key)}
                  className="w-full text-left"
                >
                  <CardHeader className="py-4 px-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {a.assignmentYear}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {a.billingPeriodStart} – {a.billingPeriodEnd}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={complete ? "default" : "secondary"}>
                          {complete ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Abgeschlossen
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> In Bearbeitung
                            </span>
                          )}
                        </Badge>
                        {expanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </button>

                {expanded && (
                  <CardContent className="pt-0 pb-5 px-5">
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Abrechnungsjahr</p>
                        <p className="text-sm font-medium text-foreground">{a.assignmentYear}</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">CO₂-Kosten</p>
                        <p className="text-sm font-medium text-foreground">
                          {a.co2Costs?.toFixed(2) ?? "–"} €
                        </p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Nutzungszeitraum</p>
                        <p className="text-sm font-medium text-foreground">
                          {a.periodOfUseStart} – {a.periodOfUseEnd}
                        </p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Positionen</p>
                        <p className="text-sm font-medium text-foreground">
                          {a.nebkoPositions?.length ?? 0}
                        </p>
                      </div>
                    </div>

                    {/* Positions table */}
                    {a.nebkoPositions && a.nebkoPositions.length > 0 ? (
                      <div className="border rounded-lg overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/40">
                              <TableHead>Kostenart</TableHead>
                              <TableHead>Verteilschlüssel</TableHead>
                              <TableHead className="text-right">Gesamtkosten</TableHead>
                              <TableHead className="text-right">Eigenanteil</TableHead>
                              <TableHead className="text-right">Gesamt-Einh.</TableHead>
                              <TableHead className="text-right">Eigen-Einh.</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {a.nebkoPositions.map((pos: NebkoPosition) => (
                              <TableRow key={pos.id}>
                                <TableCell className="font-medium">{pos.nebkoPositionTypeName}</TableCell>
                                <TableCell className="text-muted-foreground">{pos.allocationKeyType ?? "–"}</TableCell>
                                <TableCell className="text-right">{pos.totalCosts.toFixed(2)} €</TableCell>
                                <TableCell className="text-right font-medium text-primary">{pos.ownCosts.toFixed(2)} €</TableCell>
                                <TableCell className="text-right text-muted-foreground">{pos.totalUnits ?? "–"}</TableCell>
                                <TableCell className="text-right text-muted-foreground">{pos.ownUnits ?? "–"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                          <TableFooter>
                            <TableRow>
                              <TableCell colSpan={2} className="font-medium">Summe</TableCell>
                              <TableCell className="text-right font-medium">
                                {a.nebkoPositions.reduce((s, p) => s + p.totalCosts, 0).toFixed(2)} €
                              </TableCell>
                              <TableCell className="text-right font-medium text-primary">
                                {a.nebkoPositions.reduce((s, p) => s + p.ownCosts, 0).toFixed(2)} €
                              </TableCell>
                              <TableCell colSpan={2} />
                            </TableRow>
                          </TableFooter>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-sm text-muted-foreground">
                        <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground/40" />
                        Noch keine Positionen vorhanden – Generierung läuft oder steht aus.
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
