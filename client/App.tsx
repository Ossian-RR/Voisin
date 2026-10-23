import "./global.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { AuthGate } from "@/components/auth/AuthGate";
import AppLayout from "@/components/layout/AppLayout";
import { AuthProvider } from "@/lib/auth";
import AddItem from "./pages/AddItem";
import Help from "./pages/Help";
import Index from "./pages/Index";
import ItemDetail from "./pages/ItemDetail";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Requests from "./pages/Requests";
import Wanted from "./pages/Wanted";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster position="top-center" richColors />
    <AuthProvider>
      <AuthGate>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/items/:id" element={<ItemDetail />} />
              <Route path="/search" element={<Wanted />} />
              <Route path="/add" element={<AddItem />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/help" element={<Help />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthGate>
    </AuthProvider>
    <Analytics />
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
