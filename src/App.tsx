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
  Settings2
} from "lucide-react";

const GRAMMAR_CARDS = [
  {
    title: "Verbets böjningsformer",
    lessons: 14,
    duration: "45 min",
    tag: "Grammatik",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYqD9Jjx8DPhccYnRTD-U77-z9ptlA9YOjAu00S0WonGAcpobpLPgQnKAW1BxJLvFFJV0ePtzT9SJZQ5cHhfUqBMK_6hKlJDYHmgY7Rf-fMgiQjrIdSgAD7v3hyjmKS5B2aXfCc-pGzCW8aVtw8B--zKevcUfZiDjXYS_066YMBDvko0elSAieNxx9OWusYWGdXZTPYuuAHoBMJEQtYTrJsGgemCQu5OY0AdFo2ZX6jaw8-1WnSz0AMpCLxVRl8VNVyXmxi2Ij"
  },
  {
    title: "Spatial referensram",
    lessons: 8,
    duration: "32 min",
    tag: "Grammatik",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGQJW5mRQYudNMmdXvmctzQDARfH2ZIwZEoWjuP3VshCn8RnBTw_G1eIuuq0pcu6By2oWTZ4DXmUGw4qoKp49T-jD8Wb9BvIm0nsYpeVyX7eDjqYJO4m870bbZ39c0a7E4rx5-JRYcnFCmq7DSOfudSNGX2HO9Pvj_uo6sL9jvqCPEUcyIQFBIuD31lF0d9a0Nmpom3UFRmCA9a6bSgdu7FLGUOFRPNibJaPfi1hdfxSpEfO59r1QgpiLXCCNo-XmtHrwPrBhw"
  },
  {
    title: "Negationsmorfologi",
    lessons: 11,
    duration: "28 min",
    tag: "Grammatik",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUUc3I_D96T9rOY0oEpVzQjrN1RQYNffUi-OeuuVIp4l-ShhaJcJPWrxE7YYppjzEGL-SihECAk80_SFOv9IJcSIXBQv0pMsgk0T90KtzQmJuagv1bm4WkmyXkYuRup5fLdMkoHo9HoDCoSn5ECMCM8gW3ingKzt10i8DbeE2r8rYpOw8Cc3GMJyocAfnn0K1T4Pd1flXfSe9M43dAeILh3VFbV4QEnpZEjAvgN9vuYpHiW8mqPMdD4VY2wUOew9Tdw0c0hmxL"
  },
  {
    title: "Icke-manuella signaler",
    lessons: 20,
    duration: "55 min",
    tag: "Grammatik",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAj5yrcqExWIvruSq6A26BieCXa2tvb-ExKBsv3y9ciGz416WxPzazNtoktKSUFhoRdVq8ur4U-kdMoIf4ocN4VgEStRJG98RYeaIf__A_X5CnsHjFk78hYv4ZRGOHy0a_I0N2bqHAxRJ9tVh9TNxJIc0JXSEV4CiutLBiizHBfGwDd1MORwOE6z0SFeRxmr5HahfZ1aVl8-WZBbHI5eWt-mQmGUc_gBqjomrf8JasSWr3JKFexLGDAkdDvq5WI5Dq1_iaba5wI"
  }
];

const VOCAB_CARDS = [
  {
    title: "På arbetsplatsen",
    items: 25,
    duration: "12 min",
    tag: "Vokabulär",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxkSEo87JHW5po1pVnznf0TlBOAy230ysHNkhlGRIqvEZInG351eQMM0I6wK4NnKR_plx6oElPd3RZeVdhBg9jIGDploBThV8OeumztH5MQKcNOtXL_B2TDk5LYWUj4R8ffMDPrKqmgA5BvdVVZwR79m0eXFtjij5rlNVZIw326_wuLAgahXj1vsr7rL_fFWXVBWNziwt-CbCg0FmDtvcnPLwc7VFcDsV3Jo-ZuUz7qlPKejNjs0Pi-ThmiEYoRn1Eu9037fpZ"
  },
  {
    title: "Beställa på restaurang",
    items: 18,
    duration: "10 min",
    tag: "Vokabulär",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlXiLMfrw0c_aNCDdrwYhYSclQQhZMOFP7O9E0NsaMVU0tRTdJc0sf9h8ikAmGCVfpXrOb0mPAw_XXY3EYqSjUcKPNCon24E7TNmttWJMHOPCWa8Xor3rZgMGgoCa2i-OoLCWIenPerfPeRITjjphDCr16mSOwT0hxgM2_JgnrHLVl6x6ixzxZAdDis4E3WkwR2csXsvn__263ZkgB2Wa2PxwE-FEqnccL4_U9A9lzj2stM7zNwdBd3VM-0FMilZ-a4z_tDNwr"
  },
  {
    title: "Småprat & Mingel",
    items: 32,
    duration: "15 min",
    tag: "Vokabulär",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4pu7ukOUIaX_B3IMWY4MGVjQ34YrhW_HLjwhMw1KkwNQqLNJEw3-avMUnSzC7Rbbcej--KsrqBY97ytBj3WOcFeQaKxtQIS5eGXAVObZZPtb_t73kPwuCfzDfrl2r29dHL5IhjXl0ZGFjl_nO5CSCfk0JqvNA-NByybNaUCn5re7pq_XRBEnmzl7cih_sJiG67Y9UgfwFZdQ4dBRuK-egwRQ07cECxToaOIl0b3daLgNjK1pjAfGV_ZG6P8cK2peBNKgP6gS9"
  }
];

const CATEGORIES = [
  { name: "Grammatik", icon: BookOpen, color: "bg-grammar", count: 124, description: "Syntax, morfologi och struktur." },
  { name: "Vokabulär", icon: Languages, color: "bg-vocabulary", count: 450, description: "Glosor och tecken för vardagen." },
  { name: "Kultur", icon: Globe, color: "bg-culture", count: 85, description: "Historia, normer och identitet." },
  { name: "Vardagsfraser", icon: Compass, color: "bg-primary-container", count: 210, description: "Praktiska uttryck för mingel." },
  { name: "Historia", icon: Clock, color: "bg-espresso", count: 42, description: "Teckenspråkets utveckling." },
  { name: "Poesi", icon: LucideBookmark, color: "bg-stone-400", count: 18, description: "Visuell estetik och rytmik." },
  { name: "Barn & Ungdom", icon: User, color: "bg-emerald-500", count: 156, description: "Sagor och pedagogiskt material." },
  { name: "Arbetsliv", icon: Library, color: "bg-blue-500", count: 92, description: "Professionell kommunikation." },
  { name: "Sport", icon: Play, color: "bg-orange-500", count: 34, description: "Terminologi inom idrott." }
];

const SAVED_RESOURCES = [
  {
    ...GRAMMAR_CARDS[1],
    audience: "Barn",
    level: "Nivå 1"
  },
  {
    ...VOCAB_CARDS[1],
    audience: "Vuxna",
    level: "Nivå 2"
  },
  {
    title: "Dövas tidning - Arkiv",
    items: 120,
    duration: "Löpande",
    tag: "Kultur",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBEYDOvs95Nn9xuNoeI4mcqVYCbEdfzZht66sYmn5IVH_ce4iONwyP9xTflIgE8gZPJKMo0BXtoH1HF7t0-M-lAVqqieT72evGzgmU4Fmzs7JhH2DSy7fNnhtYUHAr4rWLHodgdIiHtfrcYdqs0_ilLfPfDpaHFZ8E5i1fBcCAYDjal2rOdRyw9LQ3tavCVQWYVEFb31RVWbwDS03ks-Da2GGinVcIFMYZXlmQsTwkLWK4h_p6OiHfjRFw5cAkKMS4TS9fH3ck",
    audience: "Vuxna",
    level: "Nivå 3"
  },
  {
    title: "Bebistecken: Mat & Dryck",
    items: 15,
    duration: "10 min",
    tag: "Vokabulär",
    image: "https://picsum.photos/seed/baby1/300/320",
    audience: "Bebistecken",
    level: "Nivå 1"
  },
  {
    title: "Lekfulla tecken för barn",
    lessons: 8,
    duration: "45 min",
    tag: "Grammatik",
    image: "https://picsum.photos/seed/kids/300/320",
    audience: "Barn",
    level: "Nivå 2"
  }
];

const DOCUMENTS = [
  {
    title: "Teckenspråkets grunder",
    type: "PDF",
    size: "2.4 MB",
    tag: "Referens",
    icon: "FileText"
  },
  {
    title: "Grammatikguide - Nivå 1",
    type: "PDF",
    size: "1.8 MB",
    tag: "Grammatik",
    icon: "BookOpen"
  },
  {
    title: "Handalfabetet - Referensblad",
    type: "PNG",
    size: "4.2 MB",
    tag: "Vokabulär",
    icon: "Image"
  },
  {
    title: "Kulturella koder",
    type: "PDF",
    size: "1.1 MB",
    tag: "Kultur",
    icon: "Globe"
  }
];

const ALL_RESOURCES = [
  ...GRAMMAR_CARDS,
  ...VOCAB_CARDS,
  {
    title: "Dövas tidning - Arkiv",
    items: 120,
    duration: "Löpande",
    tag: "Kultur",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBEYDOvs95Nn9xuNoeI4mcqVYCbEdfzZht66sYmn5IVH_ce4iONwyP9xTflIgE8gZPJKMo0BXtoH1HF7t0-M-lAVqqieT72evGzgmU4Fmzs7JhH2DSy7fNnhtYUHAr4rWLHodgdIiHtfrcYdqs0_ilLfPfDpaHFZ8E5i1fBcCAYDjal2rOdRyw9LQ3tavCVQWYVEFb31RVWbwDS03ks-Da2GGinVcIFMYZXlmQsTwkLWK4h_p6OiHfjRFw5cAkKMS4TS9fH3ck"
  }
];

function DocumentCard({ title, type, size, tag, icon }: any) {
  const IconComponent = {
    FileText,
    BookOpen,
    Image,
    Globe
  }[icon] || FileText;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4 group cursor-pointer hover:shadow-md transition-all"
    >
      <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-primary-container group-hover:bg-primary-container group-hover:text-white transition-colors">
        <IconComponent size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-stone-900 truncate font-outfit">{title}</h4>
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <span className="bg-stone-100 px-2 py-0.5 rounded uppercase tracking-wider">{type}</span>
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

function Card({ title, lessons, items, duration, tag, image, onRemove, onEdit, audience, level }: any) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="min-w-[300px] w-[300px] flex-shrink-0 snap-start group cursor-pointer"
    >
      <div className="relative h-[320px] rounded-2xl overflow-hidden mb-4 shadow-sm bg-stone-200 transition-all group-hover:shadow-xl">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className={`backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${tag === 'Grammatik' ? 'bg-grammar/90' : 'bg-vocabulary/90'}`}>
            {tag}
          </div>
          {level && (
            <div className="bg-white/90 backdrop-blur-sm text-stone-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              {level}
            </div>
          )}
        </div>
        {audience && (
          <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">
            {audience}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white">
            <Play className="fill-current" size={24} />
          </div>
        </div>
      </div>
      <h3 className="font-bold text-lg mb-1 line-clamp-1 font-outfit">{title}</h3>
      <div className="flex justify-between items-center">
        <p className="text-stone-500 text-sm font-body">
          {lessons ? `${lessons} lektioner` : `${items} glosor`} • {duration}
        </p>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const blob = new Blob(["Mock content for " + title], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${title}.txt`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-primary-container transition-colors"
            title="Ladda ner resurs"
          >
            <Download size={20} />
          </button>
          {onEdit && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-primary-container transition-colors"
              title="Redigera metadata"
            >
              <Settings2 size={20} />
            </button>
          )}
          {onRemove && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-2 hover:bg-red-50 rounded-lg text-stone-400 hover:text-red-500 transition-colors"
              title="Ta bort från bibliotek"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>
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
              {["Grammatik", "Vokabulär", "Kultur", "Vardagsfraser", "Historia", "Poesi", "Barn & Ungdom", "Arbetsliv", "Sport"].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
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

export default function App() {
  const [activeTab, setActiveTab] = useState("Upptäck");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alla");
  const [selectedAudience, setSelectedAudience] = useState(() => localStorage.getItem("selectedAudience") || "Alla");
  const [selectedLevel, setSelectedLevel] = useState(() => localStorage.getItem("selectedLevel") || "Alla");

  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem("selectedAudience", selectedAudience);
  }, [selectedAudience]);

  useEffect(() => {
    localStorage.setItem("selectedLevel", selectedLevel);
  }, [selectedLevel]);
  
  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [savedResources, setSavedResources] = useState(SAVED_RESOURCES);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  const handleFileUpload = async (files: FileList | null, isFolder = false) => {
    if (!files) return;
    
    const newFiles = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      type: file.type,
      status: "analyzing",
      category: "Oidentifierad",
      audience: "Vuxna",
      level: "Nivå 1",
      date: new Date().toLocaleDateString()
    }));

    setUploadedFiles(prev => [...newFiles, ...prev]);
    setIsAnalyzing(true);

    // AI Analysis for each file
    for (const fileObj of newFiles) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: `Analysera filnamnet "${fileObj.name}" och kategorisera det för ett teckenspråksbibliotek.
          Svara i JSON-format med följande fält:
          - category: (Grammatik, Vokabulär, Kultur, Vardagsfraser, Historia, Poesi, Barn & Ungdom, Arbetsliv, Sport)
          - audience: (Bebistecken, Barn, Vuxna)
          - level: (Nivå 1, Nivå 2, Nivå 3)
          
          Exempel: "bebistecken_mat.mp4" -> { "category": "Vokabulär", "audience": "Bebistecken", "level": "Nivå 1" }`,
          config: {
            responseMimeType: "application/json",
          }
        });

        const analysis = JSON.parse(response.text || "{}");
        
        const completedFile = { 
          ...fileObj, 
          category: analysis.category || "Övrigt", 
          audience: analysis.audience || "Vuxna",
          level: analysis.level || "Nivå 1",
          status: "completed" 
        };

        setUploadedFiles(prev => prev.map(f => 
          f.id === fileObj.id ? completedFile : f
        ));

        // Automatically move to library if it's a folder upload or just auto-add
        const newResource = {
          title: fileObj.name.split('.')[0],
          items: Math.floor(Math.random() * 20) + 5,
          duration: "5 min",
          tag: completedFile.category,
          audience: completedFile.audience,
          level: completedFile.level,
          image: `https://picsum.photos/seed/${fileObj.id}/300/320`
        };
        
        setSavedResources(prev => [newResource, ...prev]);

      } catch (error) {
        console.error("AI Analysis failed:", error);
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: "error" } : f
        ));
      }
    }
    setIsAnalyzing(false);
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

  const removeSavedResource = (title: string) => {
    setSavedResources(prev => prev.filter(r => r.title !== title));
  };

  const filteredResources = (activeTab === "Mitt bibliotek" ? savedResources : [...ALL_RESOURCES, ...savedResources]).filter(resource => {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredResources.map((card, idx) => (
                <Card 
                  key={idx} 
                  {...card} 
                  onRemove={() => removeSavedResource(card.title)}
                  onEdit={() => setEditingResource(card)}
                />
              ))}
            </div>
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
                {GRAMMAR_CARDS.map((card, idx) => (
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
                {VOCAB_CARDS.map((card, idx) => (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DOCUMENTS.map((doc, idx) => (
                  <DocumentCard key={idx} {...doc} />
                ))}
              </div>
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
                          {savedResources.filter(r => r.audience === folder.id).length} resurser
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredResources.map((card, idx) => (
                  <Card 
                    key={idx} 
                    {...card} 
                    onRemove={() => removeSavedResource(card.title)}
                    onEdit={() => setEditingResource(card)}
                  />
                ))}
                {filteredResources.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
                    <p className="text-stone-400 font-medium">Inga resurser hittades med valda filter.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-espresso text-white p-12 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-lg">
                <h3 className="text-3xl font-bold font-outfit">Redo att bidra?</h3>
                <p className="text-white/70 leading-relaxed">Dela med dig av ditt material eller dina erfarenheter till Teckenspråks bibliotek. Tillsammans bygger vi världens största resursbank för svenskt teckenspråk.</p>
                <button className="bg-primary-container text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform">
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
                  <div className="bg-stone-50 px-4 py-2 rounded-full text-stone-600 font-bold text-xs">
                    {cat.count} resurser
                  </div>
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
                  <p className="text-stone-500 font-medium">Teckenspråksentusiast • Medlem sedan 2024</p>
                  <div className="flex gap-3 justify-center md:justify-start pt-2">
                    <span className="bg-stone-100 px-4 py-1.5 rounded-full text-xs font-bold text-stone-600">Nivå 12</span>
                    <span className="bg-primary-container/10 px-4 py-1.5 rounded-full text-xs font-bold text-primary-container">Guldmedlem</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-stone-50 p-6 rounded-3xl text-center">
                  <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">Slutförda kurser</p>
                  <p className="text-3xl font-bold font-outfit">24</p>
                </div>
                <div className="bg-stone-50 p-6 rounded-3xl text-center">
                  <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">Inlärda tecken</p>
                  <p className="text-3xl font-bold font-outfit">1,420</p>
                </div>
                <div className="bg-stone-50 p-6 rounded-3xl text-center">
                  <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">Dagar i rad</p>
                  <p className="text-3xl font-bold font-outfit">15</p>
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
                Dela med dig av dina videor, dokument eller övningar. Vår AI hjälper dig att kategorisera materialet automatiskt.
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
                onChange={(e) => handleFileUpload(e.target.files, true)}
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
              <div className="bg-white rounded-[40px] p-10 shadow-sm border border-stone-100 space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold font-outfit">Dina uppladdningar</h3>
                  {isAnalyzing && (
                    <div className="flex items-center gap-2 text-primary-container font-bold text-sm animate-pulse">
                      <Loader2 className="animate-spin" size={18} />
                      AI analyserar...
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {uploadedFiles.map((file) => (
                    <motion.div 
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-6 bg-stone-50 rounded-3xl border border-stone-100 group hover:border-primary-container/30 transition-colors"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-stone-400 shadow-sm">
                          <FileText size={28} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-stone-800">{file.name}</h4>
                          <div className="flex items-center gap-3 text-xs font-medium">
                            <span className="text-stone-400">{file.size}</span>
                            <span className="text-stone-300">•</span>
                            <span className="text-stone-400">{file.date}</span>
                            <span className="text-stone-300">•</span>
                            <span className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${
                              file.status === 'completed' ? "bg-emerald-100 text-emerald-600" : 
                              file.status === 'error' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                            }`}>
                              {file.status === 'completed' ? <CheckCircle2 size={12} /> : 
                               file.status === 'error' ? <AlertCircle size={12} /> : <Loader2 className="animate-spin" size={12} />}
                              {file.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => downloadFile(file)}
                          className="p-3 hover:bg-white rounded-xl text-stone-400 hover:text-primary-container transition-colors shadow-sm"
                          title="Ladda ner"
                        >
                          <Download size={20} />
                        </button>
                        <button 
                          onClick={() => removeFile(file.id)}
                          className="p-3 hover:bg-white rounded-xl text-stone-400 hover:text-red-500 transition-colors shadow-sm"
                          title="Ta bort"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
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
              Teckenspråks bibliotek
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
          <h2 className="text-xl font-bold text-stone-800 font-outfit">Teckenspråks bibliotek</h2>
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
              setSavedResources(prev => prev.map(r => r.title === editingResource.title ? updated : r));
              setEditingResource(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
