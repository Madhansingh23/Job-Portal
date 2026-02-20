import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-20">
      <div className="container mx-auto px-4 lg:px-20 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand Section */}
        <div className="col-span-1 md:col-span-2">
          <img className="h-8 mb-4 brightness-0 invert" src={assets.logo} alt="Logo" />
          <p className="text-sm leading-relaxed max-w-sm mb-6 text-slate-400">
            Bridging the gap between talent and opportunity. The most trusted campus recruitment platform for students and recruiters.
          </p>
          <div className="flex gap-4">
            <img className="h-8 hover:scale-110 transition cursor-pointer" src={assets.facebook_icon} alt="Facebook" />
            <img className="h-8 hover:scale-110 transition cursor-pointer" src={assets.twitter_icon} alt="Twitter" />
            <img className="h-8 hover:scale-110 transition cursor-pointer" src={assets.instagram_icon} alt="Instagram" />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Platform</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition">Find Jobs</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Recruiters</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">About Us</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Contact</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-white font-semibold mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Terms of Service</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Cookie Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 mt-10 pt-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} CampusRecruit. All rights reserved. Designed with ❤️ by Madhan Singh.
      </div>
    </footer>
  );
};

export default Footer;
