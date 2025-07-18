import {useState} from "react";
import {Bookmark, Brain, ChevronDown, FileText, History, LogOut, Menu, Settings, User, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useAuth} from "../hooks/use-auth";
import {useLocation} from "wouter";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleAuthClick = (mode: 'login' | 'register' = 'login') => {
    if (isAuthenticated) {
      logout();
    } else {
      setLocation(`/auth${mode === 'register' ? '?mode=register' : ''}`);
    }
  };

  const handleHomeClick = () => {
    setLocation("/");
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <header className="bg-surface border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={handleHomeClick}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">ArticleAI</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">How it works</a>

            {isAuthenticated ? (
              <>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors">My Summaries</a>

                {/* User Menu (Desktop) */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 py-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">{user?.username}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>

                  <div
                    className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200 transition-all duration-200 ease-in-out ${
                      userMenuOpen 
                        ? "opacity-100 translate-y-0" 
                        : "opacity-0 translate-y-[-10px] pointer-events-none"
                    }`}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings className="w-4 h-4 mr-2" />
                      Account Settings
                    </a>
                    <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <History className="w-4 h-4 mr-2" />
                      History
                    </a>
                    <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Bookmark className="w-4 h-4 mr-2" />
                      Saved Summaries
                    </a>
                    <button
                      onClick={() => handleAuthClick()}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={() => handleAuthClick('login')}>
                  Log In
                </Button>
                <Button onClick={() => handleAuthClick('register')}>
                  Sign Up
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white border-t border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen 
            ? "max-h-96 opacity-100" 
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 space-y-3 py-2">
          <a href="#" className="block py-2 text-gray-600">How it works</a>

          {isAuthenticated ? (
            <>
              <a href="#" className="block py-2 text-gray-600">My Summaries</a>
              <a href="#" className="block py-2 text-gray-600">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>New Summary</span>
                </div>
              </a>
              <a href="#" className="block py-2 text-gray-600">
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  <span>History</span>
                </div>
              </a>
              <a href="#" className="block py-2 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Bookmark className="w-4 h-4" />
                  <span>Saved Summaries</span>
                </div>
              </a>
              <a href="#" className="block py-2 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Account Settings</span>
                </div>
              </a>
              <div className="pt-2 border-t border-gray-200 mt-2">
                <div className="flex items-center space-x-2 py-1 text-gray-700">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{user?.username}</span>
                </div>
                <button
                  onClick={() => handleAuthClick()}
                  className="flex items-center space-x-2 py-2 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col space-y-2 pt-2">
              <Button onClick={() => handleAuthClick('login')}>Log In</Button>
              <Button variant="outline" onClick={() => handleAuthClick('register')}>Sign Up</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
