import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppProvider } from "./context/AppContext";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import StudyTimer from "./pages/StudyTimer";
import Progress from "./pages/Progress";
import Holidays from "./pages/Holidays";
import ImportPlans from "./pages/ImportPlans";
import ImportData from "./pages/ImportData";
import ExportData from "./pages/ExportData";
import AppLayout from "./components/AppLayout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/study-timer" component={StudyTimer} />
      <Route path="/progress" component={Progress} />
      <Route path="/holidays" component={Holidays} />
      <Route path="/import-plans" component={ImportPlans} />
      <Route path="/import-data" component={ImportData} />
      <Route path="/export-data" component={ExportData} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <AppLayout>
            <Router />
          </AppLayout>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
