import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  Wand2,
  History,
  Trash2,
  X as XIcon,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import {
  getComplementary,
  getAnalogous,
  getTriadic,
  getSplitComplementary,
  getContrastColor,
  randomHex,
} from "@/lib/colors";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHarmonyHistory } from "@/hooks/useHarmonyHistory";
import { downloadJson, downloadCsv } from "@/lib/exportData";

interface Harmony {
  key: string;
  name: string;
  description: string;
  colors: string[];
}

const Harmony = () => {
  const [base, setBase] = useState<string>("#3B82F6");
  const [copied, setCopied] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const { entries, deleteEntry, clearAll } = useHarmonyHistory();

  const harmonies = useMemo<Harmony[]>(() => {
    const b = base.toUpperCase();
    return [
      {
        key: "complementary",
        name: "Complementary",
        description: "Opposite hue on the wheel — high contrast, vibrant.",
        colors: [b, getComplementary(b)],
      },
      {
        key: "analogous",
        name: "Analogous",
        description: "Neighboring hues — calm, harmonious palettes.",
        colors: [getAnalogous(b)[0], b, getAnalogous(b)[1]],
      },
      {
        key: "triadic",
        name: "Triadic",
        description: "Three evenly-spaced hues — balanced and lively.",
        colors: [b, ...getTriadic(b)],
      },
      {
        key: "split-complementary",
        name: "Split Complementary",
        description:
          "Base plus two hues adjacent to its complement — bold yet softer.",
        colors: [b, ...getSplitComplementary(b)],
      },
    ];
  }, [base]);

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    toast.success(`${hex} copied!`);
    setTimeout(() => setCopied(null), 1200);
  };

  const randomize = () => setBase(randomHex());

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Color Harmony Generator
          </h1>
          <p className="text-muted-foreground mb-6">
            Pick a base color and explore palettes built from classic color
            theory rules.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistory(true)}
          className="gap-1.5"
        >
          <History className="h-4 w-4" /> History
          {entries.length > 0 && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({entries.length})
            </span>
          )}
        </Button>
      </motion.div>

      {/* Base color picker */}
      <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 mb-8 flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-3 cursor-pointer">
          <span
            className="h-14 w-14 rounded-xl border border-border/60 shadow-sm relative overflow-hidden"
            style={{ backgroundColor: base }}
          >
            <input
              type="color"
              value={base}
              onChange={(e) => setBase(e.target.value.toUpperCase())}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Pick base color"
            />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Base color</p>
            <input
              value={base}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#?[0-9a-fA-F]{0,6}$/.test(v)) {
                  setBase(
                    v.startsWith("#") ? v.toUpperCase() : `#${v.toUpperCase()}`,
                  );
                }
              }}
              className="text-base font-mono font-semibold bg-transparent text-foreground focus:outline-none border-b border-transparent focus:border-primary"
            />
          </div>
        </label>
        <Button
          variant="outline"
          size="sm"
          onClick={randomize}
          className="gap-1.5 ml-auto"
        >
          <Wand2 className="h-4 w-4" /> Randomize
        </Button>
      </div>

      {/* Harmony cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {harmonies.map((h, idx) => (
          <motion.div
            key={h.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl overflow-hidden border border-border/50 bg-card/60 backdrop-blur-xl shadow-sm"
          >
            <div className="px-5 pt-4 pb-2">
              <h3 className="text-base font-semibold text-foreground">
                {h.name}
              </h3>
              <p className="text-xs text-muted-foreground">{h.description}</p>
            </div>
            <div className="flex h-32">
              {h.colors.map((c, i) => (
                <button
                  key={`${c}-${i}`}
                  onClick={() => copyHex(c)}
                  className="flex-1 relative group transition-all hover:flex-[1.15]"
                  style={{ backgroundColor: c }}
                  title={`Copy ${c}`}
                >
                  <span
                    className="absolute inset-x-0 bottom-2 text-[11px] font-mono font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1"
                    style={{ color: getContrastColor(c) }}
                  >
                    {copied === c ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {c}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* History drawer */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="harmony-history-title"
              tabIndex={-1}
              onKeyDown={(e) => {
                if (e.key === "Escape") setShowHistory(false);
              }}
              className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-card border-l border-border shadow-xl flex flex-col focus:outline-none"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <History
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <h2
                    id="harmony-history-title"
                    className="text-base font-semibold text-foreground"
                  >
                    Harmony history
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    ({entries.length})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0}>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              disabled={entries.length === 0}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5"
                                disabled={entries.length === 0}
                                aria-disabled={entries.length === 0}
                              >
                                <Download className="h-3.5 w-3.5" /> Export
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="min-w-[180px]"
                            >
                              <DropdownMenuItem
                                onClick={() => {
                                  downloadJson(
                                    entries,
                                    "harmony-history.json",
                                    {
                                      timestamp: true,
                                    },
                                  );
                                  toast.success(
                                    "Harmony history exported as JSON",
                                  );
                                }}
                              >
                                Download JSON (dated)
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  const rows = entries.map((en) => ({
                                    base_color: en.base_color,
                                    harmony_type: en.harmony_type,
                                    colors: en.colors.join("|"),
                                    created_at: en.created_at,
                                  }));
                                  downloadCsv(
                                    rows,
                                    "harmony-history.csv",
                                    [
                                      "base_color",
                                      "harmony_type",
                                      "colors",
                                      "created_at",
                                    ],
                                    { timestamp: true },
                                  );
                                  toast.success(
                                    "Harmony history exported as CSV",
                                  );
                                }}
                              >
                                Download CSV (dated)
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  downloadJson(entries, "harmony-history.json");
                                  toast.success(
                                    "Harmony history exported as JSON",
                                  );
                                }}
                              >
                                Download JSON
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  const rows = entries.map((en) => ({
                                    base_color: en.base_color,
                                    harmony_type: en.harmony_type,
                                    colors: en.colors.join("|"),
                                    created_at: en.created_at,
                                  }));
                                  downloadCsv(rows, "harmony-history.csv", [
                                    "base_color",
                                    "harmony_type",
                                    "colors",
                                    "created_at",
                                  ]);
                                  toast.success(
                                    "Harmony history exported as CSV",
                                  );
                                }}
                              >
                                Download CSV
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {entries.length === 0
                          ? "No history available to export"
                          : "Export harmony history as JSON or CSV"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {entries.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      className="text-destructive hover:text-destructive"
                    >
                      Clear all
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowHistory(false)}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {entries.length === 0 ? (
                  <div
                    className="text-center py-12 px-3"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                      <History
                        className="h-8 w-8 text-muted-foreground/40"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      No harmony history yet
                    </p>
                    <p className="text-xs text-muted-foreground mb-4 max-w-[260px] mx-auto">
                      Adjust the base color or hit Randomize — generated
                      harmonies will appear here.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        randomize();
                        setShowHistory(false);
                      }}
                      className="gap-1.5"
                    >
                      <Wand2 className="h-3.5 w-3.5" /> Try a random base
                    </Button>
                  </div>
                ) : (
                  entries.map((e) => (
                    <div
                      key={e.id}
                      className="rounded-xl border border-border/60 bg-background/50 overflow-hidden group"
                    >
                      <div className="flex h-14">
                        {e.colors.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => copyHex(c)}
                            className="flex-1 transition-all hover:flex-[1.2]"
                            style={{ backgroundColor: c }}
                            title={`Copy ${c}`}
                          />
                        ))}
                      </div>
                      <div className="px-3 py-2 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground capitalize truncate">
                            {e.harmony_type.replace("-", " ")}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono truncate">
                            {e.base_color} •{" "}
                            {new Date(e.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setBase(e.base_color);
                              toast.success("Base color restored");
                            }}
                            className="text-xs text-primary hover:underline px-1"
                          >
                            Use
                          </button>
                          <button
                            onClick={() => deleteEntry(e.id)}
                            className="text-muted-foreground hover:text-destructive p-1"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Harmony;
