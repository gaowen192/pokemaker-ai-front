
import React, { useState } from 'react';
import { XIcon, Logo, GoogleIcon, GitHubIcon, DiscordIcon } from './Icons';
import { supabase } from '../lib/supabase';
import { Provider } from '@supabase/supabase-js';
import { useLanguage } from '../contexts/LanguageContext';
import { authApi } from '../services/api';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    // onLogin is updated to accept manual callback for test login
    onLogin: (email: string, name: string, coins: number) => void; 
}

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (email: string, name: string, coins: number) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { t } = useLanguage();
    
    // Add login method toggle state
    const [loginMethod, setLoginMethod] = useState<'social' | 'password'>('social');
    
    // Add modal type state to toggle between login and registration
    const [showRegistration, setShowRegistration] = useState(false);
    
    // Add password login state
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // If showRegistration is true, render the RegistrationModal instead
    if (showRegistration) {
        return <RegistrationModal isOpen={isOpen} onClose={onClose} onLogin={onLogin} />
    }

    if (!isOpen) return null;

    const handleSocialLogin = async (provider: Provider) => {
        setIsLoading(provider);
        setErrorMessage(null);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    // Redirect back to the current page after login
                    redirectTo: window.location.origin, 
                },
            });

            if (error) {
                throw error;
            }
            
            // Note: The app will reload/redirect here, so we don't need to manually close
        } catch (error: any) {
            console.error('Login error:', error);
            setErrorMessage(error.message || 'Failed to connect. Please check configuration.');
            setIsLoading(null);
        }
    };

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!usernameOrEmail || !password) {
            setErrorMessage('Please enter both username/email and password');
            return;
        }
        
        // Clear all localStorage content before login
        localStorage.clear();
        
        setIsLoading('password');
        setErrorMessage(null);
        
        try {
            // Use the API service for login
            const userData = await authApi.login({
                username: usernameOrEmail, // Backend uses username field for both username and email
                password: password,
            });
            
            // Store token and user info
            localStorage.setItem('token', userData.accessToken);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Store specific fields as requested
            localStorage.setItem('userId', userData.userId.toString());
            localStorage.setItem('username', userData.username);
            localStorage.setItem('tokenExpireTime', userData.tokenExpireTime);
            localStorage.setItem('email', userData.email || '');
            
            // Call onLogin callback with user info and coins
            onLogin(userData.email || userData.username, userData.username, userData.coins || 0);
            onClose();
            
            console.log('================ Login successful:', userData);
        } catch (error: any) {
            console.error('================ Login error:', error);
            setErrorMessage(error.message || 'Invalid username or password');
            setIsLoading(null);
        }
    };



    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#161b22] border border-gray-800 rounded-3xl w-full max-w-[360px] p-8 shadow-2xl relative overflow-hidden">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors z-20 hover:bg-white/10 rounded-full p-1"
                >
                    <XIcon className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3.5 rounded-2xl shadow-lg shadow-blue-900/20 mb-5 border border-white/10">
                        <Logo className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white text-center tracking-tight">{t('auth.welcome')}</h2>
                    <p className="text-gray-400 text-xs mt-2 text-center font-medium">
                        {t('auth.subtitle')}
                    </p>
                </div>

                {/* Login Method Toggle */}
                <div className="flex border border-gray-800 rounded-xl overflow-hidden mb-6">
                    <button
                        onClick={() => setLoginMethod('social')}
                        className={`flex-1 py-2 text-sm font-medium transition-all ${loginMethod === 'social' ? 'bg-blue-600 text-white' : 'bg-[#161b22] text-gray-400 hover:bg-gray-800'}`}
                    >
                        Social Login
                    </button>
                    <button
                        onClick={() => setLoginMethod('password')}
                        className={`flex-1 py-2 text-sm font-medium transition-all ${loginMethod === 'password' ? 'bg-blue-600 text-white' : 'bg-[#161b22] text-gray-400 hover:bg-gray-800'}`}
                    >
                        Email/Password
                    </button>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200 text-xs text-center">
                        {errorMessage}
                    </div>
                )}

                {/* Social Login Stack */}
                {loginMethod === 'social' && (
                    <div className="space-y-3">
                        <SocialButton 
                            provider="Google" 
                            icon={GoogleIcon} 
                            bgColor="bg-white" 
                            textColor="text-gray-900" 
                            hoverColor="hover:bg-gray-200"
                            onClick={() => handleSocialLogin('google')}
                            loading={isLoading === 'google'}
                            labelPrefix={t('auth.continue')}
                        />
                        <SocialButton 
                            provider="GitHub" 
                            icon={GitHubIcon} 
                            bgColor="bg-[#24292e]" 
                            textColor="text-white" 
                            hoverColor="hover:bg-[#2f363d]"
                            onClick={() => handleSocialLogin('github')}
                            loading={isLoading === 'github'}
                            labelPrefix={t('auth.continue')}
                        />
                         <SocialButton 
                            provider="Discord" 
                            icon={DiscordIcon} 
                            bgColor="bg-[#5865F2]" 
                            textColor="text-white" 
                            hoverColor="hover:bg-[#4752c4]"
                            onClick={() => handleSocialLogin('discord')}
                            loading={isLoading === 'discord'}
                            labelPrefix={t('auth.continue')}
                        />
                    </div>
                )}
                
                {/* Password Login Form */}
                {loginMethod === 'password' && (
                    <form onSubmit={handlePasswordLogin} className="space-y-4">
                        <div>
                            <label htmlFor="usernameOrEmail" className="block text-xs text-gray-400 mb-1 font-medium">
                                Username/Email
                            </label>
                            <input
                                type="text"
                                id="usernameOrEmail"
                                value={usernameOrEmail}
                                onChange={(e) => setUsernameOrEmail(e.target.value)}
                                placeholder="Your username or email"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-xs text-gray-400 mb-1 font-medium">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Your password"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={isLoading === 'password'}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 relative overflow-hidden group active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                        >
                            {isLoading === 'password' ? (
                                <div className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Logging in...</span>
                                </div>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>
                )}

                {/* Registration Link */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => setShowRegistration(true)}
                        className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors"
                    >
                        Create Account
                    </button>
                </div>

                <div className="mt-8 border-t border-gray-800 pt-4 text-center">
                     <p className="text-[10px] text-gray-600 mt-2 px-2 leading-relaxed whitespace-pre-line">
                        {t('auth.terms')}
                    </p>
                </div>
            </div>
        </div>
    );
};

interface SocialButtonProps {
    provider: string;
    icon: React.FC<{ className?: string }>;
    bgColor: string;
    textColor: string;
    hoverColor: string;
    onClick: () => void;
    loading: boolean;
    labelPrefix: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({ provider, icon: Icon, bgColor, textColor, hoverColor, onClick, loading, labelPrefix }) => (
    <button 
        onClick={onClick}
        disabled={loading}
        className={`w-full ${bgColor} ${hoverColor} ${textColor} font-bold text-sm py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 relative overflow-hidden group active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-md`}
    >
        {loading ? (
            <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Connecting...</span>
            </div>
        ) : (
            <>
                <div className="absolute left-4">
                    <Icon className="w-5 h-5" />
                </div>
                <span>{labelPrefix} {provider}</span>
            </>
        )}
    </button>
);

// RegistrationModal Component
export const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose, onLogin }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { t } = useLanguage();
    
    // Add registration form state
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    if (!isOpen) return null;

    const handleRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate inputs
        if (!username || !email || !password || !confirmPassword) {
            setErrorMessage('Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            setErrorMessage('Password must be at least 6 characters');
            return;
        }
        
        setIsLoading(true);
        setErrorMessage(null);
        
        try {
            // Use the API service for registration
            const userData = await authApi.register({
                username,
                email,
                passwordHash: password,
            });
            
            // Store token and user info
            localStorage.setItem('token', userData.accessToken);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Store specific fields
            localStorage.setItem('userId', userData.userId.toString());
            localStorage.setItem('username', userData.username);
            localStorage.setItem('tokenExpireTime', userData.tokenExpireTime);
            localStorage.setItem('email', userData.email || '');
            
            // Call onLogin callback with user info and coins
            onLogin(userData.email || userData.username, userData.username, userData.coins || 0);
            onClose();
            
            console.log('================ Registration successful:', userData);
        } catch (error: any) {
            console.error('================ Registration error:', error);
            setErrorMessage(error.message || 'Registration failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#161b22] border border-gray-800 rounded-3xl w-full max-w-[360px] p-8 shadow-2xl relative overflow-hidden">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors z-20 hover:bg-white/10 rounded-full p-1"
                >
                    <XIcon className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3.5 rounded-2xl shadow-lg shadow-blue-900/20 mb-5 border border-white/10">
                        <Logo className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white text-center tracking-tight">Create Account</h2>
                    <p className="text-gray-400 text-xs mt-2 text-center font-medium">
                        {t('auth.subtitle')}
                    </p>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200 text-xs text-center">
                        {errorMessage}
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleRegistration} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-xs text-gray-400 mb-1 font-medium">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your username"
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="email" className="block text-xs text-gray-400 mb-1 font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email"
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="block text-xs text-gray-400 mb-1 font-medium">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Your password"
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="confirmPassword" className="block text-xs text-gray-400 mb-1 font-medium">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 relative overflow-hidden group active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Creating account...</span>
                            </div>
                        ) : (
                            <span>Sign Up</span>
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            // Navigate back to login
                            const loginModal = document.querySelector('.login-modal');
                            if (loginModal) {
                                loginModal.innerHTML = '';
                            }
                            onClose();
                        }}
                        className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors"
                    >
                        Already have an account? Sign In
                    </button>
                </div>

                <div className="mt-8 border-t border-gray-800 pt-4 text-center">
                     <p className="text-[10px] text-gray-600 mt-2 px-2 leading-relaxed whitespace-pre-line">
                        {t('auth.terms')}
                    </p>
                </div>
            </div>
        </div>
    );
};
