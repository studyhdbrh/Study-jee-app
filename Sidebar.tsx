import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAppContext } from "@/context/AppContext";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  CalendarClock, 
  Timer, 
  LineChart, 
  UmbrellaIcon, 
  FileInput, 
  CloudUpload, 
  CloudDownload,
  User,
  Menu
} from "lucide-react";

export default function Sidebar() {
  const { 
    studyData, 
    isDarkMode, 
    toggleDarkMode, 
    setProfileModalOpen 
  } = useAppContext();
  
  const [location] = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location]);

  // Listen for mobile menu button click
  useEffect(() => {
    const handleMobileMenuClick = () => {
      setIsMobileSidebarOpen(prev => !prev);
    };

    const mobileMenuButton = document.getElementById('mobile-menu-button');
    if (mobileMenuButton) {
      mobileMenuButton.addEventListener('click', handleMobileMenuClick);
    }

    return () => {
      if (mobileMenuButton) {
        mobileMenuButton.removeEventListener('click', handleMobileMenuClick);
      }
    };
  }, []);

  const navItems = [
    { href: "/", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { href: "/schedule", label: "Daily Schedule", icon: <CalendarClock className="w-5 h-5" /> },
    { href: "/study-timer", label: "Study Timer", icon: <Timer className="w-5 h-5" /> },
    { href: "/progress", label: "Progress", icon: <LineChart className="w-5 h-5" /> },
    { href: "/holidays", label: "Holidays", icon: <UmbrellaIcon className="w-5 h-5" /> },
  ];

  const dataItems = [
    { href: "/import-plans", label: "Import Plans", icon: <FileInput className="w-5 h-5" /> },
    { href: "/import-data", label: "Import Data", icon: <CloudDownload className="w-5 h-5" /> },
    { href: "/export-data", label: "Export Data", icon: <CloudUpload className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Sidebar for desktop */}
      <aside 
        id="sidebar" 
        className={`${isMobileSidebarOpen 
          ? 'fixed inset-0 z-50 block w-[80%]' 
          : 'hidden md:flex'} flex-col w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300`}
      >
        <div className="flex flex-col h-full">
          {/* Profile Section */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div 
                className="relative group cursor-pointer"
                onClick={() => setProfileModalOpen(true)}
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                  {studyData.user.profileImage ? (
                    <img 
                      src={studyData.user.profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="text-gray-400 dark:text-gray-500 w-6 h-6" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold truncate">
                  {studyData.user.name}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {studyData.user.email}
                </p>
              </div>
              <button 
                className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                onClick={() => setProfileModalOpen(true)}
              >
                <User className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <a
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium ${
                        location === item.href
                          ? "bg-primary/10 text-primary dark:text-primary"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="mt-8 px-3">
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Data Management
              </h3>
              <ul className="mt-2 space-y-1">
                {dataItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <a
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium ${
                          location === item.href
                            ? "bg-primary/10 text-primary dark:text-primary"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
          
          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dark Mode</span>
              <Switch
                checked={isDarkMode}
                onCheckedChange={toggleDarkMode}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
    </>
  );
}
