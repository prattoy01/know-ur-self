'use client';

import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, ExternalLink, Menu, X, Download, Trophy, MapPin } from 'lucide-react';

interface Skill {
    id: string;
    name: string;
    level: string;
    category: string | null;
}

interface Education {
    id: string;
    institution: string;
    degree: string;
    field: string | null;
    startYear: number;
    endYear: number | null;
    gpa: string | null;
}

interface Project {
    id: string;
    title: string;
    description: string | null;
    technologies: string | null;
    liveUrl: string | null;
    repoUrl: string | null;
    isFeatured: boolean;
}

interface Achievement {
    id: string;
    title: string;
    subtitle: string | null;
    rank: string | null;
    organizer: string | null;
}

interface Link {
    id: string;
    type: string;
    url: string;
    label: string | null;
}

interface CPStats {
    id: string;
    platform: string;
    handle: string | null;
    maxRating: number | null;
    currentRating: number | null;
    rank: string | null;
    problemsSolved: number | null;
    contestsCount: number | null;
    profileUrl: string | null;
}

interface PortfolioData {
    name: string;
    headline: string;
    location: string;
    profilePhoto: string;
    bio: string;
    careerGoal: string;
    resumeUrl: string | null;
    rating: number | null;
    rank: string | null;
    skills: Skill[];
    education: Education[];
    projects: Project[];
    achievements: Achievement[];
    links: Link[];
    cpStats: CPStats[];
    settings: {
        showStats: boolean;
        showRating: boolean;
        showAbout: boolean;
        showEducation: boolean;
        showSkills: boolean;
        showProjects: boolean;
        showAchievements: boolean;
        showContact: boolean;
    };
}

interface Props {
    data: PortfolioData;
}

const getLinkIcon = (type: string) => {
    switch (type.toUpperCase()) {
        case 'GITHUB': return <Github size={22} className="text-gray-700" />;
        case 'LINKEDIN': return <Linkedin size={22} className="text-gray-700" />;
        case 'EMAIL': return <Mail size={22} className="text-gray-700" />;
        default: return <ExternalLink size={22} className="text-gray-700" />;
    }
};

const getSkillColor = (category: string | null) => {
    switch (category?.toLowerCase()) {
        case 'languages': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', heading: 'text-blue-600' };
        case 'web development': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100', heading: 'text-green-600' };
        case 'frameworks': return { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-100', heading: 'text-pink-600' };
        case 'ios development':
        case 'application development': return { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-100', heading: 'text-pink-600' };
        case 'tools':
        case 'tools and frameworks': return { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-100', heading: 'text-cyan-600' };
        case 'databases':
        case 'database': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', heading: 'text-amber-600' };
        case 'design patterns': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', heading: 'text-purple-600' };
        default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-100', heading: 'text-gray-600' };
    }
};

const getPlatformColor = (platform: string) => {
    switch (platform.toUpperCase()) {
        case 'CODEFORCES': return 'from-blue-50 to-blue-100 border-blue-200';
        case 'CODECHEF': return 'from-purple-50 to-purple-100 border-purple-200';
        case 'ATCODER': return 'from-pink-50 to-pink-100 border-pink-200';
        case 'LEETCODE': return 'from-amber-50 to-amber-100 border-amber-200';
        default: return 'from-gray-50 to-gray-100 border-gray-200';
    }
};

const getPlatformBarColor = (platform: string) => {
    switch (platform.toUpperCase()) {
        case 'CODEFORCES': return '#3b82f6';
        case 'CODECHEF': return '#8b5cf6';
        case 'ATCODER': return '#ec4899';
        case 'LEETCODE': return '#f59e0b';
        default: return '#10b981';
    }
};

export default function PublicPortfolio({ data }: Props) {
    const [activeSection, setActiveSection] = useState('about');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);

            const sections = ['about', 'education', 'skills', 'problem-solving', 'achievements', 'projects', 'contact'];
            const current = sections.find(section => {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    return rect.top <= 100 && rect.bottom >= 100;
                }
                return false;
            });
            if (current) setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { id: 'about', label: 'About Me', show: data.settings.showAbout && data.bio },
        { id: 'education', label: 'Education', show: data.settings.showEducation && data.education.length > 0 },
        { id: 'skills', label: 'Technical Skills', show: data.settings.showSkills && data.skills.length > 0 },
        { id: 'problem-solving', label: 'Problem Solving', show: data.cpStats && data.cpStats.length > 0 },
        { id: 'achievements', label: 'Achievements', show: data.settings.showAchievements && data.achievements.length > 0 },
        { id: 'projects', label: 'Projects', show: data.settings.showProjects && data.projects.length > 0 },
    ].filter(item => item.show);

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        setIsMenuOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    // Group skills by category
    const skillsByCategory = data.skills.reduce((acc, skill) => {
        const cat = skill.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill);
        return acc;
    }, {} as Record<string, Skill[]>);

    // Calculate total problems solved
    const totalProblems = data.cpStats?.reduce((sum, stat) => sum + (stat.problemsSolved || 0), 0) || 0;
    const totalContests = data.cpStats?.reduce((sum, stat) => sum + (stat.contestsCount || 0), 0) || 0;
    // Use a fixed scale of 1200 for distribution bars (or the max if higher)
    const highestSolved = Math.max(...(data.cpStats?.map(s => s.problemsSolved || 0) || [0]));
    const maxProblems = Math.max(1200, highestSolved);

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'}`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <a href="#" className="text-xl font-bold text-gray-900">
                            {data.name}
                        </a>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === item.id
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100">
                        <div className="px-4 py-3 space-y-1">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium ${activeSection === item.id
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative pt-24 pb-20 px-6 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative min-h-[calc(100vh-6rem)] flex items-center">
                        {/* Left Column - Text Content */}
                        <div className="max-w-2xl space-y-6 z-10">
                            <p className="text-lg text-gray-500 font-light">Hello! 👋</p>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                                I'm <span className="text-blue-600">{data.name}</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-gray-600 font-light">
                                {data.headline}
                            </p>

                            {data.location && (
                                <p className="text-lg text-gray-500 flex items-center gap-2">
                                    <MapPin size={18} /> {data.location}
                                </p>
                            )}

                            {/* Download Resume Button */}
                            {data.resumeUrl && (
                                <div className="pt-4">
                                    <a
                                        href={data.resumeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition-all duration-200 hover:scale-105 shadow-md font-medium"
                                    >
                                        <Download size={20} />
                                        Download Resume
                                    </a>
                                </div>
                            )}

                            {/* Social Links */}
                            {data.settings.showContact && data.links.length > 0 && (
                                <div className="flex gap-3 pt-2">
                                    {data.links.slice(0, 4).map(link => (
                                        <a
                                            key={link.id}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                            aria-label={link.type}
                                        >
                                            {getLinkIcon(link.type)}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Side - Profile Picture */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block">
                            <div className="relative">
                                <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-2xl ring-1 ring-gray-200">
                                    {data.profilePhoto ? (
                                        <img
                                            src={data.profilePhoto}
                                            alt={data.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                            <span className="text-8xl">👤</span>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 rounded-full bg-blue-500/5 blur-3xl -z-10"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            {data.settings.showAbout && data.bio && (
                <section id="about" className="py-20 px-6">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-4xl font-bold mb-8 flex items-center gap-3">
                            About Me
                            <div className="h-1 flex-grow bg-gradient-to-r from-blue-500 to-transparent rounded"></div>
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 bg-gray-50 rounded-2xl p-8 border border-gray-100">
                                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                                    {data.bio}
                                </p>
                                {data.careerGoal && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h3 className="text-lg font-semibold text-blue-600 mb-2">Career Goal</h3>
                                        <p className="text-gray-700">{data.careerGoal}</p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                {totalProblems > 0 && (
                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                        <p className="text-sm text-gray-600">Total Problems</p>
                                        <p className="text-3xl font-bold text-blue-600">{totalProblems}+</p>
                                    </div>
                                )}
                                {totalContests > 0 && (
                                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                        <p className="text-sm text-gray-600">Contests</p>
                                        <p className="text-3xl font-bold text-purple-600">{totalContests}+</p>
                                    </div>
                                )}
                                <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
                                    <p className="text-sm text-gray-600">Projects</p>
                                    <p className="text-3xl font-bold text-pink-600">{data.projects.length}+</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Education Section */}
            {data.settings.showEducation && data.education.length > 0 && (
                <section id="education" className="py-20 px-6 bg-gray-50">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-4xl font-bold mb-8 flex items-center gap-3">
                            Education
                            <div className="h-1 flex-grow bg-gradient-to-r from-blue-500 to-transparent rounded"></div>
                        </h2>
                        <div className="space-y-4">
                            {data.education.map(edu => (
                                <div key={edu.id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{edu.institution}</h3>
                                    <p className="text-xl text-blue-600 mb-2">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                                    <div className="flex flex-wrap gap-4 text-gray-600">
                                        <span className="bg-gray-100 px-4 py-2 rounded-lg">{edu.startYear} - {edu.endYear || 'Present'}</span>
                                        {edu.gpa && <span className="bg-blue-50 px-4 py-2 rounded-lg font-semibold text-blue-600">GPA: {edu.gpa}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Skills Section */}
            {data.settings.showSkills && data.skills.length > 0 && (
                <section id="skills" className="py-20 px-6">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl font-bold mb-12 flex items-center gap-3">
                            Technical Skills
                            <div className="h-1 flex-grow bg-gradient-to-r from-blue-500 to-transparent rounded"></div>
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {Object.entries(skillsByCategory).map(([category, skills]) => {
                                const colors = getSkillColor(category);
                                return (
                                    <div key={category} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                        <h3 className={`text-xl font-bold ${colors.heading} mb-4`}>{category}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map(skill => (
                                                <span
                                                    key={skill.id}
                                                    className={`${colors.bg} ${colors.text} px-4 py-2 rounded-lg text-sm border ${colors.border} hover:opacity-80 transition-opacity`}
                                                >
                                                    {skill.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Problem Solving Section */}
            {data.cpStats && data.cpStats.length > 0 && (
                <section id="problem-solving" className="py-20 px-6 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl font-bold mb-8 flex items-center gap-3">
                            Problem Solving
                            <div className="h-1 flex-grow bg-gradient-to-r from-blue-500 to-transparent rounded"></div>
                        </h2>
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <p className="text-lg text-gray-600 mb-6">
                                Active competitive programmer with strong problem-solving skills across various platforms.
                            </p>

                            {/* Platform Cards */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {data.cpStats.slice(0, 2).map(stat => (
                                    <div
                                        key={stat.id}
                                        className={`bg-gradient-to-br ${getPlatformColor(stat.platform)} rounded-xl p-6 border`}
                                    >
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{stat.platform}</h3>
                                        {stat.maxRating && (
                                            <p className="text-gray-700 mb-1">
                                                Max Rating: <span className="font-bold">{stat.maxRating}</span>
                                                {stat.rank && ` (${stat.rank})`}
                                            </p>
                                        )}
                                        {stat.problemsSolved && (
                                            <p className="text-gray-700">
                                                Solved: <span className="font-bold">{stat.problemsSolved}+</span>
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Progress Bars */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-700">Problems Solved Distribution</h3>
                                    <span className="text-lg font-bold text-blue-600">Total: {totalProblems}</span>
                                </div>
                                {data.cpStats.map(stat => {
                                    const percentage = totalProblems > 0 ? ((stat.problemsSolved || 0) / totalProblems) * 100 : 0;
                                    return (
                                        <div key={stat.id} className="space-y-2">
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>{stat.platform}</span>
                                                <span className="font-bold">{stat.problemsSolved || 0} ({percentage.toFixed(1)}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                                    style={{
                                                        width: `${percentage}%`,
                                                        backgroundColor: getPlatformBarColor(stat.platform)
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Profile Links */}
                            <div className="mt-6 text-center">
                                <p className="text-gray-500 text-sm">
                                    Profiles:{' '}
                                    {data.cpStats.map((stat, i) => (
                                        <span key={stat.id}>
                                            {stat.profileUrl ? (
                                                <a href={stat.profileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    {stat.platform}
                                                </a>
                                            ) : stat.platform}
                                            {i < data.cpStats.length - 1 && ' | '}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Achievements Section */}
            {data.settings.showAchievements && data.achievements.length > 0 && (
                <section id="achievements" className="py-20 px-6">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl font-bold mb-12 flex items-center gap-3">
                            Recent Achievements
                            <div className="h-1 flex-grow bg-gradient-to-r from-blue-500 to-transparent rounded"></div>
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {data.achievements.map(achievement => (
                                <div
                                    key={achievement.id}
                                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                >
                                    <Trophy className="text-blue-600 mb-4" size={32} />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{achievement.title}</h3>
                                    <p className="text-gray-600 text-sm mb-3">{achievement.subtitle}</p>
                                    {achievement.rank && (
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                            <span className="text-gray-600 text-sm">Rank</span>
                                            <span className="text-2xl font-bold text-blue-600">{achievement.rank}</span>
                                        </div>
                                    )}
                                    {achievement.organizer && (
                                        <p className="text-gray-500 text-xs text-right mt-1">{achievement.organizer}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Projects Section */}
            {data.settings.showProjects && data.projects.length > 0 && (
                <section id="projects" className="py-20 px-6 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl font-bold mb-12 flex items-center gap-3">
                            Projects
                            <div className="h-1 flex-grow bg-gradient-to-r from-blue-500 to-transparent rounded"></div>
                        </h2>
                        <div className="space-y-6">
                            {data.projects.map((project, index) => (
                                <div
                                    key={project.id}
                                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <span className="text-gray-400 text-sm font-mono">{String(index + 1).padStart(2, '0')}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-2xl font-bold text-gray-900">{project.title}</h3>
                                                    {project.isFeatured && (
                                                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Featured</span>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 mb-4">{project.description}</p>
                                                {project.technologies && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {project.technologies.split(',').map((tag, i) => (
                                                            <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm border border-gray-200">
                                                                {tag.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0 ml-4">
                                            {project.liveUrl && (
                                                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                    <ExternalLink size={20} />
                                                </a>
                                            )}
                                            {project.repoUrl && (
                                                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                    <Github size={20} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-gray-200 bg-white">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-gray-600">© {new Date().getFullYear()} {data.name}. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
