import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import AppNavbar from "@/components/AppNavbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import PageTransition from "@/components/PageTransition";
import Index from "@/pages/Index";
import Explore from "@/pages/Explore";
import Generate from "@/pages/Generate";
import GradientGenerator from "@/pages/GradientGenerator";
import ImagePicker from "@/pages/ImagePicker";
import ColorDetail from "@/pages/ColorDetail";
import ContrastChecker from "@/pages/ContrastChecker";
import Harmony from "@/pages/Harmony";
import Saved from "@/pages/Saved";
import SharedPalette from "@/pages/SharedPalette";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/explore" element={<PageTransition><Explore /></PageTransition>} />
        <Route path="/generate" element={<PageTransition><Generate /></PageTransition>} />
        <Route path="/gradient" element={<PageTransition><GradientGenerator /></PageTransition>} />
        <Route path="/image-picker" element={<PageTransition><ImagePicker /></PageTransition>} />
        <Route path="/color/:hex" element={<PageTransition><ColorDetail /></PageTransition>} />
        <Route path="/contrast" element={<PageTransition><ContrastChecker /></PageTransition>} />
        <Route path="/harmony" element={<PageTransition><Harmony /></PageTransition>} />
        <Route path="/saved" element={<PageTransition><Saved /></PageTransition>} />
        <Route path="/palette" element={<PageTransition><SharedPalette /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <AppNavbar />
        <div className="pb-16 lg:pb-0">
          <AnimatedRoutes />
        </div>
        <MobileBottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
