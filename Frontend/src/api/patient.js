const API_BASE_URL = import.meta.env.VITE_API_BASE_URL+"/patient";

// -----------------------------
// Get all reports for a patient
// -----------------------------
export async function getReports(email, token) {
  const res = await fetch(`${API_BASE_URL}/${email}/reports`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// -----------------------------
// Download a specific report for a patient
// -----------------------------
export async function downloadReport(email, reportId, token, reportTitle) {
  const res = await fetch(
    `${API_BASE_URL}/${email}/reports/${reportId}/download`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error(await res.text());
  const blob = await res.blob();
  let filename = `${reportTitle}.pdf`;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename; // <-- should now be "Daily Scan report.pdf"
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  return true;
}






