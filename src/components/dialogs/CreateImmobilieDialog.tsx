import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { realEstateApi } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const REAL_ESTATE_TYPES = [
  { id: "apartment", label: "Wohnung" },
  { id: "house", label: "Haus" },
  { id: "commercial", label: "Gewerbe" },
];

export default function CreateImmobilieDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [country, setCountry] = useState("DE");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [zip, setZip] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const qc = useQueryClient();

  const { data: groups } = useQuery({
    queryKey: ["realEstateGroups"],
    queryFn: realEstateApi.getGroups,
  });

  const mutation = useMutation({
    mutationFn: () =>
      realEstateApi.create({
        name,
        realEstateTypeID: typeId,
        realEstateGroupId: groupId,
        address: { country, city, street, zip, houseNo },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["realEstates"] });
      toast.success("Immobilie erstellt");
      setOpen(false);
      resetForm();
    },
    onError: () => toast.error("Fehler beim Erstellen"),
  });

  function resetForm() {
    setName(""); setTypeId(""); setGroupId("");
    setCity(""); setStreet(""); setZip(""); setHouseNo("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Immobilie hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Neue Immobilie</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="z.B. Wohnung EG links" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Typ</Label>
              <Select value={typeId} onValueChange={setTypeId} required>
                <SelectTrigger><SelectValue placeholder="Auswählen" /></SelectTrigger>
                <SelectContent>
                  {REAL_ESTATE_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Gruppe</Label>
              <Select value={groupId} onValueChange={setGroupId} required>
                <SelectTrigger><SelectValue placeholder="Auswählen" /></SelectTrigger>
                <SelectContent>
                  {groups?.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
