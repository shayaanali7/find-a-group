import Image from "next/image"
import Link from "next/link";
import { createClient } from "./utils/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user }, error} = await supabase.auth.getUser();
  if (user) {
    redirect('/mainPage'); 
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 flex items-center justify-center">
        <div className="flex gap-8 items-center justify-center w-full max-w-6xl h-full"> 
          <div className="hidden md:block flex-shrink-0">
            <Image 
              src="/assets/logo-2.jpg" 
              width={400} 
              height={450} 
              alt="logo" 
              className="mt-2 object-contain rounded-4xl"
            />
          </div>

          <div className="flex-1 mb-10 md:mb-0 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center md:text-left">
              Welcome To <br />
              <span className="text-purple-300">Western Group Finder!</span>
            </h1>
            <p className="text-lg text-purple-200 mb-5">
              Your place to discover and join study groups, teams, and clubs — faster than ever.
            </p>

            <div className="space-y-4 mx-auto md:mx-0 mb-4 w-64">
              <div>
                <Link href="/signupPage">
                  <button className="w-full bg-slate-200 text-black  font-semibold py-2 px-15 rounded-4xl transition transform hover:scale-105">Sign Up</button>
                </Link>
              </div>

              <div>
                <Link href="/loginPage">
                  <button className="w-full bg-slate-200 text-black  font-semibold py-2 px-15 rounded-4xl transition transform hover:scale-105">Login</button>
                </Link>
              </div>

              <div>
                <Link href="/mainPage">
                  <button className="w-full bg-slate-200 text-black font-semibold py-2 px-15 rounded-4xl transition transform hover:scale-105">Guest Login</button>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
