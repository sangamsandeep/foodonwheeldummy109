import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">QR Ordering System</h1>
        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <Link
            href="/store/downtown-cafe"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded text-center"
          >
            View Demo Store
          </Link>
          <Link
            href="/staff"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded text-center"
          >
            Staff Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
