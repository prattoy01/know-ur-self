'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Step = 'identity' | 'about' | 'skills' | 'education' | 'links';

interface Skill {
    name: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    category: string;
}

interface Education {
    institution: string;
    degree: string;
    field: string;
    startYear: number;
    endYear: number | null;
}

interface Link {
    type: string;
    url: string;
    label?: string;
}

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>('identity');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Identity State
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [headline, setHeadline] = useState('');
    const [location, setLocation] = useState('');
    const [profilePhotoPreview, setProfilePhotoPreview] = useState('');

    // About State
    const [bio, setBio] = useState('');
    const [careerGoal, setCareerGoal] = useState('');

    // Skills State
    const [skills, setSkills] = useState<Skill[]>([]);
    const [newSkill, setNewSkill] = useState({ name: '', level: 'INTERMEDIATE' as const, category: 'Languages' });

    // Education State
    const [education, setEducation] = useState<Education[]>([]);
    const [newEducation, setNewEducation] = useState({
        institution: '',
        degree: '',
        field: '',
        startYear: new Date().getFullYear() - 4,
        endYear: new Date().getFullYear() as number | null,
    });

    // Links State
    const [links, setLinks] = useState<Link[]>([]);
    const [newLink, setNewLink] = useState({ type: 'GITHUB', url: '', label: '' });
    const [showEmailPublic, setShowEmailPublic] = useState(false);

    const steps: { id: Step; title: string; icon: string }[] = [
        { id: 'identity', title: 'Identity', icon: '👤' },
        { id: 'about', title: 'About', icon: '📝' },
        { id: 'skills', title: 'Skills', icon: '⚡' },
        { id: 'education', title: 'Education', icon: '🎓' },
        { id: 'links', title: 'Links', icon: '🔗' },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === currentStep);

    // Load existing user data on mount
    useEffect(() => {
        fetch('/api/onboarding')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setName(data.user.name || '');
                    setUsername(data.user.username || '');
                    setHeadline(data.user.headline || '');
                    setLocation(data.user.location || '');
                    setBio(data.user.bio || '');
                    setCareerGoal(data.user.careerGoal || '');
                    setProfilePhotoPreview(data.user.profilePhoto || '');
                }
                if (data.skills) setSkills(data.skills);
                if (data.education) setEducation(data.education);
                if (data.links) setLinks(data.links);
            })
            .catch(console.error);
    }, []);

    const validateStep = (): boolean => {
        setError('');

        switch (currentStep) {
            case 'identity':
                if (!name.trim()) {
                    setError('Full name is required');
                    return false;
                }
                if (!username.trim()) {
                    setError('Username is required for your portfolio URL');
                    return false;
                }
                if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
                    setError('Username can only contain letters, numbers, underscores, and hyphens');
                    return false;
                }
                if (!headline.trim()) {
                    setError('A short headline is required');
                    return false;
                }
                return true;
            case 'about':
                if (!bio.trim()) {
                    setError('Bio is required');
                    return false;
                }
                if (!careerGoal.trim()) {
                    setError('Career goal/focus is required');
                    return false;
                }
                return true;
            case 'skills':
                if (skills.length === 0) {
                    setError('Add at least one skill');
                    return false;
                }
                return true;
            case 'education':
                if (education.length === 0) {
                    setError('Add at least one education entry');
                    return false;
                }
                return true;
            case 'links':
                // Links are optional, but we validate format if any
                return true;
            default:
                return true;
        }
    };

    const saveCurrentStep = async (): Promise<boolean> => {
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    step: currentStep,
                    data: {
                        // Identity
                        name,
                        username,
                        headline,
                        location,
                        profilePhoto: profilePhotoPreview,
                        // About
                        bio,
                        careerGoal,
                        // Skills (only send on skills step)
                        ...(currentStep === 'skills' && { skills }),
                        // Education (only send on education step)
                        ...(currentStep === 'education' && { education }),
                        // Links (only send on links step)
                        ...(currentStep === 'links' && { links, showEmailPublic }),
                    },
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to save');
            }

            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = async () => {
        if (!validateStep()) return;

        const saved = await saveCurrentStep();
        if (!saved) return;

        const nextIndex = currentStepIndex + 1;
        if (nextIndex < steps.length) {
            setCurrentStep(steps[nextIndex].id);
        }
    };

    const handleBack = () => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setCurrentStep(steps[prevIndex].id);
        }
    };

    const handleComplete = async () => {
        if (!validateStep()) return;

        const saved = await saveCurrentStep();
        if (!saved) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/onboarding/complete', {
                method: 'POST',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to complete setup');
            }

            router.push('/dashboard');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const addSkill = () => {
        if (!newSkill.name.trim()) return;
        setSkills([...skills, { ...newSkill }]);
        setNewSkill({ name: '', level: 'INTERMEDIATE', category: 'Languages' });
    };

    const removeSkill = (index: number) => {
        setSkills(skills.filter((_, i) => i !== index));
    };

    const addEducation = () => {
        if (!newEducation.institution.trim() || !newEducation.degree.trim()) return;
        setEducation([...education, { ...newEducation }]);
        setNewEducation({
            institution: '',
            degree: '',
            field: '',
            startYear: new Date().getFullYear() - 4,
            endYear: new Date().getFullYear(),
        });
    };

    const removeEducation = (index: number) => {
        setEducation(education.filter((_, i) => i !== index));
    };

    const addLink = () => {
        if (!newLink.url.trim()) return;
        setLinks([...links, { ...newLink }]);
        setNewLink({ type: 'GITHUB', url: '', label: '' });
    };

    const removeLink = (index: number) => {
        setLinks(links.filter((_, i) => i !== index));
    };

    const skillLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
    const skillCategories = ['Languages', 'Frameworks', 'Tools', 'Databases', 'Other'];
    const linkTypes = ['GITHUB', 'LINKEDIN', 'TWITTER', 'WEBSITE', 'CODEFORCES', 'CODECHEF', 'LEETCODE', 'OTHER'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '4s' }}></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        Build Your Portfolio
                    </h1>
                    <p className="text-gray-400">Complete your profile to create your public portfolio page</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between items-center mb-12 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-700 -translate-y-1/2 -z-10"></div>
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 -translate-y-1/2 -z-10 transition-all duration-500"
                        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {steps.map((step, index) => (
                        <button
                            key={step.id}
                            onClick={() => index <= currentStepIndex && setCurrentStep(step.id)}
                            disabled={index > currentStepIndex}
                            className={`flex flex-col items-center gap-2 transition-all ${index <= currentStepIndex ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                        >
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${index < currentStepIndex
                                    ? 'bg-green-500 text-white'
                                    : index === currentStepIndex
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-110 shadow-lg shadow-purple-500/50'
                                        : 'bg-gray-700 text-gray-400'
                                    }`}
                            >
                                {index < currentStepIndex ? '✓' : step.icon}
                            </div>
                            <span className={`text-sm hidden sm:block ${index === currentStepIndex ? 'text-white font-medium' : 'text-gray-400'}`}>
                                {step.title}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {/* Form Card */}
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-purple-500/20">
                    {/* Identity Step */}
                    {currentStep === 'identity' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-6">Basic Identity</h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Username * <span className="text-xs text-gray-500">(for your URL)</span></label>
                                    <div className="flex items-center">
                                        <span className="text-gray-500 bg-slate-900/30 px-3 py-3 rounded-l-xl border border-r-0 border-gray-700">/u/</span>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                            placeholder="johndoe"
                                            className="flex-1 px-4 py-3 bg-slate-900/50 border border-gray-700 rounded-r-xl focus:border-purple-500 focus:outline-none transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Headline * <span className="text-xs text-gray-500">(one-liner about you)</span></label>
                                <input
                                    type="text"
                                    value={headline}
                                    onChange={(e) => setHeadline(e.target.value)}
                                    placeholder="Software Engineer | Open Source Enthusiast"
                                    maxLength={100}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Location <span className="text-xs text-gray-500">(optional)</span></label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Dhaka, Bangladesh"
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition"
                                />
                            </div>
                        </div>
                    )}

                    {/* About Step */}
                    {currentStep === 'about' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-6">About You</h2>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Bio * <span className="text-xs text-gray-500">(Markdown supported)</span></label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="I am a passionate developer with experience in..."
                                    rows={6}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Career Goal / Focus *</label>
                                <textarea
                                    value={careerGoal}
                                    onChange={(e) => setCareerGoal(e.target.value)}
                                    placeholder="My goal is to become a full-stack developer and contribute to open source projects..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Skills Step */}
                    {currentStep === 'skills' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-6">Your Skills</h2>

                            {/* Added Skills */}
                            {skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {skills.map((skill, index) => (
                                        <div
                                            key={index}
                                            className={`px-4 py-2 rounded-full flex items-center gap-2 ${skill.level === 'EXPERT' ? 'bg-purple-600/30 border-purple-500' :
                                                skill.level === 'ADVANCED' ? 'bg-blue-600/30 border-blue-500' :
                                                    skill.level === 'INTERMEDIATE' ? 'bg-green-600/30 border-green-500' :
                                                        'bg-gray-600/30 border-gray-500'
                                                } border`}
                                        >
                                            <span className="text-sm">{skill.name}</span>
                                            <span className="text-xs text-gray-400">({skill.level.toLowerCase()})</span>
                                            <button
                                                onClick={() => removeSkill(index)}
                                                className="text-red-400 hover:text-red-300 ml-1"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Skill Form */}
                            <div className="grid md:grid-cols-4 gap-4 items-end">
                                <div className="md:col-span-1">
                                    <label className="block text-sm text-gray-400 mb-2">Skill Name</label>
                                    <input
                                        type="text"
                                        value={newSkill.name}
                                        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                                        placeholder="React"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Level</label>
                                    <select
                                        value={newSkill.level}
                                        onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as any })}
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition"
                                    >
                                        {skillLevels.map(level => (
                                            <option key={level} value={level}>{level.charAt(0) + level.slice(1).toLowerCase()}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Category</label>
                                    <select
                                        value={newSkill.category}
                                        onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition"
                                    >
                                        {skillCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={addSkill}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl transition font-medium"
                                >
                                    Add Skill
                                </button>
                            </div>

                            <p className="text-sm text-gray-500">
                                Add at least one skill to continue. You can add more later from your dashboard.
                            </p>
                        </div>
                    )}

                    {/* Education Step */}
                    {currentStep === 'education' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-6">Education</h2>

                            {/* Added Education */}
                            {education.length > 0 && (
                                <div className="space-y-3 mb-6">
                                    {education.map((edu, index) => (
                                        <div key={index} className="bg-slate-900/30 p-4 rounded-xl flex justify-between items-center">
                                            <div>
                                                <div className="font-medium">{edu.institution}</div>
                                                <div className="text-sm text-gray-400">{edu.degree} {edu.field && `in ${edu.field}`}</div>
                                                <div className="text-xs text-gray-500">
                                                    {edu.startYear} - {edu.endYear || 'Present'}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeEducation(index)}
                                                className="text-red-400 hover:text-red-300 px-3"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Education Form */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Institution *</label>
                                    <input
                                        type="text"
                                        value={newEducation.institution}
                                        onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                                        placeholder="University Name"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Degree / Program *</label>
                                    <input
                                        type="text"
                                        value={newEducation.degree}
                                        onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                                        placeholder="B.Sc. in Computer Science"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Field of Study</label>
                                    <input
                                        type="text"
                                        value={newEducation.field}
                                        onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
                                        placeholder="Computer Science"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Start Year</label>
                                        <input
                                            type="number"
                                            value={newEducation.startYear}
                                            onChange={(e) => setNewEducation({ ...newEducation, startYear: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">End Year</label>
                                        <input
                                            type="number"
                                            value={newEducation.endYear || ''}
                                            onChange={(e) => setNewEducation({
                                                ...newEducation,
                                                endYear: e.target.value ? parseInt(e.target.value) : null
                                            })}
                                            placeholder="Present"
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={addEducation}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl transition font-medium"
                            >
                                Add Education
                            </button>
                        </div>
                    )}

                    {/* Links Step */}
                    {currentStep === 'links' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-6">Contact & Links</h2>

                            {/* Email Visibility Toggle */}
                            <label className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl cursor-pointer">
                                <div>
                                    <div className="font-medium">Show Email Publicly</div>
                                    <div className="text-sm text-gray-400">Allow visitors to see your email address</div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={showEmailPublic}
                                    onChange={(e) => setShowEmailPublic(e.target.checked)}
                                    className="w-5 h-5 accent-purple-500"
                                />
                            </label>

                            {/* Added Links */}
                            {links.length > 0 && (
                                <div className="space-y-3 mb-6">
                                    {links.map((link, index) => (
                                        <div key={index} className="bg-slate-900/30 p-4 rounded-xl flex justify-between items-center">
                                            <div>
                                                <div className="font-medium">{link.type}</div>
                                                <div className="text-sm text-blue-400 truncate max-w-md">{link.url}</div>
                                            </div>
                                            <button
                                                onClick={() => removeLink(index)}
                                                className="text-red-400 hover:text-red-300 px-3"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Link Form */}
                            <div className="grid md:grid-cols-3 gap-4 items-end">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Platform</label>
                                    <select
                                        value={newLink.type}
                                        onChange={(e) => setNewLink({ ...newLink, type: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition"
                                    >
                                        {linkTypes.map(type => (
                                            <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">URL</label>
                                    <input
                                        type="url"
                                        value={newLink.url}
                                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                        placeholder="https://github.com/username"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition"
                                    />
                                </div>
                                <button
                                    onClick={addLink}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl transition font-medium"
                                >
                                    Add Link
                                </button>
                            </div>

                            <p className="text-sm text-gray-500">
                                Adding links is optional but recommended. You can always add more later.
                            </p>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-10 pt-6 border-t border-gray-700">
                        <button
                            onClick={handleBack}
                            disabled={currentStepIndex === 0}
                            className={`px-6 py-3 rounded-xl transition font-medium ${currentStepIndex === 0
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-700 hover:bg-gray-600 text-white'
                                }`}
                        >
                            ← Back
                        </button>

                        {currentStepIndex < steps.length - 1 ? (
                            <button
                                onClick={handleNext}
                                disabled={isLoading}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl transition font-medium shadow-lg shadow-purple-500/30 disabled:opacity-50"
                            >
                                {isLoading ? 'Saving...' : 'Continue →'}
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={isLoading}
                                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl transition font-medium shadow-lg shadow-green-500/30 disabled:opacity-50"
                            >
                                {isLoading ? 'Completing...' : '✓ Complete Setup'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Preview URL */}
                {username && (
                    <div className="text-center mt-8 text-gray-400">
                        Your portfolio URL will be: <span className="text-purple-400 font-medium">antigravity.app/u/{username}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
