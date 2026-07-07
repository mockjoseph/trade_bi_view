import { useState, useEffect, useMemo, useRef } from "react";
import {
  Upload as UploadIcon,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toNumberOrNull(str) {
  if (str === "" || str === null || str === undefined) return null;
  const n = parseFloat(str);
  return Number.isNaN(n) ? null : n;
}

function money(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `row-${idCounter}-${Date.now()}`;
}

function normalizeResult(data) {
  const items = Array.isArray(data?.items) ? data.items : [];
  return {
    merchant: data?.merchant ?? "",
    date: data?.date ?? "",
    items: items.map((it) => ({
      id: nextId(),
      name: it?.name ?? "",
      price: it?.price === null || it?.price === undefined ? "" : String(it.price),
    })),
    subtotal: data?.subtotal === null || data?.subtotal === undefined ? "" : String(data.subtotal),
    tax: data?.tax === null || data?.tax === undefined ? "" : String(data.tax),
    total: data?.total === null || data?.total === undefined ? "" : String(data.total),
  };
}

// Matches the input styling feel of the rest of the app: transparent by
// default, a subtle recessed fill on focus so it's obvious what's editable.
const inputBase =
  "w-full bg-transparent rounded-md px-2 py-1 -mx-2 text-slate-200 transition-colors focus:outline-none focus:bg-slate-900 focus:ring-1 focus:ring-slate-600";

// Alert pill, same shape as the "3 unpaid invoices" pill in the dashboard header.
function AlertPill({ tone = "amber", children, action }) {
  const tones = {
    amber: "bg-amber-950 text-amber-300 border-amber-800",
    red: "bg-red-950 text-red-300 border-red-800",
  };
  return (
    <div className={`flex items-center justify-between gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>
      <span className="flex items-center gap-1.5">
        <AlertCircle size={11} />
        {children}
      </span>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="font-semibold underline underline-offset-2 shrink-0 hover:text-amber-100"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReceiptUploader({ onSave } = {}) {
  const [status, setStatus] = useState("idle"); // idle | loading | error | ready
  const [errorMsg, setErrorMsg] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [receipt, setReceipt] = useState(null); // normalized, editable
  const [savedFlash, setSavedFlash] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setStatus("loading");
    setErrorMsg("");
    setSavedFlash(false);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/receipts/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded ${response.status}`);
      }

      const data = await response.json();
      setReceipt(normalizeResult(data));
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Could not read that receipt.");
      setStatus("error");
    }
  }

  function updateField(field, value) {
    setReceipt((r) => ({ ...r, [field]: value }));
    setSavedFlash(false);
  }

  function updateItem(id, field, value) {
    setReceipt((r) => ({
      ...r,
      items: r.items.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    }));
    setSavedFlash(false);
  }

  function removeItem(id) {
    setReceipt((r) => ({ ...r, items: r.items.filter((it) => it.id !== id) }));
    setSavedFlash(false);
  }

  function addItem() {
    setReceipt((r) => ({
      ...r,
      items: [...r.items, { id: nextId(), name: "", price: "" }],
    }));
    setSavedFlash(false);
  }

  const itemsSum = useMemo(() => {
    if (!receipt) return 0;
    return receipt.items.reduce((sum, it) => sum + (toNumberOrNull(it.price) || 0), 0);
  }, [receipt]);

  const subtotalNum = receipt ? toNumberOrNull(receipt.subtotal) : null;
  const taxNum = receipt ? toNumberOrNull(receipt.tax) : null;
  const totalNum = receipt ? toNumberOrNull(receipt.total) : null;

  const subtotalMismatch = subtotalNum !== null && Math.abs(itemsSum - subtotalNum) > 0.01;

  const totalMismatch =
    subtotalNum !== null &&
    taxNum !== null &&
    totalNum !== null &&
    Math.abs(subtotalNum + taxNum - totalNum) > 0.01;

  function applyComputedSubtotal() {
    updateField("subtotal", itemsSum.toFixed(2));
  }

  function applyComputedTotal() {
    if (subtotalNum === null) return;
    const computed = subtotalNum + (taxNum || 0);
    updateField("total", computed.toFixed(2));
  }

  function handleSave() {
    if (!receipt) return;
    const cleaned = {
      merchant: receipt.merchant.trim() || null,
      date: receipt.date.trim() || null,
      items: receipt.items
        .filter((it) => it.name.trim() !== "" || it.price !== "")
        .map((it) => ({
          name: it.name.trim(),
          price: toNumberOrNull(it.price),
        })),
      subtotal: subtotalNum,
      tax: taxNum,
      total: totalNum,
    };
    setSavedFlash(true);
    if (typeof onSave === "function") {
      onSave(cleaned);
    } else {
      console.log("Receipt confirmed:", cleaned);
    }
  }

  function reset() {
    setReceipt(null);
    setStatus("idle");
    setErrorMsg("");
    setSavedFlash(false);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <div className="max-w-md mx-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-3">
          Materials Receipt
        </p>

        {/* Upload control */}
        <label className="flex items-center gap-3 bg-slate-800 rounded-xl p-4 mb-4 cursor-pointer hover:bg-slate-750 transition-colors">
          <div className="w-9 h-9 rounded-md flex items-center justify-center bg-slate-900 text-slate-500 shrink-0">
            <UploadIcon size={16} />
          </div>
          <span className="flex-1 text-sm font-medium text-slate-300">
            {imagePreview ? "Replace photo" : "Upload receipt photo"}
          </span>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Receipt preview"
              className="w-10 h-10 rounded-md object-cover border border-slate-700 shrink-0"
            />
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </label>

        {status === "loading" && (
          <div className="bg-slate-800 rounded-xl overflow-hidden px-4 py-6 text-center mb-4">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <Loader2 size={13} className="animate-spin" />
              Reading the receipt…
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="bg-slate-800 rounded-xl overflow-hidden px-4 py-6 text-center mb-4">
            <p className="text-xs text-red-400">
              Couldn't read that receipt: {errorMsg}. Try again, or upload a clearer photo.
            </p>
          </div>
        )}

        {status === "idle" && (
          <div className="bg-slate-800 rounded-xl overflow-hidden px-4 py-6 text-center">
            <p className="text-xs text-slate-500">No receipt yet. Upload a photo to get started.</p>
          </div>
        )}

        {status === "ready" && receipt && (
          <>
            <div className="bg-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700">
                <input
                  className={`${inputBase} text-sm font-semibold text-slate-50 placeholder:text-slate-600 placeholder:font-medium`}
                  value={receipt.merchant}
                  placeholder="Merchant name"
                  onChange={(e) => updateField("merchant", e.target.value)}
                />
                <input
                  className={`${inputBase} text-[11px] text-slate-500 mt-0.5`}
                  value={receipt.date}
                  placeholder="Date (e.g. 2026-07-07)"
                  onChange={(e) => updateField("date", e.target.value)}
                />
              </div>

              {/* Line items */}
              <div className="divide-y divide-slate-900">
                {receipt.items.map((it) => (
                  <div key={it.id} className="px-4 py-2 flex items-center gap-2">
                    <input
                      className={`${inputBase} flex-1 text-sm text-slate-300`}
                      value={it.name}
                      placeholder="Item name"
                      onChange={(e) => updateItem(it.id, "name", e.target.value)}
                    />
                    <input
                      className={`${inputBase} w-20 text-xs text-right tabular-nums text-slate-400`}
                      value={it.price}
                      placeholder="0.00"
                      inputMode="decimal"
                      onChange={(e) => updateItem(it.id, "price", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(it.id)}
                      className="p-1 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-950/50 transition-colors shrink-0"
                      aria-label="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="px-4 py-2 border-b border-slate-700">
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Plus size={11} />
                  Add item
                </button>
              </div>

              {/* Totals */}
              <div className="px-4 py-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Subtotal</span>
                  <input
                    className={`${inputBase} w-20 text-right tabular-nums text-slate-300`}
                    value={receipt.subtotal}
                    placeholder="0.00"
                    inputMode="decimal"
                    onChange={(e) => updateField("subtotal", e.target.value)}
                  />
                </div>
                {subtotalMismatch && (
                  <AlertPill
                    action={{ label: `Use ${money(itemsSum)}`, onClick: applyComputedSubtotal }}
                  >
                    Items add up to ${money(itemsSum)}, not ${money(subtotalNum)}
                  </AlertPill>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Tax</span>
                  <input
                    className={`${inputBase} w-20 text-right tabular-nums text-slate-300`}
                    value={receipt.tax}
                    placeholder="0.00"
                    inputMode="decimal"
                    onChange={(e) => updateField("tax", e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between text-sm font-semibold text-slate-50 border-t border-slate-700 pt-2 mt-1">
                  <span>Total</span>
                  <input
                    className={`${inputBase} w-20 text-right tabular-nums font-semibold text-slate-50`}
                    value={receipt.total}
                    placeholder="0.00"
                    inputMode="decimal"
                    onChange={(e) => updateField("total", e.target.value)}
                  />
                </div>
                {totalMismatch && (
                  <AlertPill action={{ label: "Fix it", onClick: applyComputedTotal }}>
                    Subtotal + tax = ${money(subtotalNum + taxNum)}, not ${money(totalNum)}
                  </AlertPill>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={reset}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors px-2 py-2"
              >
                <RotateCcw size={12} />
                Start over
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 text-slate-900 hover:bg-amber-400 font-semibold rounded-xl py-2.5 text-sm transition-colors"
              >
                <CheckCircle2 size={15} />
                Confirm receipt
              </button>
            </div>

            {savedFlash && (
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-medium mt-2.5">
                <CheckCircle2 size={12} />
                Looks good — ready to attach to a job.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}