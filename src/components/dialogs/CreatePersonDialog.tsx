import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { personApi } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function CreatePersonDialog() {
  const [open, setOpen] = useState(false);
  const [legalName, setLegalName] = useState("");
  const [personTypeName, setPersonTypeName] = useState("");
  const [country, setCountry] = useState("DE");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [zip, setZip] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const qc = useQueryClient();

  const { data: types } = useQuery({
    queryKey: ["personTypes"],
    queryFn: personApi.getTypes,
  });

  const mutation = useMutation({
    mutationFn: () =>
      personApi.create({
        personTypeName,
        legalName,
        addressData: { country, city, street, zip, houseNo },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["persons"] });
      toast.success("Person erstellt");
      setOpen(false);
      resetForm();
    },
    onError: () => toast.error("Fehler beim Erstellen"),
  });

  function resetForm() {
    setLegalName(""); setPersonTypeName("");
    setCity(""); setStreet(""); setZip(""); setHouseNo("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Person hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neue Person</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} placeholder="Max Mustermann" required />
          </div>
          <div className="space-y-2">
            <Label>Typ</Label>
            <Select value={personTypeName} onValueChange={setPersonTypeName} required>
              <SelectTrigger><SelectValue placeholder="Auswählen" /></SelectTrigger>
              <SelectContent>
                {types?.map((t) => (
                  <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Adresse</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input className="col-span-2" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Straße" required />
              <Input value={houseNo} onChange={(e) => setHouseNo(e.target.value)} placeholder="Nr." required />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="PLZ" required />
              <Input className="col-span-2" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Stadt" required />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Wird erstellt…" : "Erstellen"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
