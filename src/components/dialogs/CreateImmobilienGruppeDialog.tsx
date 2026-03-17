import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { realEstateApi } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function CreateImmobilienGruppeDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => realEstateApi.createGroup({ name, addressLineText: address }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["realEstateGroups"] });
      toast.success("Immobiliengruppe erstellt");
      setOpen(false);
      setName("");
      setAddress("");
    },
    onError: () => toast.error("Fehler beim Erstellen"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Gruppe anlegen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neue Immobiliengruppe</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="group-name">Name</Label>
            <Input id="group-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="z.B. Musterstraße 1-5" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-address">Adresse</Label>
            <Input id="group-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Musterstraße 1, 12345 Berlin" required />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Wird erstellt…" : "Erstellen"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
