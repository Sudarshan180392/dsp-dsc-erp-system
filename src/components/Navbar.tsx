import React from 'react';
import Link from 'next/link';
import { Menu, LogOut, User } from 'lucide-react';
import { AppSession } from '@/lib/types';

interface NavbarProps {
  session: AppSession | null;
}

export function Navbar({ session }: NavbarProps) {
  return (
    <nav className="bg-[#5B4B8A] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold tracking-wider">
                DSP & DSC
              </Link>
            </div>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {session?.role === 'SUPERADMIN' && (
                <>
                  <Link href="/admin" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-white text-sm font-medium">Dashboard</Link>
                  <Link href="/admin/users" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-white text-sm font-medium">Users</Link>
                  <Link href="/admin/courses" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-white text-sm font-medium">Courses</Link>
                  <Link href="/admin/sales" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-white text-sm font-medium">Sales</Link>
                  <Link href="/admin/academics" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-white text-sm font-medium">Academics</Link>
                </>
              )}

              {(session?.role === 'BRANCH_HEAD' || session?.role === 'SALES_REP') && (
                <>
                  <Link href={`/sales/${'branch' in session ? session.branch : ''}`} className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-white text-sm font-medium">Dashboard</Link>
                  <Link href={`/sales/${'branch' in session ? session.branch : ''}/leads`} className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-white text-sm font-medium">Leads</Link>
                  <Link href={`/sales/${'branch' in session ? session.branch : ''}/follow-ups`} className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-white text-sm font-medium">Follow-ups</Link>
                </>
              )}

              {session?.role === 'FACULTY' && (
                <>
                  <Link href="/faculty" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-white text-sm font-medium">Dashboard</Link>
                  <Link href="/faculty/update-progress" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-white text-sm font-medium">Update Progress</Link>
                  <Link href="/faculty/syllabus" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-white text-sm font-medium">Syllabus</Link>
                </>
              )}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {session && (
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium">
                    {'fullName' in session ? session.fullName : ('facultyName' in session ? session.facultyName : 'User')}
                  </span>
                  <div className="flex space-x-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#E8E5F5] text-[#5B4B8A]">
                      {session.role}
                    </span>
                    {'branch' in session && session.branch && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                        {session.branch}
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-[#E8E5F5] p-1.5 rounded-full text-[#5B4B8A]">
                  <User className="h-5 w-5" />
                </div>
                <form action="/auth/logout" method="POST">
                  <button type="submit" className="text-[#E8E5F5] hover:text-white p-2">
                    <LogOut className="h-5 w-5" />
                  </button>
                </form>
              </div>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-[#4A3C75] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="block h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
