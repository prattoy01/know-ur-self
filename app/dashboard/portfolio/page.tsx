'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Save, ExternalLink, Plus, Trash2, GripVertical } from 'lucide-react';

type Section = 'basic' | 'about' | 'skills' | 'education' | 'projects' | 'achievements' | 'cp' | 'links' | 'settings';

interface Skill {
    id?: string;
    name: string;
    level: string;
    category: string;
    isVisible: boolean;
}

interface Education {
    id?: string;
    institution: string;
    degree: string;
    field: string;
    startYear: number;
    endYear: number | null;
    gpa: string;
    isVisible: boolean;
}

interface Project {
    id?: string;
    title: string;
    description: string;
    technologies: string;
    liveUrl: string;
    repoUrl: string;
    isFeatured: boolean;
    isVisible: boolean;
}

interface Achievement {
    id?: string;
    title: string;
    subtitle: string;
    rank: string;
    organizer: string;
    date: string;
    isVisible: boolean;
}

interface Link {
    id?: string;
    type: string;
    url: string;
    label: string;
    isVisible: boolean;
}

interface CPStats {
    id?: string;
    platform: string;
    handle: string;
    maxRating: number | null;
    currentRating: number | null;
    rank: string;
    problemsSolved: number | null;
    contestsCount: number | null;
    profileUrl: string;
    isVisible: boolean;
}

interface Settings {
    isPublic: boolean;
    showStats: boolean;
    showRating: boolean;
    showAbout: boolean;
    showEducation: boolean;
    showSkills: boolean;
    showProjects: boolean;
    showAchievements: boolean;
    showContact: boolean;
}

export default function PortfolioEditorPage() {
    const router = useRouter();
    const [activeSection, setActiveSection] = useState<Section>('basic');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | ''>('');
    const [previewMode, setPreviewMode] = useState(false);

    // Basic Info
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [headline, setHeadline] = useState('');
    const [location, setLocation] = useState('');
    const [profilePhoto, setProfilePhoto] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');

    // About
    const [bio, setBio] = useState('');
    const [careerGoal, setCareerGoal] = useState('');

    // Skills
    const [skills, setSkills] = useState<Skill[]>([]);
    const [newSkill, setNewSkill] = useState<Skill>({ name: '', level: 'INTERMEDIATE', category: 'Languages', isVisible: true });

    // Education
    const [education, setEducation] = useState<Education[]>([]);
    const [newEducation, setNewEducation] = useState<Education>({
        institution: '', degree: '', field: '', startYear: new Date().getFullYear() - 4,
        endYear: new Date().getFullYear(), gpa: '', isVisible: true
    });

    // Projects
    const [projects, setProjects] = useState<Project[]>([]);
    const [newProject, setNewProject] = useState<Project>({
        title: '', description: '', technologies: '', liveUrl: '', repoUrl: '',
        isFeatured: false, isVisible: true
    });

    // Achievements
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [newAchievement, setNewAchievement] = useState<Achievement>({
        title: '', subtitle: '', rank: '', organizer: '', date: '', isVisible: true
    });

    // Links
    const [links, setLinks] = useState<Link[]>([]);
    const [newLink, setNewLink] = useState<Link>({ type: 'GITHUB', url: '', label: '', isVisible: true });

    // CP Stats
    const [cpStats, setCpStats] = useState<CPStats[]>([]);
    const [newCpStat, setNewCpStat] = useState<CPStats>({
        platform: 'CODEFORCES', handle: '', maxRating: null, currentRating: null,
        rank: '', problemsSolved: null, contestsCount: null, profileUrl: '', isVisible: true
    });

    // Settings
    const [settings, setSettings] = useState<Settings>({
        isPublic: true, showStats: true, showRating: true, showAbout: true,
        showEducation: true, showSkills: true, showProjects: true,
        showAchievements: true, showContact: true
    });

    const sections = [
        { id: 'basic', label: 'Basic Info', icon: '👤' },
        { id: 'about', label: 'About', icon: '📝' },
        { id: 'skills', label: 'Skills', icon: '⚡' },
        { id: 'education', label: 'Education', icon: '🎓' },
        { id: 'cp', label: 'Problem Solving', icon: '💻' },
        { id: 'projects', label: 'Projects', icon: '💼' },
        { id: 'achievements', label: 'Achievements', icon: '🏆' },
        { id: 'links', label: 'Links', icon: '🔗' },
        { id: 'settings', label: 'Privacy', icon: '🔒' },
    ];

    // Fetch portfolio data
    useEffect(() => {
        fetch('/api/portfolio/editor')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setName(data.user.name || '');
                    setUsername(data.user.username || '');
                    setHeadline(data.user.headline || '');
                    setLocation(data.user.location || '');
                    setProfilePhoto(data.user.profilePhoto || '');
                    setResumeUrl(data.user.resumeUrl || '');
                    setBio(data.user.bio || '');
                    setCareerGoal(data.user.careerGoal || '');
                }
                if (data.skills) setSkills(data.skills);
                if (data.education) setEducation(data.education);
                if (data.projects) setProjects(data.projects);
                if (data.achievements) setAchievements(data.achievements);
                if (data.links) setLinks(data.links);
                if (data.cpStats) setCpStats(data.cpStats);
                if (data.settings) setSettings({ ...settings, ...data.settings });
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, []);

    // Debounced autosave
    const autoSave = useCallback(async () => {
        setSaveStatus('saving');
        setIsSaving(true);

        try {
            await fetch('/api/portfolio/editor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: { name, username, headline, location, profilePhoto, resumeUrl, bio, careerGoal },
                    skills, education, projects, achievements, links, cpStats, settings
                }),
            });
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(''), 2000);
        } catch {
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    }, [name, username, headline, location, profilePhoto, resumeUrl, bio, careerGoal, skills, education, projects, achievements, links, cpStats, settings]);

    // Add handlers
    const addSkill = () => {
        if (!newSkill.name.trim()) return;
        setSkills([...skills, { ...newSkill }]);
        setNewSkill({ name: '', level: 'INTERMEDIATE', category: 'Languages', isVisible: true });
    };

    const addEducation = () => {
        if (!newEducation.institution.trim() || !newEducation.degree.trim()) return;
        setEducation([...education, { ...newEducation }]);
        setNewEducation({
            institution: '', degree: '', field: '', startYear: new Date().getFullYear() - 4,
            endYear: new Date().getFullYear(), gpa: '', isVisible: true
        });
    };

    const addProject = () => {
        if (!newProject.title.trim()) return;
        setProjects([...projects, { ...newProject }]);
        setNewProject({
            title: '', description: '', technologies: '', liveUrl: '', repoUrl: '',
            isFeatured: false, isVisible: true
        });
    };

    const addAchievement = () => {
        if (!newAchievement.title.trim()) return;
        setAchievements([...achievements, { ...newAchievement }]);
        setNewAchievement({ title: '', subtitle: '', rank: '', organizer: '', date: '', isVisible: true });
    };

    const addLink = () => {
        if (!newLink.url.trim()) return;
        setLinks([...links, { ...newLink }]);
        setNewLink({ type: 'GITHUB', url: '', label: '', isVisible: true });
    };

    const addCpStat = () => {
        if (!newCpStat.platform.trim()) return;
        setCpStats([...cpStats, { ...newCpStat }]);
        setNewCpStat({
            platform: 'CODEFORCES', handle: '', maxRating: null, currentRating: null,
            rank: '', problemsSolved: null, contestsCount: null, profileUrl: '', isVisible: true
        });
    };

    const skillLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
    const skillCategories = ['Languages', 'Frameworks', 'Tools', 'Databases', 'Other'];
    const linkTypes = ['GITHUB', 'LINKEDIN', 'TWITTER', 'WEBSITE', 'CODEFORCES', 'CODECHEF', 'LEETCODE', 'EMAIL', 'OTHER'];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading portfolio...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio Editor</h1>
                    <p className="text-gray-500 dark:text-gray-400">Customize your public profile</p>
                </div>

                <div className="flex items-center gap-3">
                    {saveStatus && (
                        <span className={`text-sm px-3 py-1 rounded-full ${saveStatus === 'saved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            saveStatus === 'saving' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                            {saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'saving' ? 'Saving...' : 'Error saving'}
                        </span>
                    )}

                    <button
                        onClick={autoSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition disabled:opacity-50"
                    >
                        <Save size={18} />
                        Save Changes
                    </button>

                    {username && (
                        <a
                            href={`/u/${username}`}
                            target="_blank"
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            <ExternalLink size={18} />
                            View Live
                        </a>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-[280px_1fr] gap-6">
                {/* Section Navigation */}
                <nav className="space-y-1">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id as Section)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${activeSection === section.id
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <span className="text-xl">{section.icon}</span>
                            <span className="font-medium">{section.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Editor Content */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                    {/* Basic Info */}
                    {activeSection === 'basic' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Basic Information</h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Username</label>
                                    <div className="flex items-center">
                                        <span className="px-3 py-3 bg-gray-100 dark:bg-gray-800 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-xl text-gray-500">/u/</span>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-xl focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Headline</label>
                                <input
                                    type="text"
                                    value={headline}
                                    onChange={(e) => setHeadline(e.target.value)}
                                    placeholder="Software Engineer | Open Source Enthusiast"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Resume URL</label>
                                <input
                                    type="url"
                                    value={resumeUrl}
                                    onChange={(e) => setResumeUrl(e.target.value)}
                                    placeholder="https://drive.google.com/your-resume.pdf"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">Link to your resume (Google Drive, Dropbox, etc.). This enables the &quot;Download Resume&quot; button on your portfolio.</p>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Location</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="City, Country"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none"
                                />
                            </div>

                            {/* Profile Photo */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-4">Profile Photo</label>
                                <div className="flex items-start gap-6">
                                    {/* Preview */}
                                    <div className="flex-shrink-0">
                                        {profilePhoto ? (
                                            <div className="w-32 h-32 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-700">
                                                <img
                                                    src={profilePhoto}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '';
                                                        setProfilePhoto('');
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ring-2 ring-dashed ring-gray-300 dark:ring-gray-600">
                                                <span className="text-4xl">👤</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Upload Options */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Image URL</label>
                                            <input
                                                type="url"
                                                value={profilePhoto}
                                                onChange={(e) => setProfilePhoto(e.target.value)}
                                                placeholder="https://example.com/your-photo.jpg"
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                                            />
                                        </div>
                                        <div className="relative">
                                            <label className="block text-xs text-gray-400 mb-1">Or upload a file</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    // Create FormData and upload
                                                    const formData = new FormData();
                                                    formData.append('file', file);

                                                    try {
                                                        const res = await fetch('/api/upload', {
                                                            method: 'POST',
                                                            body: formData,
                                                        });
                                                        const data = await res.json();
                                                        if (data.url) {
                                                            setProfilePhoto(data.url);
                                                        }
                                                    } catch (err) {
                                                        console.error('Upload failed:', err);
                                                    }
                                                }}
                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/30 dark:file:text-purple-400"
                                            />
                                        </div>
                                        {profilePhoto && (
                                            <button
                                                onClick={() => setProfilePhoto('')}
                                                className="text-sm text-red-500 hover:text-red-600"
                                            >
                                                Remove photo
                                            </button>
                                        )}
                                        <p className="text-xs text-gray-400">
                                            Recommended: Square image, at least 400x400 pixels
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* About */}
                    {activeSection === 'about' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">About</h2>

                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Bio <span className="text-xs">(Markdown supported)</span></label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={8}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Career Goal</label>
                                <textarea
                                    value={careerGoal}
                                    onChange={(e) => setCareerGoal(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    {activeSection === 'skills' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Skills</h2>

                            {/* Existing Skills */}
                            {skills.length > 0 && (
                                <div className="space-y-2">
                                    {skills.map((skill, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                            <button
                                                onClick={() => {
                                                    const updated = [...skills];
                                                    updated[index].isVisible = !updated[index].isVisible;
                                                    setSkills(updated);
                                                }}
                                                className={`p-1 rounded ${skill.isVisible ? 'text-green-500' : 'text-gray-400'}`}
                                            >
                                                {skill.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                            <div className="flex-1">
                                                <span className="font-medium">{skill.name}</span>
                                                <span className="text-sm text-gray-500 ml-2">({skill.level.toLowerCase()})</span>
                                            </div>
                                            <span className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{skill.category}</span>
                                            <button
                                                onClick={() => setSkills(skills.filter((_, i) => i !== index))}
                                                className="text-red-400 hover:text-red-500 p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Skill */}
                            <div className="grid md:grid-cols-4 gap-3 items-end p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                <input
                                    type="text"
                                    value={newSkill.name}
                                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                                    placeholder="Skill name"
                                    className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                                />
                                <select
                                    value={newSkill.level}
                                    onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                                    className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                                >
                                    {skillLevels.map(l => <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>)}
                                </select>
                                <select
                                    value={newSkill.category}
                                    onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                                    className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                                >
                                    {skillCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <button onClick={addSkill} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition flex items-center justify-center gap-2">
                                    <Plus size={18} /> Add
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {activeSection === 'education' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Education</h2>

                            {education.map((edu, index) => (
                                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-start gap-3">
                                    <button
                                        onClick={() => {
                                            const updated = [...education];
                                            updated[index].isVisible = !updated[index].isVisible;
                                            setEducation(updated);
                                        }}
                                        className={`p-1 mt-1 rounded ${edu.isVisible ? 'text-green-500' : 'text-gray-400'}`}
                                    >
                                        {edu.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="font-medium">{edu.institution}</div>
                                        <div className="text-sm text-gray-500">{edu.degree} {edu.field && `in ${edu.field}`}</div>
                                        <div className="text-xs text-gray-400">{edu.startYear} - {edu.endYear || 'Present'} {edu.gpa && `• GPA: ${edu.gpa}`}</div>
                                    </div>
                                    <button
                                        onClick={() => setEducation(education.filter((_, i) => i !== index))}
                                        className="text-red-400 hover:text-red-500 p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            {/* Add Education */}
                            <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
                                <div className="grid md:grid-cols-2 gap-3">
                                    <input type="text" value={newEducation.institution} onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })} placeholder="Institution" className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none" />
                                    <input type="text" value={newEducation.degree} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} placeholder="Degree" className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none" />
                                </div>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <input type="text" value={newEducation.field} onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })} placeholder="Field of Study" className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none" />
                                    <input type="text" value={newEducation.gpa} onChange={(e) => setNewEducation({ ...newEducation, gpa: e.target.value })} placeholder="CGPA (e.g., 3.7/4.0)" className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none" />
                                </div>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <input type="number" value={newEducation.startYear} onChange={(e) => setNewEducation({ ...newEducation, startYear: parseInt(e.target.value) })} placeholder="Start Year" className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none" />
                                    <input type="number" value={newEducation.endYear || ''} onChange={(e) => setNewEducation({ ...newEducation, endYear: e.target.value ? parseInt(e.target.value) : null })} placeholder="End Year (leave empty if current)" className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none" />
                                </div>
                                <button onClick={addEducation} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition flex items-center gap-2">
                                    <Plus size={18} /> Add Education
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Problem Solving / CP Stats */}
                    {activeSection === 'cp' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Problem Solving Profiles</h2>
                            <p className="text-gray-500 text-sm">Add your competitive programming profiles to showcase your problem-solving skills.</p>

                            {cpStats.map((stat, index) => (
                                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3">
                                    <div className="flex items-start gap-3">
                                        <button
                                            onClick={() => {
                                                const updated = [...cpStats];
                                                updated[index].isVisible = !updated[index].isVisible;
                                                setCpStats(updated);
                                            }}
                                            className={`p-1 mt-1 rounded ${stat.isVisible ? 'text-green-500' : 'text-gray-400'}`}
                                        >
                                            {stat.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                        <div className="flex-1 space-y-3">
                                            <div className="grid md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Platform</label>
                                                    <select
                                                        value={stat.platform}
                                                        onChange={(e) => {
                                                            const updated = [...cpStats];
                                                            updated[index].platform = e.target.value;
                                                            setCpStats(updated);
                                                        }}
                                                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                                    >
                                                        <option value="CODEFORCES">Codeforces</option>
                                                        <option value="CODECHEF">CodeChef</option>
                                                        <option value="ATCODER">AtCoder</option>
                                                        <option value="LEETCODE">LeetCode</option>
                                                        <option value="OTHER">Other</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Handle/Username</label>
                                                    <input
                                                        type="text"
                                                        value={stat.handle}
                                                        onChange={(e) => {
                                                            const updated = [...cpStats];
                                                            updated[index].handle = e.target.value;
                                                            setCpStats(updated);
                                                        }}
                                                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Max Rating</label>
                                                    <input
                                                        type="number"
                                                        value={stat.maxRating || ''}
                                                        onChange={(e) => {
                                                            const updated = [...cpStats];
                                                            updated[index].maxRating = e.target.value ? parseInt(e.target.value) : null;
                                                            setCpStats(updated);
                                                        }}
                                                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Rank Title</label>
                                                    <input
                                                        type="text"
                                                        value={stat.rank}
                                                        placeholder="e.g., Specialist, 4*"
                                                        onChange={(e) => {
                                                            const updated = [...cpStats];
                                                            updated[index].rank = e.target.value;
                                                            setCpStats(updated);
                                                        }}
                                                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Problems Solved</label>
                                                    <input
                                                        type="number"
                                                        value={stat.problemsSolved || ''}
                                                        onChange={(e) => {
                                                            const updated = [...cpStats];
                                                            updated[index].problemsSolved = e.target.value ? parseInt(e.target.value) : null;
                                                            setCpStats(updated);
                                                        }}
                                                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Profile URL</label>
                                                <input
                                                    type="url"
                                                    value={stat.profileUrl}
                                                    placeholder="https://codeforces.com/profile/username"
                                                    onChange={(e) => {
                                                        const updated = [...cpStats];
                                                        updated[index].profileUrl = e.target.value;
                                                        setCpStats(updated);
                                                    }}
                                                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setCpStats(cpStats.filter((_, i) => i !== index))}
                                            className="text-red-400 hover:text-red-500 p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Add CP Stat */}
                            <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
                                <div className="grid md:grid-cols-2 gap-3">
                                    <select
                                        value={newCpStat.platform}
                                        onChange={(e) => setNewCpStat({ ...newCpStat, platform: e.target.value })}
                                        className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    >
                                        <option value="CODEFORCES">Codeforces</option>
                                        <option value="CODECHEF">CodeChef</option>
                                        <option value="ATCODER">AtCoder</option>
                                        <option value="LEETCODE">LeetCode</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={newCpStat.handle}
                                        onChange={(e) => setNewCpStat({ ...newCpStat, handle: e.target.value })}
                                        placeholder="Handle/Username"
                                        className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    />
                                </div>
                                <div className="grid md:grid-cols-3 gap-3">
                                    <input
                                        type="number"
                                        value={newCpStat.maxRating || ''}
                                        onChange={(e) => setNewCpStat({ ...newCpStat, maxRating: e.target.value ? parseInt(e.target.value) : null })}
                                        placeholder="Max Rating"
                                        className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        value={newCpStat.rank}
                                        onChange={(e) => setNewCpStat({ ...newCpStat, rank: e.target.value })}
                                        placeholder="Rank (e.g., Specialist)"
                                        className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    />
                                    <input
                                        type="number"
                                        value={newCpStat.problemsSolved || ''}
                                        onChange={(e) => setNewCpStat({ ...newCpStat, problemsSolved: e.target.value ? parseInt(e.target.value) : null })}
                                        placeholder="Problems Solved"
                                        className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    />
                                </div>
                                <input
                                    type="url"
                                    value={newCpStat.profileUrl}
                                    onChange={(e) => setNewCpStat({ ...newCpStat, profileUrl: e.target.value })}
                                    placeholder="Profile URL (optional)"
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                />
                                <button onClick={addCpStat} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition flex items-center gap-2">
                                    <Plus size={18} /> Add Platform
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Projects */}
                    {activeSection === 'projects' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Projects</h2>

                            {projects.map((project, index) => (
                                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-start gap-3">
                                    <button
                                        onClick={() => {
                                            const updated = [...projects];
                                            updated[index].isVisible = !updated[index].isVisible;
                                            setProjects(updated);
                                        }}
                                        className={`p-1 mt-1 rounded ${project.isVisible ? 'text-green-500' : 'text-gray-400'}`}
                                    >
                                        {project.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="font-medium">{project.title} {project.isFeatured && <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded ml-2">Featured</span>}</div>
                                        <div className="text-sm text-gray-500 line-clamp-2">{project.description}</div>
                                        {project.technologies && <div className="text-xs text-gray-400 mt-1">{project.technologies}</div>}
                                    </div>
                                    <button
                                        onClick={() => setProjects(projects.filter((_, i) => i !== index))}
                                        className="text-red-400 hover:text-red-500 p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            {/* Add Project */}
                            <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
                                <input type="text" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} placeholder="Project Title" className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none" />
                                <textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="Description" rows={3} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none resize-none" />
                                <input type="text" value={newProject.technologies} onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })} placeholder="Technologies (comma separated)" className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none" />
                                <div className="grid md:grid-cols-2 gap-3">
                                    <input type="url" value={newProject.liveUrl} onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })} placeholder="Live URL" className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none" />
                                    <input type="url" value={newProject.repoUrl} onChange={(e) => setNewProject({ ...newProject, repoUrl: e.target.value })} placeholder="Repository URL" className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none" />
                                </div>
                                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <input type="checkbox" checked={newProject.isFeatured} onChange={(e) => setNewProject({ ...newProject, isFeatured: e.target.checked })} className="accent-purple-500" />
                                    Feature this project
                                </label>
                                <button onClick={addProject} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition flex items-center gap-2">
                                    <Plus size={18} /> Add Project
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Achievements */}
                    {activeSection === 'achievements' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Achievements</h2>

                            {achievements.map((achievement, index) => (
                                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-start gap-3">
                                    <button
                                        onClick={() => {
                                            const updated = [...achievements];
                                            updated[index].isVisible = !updated[index].isVisible;
                                            setAchievements(updated);
                                        }}
                                        className={`p-1 mt-1 rounded ${achievement.isVisible ? 'text-green-500' : 'text-gray-400'}`}
                                    >
                                        {achievement.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="font-medium">{achievement.title}</div>
                                        <div className="text-sm text-gray-500">{achievement.subtitle}</div>
                                        {achievement.rank && <div className="text-sm text-purple-500 font-medium">{achievement.rank}</div>}
                                    </div>
                                    <button
                                        onClick={() => setAchievements(achievements.filter((_, i) => i !== index))}
                                        className="text-red-400 hover:text-red-500 p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            {/* Add Achievement */}
                            <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
                                <input type="text" value={newAchievement.title} onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })} placeholder="Achievement Title" className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none" />
                                <div className="grid md:grid-cols-2 gap-3">
                                    <input type="text" value={newAchievement.subtitle} onChange={(e) => setNewAchievement({ ...newAchievement, subtitle: e.target.value })} placeholder="Subtitle (e.g., Contest name)" className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none" />
                                    <input type="text" value={newAchievement.rank} onChange={(e) => setNewAchievement({ ...newAchievement, rank: e.target.value })} placeholder="Rank (e.g., 1st, Top 10%)" className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none" />
                                </div>
                                <input type="text" value={newAchievement.organizer} onChange={(e) => setNewAchievement({ ...newAchievement, organizer: e.target.value })} placeholder="Organizer" className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none" />
                                <button onClick={addAchievement} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition flex items-center gap-2">
                                    <Plus size={18} /> Add Achievement
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Links */}
                    {activeSection === 'links' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Links & Contact</h2>

                            {links.map((link, index) => (
                                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            const updated = [...links];
                                            updated[index].isVisible = !updated[index].isVisible;
                                            setLinks(updated);
                                        }}
                                        className={`p-1 rounded ${link.isVisible ? 'text-green-500' : 'text-gray-400'}`}
                                    >
                                        {link.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="font-medium">{link.type}</div>
                                        <div className="text-sm text-blue-500 truncate">{link.url}</div>
                                    </div>
                                    <button
                                        onClick={() => setLinks(links.filter((_, i) => i !== index))}
                                        className="text-red-400 hover:text-red-500 p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            {/* Add Link */}
                            <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
                                <div className="grid md:grid-cols-3 gap-3">
                                    <select value={newLink.type} onChange={(e) => setNewLink({ ...newLink, type: e.target.value })} className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none">
                                        {linkTypes.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                                    </select>
                                    <input type="url" value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} placeholder="URL" className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none" />
                                    <button onClick={addLink} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition flex items-center justify-center gap-2">
                                        <Plus size={18} /> Add Link
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Settings */}
                    {activeSection === 'settings' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Privacy & Visibility</h2>

                            <div className="space-y-3">
                                {[
                                    { key: 'isPublic', label: 'Make Portfolio Public', desc: 'Allow anyone to view your portfolio' },
                                    { key: 'showStats', label: 'Show Statistics', desc: 'Display study hours and activity stats' },
                                    { key: 'showRating', label: 'Show Rating', desc: 'Display your AntiGravity rank and rating' },
                                    { key: 'showAbout', label: 'Show About Section', desc: 'Display bio and career goal' },
                                    { key: 'showEducation', label: 'Show Education', desc: 'Display education history' },
                                    { key: 'showSkills', label: 'Show Skills', desc: 'Display your skills' },
                                    { key: 'showProjects', label: 'Show Projects', desc: 'Display your projects' },
                                    { key: 'showAchievements', label: 'Show Achievements', desc: 'Display your achievements' },
                                    { key: 'showContact', label: 'Show Contact Info', desc: 'Display links and email' },
                                ].map(setting => (
                                    <label key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition">
                                        <div>
                                            <div className="font-medium">{setting.label}</div>
                                            <div className="text-sm text-gray-500">{setting.desc}</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={(settings as any)[setting.key]}
                                            onChange={(e) => setSettings({ ...settings, [setting.key]: e.target.checked })}
                                            className="w-5 h-5 accent-purple-500"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
