import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Btn, Input } from "@/components/ui";
import { uploadImage } from "@/lib/upload";

export function ImageUpload({
  value,
  onChange,
  folder = "uploads",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadImage(file, folder));
      toast.success("Image uploaded.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {value ? (
          <span className="relative">
            <img
              src={value}
              alt="Selected"
              className="h-20 w-28 rounded-sm border border-border object-cover"
            />
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => onChange("")}
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-stop"
            >
              <X size={12} />
            </button>
          </span>
        ) : (
          <span className="flex h-20 w-28 items-center justify-center rounded-sm border border-dashed border-border text-faint">
            <ImagePlus size={18} />
          </span>
        )}
        <div className="flex-1 space-y-2">
          <Btn type="button" size="sm" variant="ghost" disabled={busy} onClick={() => ref.current?.click()}>
            {busy ? <Loader2 className="animate-spin" size={13} /> : <ImagePlus size={13} />}
            {busy ? "Uploading…" : "Upload image"}
          </Btn>
          <Input
            placeholder="…or paste an image URL"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void pick(e.target.files?.[0])}
      />
    </div>
  );
}
