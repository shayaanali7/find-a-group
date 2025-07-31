import Image from "next/image"
import Link from "next/link";
import { createClient } from "./utils/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user }, error} = await supabase.auth.getUser();
  if (error) console.log(error);
  if (user) {
    redirect('/mainPage'); 
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse [animation-delay:2s]"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse [animation-delay:4s]"></div>
        </div>

        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-300 rounded-full opacity-60 animate-bounce [animation-delay:1s]"></div>
          <div className="absolute top-3/4 left-3/4 w-1 h-1 bg-indigo-300 rounded-full opacity-40 animate-bounce [animation-delay:3s]"></div>
          <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-purple-200 rounded-full opacity-50 animate-bounce [animation-delay:5s]"></div>
          <div className="absolute top-1/6 right-1/4 w-1 h-1 bg-indigo-200 rounded-full opacity-30 animate-bounce [animation-delay:2s]"></div>
        </div>

        <div className="relative z-10 pt-16">
          <div className="text-center">
            <div className="transform transition-all duration-700 hover:scale-110 drop-shadow-lg">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="inline-block text-white ">
                  Welcome To 
                </span>
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 drop-shadow-lg [animation-delay:0.3s] ml-3">
                  Find A Group!
                </span>
              </h1>
            </div>
            
          </div>
        </div>

        <div className="relative z-10 flex gap-12 items-center justify-center w-full max-w-7xl mx-auto flex-grow px-6"> 
          <div className="hidden md:block flex-shrink-0 transform transition-all duration-1000 hover:scale-105">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-4xl blur-lg opacity-30 animate-pulse"></div>
              <Image 
                src="/assets/logo-2.jpg" 
                width={400} 
                height={450} 
                alt="logo" 
                className="relative z-10 object-contain rounded-4xl shadow-2xl border-2 border-purple-300/30 backdrop-blur-sm transform transition-transform duration-700 hover:rotate-2"
              />
            </div>
          </div>
          <div className="flex-1 text-center">
            <div className="transform transition-all duration-1000 [animation-delay:0.6s] mb-8">
              <p className="text-xl md:text-2xl text-purple-100 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
                Your place to discover and join teams for group project courses — 
                <span className="text-purple-200 font-semibold"> faster than ever.</span>
              </p>
            </div>

            <div className="flex items-center justify-center gap-12 transform transition-all duration-1000 [animation-delay:0.9s]">
              <div className="space-y-5 w-full max-w-4xl">
                <div className="flex items-center gap-6 w-full">
                  <div className="flex-1 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                    <Link href="/signupPage" className="block">
                      <button className="w-full bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:from-purple-50 hover:to-indigo-50 border border-purple-200/50 backdrop-blur-sm group">
                        <span className="group-hover:scale-110 inline-block transition-transform duration-200">
                          🚀 Sign Up
                        </span>
                      </button>
                    </Link>
                  </div>
                  <div className="hidden md:block flex-1 transform transition-all duration-300 hover:scale-105 hover:bg-purple-500/20">
                    <div className="flex items-center space-x-3 text-purple-200 bg-purple-500/10 px-6 py-4 rounded-2xl backdrop-blur-sm border border-purple-300/20 h-16">
                      <span className="text-2xl">⚡</span>
                      <span className="text-base font-medium">Find People Fast</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full transform [animation-delay:0.2s]">
                  <div className="flex-1 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                    <Link href="/loginPage" className="block">
                      <button className="w-full bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:from-slate-50 hover:to-gray-50 border border-slate-200/50 backdrop-blur-sm group">
                        <span className="group-hover:scale-110 inline-block transition-transform duration-200">
                          👋 Login
                        </span>
                      </button>
                    </Link>
                  </div>
                  <div className="hidden md:block flex-1 transform transition-all duration-300 hover:scale-105 hover:bg-purple-500/20">
                    <div className="flex items-center space-x-3 text-purple-200 bg-purple-500/10 px-6 py-4 rounded-2xl backdrop-blur-sm border border-purple-300/20 h-16">
                      <span className="text-2xl">🎯</span>
                      <span className="text-base font-medium">Smart Filtering</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full transform [animation-delay:0.4s]">
                  <div className="flex-1 transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                    <Link href="/mainPage" className="block">
                      <button className="w-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-100 font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl border-2 border-purple-300/30 backdrop-blur-sm hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-indigo-500/30 group">
                        <span className="group-hover:scale-110 inline-block transition-transform duration-200">
                          🔍 Guest Login
                        </span>
                      </button>
                    </Link>
                  </div>
                  <div className="hidden md:block flex-1 transform transition-all duration-300 hover:scale-105 hover:bg-purple-500/20">
                    <div className="flex items-center space-x-3 text-purple-200 bg-purple-500/10 px-6 py-4 rounded-2xl backdrop-blur-sm border border-purple-300/20 h-16">
                      <span className="text-2xl">🤝</span>
                      <span className="text-base font-medium">Easy Communication</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>


    </>
  );
}