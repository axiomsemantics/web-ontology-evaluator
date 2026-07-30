import { UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
  accept: string;
  multiple?: boolean;
  label: string;
  hint: string;
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export function FileDropzone({ accept, multiple, label, hint, onFiles, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  return (
    <div
      className={`dropzone ${dragging ? "dragging" : ""}`}
      onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) onFiles([...event.dataTransfer.files]);
      }}
    >
      <UploadCloud aria-hidden="true" />
      <strong>{label}</strong>
      <span>{hint}</span>
      <button type="button" className="secondaryButton" disabled={disabled} onClick={() => inputRef.current?.click()}>
        Browse files
      </button>
      <input
        ref={inputRef}
        className="srOnly"
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-label={label}
        onChange={(event) => onFiles([...(event.target.files ?? [])])}
      />
    </div>
  );
}
