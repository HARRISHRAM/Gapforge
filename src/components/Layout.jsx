import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="lg:flex min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1 px-4 lg:px-8 py-8 max-w-5xl w-full mx-auto">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
