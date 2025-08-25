const API_BASE_URL = import.meta.env.VITE_API_BASE_URL+"/Admin";
// -----------------------------
// Get Patients List (Admin only)
// -----------------------------
export async function getPatients(token) {
  const res = await fetch(`${API_BASE_URL}/patients-list`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`, // Pass JWT token
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// -----------------------------
// Upload Report (Admin only)
// -----------------------------
export async function uploadReport(token, patientId, title, description, pdfFile) {
  const formData = new FormData();
  formData.append("PatientId", patientId);
  formData.append("ReportTitle", title);
  formData.append("ReportDescription", description);
  formData.append("ReportPdf", pdfFile);

  const res = await fetch(`${API_BASE_URL}/upload-report`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`, // Admin token
    },
    body: formData, // FormData automatically sets correct headers
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}