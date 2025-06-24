
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { navItems } from "./nav-items";
import { AuthProvider } from "@/hooks/useAuth";
import { ChatWidget } from "@/components/chatbot/ChatWidget";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import ManageProducts from "./pages/ManageProducts";
import ProductEdit from "./pages/ProductEdit";
import ProductDetail from "./components/products/ProductDetail";
import Browse from "./pages/Browse";
import Chat from "./pages/Chat";
import ChatList from "./pages/ChatList";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/create" element={<AddProduct />} />
            <Route path="/products/manage" element={<ManageProducts />} />
            <Route path="/products/:id/edit" element={<ProductEdit />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/chat" element={<ChatList />} />
            <Route path="/chat/:chatId" element={<Chat />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        {/* <ChatWidget /> */}
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
