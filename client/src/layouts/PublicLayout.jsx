import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatbotDrawer from '../components/ChatbotDrawer';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090E17] text-slate-100 transition-colors">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatbotDrawer />
    </div>
  );
}
