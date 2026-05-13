import { useState } from 'react';
import { Pencil, Check, X as XIcon, Copy, Share2, Trash2, FolderInput } from 'lucide-react';
import { toast } from 'sonner';
import type { CloudPalette, PaletteFolder } from '@/hooks/useCloudPalettes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CloudPaletteCardProps {
  palette: CloudPalette;
  folders: PaletteFolder[];
  onUpdate: (id: string, updates: { name?: string; colors?: string[] }) => Promise<boolean>;
  onDuplicate: (id: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onMoveToFolder: (paletteId: string, folderId: string | null) => Promise<boolean>;
  disableDrag?: boolean;
}

export default function CloudPaletteCard({ palette, folders, onUpdate, onDuplicate, onDelete, onMoveToFolder, disableDrag }: CloudPaletteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editColors, setEditColors] = useState<string[]>([]);

  const startEdit = () => {
    setIsEditing(true);
    setEditName(palette.name);
    setEditColors([...palette.colors]);
  };

  const saveEdit = async () => {
    await onUpdate(palette.id, { name: editName.trim() || palette.name, colors: editColors });
    setIsEditing(false);
  };

  const share = () => {
    const colorsStr = palette.colors.map(c => c.replace('#', '')).join('-');
    const url = `${window.location.origin}/palette?colors=${colorsStr}&name=${encodeURIComponent(palette.name)}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied!');
  };

  return (
    <div
      draggable={!isEditing && !disableDrag}
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-palette-id', palette.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      className={`rounded-2xl overflow-hidden border border-border/50 bg-card/60 backdrop-blur-xl shadow-sm ${disableDrag ? '' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <div className="flex h-36">
        {(isEditing ? editColors : palette.colors).map((color, ci) => (
          <div key={ci} className="flex-1 relative group/swatch" style={{ backgroundColor: color }}>
            {isEditing && (
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  const next = [...editColors];
                  next[ci] = e.target.value.toUpperCase();
                  setEditColors(next);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            )}
          </div>
        ))}
      </div>
      <div className="px-3.5 pt-2.5 pb-2 flex items-center justify-between gap-2">
        {isEditing ? (
          <>
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 text-sm font-semibold bg-transparent border-b border-primary text-foreground focus:outline-none"
            />
            <div className="flex items-center gap-1">
              <button onClick={saveEdit} className="text-primary hover:text-primary/80 p-1">
                <Check className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground p-1">
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-sm font-semibold text-foreground truncate">{palette.name}</h3>
            <div className="flex items-center gap-1">
              <button onClick={startEdit} className="text-muted-foreground hover:text-primary transition-colors p-1" title="Edit">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => onDuplicate(palette.id)} className="text-muted-foreground hover:text-primary transition-colors p-1" title="Duplicate">
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button onClick={share} className="text-muted-foreground hover:text-primary transition-colors p-1" title="Share">
                <Share2 className="h-3.5 w-3.5" />
              </button>
              {/* Move to folder dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-muted-foreground hover:text-primary transition-colors p-1" title="Move to folder">
                    <FolderInput className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[140px]">
                  <DropdownMenuItem
                    onClick={() => onMoveToFolder(palette.id, null)}
                    className={!palette.folder_id ? 'font-semibold' : ''}
                  >
                    No folder
                  </DropdownMenuItem>
                  {folders.length > 0 && <DropdownMenuSeparator />}
                  {folders.map(f => (
                    <DropdownMenuItem
                      key={f.id}
                      onClick={() => onMoveToFolder(palette.id, f.id)}
                      className={palette.folder_id === f.id ? 'font-semibold' : ''}
                    >
                      {f.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <button onClick={() => onDelete(palette.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1" title="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
