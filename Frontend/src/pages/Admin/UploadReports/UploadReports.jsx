import React, { useEffect, useState } from "react";
import { getPatients, uploadReport } from "../../../api/admin";
import { Upload, FileText, X } from "lucide-react";

export default function UploadReports() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch patients on mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const data = await getPatients(token);
        setPatients(data);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setMessage("Failed to fetch patients.");
      }
    };
    fetchPatients();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      setFile(null);
      alert("Please upload a valid PDF file.");
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !title || !file) {
      setMessage("Please fill required fields and upload a PDF.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("accessToken");
      const response = await uploadReport(
        token,
        selectedPatient,
        title,
        description,
        file
      );

      setMessage(`✅ Report uploaded successfully (ID: ${response.reportId})`);
      setSelectedPatient("");
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("❌ Error uploading report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Upload Patient Report
        </h2>

        {message && (
          <div className="mb-4 text-center text-sm font-medium">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Dropdown */}
          <div>
            <label className="block mb-1 font-medium">Select Patient *</label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">-- Select Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} ({p.email})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block mb-1 font-medium">Report Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 font-medium">Report Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows="3"
            ></textarea>
          </div>

          {/* Creative PDF Upload */}
          <div>
            <label className="block mb-1 font-medium">Upload PDF *</label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 transition">
              {!file ? (
                <>
                  <Upload className="w-10 h-10 text-blue-500 mb-2" />
                  <p className="text-gray-600">
                    Drag & drop your PDF here <br /> or{" "}
                    <span className="text-blue-600 font-medium underline">
                      browse
                    </span>
                  </p>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                </>
              ) : (
                <div className="flex items-center justify-between w-full bg-gray-50 p-3 rounded-lg shadow">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Uploading..." : "Upload Report"}
          </button>
        </form>
      </div>
    </div>
  );
}
