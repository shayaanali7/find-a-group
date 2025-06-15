import Image from "next/image"

export default function HomePage() {
  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-800 to-purple-700 flex items-center justify-center">
        <div className="flex space-x-">
          <div>
            <Image src="/assets/logo.jpg" width={500} height={500} alt="logo" className="object-contain"/>
          </div>
          
          <div className="bg-white p-6 rounded-lg">
            <h2>Right Div</h2>
            <p>Content here</p>
          </div>
        </div>
      </main>
    </>
  );
}
