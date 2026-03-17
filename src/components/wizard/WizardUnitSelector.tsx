import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  realEstateApi,
  RealEstateGroup,
  RealEstate,
  RealEstateUnit,
  RealEstateType,
} from "@/lib/api";
import {
  Building2,
  Home,
  DoorOpen,
  Plus,
  Loader2,
  AlertCircle,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  unitId: string;
  onUnitSelected: (unitId: string) => void;
}

export default function WizardUnitSelector({ unitId, onUnitSelected }: Props) {
  const qc = useQueryClient();

  // Selection state
  const [groupId, setGroupId] = useState("");
  const [realEstateId, setRealEstateId] = useState("");

  // Inline create toggles
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateRealEstate, setShowCreateRealEstate] = useState(false);
  const [showCreateUnit, setShowCreateUnit] = useState(false);

  // Create group form
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupAddress, setNewGroupAddress] = useState("");

  // Create real estate form
  const [newReName, setNewReName] = useState("");
  const [newReTypeId, setNewReTypeId] = useState("");
  const [newReStreet, setNewReStreet] = useState("");
  const [newReHouseNo, setNewReHouseNo] = useState("");
  const [newReZip, setNewReZip] = useState("");
  const [newReCity, setNewReCity] = useState("");

  // Create unit form
  const [newUnitName, setNewUnitName] = useState("");

  // Queries
  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["realEstateGroups"],
    queryFn: realEstateApi.getGroups,
  });

  const { data: allProperties, isLoading: propsLoading } = useQuery({
    queryKey: ["realEstates"],
    queryFn: realEstateApi.getAll,
  });

  const { data: types } = useQuery({
    queryKey: ["realEstateTypes"],
    queryFn: realEstateApi.getTypes,
  });

  const { data: allUnits, isLoading: unitsLoading } = useQuery({
    queryKey: ["realEstateUnits"],
    queryFn: realEstateApi.getUnits,
  });

  // Filtered data
  const properties = allProperties?.filter(
    (p: RealEstate) => p.realEstateGroupId === groupId
  );
  const units = allUnits?.filter(
    (u: RealEstateUnit) => u.realEstateId === realEstateId
  );

  // Mutations
  const createGroupMut = useMutation({
    mutationFn: () =>
      realEstateApi.createGroup({
        name: newGroupName,
        addressLineText: newGroupAddress,
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["realEstateGroups"] });
      toast.success("Gruppe erstellt");
      setGroupId(data.id);
      setShowCreateGroup(false);
      setNewGroupName("");
      setNewGroupAddress("");
    },
    onError: () => toast.error("Fehler beim Erstellen der Gruppe"),
  });

  const createRealEstateMut = useMutation({
    mutationFn: () =>
      realEstateApi.create({
        name: newReName,
        realEstateTypeID: newReTypeId,
        realEstateGroupId: groupId,
        address: {
          country: "DE",
          city: newReCity,
          street: newReStreet,
          zip: newReZip,
          houseNo: newReHouseNo,
        },
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["realEstates"] });
      toast.success("Immobilie erstellt");
      setRealEstateId(data.id);
      setShowCreateRealEstate(false);
      setNewReName("");
      setNewReTypeId("");
      setNewReStreet("");
      setNewReHouseNo("");
      setNewReZip("");
      setNewReCity("");
    },
    onError: () => toast.error("Fehler beim Erstellen der Immobilie"),
  });

  const createUnitMut = useMutation({
    mutationFn: () =>
      realEstateApi.createUnit({
        name: newUnitName,
        realEstateId: realEstateId,
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["realEstateUnits"] });
      toast.success("Einheit erstellt");
      onUnitSelected(data.id);
      setShowCreateUnit(false);
      setNewUnitName("");
    },
    onError: () => toast.error("Fehler beim Erstellen der Einheit"),
  });

  function handleGroupChange(id: string) {
    setGroupId(id);
    setRealEstateId("");
    onUnitSelected("");
  }

  function handleRealEstateChange(id: string) {
    setRealEstateId(id);
    onUnitSelected("");
  }

  const isLoading = groupsLoading || propsLoading || unitsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm p-4">
        <Loader2 className="h-4 w-4 animate-spin" /> Daten werden geladen…
      </div>
    );
  }

  const selectedGroup = groups?.find((g) => g.id === groupId);
  const selectedRe = allProperties?.find((p) => p.id === realEstateId);

  return (
    <div className="space-y-4">
      {/* Step A: Gruppe */}
      <div className="card-elevated p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-medium text-foreground">
              1. Immobiliengruppe
            </h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateGroup(!showCreateGroup)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Neu
          </Button>
        </div>

        {showCreateGroup ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createGroupMut.mutate();
            }}
            className="space-y-3 border rounded-lg p-4 bg-muted/30"
          >
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="z.B. Musterstraße 1-5"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={newGroupAddress}
                onChange={(e) => setNewGroupAddress(e.target.value)}
                placeholder="Musterstraße 1, 12345 Berlin"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={createGroupMut.isPending}
              >
                {createGroupMut.isPending ? "Erstelle…" : "Erstellen"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCreateGroup(false)}
              >
                Abbrechen
              </Button>
            </div>
          </form>
        ) : groups && groups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {groups.map((g: RealEstateGroup) => (
              <button
                key={g.id}
                type="button"
                onClick={() => handleGroupChange(g.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-colors ${
                  groupId === g.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                }`}
              >
                <Home
                  className={`h-4 w-4 flex-shrink-0 ${
                    groupId === g.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                <div>
                  <span className="font-medium text-foreground">{g.name}</span>
                  <p className="text-xs text-muted-foreground">
                    {g.addressLineText}
                  </p>
                </div>
                {groupId === g.id && (
                  <Check className="h-4 w-4 text-primary ml-auto" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            Keine Gruppen vorhanden. Erstellen Sie eine neue.
          </div>
        )}
      </div>

      {/* Step B: Immobilie */}
      {groupId && (
        <div className="card-elevated p-5 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-medium text-foreground">
                2. Immobilie
              </h3>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setShowCreateRealEstate(!showCreateRealEstate)
              }
            >
              <Plus className="h-4 w-4 mr-1" />
              Neu
            </Button>
          </div>

          {showCreateRealEstate ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createRealEstateMut.mutate();
              }}
              className="space-y-3 border rounded-lg p-4 bg-muted/30"
            >
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newReName}
                  onChange={(e) => setNewReName(e.target.value)}
                  placeholder="z.B. Hauptgebäude"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Typ</Label>
                <Select
                  value={newReTypeId}
                  onValueChange={setNewReTypeId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {types?.map((t: RealEstateType) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    className="col-span-2"
                    value={newReStreet}
                    onChange={(e) => setNewReStreet(e.target.value)}
                    placeholder="Straße"
                    required
                  />
                  <Input
                    value={newReHouseNo}
                    onChange={(e) => setNewReHouseNo(e.target.value)}
                    placeholder="Nr."
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={newReZip}
                    onChange={(e) => setNewReZip(e.target.value)}
                    placeholder="PLZ"
                    required
                  />
                  <Input
                    className="col-span-2"
                    value={newReCity}
                    onChange={(e) => setNewReCity(e.target.value)}
                    placeholder="Stadt"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={createRealEstateMut.isPending}
                >
                  {createRealEstateMut.isPending ? "Erstelle…" : "Erstellen"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateRealEstate(false)}
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          ) : properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {properties.map((p: RealEstate) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleRealEstateChange(p.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-colors ${
                    realEstateId === p.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <Building2
                    className={`h-4 w-4 flex-shrink-0 ${
                      realEstateId === p.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span className="font-medium text-foreground">{p.name}</span>
                  {realEstateId === p.id && (
                    <Check className="h-4 w-4 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Keine Immobilien in dieser Gruppe. Erstellen Sie eine neue.
            </div>
          )}
        </div>
      )}

      {/* Step C: Einheit */}
      {realEstateId && (
        <div className="card-elevated p-5 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-medium text-foreground">
                3. Mieteinheit
              </h3>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateUnit(!showCreateUnit)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Neu
            </Button>
          </div>

          {showCreateUnit ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createUnitMut.mutate();
              }}
              className="space-y-3 border rounded-lg p-4 bg-muted/30"
            >
              <div className="space-y-2">
                <Label>Name der Einheit</Label>
                <Input
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="z.B. Wohnung EG links"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={createUnitMut.isPending}
                >
                  {createUnitMut.isPending ? "Erstelle…" : "Erstellen"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateUnit(false)}
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          ) : units && units.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {units.map((u: RealEstateUnit) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onUnitSelected(u.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-colors ${
                    unitId === u.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <DoorOpen
                    className={`h-4 w-4 flex-shrink-0 ${
                      unitId === u.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span className="font-medium text-foreground">{u.name}</span>
                  {unitId === u.id && (
                    <Check className="h-4 w-4 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Keine Einheiten vorhanden. Erstellen Sie eine neue.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
