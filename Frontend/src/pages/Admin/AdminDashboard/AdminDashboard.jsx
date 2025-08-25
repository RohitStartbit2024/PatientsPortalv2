import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate("/upload-reports");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-6 shadow-md">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center">
          Welcome to Admin Dashboard
        </h1>
        <p className="text-center text-purple-100 mt-2">
          Manage reports and insights with ease
        </p>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            Quick Actions
          </h2>

          <button
            onClick={handleUploadClick}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-lg font-medium rounded-xl shadow-lg transform hover:scale-105 hover:shadow-2xl transition duration-300"
          >
            📤 Upload a Report
          </button>
        </div>
      </main>
    </div>
  );
}
