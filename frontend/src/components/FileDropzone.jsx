import { useState, useCallback, useRef } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE = 5 * 1024 * 1024;

export default function FileDropzone({ file, onFileSelect, error }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const validateAndSet = useCallback(
    (selected) => {
      if (!selected) return;
      if (!ACCEPTED_TYPES.includes(selected.type)) {
        onFileSelect(null, 'Only PDF and DOCX files are supported.');
        return;
      }
      if (selected.size > MAX_SIZE) {
        onFileSelect(null, 'File is too large. Maximum size is 5MB.');
        return;
      }
      onFileSelect(selected, null);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      validateAndSet(e.dataTransfer.files?.[0]);
    },
    [validateAndSet]
  );

  if (file) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-ink-700 bg-white dark:bg-ink-800 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="text-brand-600 dark:text-brand-400 shrink-0" size={20} />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
        </div>
        <button
          onClick={() => onFileSelect(null, null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          aria-label="Remove file"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
            : 'border-slate-300 dark:border-ink-700 hover:border-brand-400'
        }`}
      >
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400">
          <UploadCloud size={22} />
        </span>
        <div>
          <p className="text-sm font-medium">
            <span className="text-brand-600 dark:text-brand-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-400 mt-1">PDF or DOCX, up to 5MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => validateAndSet(e.target.files?.[0])}
        />
      </div>
      {error && <p className="text-sm text-rose-500 mt-2">{error}</p>}
    </div>
  );
}
