import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import AddItem from "./pages/AddItem";
import Help from "./pages/Help";
import Index from "./pages/Index";
import ItemDetail from "./pages/ItemDetail";
import Placeholder from "./pages/Placeholder";
import Profile from "./pages/Profile";
import Requests from "./pages/Requests";
import Wanted from "./pages/Wanted";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/items/:id" element={<ItemDetail />} />
            <Route path="/search" element={<Wanted />} />
            <Route path="/add" element={<AddItem />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/help" element={<Help />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
