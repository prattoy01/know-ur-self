'use client';

import React, { useState, useEffect } from 'react';
import { Code, Trophy, Bookmark, Github, Linkedin, Mail, Menu, X } from 'lucide-react';

export default function Portfolio() {
    const [activeSection, setActiveSection] = useState('about');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { id: 'about', label: 'About Me', icon: Code },
        { id: 'education', label: 'Education', icon: Bookmark },
        { id: 'skills', label: 'Technical Skills', icon: Code },
        { id: 'problem-solving', label: 'Problem Solving', icon: Code },
        { id: 'achievements', label: 'Achievements', icon: Trophy },
        { id: 'projects', label: 'Projects', icon: Code }
    ];

    const skills = {
        languages: ['C', 'C++', 'Python', 'Swift', 'Objective-C'],
        web: ['HTML', 'CSS', 'JavaScript'],
        ios: ['Swift', 'Objective-C', 'UIKit', 'Cocoa Touch'],
        patterns: ['MVC', 'MVVM'],
        database: ['SQL']
    };

    const problemSolvingData = [
        { platform: 'Codeforces', solved: 1025, color: '#3b82f6' },
        { platform: 'CodeChef', solved: 250, color: '#8b5cf6' },
        { platform: 'AtCoder', solved: 150, color: '#ec4899' },
        { platform: 'Other', solved: 300, color: '#10b981' }
    ];

    const achievements = [
        {
            title: 'MU CSE Fest 2025 IUPC',
            subtitle: 'Inter University Programming Contest',
            team: 'SEC_Dungeon_Master',
            rank: '13th',
            total: '91 Teams'
        },
        {
            title: 'ICPC Dhaka Regional 2025',
            subtitle: 'Prestigious onsite regional contest',
            team: 'SEC_Dungeon_Master',
            rank: '33rd',
            total: '313 Teams'
        },
        {
            title: 'CUET IUPC',
            subtitle: 'Inter University Programming Contest',
            team: 'SEC_Dungeon_Master',
            rank: '83rd',
            total: '130+ Teams'
        }
    ];

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        setIsMenuOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '4s' }}></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
            </div>

            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-slate-900/90 backdrop-blur-lg shadow-lg' : ''}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Prattoy Mondal
                            </h1>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:block">
                            <div className="flex space-x-1">
                                {navItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => scrollToSection(item.id)}
                                        className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeSection === item.id
                                            ? 'bg-purple-600 text-white shadow-lg'
                                            : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-slate-800"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-slate-900/95 backdrop-blur-lg">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`block w-full text-left px-3 py-2 rounded-lg transition-all ${activeSection === item.id
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-300 hover:bg-slate-800'
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
            <section className="relative pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-block mb-6 animate-bounce">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                                <Code size={48} className="text-purple-400" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                        Prattoy Mondal
                    </h1>
                    <p className="text-2xl md:text-3xl text-gray-300 mb-6">Computer Science Student & iOS Developer</p>
                    <p className="text-xl text-gray-400 mb-8">Sylhet, Bangladesh</p>

                    <div className="flex justify-center flex-wrap gap-4">
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-purple-600 transition-all duration-300 hover:scale-105 border border-purple-500/20">
                            <Github size={20} />
                            <span className="font-medium">GitHub</span>
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-purple-600 transition-all duration-300 hover:scale-105 border border-purple-500/20">
                            <Linkedin size={20} />
                            <span className="font-medium">LinkedIn</span>
                        </a>
                        <a href="mailto:prattoy@example.com" className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-purple-600 transition-all duration-300 hover:scale-105 border border-purple-500/20">
                            <Mail size={20} />
                            <span className="font-medium">Email</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">About Me</h2>
                    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                        <p className="text-lg text-gray-300 leading-relaxed">
                            I am a Computer Science and Engineering student at Sylhet Engineering College with a strong passion for competitive programming and application development. I specialize in iOS development using Swift and Objective-C and have a solid foundation in algorithms and data structures.
                        </p>
                    </div>
                </div>
            </section>

            {/* Education Section */}
            <section id="education" className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Education</h2>
                    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                        <h3 className="text-2xl font-bold text-white mb-2">Sylhet Engineering College</h3>
                        <p className="text-xl text-purple-400 mb-2">Bachelor of Science in Computer Science and Engineering</p>
                        <div className="flex flex-wrap gap-4 text-gray-300">
                            <span className="bg-slate-700/50 px-4 py-2 rounded-lg">3rd Year, 2nd Semester</span>
                            <span className="bg-purple-600/30 px-4 py-2 rounded-lg font-semibold">GPA: 3.7/4.0</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technical Skills Section */}
            <section id="skills" className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Technical Skills</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105">
                            <h3 className="text-xl font-bold text-purple-400 mb-4">Languages</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.languages.map(skill => (
                                    <span key={skill} className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm">{skill}</span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105">
                            <h3 className="text-xl font-bold text-blue-400 mb-4">Web Development</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.web.map(skill => (
                                    <span key={skill} className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm">{skill}</span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 hover:scale-105">
                            <h3 className="text-xl font-bold text-pink-400 mb-4">iOS Development</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.ios.map(skill => (
                                    <span key={skill} className="bg-pink-600/20 text-pink-300 px-3 py-1 rounded-full text-sm">{skill}</span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105">
                            <h3 className="text-xl font-bold text-green-400 mb-4">Design Patterns</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.patterns.map(skill => (
                                    <span key={skill} className="bg-green-600/20 text-green-300 px-3 py-1 rounded-full text-sm">{skill}</span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:scale-105">
                            <h3 className="text-xl font-bold text-yellow-400 mb-4">Database</h3>
                            <div className="flex flex-wrap gap-2">
                                {skills.database.map(skill => (
                                    <span key={skill} className="bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded-full text-sm">{skill}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem Solving Section */}
            <section id="problem-solving" className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Problem Solving</h2>
                    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-purple-500/20">
                        <p className="text-lg text-gray-300 mb-6 text-center">
                            Active competitive programmer with strong problem-solving skills across various platforms.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-xl p-6 border border-blue-500/30">
                                <h3 className="text-2xl font-bold text-blue-400 mb-2">Codeforces</h3>
                                <p className="text-gray-300 mb-1">Max Rating: <span className="text-white font-bold">1488</span> (Specialist)</p>
                                <p className="text-gray-300">Solved: <span className="text-white font-bold">1025+</span></p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl p-6 border border-purple-500/30">
                                <h3 className="text-2xl font-bold text-purple-400 mb-2">CodeChef</h3>
                                <p className="text-gray-300 mb-1">Max Rating: <span className="text-white font-bold">1802</span> (4* Coder)</p>
                                <p className="text-gray-300">Solved: <span className="text-white font-bold">250+</span></p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-center text-gray-300 mb-4">Problems Solved Distribution</h3>
                            {problemSolvingData.map((item, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>{item.platform}</span>
                                        <span className="font-bold">{item.solved}</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{
                                                width: `${(item.solved / 1200) * 100}%`,
                                                backgroundColor: item.color
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-gray-400 text-sm">
                                Profiles: <a href="https://codeforces.com" className="text-purple-400 hover:text-purple-300">Codeforces</a> | <a href="https://codechef.com" className="text-purple-400 hover:text-purple-300">CodeChef</a> | <a href="https://atcoder.jp" className="text-purple-400 hover:text-purple-300">AtCoder</a> | <a href="https://stopstalk.com" className="text-purple-400 hover:text-purple-300">StopStalk</a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Achievements Section */}
            <section id="achievements" className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Recent Achievements</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {achievements.map((achievement, index) => (
                            <div
                                key={index}
                                className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                            >
                                <Trophy className="text-yellow-400 mb-4" size={32} />
                                <h3 className="text-xl font-bold text-white mb-2">{achievement.title}</h3>
                                <p className="text-gray-400 text-sm mb-3">{achievement.subtitle}</p>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-300">Team: <span className="text-purple-400">{achievement.team}</span></p>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                                        <span className="text-gray-400">Rank</span>
                                        <span className="text-2xl font-bold text-purple-400">{achievement.rank}</span>
                                    </div>
                                    <p className="text-gray-500 text-xs text-right">{achievement.total}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section id="projects" className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Projects</h2>
                    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-12 shadow-2xl border border-purple-500/20 text-center">
                        <Code size={64} className="text-purple-400 mx-auto mb-4" />
                        <p className="text-xl text-gray-300">Projects section coming soon...</p>
                        <p className="text-gray-400 mt-2">Check back later for updates!</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-slate-800">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-gray-400">© 2026 Prattoy Mondal. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
