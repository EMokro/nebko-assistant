import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { documentApi } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";

export default function UploadDocumentDialog() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => documentApi.upload(files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success(`${files.length} Dokument(e) hochgeladen`);
      setOpen(false);
      setFiles([]);
    },
    onError: () => toast.error("Fehler beim Hochladen"),
  });

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Hochladen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dokumente hochladen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
                  <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button onClick={() => mutation.mutate()} className="w-full" disabled={files.length === 0 || mutation.isPending}>
            {mutation.isPending ? "Wird hochgeladen…" : `${files.length} Datei(en) hochladen`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
