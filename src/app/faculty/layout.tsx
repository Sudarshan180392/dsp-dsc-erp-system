import { cookies } from 'next/headers';
import FacultyHeader from '@/components/faculty/FacultyHeader';
import Footer from '@/components/Footer';

export default async function FacultyLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const facultySession = cookieStore.get('faculty_session')?.value;
  
  let facultyName = "Faculty Member";
  let subject = "General";

  if (facultySession) {
    try {
      const parsed = JSON.parse(facultySession);
      facultyName = parsed.facultyName || parsed.name || facultyName;
      subject = parsed.subject || subject;
    } catch (e) {}
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <FacultyHeader facultyName={facultyName} subject={subject} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
