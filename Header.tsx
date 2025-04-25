import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Search, Bell, User, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { studyData, setProfileModalOpen } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button 
            id="mobile-menu-button" 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="md:hidden flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
              {studyData.user.profileImage ? (
                <img 
                  src={studyData.user.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="text-gray-400 dark:text-gray-500 w-4 h-4" />
              )}
            </div>
            <span className="text-sm font-medium">{studyData.user.name}</span>
          </div>
          
          <h1 className="text-lg font-bold hidden md:block">Study Planner</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 w-48 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-red-500"></span>
          </Button>
        </div>
      </div>
    </header>
  );
}
