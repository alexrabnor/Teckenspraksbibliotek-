/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Search as LucideSearch, 
  Bell, 
  Bookmark as LucideBookmark, 
  Play, 
  ArrowRight,
  Library,
  BookOpen,
  Languages,
  Globe,
  FolderHeart,
  UploadCloud,
  Home as LucideHome,
  Compass,
  Video,
  User,
  Clock,
  LayoutGrid,
  FileText,
  Download,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image,
  Baby,
  Users,
  Folder,
  Settings2,
  ExternalLink,
  X
} from "lucide-react";

const GRAMMAR_CARDS: any[] = [];

const VOCAB_CARDS: any[] = [];

const CATEGORIES = [
  { name: "Alfabetet & Siffror", icon: Languages, color: "bg-blue-500", description: "Handalfabetet och räkneord." },
  { name: "Vardagsfraser", icon: Compass, color: "bg-primary-container", description: "Hälsningar, artighetsfraser och småprat." },
  { name: "Frågeord", icon: BookOpen, color: "bg-grammar", description: "Vem, vad, när, hur, varför." },
  { name: "Placeringar", icon: Globe, color: "bg-teal-500", description: "Rumsliga relationer och positioner." },
  { name: "Riktning", icon: ArrowRight, color: "bg-orange-500", description: "Rörelser och riktningsangivelser." },
  { name: "Avbildande tecken", icon: Play, color: "bg-violet-500", description: "Ikoniska och avbildande tecken." },
  { name: "Munrörelser & Mimik", icon: User, color: "bg-pink-500", description: "Ansiktsuttryck och munrörelser." },
  { name: "Familj", icon: Users, color: "bg-emerald-500", description: "Familjemedlemmar och relationer." },
  { name: "Samhälle", icon: Library, color: "bg-stone-500", description: "Samhälle, yrken och institutioner." },
  { name: "Natur", icon: Globe, color: "bg-green-600", description: "Djur, växter och natur." },
  { name: "Tid", icon: Clock, color: "bg-amber-500", description: "Tid, datum och tidsuttryck." },
  { name: "Sagor", icon: LucideBookmark, color: "bg-indigo-500", description: "Berättelser och sagor på TSP." },
  { name: "Dövkultur & Historia", icon: Globe, color: "bg-espresso", description: "Dövkultur, identitet och historia." },
  { name: "Lexikon/Ordböcker", icon: BookOpen, color: "bg-vocabulary", description: "Ordlistor och lexikon." },
  { name: "Övningsmaterial", icon: FolderHeart, color: "bg-culture", description: "Uppgifter och övningar." },
  { name: "Regionala varianter", icon: Compass, color: "bg-stone-400", description: "Dialekter och regionala tecken." },
];

const SAVED_RESOURCES: any[] = [];

const DOCUMENTS: any[] = [];

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || "https://databasen.alexcloud.se";

const TYPE_STYLES: Record<string, { badge: string; icon: string }> = {
  PDF:  { badge: "bg-red-100 text-red-600",   icon: "text-red-500" },
  DOCX: { badge: "bg-blue-100 text-blue-600", icon: "text-blue-500" },
  DOC:  { badge: "bg-blue-100 text-blue-600", icon: "text-blue-500" },
  PNG:  { badge: "bg-emerald-100 text-emerald-600", icon: "text-emerald-500" },
  JPG:  { badge: "bg-emerald-100 text-emerald-600", icon: "text-emerald-500" },
  MP4:  { badge: "bg-purple-100 text-purple-600", icon: "text-purple-500" },
  MOV:  { badge: "bg-purple-100 text-purple-600", icon: "text-purple-500" },
};

function DocumentCard({ title, type, size, tag, icon }: any) {
  const IconComponent = {
    FileText,
    BookOpen,
    Image,
    Globe
  }[icon] || FileText;

  const typeStyle = TYPE_STYLES[type?.toUpperCase()] || { badge: "bg-stone-100 text-stone-600", icon: "text-stone-400" };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4 group cursor-pointer hover:shadow-md transition-all"
    >
      <div className={`w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center transition-colors group-hover:bg-primary-container group-hover:text-white ${typeStyle.icon}`}>
        <IconComponent size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-stone-900 truncate font-outfit">{title}</h4>
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <span className={`${typeStyle.badge} px-2 py-0.5 rounded font-bold uppercase tracking-wider`}>{type}</span>
          <span>•</span>
          <span>{size}</span>
          <span>•</span>
          <span className="text-primary-container">{tag}</span>
        </div>
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          const blob = new Blob(["Mock document content for " + title], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${title}.${type.toLowerCase()}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }}
        className="p-2 text-stone-400 hover:text-primary-container transition-colors"
      >
        <Download size={20} />
      </button>
    </motion.div>
  );
}

const TAG_COLORS: Record<string, string> = {
  "Grammatik": "bg-grammar",
  "Vokabulär": "bg-vocabulary",
  "Kultur": "bg-culture",
  "Vardagsfraser": "bg-primary-container",
  "Historia": "bg-espresso",
  "Poesi": "bg-stone-400",
  "Barn & Ungdom": "bg-emerald-500",
  "Arbetsliv": "bg-blue-500",
  "Sport": "bg-orange-500",
};

function Card({ title, tag, image, onRemove, onEdit, audience, level, date, onClick }: any) {
  const bgColor = TAG_COLORS[tag] || "bg-stone-400";
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Bild eller färgad placeholder */}
      <div className={`relative h-[200px] rounded-2xl overflow-hidden mb-3 shadow-sm transition-all group-hover:shadow-xl ${!image ? bgColor : "bg-stone-200"}`}>
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText size={56} className="text-white/60" />
          </div>
        )}
        {/* Taggar */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <div className={`text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${image ? bgColor + "/90 backdrop-blur-sm" : "bg-white/20 backdrop-blur-sm"}`}>
            {tag}
          </div>
          {level && (
            <div className="bg-white/90 backdrop-blur-sm text-stone-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              {level}
            </div>
          )}
        </div>
        {audience && (
          <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">
            {audience}
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2">
            <FileText size={14} /> Visa detaljer
          </div>
        </div>
      </div>

      {/* Info under kortet */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base mb-0.5 line-clamp-2 font-outfit leading-snug">{title}</h3>
          {date && <p className="text-stone-400 text-xs">{date}</p>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-primary-container transition-colors"
              title="Redigera"
            >
              <Settings2 size={16} />
            </button>
          )}
          {onRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-2 hover:bg-red-50 rounded-lg text-stone-400 hover:text-red-500 transition-colors"
              title="Ta bort"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function FileDetailModal({ resource, onClose }: any) {
  const bgColor = TAG_COLORS[resource.tag] || "bg-stone-400";
  const fileUrl = resource.file_id
    ? `https://databasen.alexcloud.se/assets/${resource.file_id}`
    : null;
  const isPdf = fileUrl && (resource.title?.toLowerCase().endsWith(".pdf") || resource.title?.toLowerCase().includes("pdf"));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[32px] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${bgColor} px-8 py-5 flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center gap-3">
            <FileText size={28} className="text-white/80" />
            <h2 className="text-lg font-bold font-outfit text-white truncate max-w-md">{resource.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {fileUrl && (
              <a
                href={`${fileUrl}?download`}
                download
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                onClick={e => e.stopPropagation()}
              >
                <Download size={16} /> Ladda ner
              </a>
            )}
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink size={16} /> Öppna
              </a>
            )}
            <button onClick={onClose} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PDF-visning */}
        {fileUrl ? (
          <div className="flex-1 overflow-hidden min-h-[400px]">
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=0`}
              className="w-full h-full min-h-[500px]"
              title={resource.title}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12 text-stone-400">
            <div className="text-center space-y-3">
              <FileText size={48} className="mx-auto opacity-30" />
              <p className="font-medium">Ingen fil kopplad till denna resurs</p>
            </div>
          </div>
        )}

        {/* Footer med taggar */}
        <div className="px-8 py-4 border-t border-stone-100 flex items-center justify-between flex-shrink-0">
          <div className="flex flex-wrap gap-2">
            <span className={`${bgColor} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest`}>{resource.tag}</span>
            {resource.level && <span className="bg-stone-100 text-stone-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">{resource.level}</span>}
            {resource.audience && <span className="bg-stone-100 text-stone-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">{resource.audience}</span>}
            {resource.mapp && <span className="bg-stone-100 text-stone-500 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Folder size={10} /> {resource.mapp}</span>}
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-sm font-medium transition-colors">
            Stäng
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EditResourceModal({ resource, onSave, onClose }: any) {
  const [edited, setEdited] = useState({ ...resource });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold font-outfit mb-6">Redigera resurs</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-stone-500 mb-2 uppercase tracking-wider">Titel</label>
            <input 
              type="text" 
              value={edited.title}
              onChange={e => setEdited({ ...edited, title: e.target.value })}
              className="w-full p-4 bg-stone-100 rounded-2xl border-none focus:ring-2 focus:ring-primary-container font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-stone-500 mb-2 uppercase tracking-wider">Mapp / Målgrupp</label>
              <select 
                value={edited.audience}
                onChange={e => setEdited({ ...edited, audience: e.target.value })}
                className="w-full p-4 bg-stone-100 rounded-2xl border-none focus:ring-2 focus:ring-primary-container font-medium"
              >
                <option value="Bebistecken">Bebistecken</option>
                <option value="Barn">Barn</option>
                <option value="Vuxna">Vuxna</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-500 mb-2 uppercase tracking-wider">Nivå</label>
              <select 
                value={edited.level}
                onChange={e => setEdited({ ...edited, level: e.target.value })}
                className="w-full p-4 bg-stone-100 rounded-2xl border-none focus:ring-2 focus:ring-primary-container font-medium"
              >
                <option value="Nivå 1">Nivå 1</option>
                <option value="Nivå 2">Nivå 2</option>
                <option value="Nivå 3">Nivå 3</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-500 mb-2 uppercase tracking-wider">Kategori</label>
            <select 
              value={edited.tag}
              onChange={e => setEdited({ ...edited, tag: e.target.value })}
              className="w-full p-4 bg-stone-100 rounded-2xl border-none focus:ring-2 focus:ring-primary-container font-medium"
            >
              {CATEGORIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button 
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl font-bold text-stone-500 hover:bg-stone-100 transition-colors"
          >
            Avbryt
          </button>
          <button 
            onClick={() => onSave(edited)}
            className="flex-1 py-4 bg-primary-container text-white rounded-2xl font-bold hover:shadow-lg transition-all"
          >
            Spara ändringar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FolderCard({ folderName, files, bgColor, onRemoveFile, onClickFile }: any) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div whileHover={{ y: -4 }} className="group">
      <div
        className={`relative h-[200px] rounded-2xl overflow-hidden mb-3 shadow-sm cursor-pointer transition-all group-hover:shadow-xl ${bgColor}`}
        onClick={() => setOpen(o => !o)}
      >
        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
          <Folder size={56} className="text-white/70" />
          <span className="text-white/80 text-sm font-bold">{files.length} filer</span>
        </div>
        <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
          {files[0]?.tag || ""}
        </div>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-xs font-bold bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
            {open ? "Dölj filer" : "Visa filer"}
          </span>
        </div>
      </div>
      <h3 className="font-bold text-base font-outfit line-clamp-1">{folderName}</h3>
      <p className="text-stone-400 text-xs mb-2">{files.length} filer</p>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-stone-50 rounded-2xl border border-stone-100 divide-y divide-stone-100 mb-2">
              {files.map((f: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-stone-100 transition-colors cursor-pointer" onClick={() => onClickFile(f)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={16} className="text-stone-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-stone-700 truncate">{f.title}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-stone-400 mr-2">{f.level}</span>
                    <button onClick={(e) => { e.stopPropagation(); onRemoveFile(f); }} className="p-1 hover:text-red-500 text-stone-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("Upptäck");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alla");
  const [selectedAudience, setSelectedAudience] = useState(() => localStorage.getItem("selectedAudience") || "Alla");
  const [selectedLevel, setSelectedLevel] = useState(() => localStorage.getItem("selectedLevel") || "Alla");

  // Document filters
  const [docSearch, setDocSearch] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("Alla");
  const [docTagFilter, setDocTagFilter] = useState("Alla");
  const [docSortOrder, setDocSortOrder] = useState<"az" | "za">("az");

  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem("selectedAudience", selectedAudience);
  }, [selectedAudience]);

  useEffect(() => {
    localStorage.setItem("selectedLevel", selectedLevel);
  }, [selectedLevel]);

  // Directus data state
  const [grammarCards, setGrammarCards] = useState<any[]>(GRAMMAR_CARDS);
  const [vocabCards, setVocabCards] = useState<any[]>(VOCAB_CARDS);
  const [allResources, setAllResources] = useState<any[]>([...GRAMMAR_CARDS, ...VOCAB_CARDS]);
  const [documents, setDocuments] = useState<any[]>(DOCUMENTS);

  useEffect(() => {
    const fetchDirectus = async () => {
      try {
        const [resRes, docRes] = await Promise.all([
          fetch(`${DIRECTUS_URL}/items/teckensprak_resurser?limit=100`),
          fetch(`${DIRECTUS_URL}/items/teckensprak_dokument?limit=100`),
        ]);
        if (resRes.ok) {
          const resData = await resRes.json();
          const resources: any[] = resData.data || [];
          setGrammarCards(resources.filter((r: any) => r.tag === "Grammatik"));
          setVocabCards(resources.filter((r: any) => r.tag === "Vokabulär"));
          setAllResources(resources);
        }
        if (docRes.ok) {
          const docData = await docRes.json();
          setDocuments(docData.data || []);
        }
      } catch (e) {
        console.error("Directus fetch failed, using static data", e);
      }
    };
    fetchDirectus();
  }, []);

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [mappNamn, setMappNamn] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingResource, setEditingResource] = useState<any>(null);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const CATEGORY_OPTIONS = CATEGORIES.map(c => c.name);
  const AUDIENCE_OPTIONS = ["Bebistecken", "Barn", "Vuxna"];
  const LEVEL_OPTIONS = ["Nivå 1", "Nivå 2", "Nivå 3"];

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      type: file.type,
      fileObject: file,
      status: "pending",
      progress: 0,
      category: "Grammatik",
      audience: "Vuxna",
      level: "Nivå 1",
      date: new Date().toLocaleDateString("sv-SE")
    }));
    setUploadedFiles(prev => [...newFiles, ...prev]);
  };

  const updateFileField = (id: string, field: string, value: string) => {
    setUploadedFiles(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const confirmFile = async (fileObj: any) => {
    if (!fileObj.fileObject) return;
    setUploadedFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: "uploading", progress: 0 } : f));

    try {
      const file_id = await new Promise<string>((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", fileObj.fileObject, fileObj.name);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");
        xhr.timeout = 120000; // 2 min timeout

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 90);
            setUploadedFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, progress: pct } : f));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data.file_id) resolve(data.file_id);
              else reject(new Error(data.error || "Inget file_id returnerades"));
            } catch {
              reject(new Error("Ogiltigt svar från server: " + xhr.responseText.slice(0, 200)));
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.responseText.slice(0, 200)}`));
          }
        };
        xhr.ontimeout = () => reject(new Error("Uppladdning tog för lång tid (timeout)"));
        xhr.onerror = () => reject(new Error("Nätverksfel – kontrollera anslutningen"));
        xhr.send(formData);
      });

      setUploadedFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, progress: 95 } : f));

      const metaRes = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fileObj.name.replace(/\.[^/.]+$/, ""),
          tag: fileObj.category,
          audience: fileObj.audience,
          level: fileObj.level,
          mapp: mappNamn.trim() || null,
          file_id,
        }),
      });

      if (!metaRes.ok) throw new Error("Metadata save failed: " + await metaRes.text());
      const saved = await metaRes.json();
      setAllResources(prev => [saved.data, ...prev]);
      setUploadedFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: "completed", progress: 100 } : f));
    } catch (e: any) {
      console.error("Uppladdning misslyckades:", e.message);
      setUploadedFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: "error", progress: 0, errorMsg: e.message } : f));
    }
  };

  // Ladda upp 3 filer parallellt
  const confirmAllFiles = async () => {
    const pending = uploadedFiles.filter(f => f.status === "pending");
    const chunkSize = 3;
    for (let i = 0; i < pending.length; i += chunkSize) {
      const chunk = pending.slice(i, i + chunkSize);
      await Promise.all(chunk.map(file => confirmFile(file)));
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const downloadFile = (file: any) => {
    // Mock download
    const blob = new Blob(["Mock content for " + file.name], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const removeSavedResource = async (resource: any) => {
    if (resource.id) {
      await fetch(`${DIRECTUS_URL}/items/teckensprak_resurser/${resource.id}`, { method: "DELETE" });
    }
    setAllResources(prev => prev.filter(r => r.title !== resource.title));
  };

  const filteredResources = allResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         resource.tag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Alla" || resource.tag === selectedCategory;
    
    // Only apply audience/level filters in library or if they are explicitly set and we are searching
    const matchesAudience = selectedAudience === "Alla" || resource.audience === selectedAudience;
    const matchesLevel = selectedLevel === "Alla" || resource.level === selectedLevel;
    
    // If in Discover and no search/category, we don't apply audience/level filters to the sections
    // but if we ARE searching or in Library, we apply them.
    if (activeTab === "Mitt bibliotek" || searchQuery || selectedCategory !== "Alla") {
      return matchesSearch && matchesCategory && matchesAudience && matchesLevel;
    }
    
    return matchesSearch && matchesCategory;
  });

  // Gruppera filtrerade resurser: mappar som grupper + lösa filer
  const groupedResources = (() => {
    const folders: Record<string, any[]> = {};
    const loose: any[] = [];
    for (const r of filteredResources) {
      if (r.mapp) {
        if (!folders[r.mapp]) folders[r.mapp] = [];
        folders[r.mapp].push(r);
      } else {
        loose.push(r);
      }
    }
    return { folders, loose };
  })();

  const renderResourceGrid = (resources: any[], folders: Record<string, any[]>) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Object.entries(folders).map(([folderName, files]) => (
        <FolderCard
          key={`folder-${folderName}`}
          folderName={folderName}
          files={files}
          bgColor={TAG_COLORS[files[0]?.tag] || "bg-stone-400"}
          onRemoveFile={(f: any) => removeSavedResource(f)}
          onClickFile={(f: any) => setSelectedResource(f)}
        />
      ))}
      {resources.map((card, idx) => (
        <Card
          key={idx}
          {...card}
          onRemove={() => removeSavedResource(card)}
          onEdit={() => setEditingResource(card)}
          onClick={() => setSelectedResource(card)}
        />
      ))}
    </div>
  );

  const renderContent = () => {
    if (searchQuery || (selectedCategory !== "Alla" && activeTab !== "Kategorier")) {
      return (
        <motion.div 
          key="search-results"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-12"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold font-outfit mb-2">
                {searchQuery ? `Resultat för "${searchQuery}"` : selectedCategory}
              </h2>
              <p className="text-stone-500 font-medium">
                Hittade {filteredResources.length} resurser
              </p>
            </div>
            <button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Alla");
                setSelectedAudience("Alla");
                setSelectedLevel("Alla");
              }}
              className="text-primary font-bold hover:underline"
            >
              Rensa filter
            </button>
          </div>

          {filteredResources.length > 0 ? (
            renderResourceGrid(groupedResources.loose, groupedResources.folders)
          ) : (
            <div className="py-20 text-center">
              <div className="bg-stone-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-400">
                <LucideSearch size={32} />
              </div>
              <h3 className="text-2xl font-bold font-outfit mb-2">Inga träffar</h3>
              <p className="text-stone-500">Försök med ett annat sökord eller ändra kategori.</p>
            </div>
          )}
        </motion.div>
      );
    }

    switch (activeTab) {
      case "Upptäck":
        return (
          <motion.div 
            key="discover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Category Filter Bar */}
            <div className="flex gap-3 overflow-x-auto pb-6 mb-4 hide-scrollbar">
              {["Alla", ...CATEGORIES.map(c => c.name)].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? "bg-primary-container text-white shadow-lg scale-105" : "bg-white border border-stone-200 text-stone-500 hover:bg-stone-50"}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Hero Section */}
            <section className="mb-20">
              <div className="relative w-full h-[500px] rounded-3xl overflow-hidden group shadow-2xl">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKLb8M9By_QHbeoU2Fff4FD-znd3JqQDWnlj1k0W44Y_jGXJJ1Aw_eAuRK5K8axH1Y_Iz5-3lcLrl4LaFCuITDUFgdzC2rhHv742ZBH0ygM7kFNKQ1utAo0rLf31Ofedqezt-g4PSEBW1blyhkDypLMnLQ0EhUGN0hOm8iz8crxgQXs8f_EnPm58Eg1itxLHlI6pQyhe03uoJON82L-7l7jRU95yyuUBsWDGT2r-HRAeNaB2L4nZ0sgpzo8MhvVdPUt5IoTyIj" 
                  alt="Hero" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-espresso/80 via-espresso/40 to-transparent flex flex-col justify-end p-16">
                  <span className="inline-block px-4 py-1.5 bg-primary-container text-white text-xs font-bold rounded-full mb-4 w-fit tracking-wider uppercase">Senaste tillagt</span>
                  <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 font-outfit tracking-tighter leading-[0.9] max-w-2xl">Visual Sign Mastery.</h1>
                  <p className="text-white/80 text-lg max-w-md mb-8 leading-relaxed">Utforska vår senaste produktion fokuserad på avancerad syntax och spatial grammatik i svenskt teckenspråk.</p>
                  <div className="flex gap-4">
                    <button className="bg-primary-container hover:bg-primary text-white px-8 py-4 rounded-full font-bold flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95">
                      <Play size={20} className="fill-current" />
                      Se nu
                    </button>
                    <button className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold transition-all">
                      Spara i bibliotek
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Grammar Section */}
            <section className="mb-16">
              <div className="flex justify-between items-end mb-8">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold font-outfit tracking-tight">Grammatik – Nivå 2</h2>
                  <p className="text-stone-500 font-medium">Fördjupning i morfologi och syntax</p>
                </div>
                <a className="text-primary font-bold flex items-center gap-1 group" href="#">
                  Se alla 
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </a>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x">
                {grammarCards.map((card, idx) => (
                  <Card key={idx} {...card} />
                ))}
              </div>
            </section>

            {/* Vocabulary Section */}
            <section className="mb-16">
              <div className="flex justify-between items-end mb-8">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold font-outfit tracking-tight">Vardagsfraser</h2>
                  <p className="text-stone-500 font-medium">Praktiska uttryck för sociala sammanhang</p>
                </div>
                <a className="text-primary font-bold flex items-center gap-1 group" href="#">
                  Se alla 
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </a>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x">
                {vocabCards.map((card, idx) => (
                  <Card key={idx} {...card} />
                ))}
              </div>
            </section>

            {/* Culture Section */}
            <section className="mb-16">
              <div className="flex justify-between items-end mb-8">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold font-outfit tracking-tight">Dövkultur</h2>
                  <p className="text-stone-500 font-medium">Historia, normer och identitet</p>
                </div>
                <a className="text-primary font-bold flex items-center gap-1 group" href="#">
                  Se alla 
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="md:col-span-2 relative rounded-3xl overflow-hidden shadow-sm group cursor-pointer"
                >
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBEYDOvs95Nn9xuNoeI4mcqVYCbEdfzZht66sYmn5IVH_ce4iONwyP9xTflIgE8gZPJKMo0BXtoH1HF7t0-M-lAVqqieT72evGzgmU4Fmzs7JhH2DSy7fNnhtYUHAr4rWLHodgdIiHtfrcYdqs0_ilLfPfDpaHFZ8E5i1fBcCAYDjal2rOdRyw9LQ3tavCVQWYVEFb31RVWbwDS03ks-Da2GGinVcIFMYZXlmQsTwkLWK4h_p6OiHfjRFw5cAkKMS4TS9fH3ck" 
                    alt="History" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-culture/90 via-culture/20 to-transparent p-10 flex flex-col justify-end">
                    <div className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest w-fit mb-4">Historia</div>
                    <h3 className="text-4xl font-bold text-white mb-2 font-outfit">Svensk teckenspråkshistoria</h3>
                    <p className="text-white/80 max-w-lg">Från Manillaskolan till erkännandet 1981. En resa genom tid och lagstiftning.</p>
                  </div>
                </motion.div>

                <div className="flex flex-col gap-6">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="h-1/2 relative rounded-3xl overflow-hidden shadow-sm group cursor-pointer"
                  >
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkpRXYbwqF3KOberpLR0vpFt5MeaaXYXVZg5aoFSI49Q5aUun3I0v8JzcD9uElPgasKrilm58tP5MeUiD62hp5zuxnePvElEGIGFT3eLx7hQtUEiI72LE1GDG2Cnzg3zLF1_iAMqejpPqW5e915me1tO44lCpzja1o5ikyG4WDwRH78tEXMQRrKpOmp567OkAnB2i9xF09EKT8NqtpQRBIZfMOpHQ8MnMzC96eHKNcxiZ7zZF6D1XqM7lOBOjXXT1JIE42Yk2n" 
                      alt="Norms" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                      <h3 className="text-xl font-bold text-white mb-1 font-outfit">Sociala normer</h3>
                      <p className="text-white/70 text-sm">Vett och etikett i rummet.</p>
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="h-1/2 relative rounded-3xl overflow-hidden shadow-sm group cursor-pointer"
                  >
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMLb9wWpWhVhr2Zm2SjycXmY_kQAHLoMrKhlXobMd9cnWrABMK8UUVYyfOsXK1Ypp-NmOOyHw6bicNk7bg9C_G0OlaTCbo6-o-G7LPbxQG-CyFNPDNsKNteBWyfPuU7oPb0BrOkw8NBJPiQrpJzcGWOWHntas855k-veC5K4_6tATpqrDbo0lYLWQjJ3llzvQw-9cAZ3nb5ptg-K8tgOq9w1sZkpX-i6Y_X4qV0PKjI8VGJdSSMSJXr2yYYHfHFnuICWxE6nPs" 
                      alt="Poetry" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                      <h3 className="text-xl font-bold text-white mb-1 font-outfit">Teckenspråkig poesi</h3>
                      <p className="text-white/70 text-sm">Visuell estetik och rytmik.</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>
          </motion.div>
        );
      case "Mitt bibliotek":
        return (
          <motion.div 
            key="library"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-16"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h2 className="text-4xl font-bold font-outfit mb-2">Mitt bibliotek</h2>
                <p className="text-stone-500 font-medium">Dina sparade resurser och dokument</p>
              </div>
              <div className="flex items-center bg-stone-100 px-6 py-3 rounded-2xl w-full md:w-80 group focus-within:ring-2 ring-primary-container/20 transition-all">
                <LucideSearch className="text-stone-400 mr-3" size={20} />
                <input 
                  className="bg-transparent border-none focus:ring-0 p-0 text-sm w-full text-espresso placeholder-stone-400 font-medium" 
                  placeholder="Sök i ditt bibliotek..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <section>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold font-outfit flex items-center gap-2">
                  <FileText className="text-primary-container" /> Dokument
                </h3>
              </div>

              {/* Filter panel */}
              {(() => {
                const uniqueTypes = ["Alla", ...Array.from(new Set(documents.map((d: any) => d.type).filter(Boolean)))];
                const uniqueTags = ["Alla", ...Array.from(new Set(documents.map((d: any) => d.tag).filter(Boolean)))];
                const filteredDocs = documents
                  .filter((d: any) => {
                    const matchSearch = !docSearch || d.title?.toLowerCase().includes(docSearch.toLowerCase());
                    const matchType = docTypeFilter === "Alla" || d.type === docTypeFilter;
                    const matchTag = docTagFilter === "Alla" || d.tag === docTagFilter;
                    return matchSearch && matchType && matchTag;
                  })
                  .sort((a: any, b: any) => {
                    const ta = a.title || "";
                    const tb = b.title || "";
                    return docSortOrder === "az" ? ta.localeCompare(tb, "sv") : tb.localeCompare(ta, "sv");
                  });

                const hasActiveFilters = docSearch || docTypeFilter !== "Alla" || docTagFilter !== "Alla";

                return (
                  <>
                    <div className="bg-stone-50 rounded-3xl p-6 mb-6 space-y-4">
                      {/* Search */}
                      <div className="flex items-center bg-white px-4 py-3 rounded-2xl shadow-sm gap-3 focus-within:ring-2 ring-primary-container/20 transition-all">
                        <LucideSearch className="text-stone-400 shrink-0" size={18} />
                        <input
                          className="bg-transparent border-none focus:ring-0 p-0 text-sm w-full text-espresso placeholder-stone-400 font-medium"
                          placeholder="Sök bland filer..."
                          value={docSearch}
                          onChange={e => setDocSearch(e.target.value)}
                        />
                        {docSearch && (
                          <button onClick={() => setDocSearch("")} className="text-stone-400 hover:text-stone-600 transition-colors text-xs font-bold">✕</button>
                        )}
                      </div>

                      {/* Type filter */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mr-1">Typ:</span>
                        {uniqueTypes.map(t => (
                          <button
                            key={t}
                            onClick={() => setDocTypeFilter(t)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${docTypeFilter === t ? "bg-primary-container text-white shadow-sm" : "bg-white text-stone-500 hover:text-stone-700 border border-stone-200"}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      {/* Tag filter */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mr-1">Kategori:</span>
                        {uniqueTags.map(t => (
                          <button
                            key={t}
                            onClick={() => setDocTagFilter(t)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${docTagFilter === t ? "bg-primary-container text-white shadow-sm" : "bg-white text-stone-500 hover:text-stone-700 border border-stone-200"}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      {/* Sort + clear */}
                      <div className="flex flex-wrap gap-3 items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Sortera:</span>
                          <button
                            onClick={() => setDocSortOrder(docSortOrder === "az" ? "za" : "az")}
                            className="px-4 py-1.5 rounded-full text-xs font-bold bg-white border border-stone-200 text-stone-500 hover:text-stone-700 transition-all"
                          >
                            {docSortOrder === "az" ? "A → Ö" : "Ö → A"}
                          </button>
                        </div>
                        {hasActiveFilters && (
                          <button
                            onClick={() => { setDocSearch(""); setDocTypeFilter("Alla"); setDocTagFilter("Alla"); }}
                            className="text-primary-container text-xs font-bold hover:underline flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Rensa filter
                          </button>
                        )}
                        <span className="text-xs text-stone-400 font-medium ml-auto">{filteredDocs.length} av {documents.length} filer</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredDocs.map((doc: any, idx: number) => (
                        <DocumentCard key={idx} {...doc} />
                      ))}
                      {filteredDocs.length === 0 && (
                        <div className="col-span-full py-16 text-center bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
                          <p className="text-stone-400 font-medium">Inga filer matchar filtren.</p>
                          <button
                            onClick={() => { setDocSearch(""); setDocTypeFilter("Alla"); setDocTagFilter("Alla"); }}
                            className="mt-3 text-primary-container text-sm font-bold hover:underline"
                          >
                            Rensa filter
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </section>

            <section>
              <div className="mb-12">
                <h3 className="text-2xl font-bold font-outfit flex items-center gap-2 mb-6">
                  <Folder className="text-primary-container" /> Mappar
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { id: "Bebistecken", name: "Bebistecken", icon: Baby, color: "bg-pink-100 text-pink-600" },
                    { id: "Barn", name: "Barn", icon: Users, color: "bg-blue-100 text-blue-600" },
                    { id: "Vuxna", name: "Vuxna", icon: User, color: "bg-stone-100 text-stone-600" }
                  ].map((folder) => (
                    <motion.button
                      key={folder.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedAudience(selectedAudience === folder.id ? "Alla" : folder.id)}
                      className={`p-8 rounded-3xl flex flex-col items-center gap-4 transition-all border-2 ${selectedAudience === folder.id ? "border-primary-container bg-primary-container/5" : "border-transparent bg-white shadow-sm"}`}
                    >
                      <div className={`w-16 h-16 ${folder.color} rounded-2xl flex items-center justify-center`}>
                        <folder.icon size={32} />
                      </div>
                      <div className="text-center">
                        <span className="block font-bold text-lg font-outfit">{folder.name}</span>
                        <span className="text-sm text-stone-500">
                          {allResources.filter(r => r.audience === folder.id).length} resurser
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-bold font-outfit flex items-center gap-2">
                    <LucideBookmark className="text-primary-container" /> 
                    {selectedAudience === "Alla" ? "Alla sparade resurser" : `Resurser för ${selectedAudience}`}
                  </h3>
                  {(selectedAudience !== "Alla" || selectedLevel !== "Alla" || searchQuery !== "" || selectedCategory !== "Alla") && (
                    <button 
                      onClick={() => {
                        setSelectedAudience("Alla");
                        setSelectedLevel("Alla");
                        setSearchQuery("");
                        setSelectedCategory("Alla");
                      }}
                      className="text-primary-container text-sm font-bold hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Rensa alla filter
                    </button>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 bg-stone-100 p-1 rounded-2xl">
                  {["Alla", "Nivå 1", "Nivå 2", "Nivå 3"].map((level) => (
                    <button 
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${selectedLevel === level ? "bg-white text-primary-container shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {filteredResources.length > 0
                ? renderResourceGrid(groupedResources.loose, groupedResources.folders)
                : (
                  <div className="py-20 text-center bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
                    <p className="text-stone-400 font-medium">Inga resurser hittades med valda filter.</p>
                  </div>
                )
              }
            </section>

            <section className="bg-espresso text-white p-12 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-lg">
                <h3 className="text-3xl font-bold font-outfit">Redo att bidra?</h3>
                <p className="text-white/70 leading-relaxed">Dela med dig av ditt material eller dina erfarenheter till Teckenspråksbibliotek. Tillsammans bygger vi världens största resursbank för svenskt teckenspråk.</p>
                <button onClick={() => setActiveTab("Ladda upp")} className="bg-primary-container text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform">
                  Ladda upp material
                </button>
              </div>
              <div className="w-full md:w-1/3 aspect-video bg-white/10 rounded-3xl border border-white/20 flex items-center justify-center">
                <UploadCloud size={64} className="text-white/30" />
              </div>
            </section>
          </motion.div>
        );
      case "Kategorier":
        return (
          <motion.div 
            key="categories"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-12">
              <h2 className="text-4xl font-bold font-outfit mb-2">Utforska kategorier</h2>
              <p className="text-stone-500 font-medium">Hitta precis det du letar efter genom våra ämnesområden</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {CATEGORIES.map((cat, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.02, y: -4 }}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setActiveTab("Upptäck");
                  }}
                  className="bg-white p-10 rounded-[40px] shadow-sm hover:shadow-2xl transition-all cursor-pointer group flex flex-col items-center text-center border border-stone-100"
                >
                  <div className={`${cat.color} w-24 h-24 rounded-3xl flex items-center justify-center text-white mb-8 group-hover:rotate-6 transition-transform shadow-lg`}>
                    <cat.icon size={48} />
                  </div>
                  <h3 className="text-2xl font-bold font-outfit mb-3">{cat.name}</h3>
                  <p className="text-stone-400 text-sm mb-6 max-w-[200px]">{cat.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      case "Profil":
        return (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-[40px] p-12 shadow-sm border border-stone-100">
              <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-container shadow-xl">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQeS03uD80SN967jzf8d7YDLQkmQfgyD78FIxdt_eWq0SJ1OeamNxSbVIj0ZfqOW6h_Cqb2BZIzpOmttciy7RyhrnfnWFoAmCDl6CGzm4dK7vL3ReItchkMvW-9yAPp7l_vbqWn8ec3qgvefO-RsPc5LpWxWt23S_KdX5TQWKEtN_B5wDo5dkZOOG1Az_GnqpBipxDEu928S98_Pwk-tls54yMEW6RPTxp717_6d6fKwIDe1cmVyOqWHQ1RopVx9s-uB_6u4DY" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-center md:text-left space-y-2">
                  <h2 className="text-4xl font-bold font-outfit">Alexander Rabnor</h2>
                  <p className="text-stone-500 font-medium">Administratör • Teckenspraksbiblioteket</p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold font-outfit">Inställningar</h3>
                <div className="space-y-2">
                  {["Kontoinställningar", "Notifikationer", "Sekretess", "Språkinställningar"].map((item) => (
                    <button key={item} className="w-full flex justify-between items-center p-5 hover:bg-stone-50 rounded-2xl transition-colors group">
                      <span className="font-medium text-stone-700">{item}</span>
                      <ArrowRight size={18} className="text-stone-300 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );
      case "Ladda upp":
        return (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-5xl mx-auto space-y-12"
          >
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-bold font-outfit tracking-tight">Ladda upp material</h2>
              <p className="text-stone-500 text-lg max-w-2xl mx-auto">
                Dela med dig av dina videor, dokument eller övningar. Välj kategori, målgrupp och nivå för varje fil.
              </p>
            </div>

            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileUpload(e.dataTransfer.files);
              }}
              className={`relative border-4 border-dashed rounded-[40px] p-20 transition-all flex flex-col items-center justify-center text-center space-y-6 ${
                isDragging ? "border-primary-container bg-primary-container/5 scale-[1.02]" : "border-stone-200 bg-white"
              }`}
            >
              <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors ${isDragging ? "bg-primary-container text-white" : "bg-stone-100 text-stone-400"}`}>
                <UploadCloud size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-outfit">Dra och släpp filer här</h3>
                <p className="text-stone-400">eller klicka för att bläddra på din enhet</p>
              </div>
              <input
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <input
                type="file"
                multiple
                {...{ webkitdirectory: "", directory: "" } as any}
                className="hidden"
                ref={folderInputRef}
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-espresso text-white px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2"
                >
                  <FileText size={20} />
                  Välj filer
                </button>
                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="bg-white border-2 border-espresso text-espresso px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2"
                >
                  <Folder size={20} />
                  Ladda upp hel mapp
                </button>
              </div>
              <p className="text-stone-400 text-xs">Stöder MP4, PDF, JPG, PNG (Max 50MB per fil)</p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="bg-white rounded-[40px] p-10 shadow-sm border border-stone-100 space-y-6">
                {/* Mappnamn-fält */}
                <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 space-y-2">
                  <label className="block text-sm font-bold text-stone-600 uppercase tracking-wide flex items-center gap-2">
                    <Folder size={16} /> Spara som mapp (valfritt)
                  </label>
                  <p className="text-xs text-stone-400">Ange ett mappnamn om du vill gruppera filerna. Lämna tomt för att spara som enskilda filer.</p>
                  <input
                    type="text"
                    placeholder="t.ex. Övningsboken kapitel 1–5"
                    value={mappNamn}
                    onChange={e => setMappNamn(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold font-outfit">Dina uppladdningar</h3>
                  {uploadedFiles.some(f => f.status === "pending") && (
                    <button
                      onClick={confirmAllFiles}
                      className="bg-primary-container text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2"
                    >
                      <CheckCircle2 size={16} />
                      Spara alla till biblioteket
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {uploadedFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-6 rounded-3xl border transition-colors ${
                        file.status === 'completed'
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-stone-50 border-stone-100"
                      }`}
                    >
                      {/* Filinfo rad */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-stone-400 shadow-sm">
                            <FileText size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-stone-800">{file.name}</h4>
                            <p className="text-xs text-stone-400">{file.size} • {file.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {file.status === 'uploading' && (
                            <span className="flex items-center gap-1 text-blue-500 text-sm font-bold animate-pulse">
                              <Loader2 size={16} className="animate-spin" /> Laddar upp...
                            </span>
                          )}
                          {file.status === 'completed' && (
                            <span className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
                              <CheckCircle2 size={16} /> Sparad i biblioteket
                            </span>
                          )}
                          {file.status === 'error' && (
                            <span className="flex flex-col items-end gap-0.5">
                              <span className="flex items-center gap-1 text-red-500 text-sm font-bold">
                                <AlertCircle size={16} /> Misslyckades
                              </span>
                              {file.errorMsg && (
                                <span className="text-red-400 text-[11px] max-w-[280px] text-right leading-tight">{file.errorMsg}</span>
                              )}
                            </span>
                          )}
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-2 hover:bg-white rounded-xl text-stone-400 hover:text-red-500 transition-colors"
                            title="Ta bort"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Progress-bar */}
                      {file.status === 'uploading' && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-stone-500 mb-1">
                            <span>Laddar upp till server...</span>
                            <span className="font-bold text-blue-500">{file.progress}%</span>
                          </div>
                          <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                            <motion.div
                              className="h-2 bg-blue-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${file.progress}%` }}
                              transition={{ ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Kategori-val (döljs när sparad/uploading) */}
                      {file.status !== 'completed' && file.status !== 'uploading' && (
                        <div className="flex flex-wrap gap-3 items-end">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Kategori</label>
                            <select
                              value={file.category}
                              onChange={(e) => updateFileField(file.id, "category", e.target.value)}
                              className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                            >
                              {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Målgrupp</label>
                            <select
                              value={file.audience}
                              onChange={(e) => updateFileField(file.id, "audience", e.target.value)}
                              className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                            >
                              {AUDIENCE_OPTIONS.map(a => <option key={a}>{a}</option>)}
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Nivå</label>
                            <select
                              value={file.level}
                              onChange={(e) => updateFileField(file.id, "level", e.target.value)}
                              className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                            >
                              {LEVEL_OPTIONS.map(l => <option key={l}>{l}</option>)}
                            </select>
                          </div>
                          <button
                            onClick={() => confirmFile(file)}
                            className="bg-espresso text-white px-6 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2"
                          >
                            <CheckCircle2 size={16} />
                            Spara till bibliotek
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-background text-espresso font-body min-h-screen">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-0">
            <span 
              className="text-2xl font-bold tracking-tight text-stone-800 font-outfit cursor-pointer"
              onClick={() => setActiveTab("Upptäck")}
            >
              Teckenspråksbibliotek
            </span>
            <div className="hidden md:flex items-center bg-surface-container-low px-4 py-2.5 rounded-full w-40 mr-8 group focus-within:ring-2 ring-primary-container/20 transition-all">
              <LucideSearch className="text-stone-400 mr-2" size={18} />
              <input 
                className="bg-transparent border-none focus:ring-0 p-0 text-sm w-full text-espresso placeholder-stone-400" 
                placeholder="Sök i resursbanken..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button 
              className={`${activeTab === "Upptäck" ? "text-primary-container font-bold border-b-2 border-primary-container" : "text-stone-500"} pb-1 transition-all`}
              onClick={() => setActiveTab("Upptäck")}
            >
              Upptäck
            </button>
            <button 
              className={`${activeTab === "Mitt bibliotek" ? "text-primary-container font-bold border-b-2 border-primary-container" : "text-stone-500"} pb-1 transition-all`}
              onClick={() => setActiveTab("Mitt bibliotek")}
            >
              Mitt bibliotek
            </button>
            <button 
              className={`${activeTab === "Kategorier" ? "text-primary-container font-bold border-b-2 border-primary-container" : "text-stone-500"} pb-1 transition-all`}
              onClick={() => setActiveTab("Kategorier")}
            >
              Kategorier
            </button>
            <button 
              className={`${activeTab === "Ladda upp" ? "text-primary-container font-bold border-b-2 border-primary-container" : "text-stone-500"} pb-1 transition-all`}
              onClick={() => setActiveTab("Ladda upp")}
            >
              Ladda upp
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-stone-100 transition-colors relative">
              <Bell className="text-stone-600" size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary-container rounded-full"></span>
            </button>
            <button 
              className={`p-2 rounded-full hover:bg-stone-100 transition-colors ${activeTab === "Mitt bibliotek" ? "text-primary-container" : ""}`}
              onClick={() => setActiveTab("Mitt bibliotek")}
            >
              <LucideBookmark className="text-stone-600" size={20} />
            </button>
            <div 
              className={`w-10 h-10 rounded-full overflow-hidden border-2 shadow-sm ml-2 cursor-pointer transition-all ${activeTab === "Profil" ? "border-primary-container scale-110" : "border-white"}`}
              onClick={() => setActiveTab("Profil")}
            >
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQeS03uD80SN967jzf8d7YDLQkmQfgyD78FIxdt_eWq0SJ1OeamNxSbVIj0ZfqOW6h_Cqb2BZIzpOmttciy7RyhrnfnWFoAmCDl6CGzm4dK7vL3ReItchkMvW-9yAPp7l_vbqWn8ec3qgvefO-RsPc5LpWxWt23S_KdX5TQWKEtN_B5wDo5dkZOOG1Az_GnqpBipxDEu928S98_Pwk-tls54yMEW6RPTxp717_6d6fKwIDe1cmVyOqWHQ1RopVx9s-uB_6u4DY" 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-8 pb-4 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center bg-stone-100 px-4 py-2.5 rounded-full group focus-within:ring-2 ring-primary-container/20 transition-all">
          <LucideSearch className="text-stone-400 mr-2" size={18} />
          <input 
            className="bg-transparent border-none focus:ring-0 p-0 text-sm w-full text-espresso placeholder-stone-400" 
            placeholder="Sök i resursbanken..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-8 pt-10 pb-24">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      {/* Floating Side Nav (Desktop) */}
      <aside className="fixed left-0 top-0 h-full hidden lg:flex flex-col py-10 px-6 w-72 bg-stone-50 rounded-r-[40px] z-40 transform -translate-x-[calc(100%-20px)] hover:translate-x-0 transition-transform duration-500 ease-in-out shadow-2xl">
        <div className="mb-14">
          <h2 className="text-xl font-bold text-stone-800 font-outfit">Teckenspråksbibliotek</h2>
          <p className="text-stone-500 text-sm">Svenskt teckenspråk</p>
        </div>
        <nav className="space-y-4 flex-1">
          <button 
            className={`flex items-center gap-4 w-full ${activeTab === "Upptäck" ? "bg-white text-primary-container shadow-sm" : "text-stone-500"} rounded-full px-6 py-3 transition-transform duration-300 hover:translate-x-2`}
            onClick={() => setActiveTab("Upptäck")}
          >
            <Library size={20} />
            <span className="font-medium">Arkiv</span>
          </button>
          <button 
            className={`flex items-center gap-4 w-full ${activeTab === "Kategorier" ? "bg-white text-primary-container shadow-sm" : "text-stone-500"} rounded-full px-6 py-3 transition-transform duration-300 hover:translate-x-2`}
            onClick={() => setActiveTab("Kategorier")}
          >
            <LayoutGrid size={20} />
            <span className="font-medium">Kategorier</span>
          </button>
          <button 
            className={`flex items-center gap-4 w-full ${activeTab === "Profil" ? "bg-white text-primary-container shadow-sm" : "text-stone-500"} rounded-full px-6 py-3 transition-transform duration-300 hover:translate-x-2`}
            onClick={() => setActiveTab("Profil")}
          >
            <User size={20} />
            <span className="font-medium">Min profil</span>
          </button>
          <div className="h-px bg-stone-200 my-4 mx-4"></div>
          <button className="flex items-center gap-4 w-full text-stone-500 px-6 py-3 transition-transform duration-300 hover:translate-x-2">
            <BookOpen size={20} />
            <span className="font-medium">Grammatik</span>
          </button>
          <button className="flex items-center gap-4 w-full text-stone-500 px-6 py-3 transition-transform duration-300 hover:translate-x-2">
            <Languages size={20} />
            <span className="font-medium">Vokabulär</span>
          </button>
          <button 
            className={`flex items-center gap-4 w-full ${activeTab === "Mitt bibliotek" ? "bg-white text-primary-container shadow-sm" : "text-stone-500"} rounded-full px-6 py-3 transition-transform duration-300 hover:translate-x-2`}
            onClick={() => setActiveTab("Mitt bibliotek")}
          >
            <FolderHeart size={20} />
            <span className="font-medium">Mina resurser</span>
          </button>
          <button 
            className={`flex items-center gap-4 w-full ${activeTab === "Ladda upp" ? "bg-white text-primary-container shadow-sm" : "text-stone-500"} rounded-full px-6 py-3 transition-transform duration-300 hover:translate-x-2`}
            onClick={() => setActiveTab("Ladda upp")}
          >
            <UploadCloud size={20} />
            <span className="font-medium">Ladda upp</span>
          </button>
        </nav>
        <button 
          onClick={() => setActiveTab("Ladda upp")}
          className="mt-auto bg-primary text-white py-4 px-6 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
        >
          <UploadCloud size={20} />
          Ladda upp material
        </button>
      </aside>

      {/* Bottom Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-100 flex justify-around items-center py-4 z-50">
        <button 
          className={`flex flex-col items-center gap-1 ${activeTab === "Upptäck" ? "text-primary-container" : "text-stone-400"}`}
          onClick={() => setActiveTab("Upptäck")}
        >
          <LucideHome size={24} />
          <span className="text-[10px] font-bold">Hem</span>
        </button>
        <button 
          className={`flex flex-col items-center gap-1 ${activeTab === "Kategorier" ? "text-primary-container" : "text-stone-400"}`}
          onClick={() => setActiveTab("Kategorier")}
        >
          <Compass size={24} />
          <span className="text-[10px] font-bold">Upptäck</span>
        </button>
        <button 
          className={`flex flex-col items-center gap-1 ${activeTab === "Mitt bibliotek" ? "text-primary-container" : "text-stone-400"}`}
          onClick={() => setActiveTab("Mitt bibliotek")}
        >
          <Video size={24} />
          <span className="text-[10px] font-bold">Bibliotek</span>
        </button>
        <button 
          className={`flex flex-col items-center gap-1 ${activeTab === "Ladda upp" ? "text-primary-container" : "text-stone-400"}`}
          onClick={() => setActiveTab("Ladda upp")}
        >
          <UploadCloud size={24} />
          <span className="text-[10px] font-bold">Ladda upp</span>
        </button>
        <button 
          className={`flex flex-col items-center gap-1 ${activeTab === "Profil" ? "text-primary-container" : "text-stone-400"}`}
          onClick={() => setActiveTab("Profil")}
        >
          <User size={24} />
          <span className="text-[10px] font-bold">Profil</span>
        </button>
      </nav>

      <AnimatePresence>
        {editingResource && (
          <EditResourceModal
            resource={editingResource}
            onClose={() => setEditingResource(null)}
            onSave={(updated: any) => {
              setAllResources(prev => prev.map(r => r.title === editingResource.title ? updated : r));
              setEditingResource(null);
            }}
          />
        )}
        {selectedResource && (
          <FileDetailModal
            resource={selectedResource}
            onClose={() => setSelectedResource(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
