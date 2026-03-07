import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorAPI, skillAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Video, FileText, Plus, Trash2, ChevronLeft, Save,
    Layout, CheckCircle, AlertCircle, Play, FileDown, HelpCircle,
    GripVertical, List, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Lesson {
    title: string;
    videoUrl: string;
    content: string;
    duration: string;
}

interface Module {
    title: string;
    lessons: Lesson[];
}

interface Resource {
    title: string;
    url: string;
    type: 'PDF' | 'Video' | 'Code' | 'Other';
}

interface Question {
    question: string;
    options: string[];
    correctAnswer: number;
}

interface MockTest {
    title: string;
    description: string;
    duration: number;
    questions: Question[];
}

export default function InstructorCurriculum() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'modules' | 'resources' | 'tests'>('modules');

    const [modules, setModules] = useState<Module[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [mockTests, setMockTests] = useState<MockTest[]>([]);

    const { data: course, isLoading } = useQuery({
        queryKey: ['courseDetails', courseId],
        queryFn: () => skillAPI.getCourseDetails(courseId!).then(r => r.data.course),
        enabled: !!courseId
    });

    useEffect(() => {
        if (course) {
            setModules(course.modules || []);
            setResources(course.resources || []);
            setMockTests(course.mockTests || []);
        }
    }, [course]);

    const saveMutation = useMutation({
        mutationFn: (data: any) => instructorAPI.updateCurriculum(courseId!, data),
        onSuccess: () => {
            toast.success('Curriculum saved successfully!');
            queryClient.invalidateQueries({ queryKey: ['courseDetails', courseId] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to save')
    });

    const handleSave = () => {
        saveMutation.mutate({ modules, resources, mockTests });
    };

    // ── Module Handlers ───────────────────────────────────────────────────────
    const addModule = () => {
        setModules([...modules, { title: 'New Module', lessons: [] }]);
    };

    const updateModuleTitle = (idx: number, title: string) => {
        const newModules = [...modules];
        newModules[idx].title = title;
        setModules(newModules);
    };

    const addLesson = (moduleIdx: number) => {
        const newModules = [...modules];
        newModules[moduleIdx].lessons.push({ title: 'New Lesson', videoUrl: '', content: '', duration: '10 mins' });
        setModules(newModules);
    };

    const updateLesson = (mIdx: number, lIdx: number, field: keyof Lesson, value: string) => {
        const newModules = [...modules];
        (newModules[mIdx].lessons[lIdx] as any)[field] = value;
        setModules(newModules);
    };

    const deleteLesson = (mIdx: number, lIdx: number) => {
        const newModules = [...modules];
        newModules[mIdx].lessons.splice(lIdx, 1);
        setModules(newModules);
    };

    const deleteModule = (idx: number) => {
        setModules(modules.filter((_, i) => i !== idx));
    };

    // ── Resource Handlers ─────────────────────────────────────────────────────
    const addResource = () => {
        setResources([...resources, { title: 'Study Note', url: '', type: 'PDF' }]);
    };

    // ── Mock Test Handlers ────────────────────────────────────────────────────
    const addMockTest = () => {
        setMockTests([...mockTests, { title: 'Final Assessment', description: '', duration: 30, questions: [] }]);
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-white">Loading Curriculum Editor...</div>;

    return (
        <div className="min-h-screen bg-dark-900 pb-20">
            {/* Nav Header */}
            <header className="sticky top-0 z-40 bg-dark-800/80 backdrop-blur-md border-b border-white/5 py-4 px-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/instructor/dashboard')} className="p-2 hover:bg-white/5 rounded-full text-white/50">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white leading-tight">{course?.title}</h1>
                            <p className="text-white/40 text-xs">Curriculum Editor</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" /> {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-8 py-8">
                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-white/5 pb-px">
                    {[
                        { id: 'modules', label: 'Modules & Lessons', icon: Layout },
                        { id: 'resources', label: 'Study Material', icon: FileDown },
                        { id: 'tests', label: 'Mock Tests', icon: HelpCircle }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id ? 'text-primary-400' : 'text-white/40 hover:text-white'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div layoutId="curriculum-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'modules' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-semibold flex items-center gap-2"><List className="w-5 h-5 text-primary-400" /> Course Content</h3>
                                <button onClick={addModule} className="btn-secondary text-xs flex items-center gap-2 py-2 px-4">
                                    <Plus className="w-3.5 h-3.5" /> Add Module
                                </button>
                            </div>

                            {modules.map((module, mIdx) => (
                                <div key={mIdx} className="glass-card overflow-hidden">
                                    <div className="bg-white/5 p-4 flex items-center gap-4">
                                        <GripVertical className="w-4 h-4 text-white/20 cursor-move" />
                                        <input
                                            value={module.title}
                                            onChange={e => updateModuleTitle(mIdx, e.target.value)}
                                            className="bg-transparent border-none text-white font-bold w-full focus:ring-0"
                                            placeholder="Module Title"
                                        />
                                        <button onClick={() => deleteModule(mIdx)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="p-4 space-y-3 bg-dark-800/40">
                                        {module.lessons.map((lesson, lIdx) => (
                                            <div key={lIdx} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <Video className="w-4 h-4 text-primary-400" />
                                                        <input
                                                            value={lesson.title}
                                                            onChange={e => updateLesson(mIdx, lIdx, 'title', e.target.value)}
                                                            className="bg-transparent border-none text-white text-sm font-medium w-full focus:ring-0"
                                                            placeholder="Lesson Title"
                                                        />
                                                    </div>
                                                    <button onClick={() => deleteLesson(mIdx, lIdx)} className="p-1 px-2 text-white/20 hover:text-red-400 transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] text-white/40 uppercase font-bold mb-1 block">Video URL (YouTube/Vimeo)</label>
                                                        <input
                                                            value={lesson.videoUrl}
                                                            onChange={e => updateLesson(mIdx, lIdx, 'videoUrl', e.target.value)}
                                                            className="input-field text-xs py-2"
                                                            placeholder="https://..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-white/40 uppercase font-bold mb-1 block">Duration</label>
                                                        <input
                                                            value={lesson.duration}
                                                            onChange={e => updateLesson(mIdx, lIdx, 'duration', e.target.value)}
                                                            className="input-field text-xs py-2"
                                                            placeholder="e.g. 15 mins"
                                                        />
                                                    </div>
                                                </div>
                                                <textarea
                                                    value={lesson.content}
                                                    onChange={e => updateLesson(mIdx, lIdx, 'content', e.target.value)}
                                                    className="input-field text-xs py-2 w-full h-20"
                                                    placeholder="Short lesson description or text content..."
                                                />
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addLesson(mIdx)}
                                            className="w-full py-3 border-2 border-dashed border-white/5 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Plus className="w-4 h-4" /> Add Lesson
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'resources' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-semibold flex items-center gap-2"><FileDown className="w-5 h-5 text-emerald-400" /> Additional Resources</h3>
                                <button onClick={addResource} className="btn-secondary text-xs flex items-center gap-2">
                                    <Plus className="w-3.5 h-3.5" /> Add Material
                                </button>
                            </div>
                            {resources.map((res, idx) => (
                                <div key={idx} className="glass-card p-4 flex gap-4">
                                    <select
                                        value={res.type}
                                        onChange={e => {
                                            const newR = [...resources];
                                            newR[idx].type = e.target.value as any;
                                            setResources(newR);
                                        }}
                                        className="bg-dark-900 border border-white/10 rounded-xl text-xs text-white p-2"
                                    >
                                        <option value="PDF">PDF</option>
                                        <option value="Code">Code</option>
                                        <option value="Video">Video</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <div className="flex-1 space-y-2">
                                        <input
                                            value={res.title}
                                            onChange={e => {
                                                const newR = [...resources];
                                                newR[idx].title = e.target.value;
                                                setResources(newR);
                                            }}
                                            className="input-field py-2 text-xs"
                                            placeholder="Material Title (e.g. Cheat Sheet)"
                                        />
                                        <input
                                            value={res.url}
                                            onChange={e => {
                                                const newR = [...resources];
                                                newR[idx].url = e.target.value;
                                                setResources(newR);
                                            }}
                                            className="input-field py-2 text-xs"
                                            placeholder="Download URL"
                                        />
                                    </div>
                                    <button onClick={() => setResources(resources.filter((_, i) => i !== idx))} className="text-white/20 hover:text-red-400 transition-colors p-2">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'tests' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-semibold flex items-center gap-2"><Award className="w-5 h-5 text-yellow-400" /> Mock Assessments</h3>
                                <button onClick={addMockTest} className="btn-secondary text-xs flex items-center gap-2">
                                    <Plus className="w-3.5 h-3.5" /> Create Test
                                </button>
                            </div>
                            {mockTests.map((test, idx) => (
                                <div key={idx} className="glass-card p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 space-y-3">
                                            <input
                                                value={test.title}
                                                onChange={e => {
                                                    const newT = [...mockTests];
                                                    newT[idx].title = e.target.value;
                                                    setMockTests(newT);
                                                }}
                                                className="bg-transparent border-none text-white font-bold text-lg w-full focus:ring-0 p-0"
                                                placeholder="Mock Test Title"
                                            />
                                            <textarea
                                                value={test.description}
                                                onChange={e => {
                                                    const newT = [...mockTests];
                                                    newT[idx].description = e.target.value;
                                                    setMockTests(newT);
                                                }}
                                                className="input-field text-xs py-2 h-16"
                                                placeholder="Test instructions..."
                                            />
                                        </div>
                                        <button onClick={() => setMockTests(mockTests.filter((_, i) => i !== idx))} className="text-white/20 hover:text-red-400 p-2">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-white/50">
                                        <span>Questions: {test.questions.length}</span>
                                        <span>Duration: {test.duration} mins</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newT = [...mockTests];
                                            newT[idx].questions.push({ question: 'New Question', options: ['', '', '', ''], correctAnswer: 0 });
                                            setMockTests(newT);
                                        }}
                                        className="btn-ghost border border-white/5 text-xs py-2 w-full"
                                    >
                                        Add/Edit Questions (Coming Soon)
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
