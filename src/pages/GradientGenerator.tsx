import { useState, useCallback } from 'react';
import { Copy, Plus, Trash2, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getContrastColor } from '@/lib/colors';

type GradientType = 'linear' | 'radial' | 'conic';

interface Stop {
  id: string;
  color: string;
  position: number;
}

const GradientGenerator = () => {
  const [type, setType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<Stop[]>([
    { id: 's1', color: '#6366F1', position: 0 },
    { id: 's2', color: '#EC4899', position: 50 },
    { id: 's3', color: '#F59E0B', position: 100 },
  ]);

  const buildCSS = useCallback(() => {
    const stopsStr = stops
      .sort((a, b) => a.position - b.position)
      .map(s => `${s.color} ${s.position}%`)
      .join(', ');
    switch (type) {
      case 'linear': return `linear-gradient(${angle}deg, ${stopsStr})`;
      case 'radial': return `radial-gradient(circle, ${stopsStr})`;
      case 'conic': return `conic-gradient(from ${angle}deg, ${stopsStr})`;
    }
  }, [type, angle, stops]);

  const css = buildCSS();
  const fullCSS = `background: ${css};`;

  const addStop = () => {
    if (stops.length >= 8) return toast.error('Maximum 8 stops');
    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F43F5E', '#14B8A6'];
    setStops(prev => [...prev, {
      id: `s-${Date.now()}`,
      color: colors[Math.floor(Math.random() * colors.length)],
      position: 50,
    }]);
  };

  const removeStop = (id: string) => {
    if (stops.length <= 2) return toast.error('Minimum 2 stops');
    setStops(prev => prev.filter(s => s.id !== id));
  };

  const updateStop = (id: string, field: 'color' | 'position', value: string | number) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(fullCSS);
    toast.success('CSS copied!');
  };

  const copyTailwind = () => {
    navigator.clipboard.writeText(`style={{ ${fullCSS} }}`);
    toast.success('Tailwind style copied!');
  };

  const presets = [
    { name: 'Sunset', stops: [{ color: '#FF512F', position: 0 }, { color: '#F09819', position: 100 }], angle: 135, type: 'linear' as GradientType },
    { name: 'Ocean', stops: [{ color: '#2193b0', position: 0 }, { color: '#6dd5ed', position: 100 }], angle: 135, type: 'linear' as GradientType },
    { name: 'Purple', stops: [{ color: '#7F00FF', position: 0 }, { color: '#E100FF', position: 100 }], angle: 135, type: 'linear' as GradientType },
    { name: 'Forest', stops: [{ color: '#11998e', position: 0 }, { color: '#38ef7d', position: 100 }], angle: 135, type: 'linear' as GradientType },
    { name: 'Fire', stops: [{ color: '#f12711', position: 0 }, { color: '#f5af19', position: 100 }], angle: 135, type: 'linear' as GradientType },
    { name: 'Cosmic', stops: [{ color: '#FF057C', position: 0 }, { color: '#7C64D5', position: 50 }, { color: '#4CC3FF', position: 100 }], angle: 135, type: 'linear' as GradientType },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">Gradient Generator</h1>
        <p className="text-muted-foreground mb-8">Create beautiful CSS gradients with live preview</p>
      </motion.div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="rounded-2xl border border-border overflow-hidden mb-8 shadow-lg"
      >
        <div className="h-64 sm:h-80 transition-all duration-500" style={{ background: css }} />
      </motion.div>

      {/* Presets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Presets</h3>
        <div className="flex gap-2 flex-wrap">
          {presets.map(p => (
            <button
              key={p.name}
              onClick={() => {
                setStops(p.stops.map((s, i) => ({ ...s, id: `p-${i}` })));
                setAngle(p.angle);
                setType(p.type);
              }}
              className="group relative h-10 w-20 rounded-lg border border-border overflow-hidden hover:scale-105 transition-transform"
              style={{ background: `linear-gradient(135deg, ${p.stops.map(s => `${s.color} ${s.position}%`).join(', ')})` }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
          {/* Type */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Type</label>
            <div className="flex gap-1 bg-muted rounded-lg p-0.5">
              {(['linear', 'radial', 'conic'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium capitalize transition-all ${type === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Angle */}
          {(type === 'linear' || type === 'conic') && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Angle: {angle}°</label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min="0" max="360" value={angle}
                  onChange={e => setAngle(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <button onClick={() => setAngle((angle + 45) % 360)} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
                  <RotateCw className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}

          {/* Stops */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground">Color Stops</label>
              <Button variant="outline" size="sm" onClick={addStop} className="gap-1">
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {stops.map(stop => (
                <motion.div
                  key={stop.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-2 rounded-xl border border-border bg-card"
                >
                  <input
                    type="color"
                    value={stop.color}
                    onChange={e => updateStop(stop.id, 'color', e.target.value)}
                    className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={stop.color}
                    onChange={e => updateStop(stop.id, 'color', e.target.value)}
                    className="w-20 bg-transparent font-mono text-sm text-foreground focus:outline-none uppercase"
                  />
                  <input
                    type="range" min="0" max="100" value={stop.position}
                    onChange={e => updateStop(stop.id, 'position', Number(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-xs text-muted-foreground w-8 text-right">{stop.position}%</span>
                  <button onClick={() => removeStop(stop.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Output */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">CSS Output</label>
            <div className="relative">
              <pre className="p-4 rounded-xl bg-muted text-sm font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
                {fullCSS}
              </pre>
              <button onClick={copyCSS} className="absolute top-2 right-2 p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors">
                <Copy className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Inline Style (React)</label>
            <div className="relative">
              <pre className="p-4 rounded-xl bg-muted text-sm font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
                {`style={{ ${fullCSS} }}`}
              </pre>
              <button onClick={copyTailwind} className="absolute top-2 right-2 p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors">
                <Copy className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={copyCSS} className="gap-2 flex-1">
              <Copy className="h-4 w-4" /> Copy CSS
            </Button>
            <Button variant="outline" onClick={copyTailwind} className="gap-2 flex-1">
              <Copy className="h-4 w-4" /> React Style
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GradientGenerator;
