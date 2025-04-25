import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ProfileModal from "./ProfileModal";
import ImportPlansModal from "./ImportPlansModal";
import { useAppContext } from "@/context/AppContext";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isProfileModalOpen, isImportPlansModalOpen } = useAppContext();
  const [location] = useLocation();

  // Update document title based on current location
  useEffect(() => {
    let title = "Study Planner";
    
    if (location !== "/") {
      const pageName = location.substring(1).split("-").map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(" ");
      
      title = `${pageName} | Study Planner`;
    }
    
    document.title = title;
  }, [location]);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Modals */}
      {isProfileModalOpen && <ProfileModal />}
      {isImportPlansModalOpen && <ImportPlansModal />}
    </div>
  );
}
