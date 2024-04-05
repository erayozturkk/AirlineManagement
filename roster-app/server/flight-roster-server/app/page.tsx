import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
      {/* Header */}
      <header className="bg-blue-500 dark:bg-gray-900 text-white py-4">
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1 className="text-xl font-bold">Airline Management System</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="#" className="hover:underline">Flights</a></li>
              <li><a href="#" className="hover:underline">Passengers</a></li>
              <li><a href="#" className="hover:underline">Bookings</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center">
          {/* <Image
            src="/airplane.svg"
            alt="Airplane Icon"
            width={150}
            height={150}
          /> */}
          <h2 className="text-2xl font-semibold mt-4 mb-2">Welcome to Airline Management System</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            by Emre BÜLBÜL
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 dark:bg-gray-700 py-4">
        <div className="container mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © 2024 Airline Management Systems. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
