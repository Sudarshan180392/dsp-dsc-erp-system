import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, CheckSquare, LayoutDashboard, LogOut, GraduationCap } from 'lucide-react';

export default async function FacultyLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const facultySession = cookieStore.get('faculty_session')?.value;
  
  if (!facultySession) {
    // redirect('/login');
  }
  
  const facultyName = facultySession ? JSON.parse(facultySession).name : "Demo Faculty";
  const subject = facultySession ? JSON.parse(facultySession).subject : "Mathematics";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-[#5B4B8A] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <GraduationCap size={24}/> Faculty Portal
            </h1>
            <nav className="hidden md:flex gap-1 ml-8">
              <Link href="/faculty" className="hover:bg-white/10 px-3 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link href="/faculty/update" className="hover:bg-white/10 px-3 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors">
                <CheckSquare size={18} /> Update Progress
              </Link>
              <Link href="/faculty/syllabus" className="hover:bg-white/10 px-3 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors">
                <BookOpen size={18} /> Syllabus
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium">👨‍🏫 {facultyName}</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded mt-0.5 text-white/90">{subject}</span>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
