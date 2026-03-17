import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-20">
      <div className="container mx-auto px-4 lg:px-20 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand Section */}
        <div className="col-span-1 md:col-span-2">

          <p className="text-sm leading-relaxed max-w-sm mb-6 text-slate-400">
            Empowering students to achieve their career aspirations. The official campus recruitment portal connecting bright minds with industry leaders.
          </p>
          <div className="flex gap-4">
            <img className="h-8 hover:scale-110 transition cursor-pointer" src={assets.facebook_icon} alt="Facebook" />
            <img className="h-8 hover:scale-110 transition cursor-pointer" src={assets.twitter_icon} alt="Twitter" />
            <img className="h-8 hover:scale-110 transition cursor-pointer" src={assets.instagram_icon} alt="Instagram" />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">University</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition">Placement Policy</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Student Guidelines</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Past Recruiters</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Contact Training & Placement</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-white font-semibold mb-4">Resources & Support</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition">Resume Building Guide</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Interview Preparation</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Alumni Network</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 mt-10 pt-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} University Placement Cell. All rights reserved. Designed with ❤️ by Madhan Singh.
      </div>
    </footer>
  );
};

export default Footer;
