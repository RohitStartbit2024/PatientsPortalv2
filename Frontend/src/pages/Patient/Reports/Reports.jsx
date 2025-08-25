import React, { useEffect, useState } from "react";
import { getReports, downloadReport } from "../../../api/patient";

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("accessToken");
    const email = user.email;

    useEffect(() => {
        if (!email || !token) return;

        const fetchReports = async () => {
            try {
                const res = await getReports(email, token);
                setReports(res);
            } catch (err) {
                console.error("Error fetching reports:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [email, token]);

    const handleDownload = async (reportId, reportTitle) => {
        try {
            await downloadReport(email, reportId, token, reportTitle);
        } catch (err) {
            console.error("Download failed:", err);
        }
    };


    if (loading)
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 text-lg">Loading reports...</p>
            </div>
        );

    return (
        <div className="p-4  mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                My Reports
            </h2>

            {reports.length === 0 ? (
                <p className="text-center text-gray-600">No reports available.</p>
            ) : (
                <div className="overflow-x-auto border border-gray-200 ">
                    <table className="min-w-full border border-gray-200 shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-blue-100 text-left">
                            <tr>
                                <th className="px-6 py-3 border-b">S.No</th>
                                <th className="px-6 py-3 border-b">Title</th>
                                <th className="px-6 py-3 border-b">Description</th>
                                <th className="px-6 py-3 border-b">Uploaded On</th>
                                <th className="px-6 py-3 border-b">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, index) => (
                                <tr
                                    key={report.id}
                                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                >
                                    <td className="px-6 py-4 border-b">{index + 1}</td>
                                    <td className="px-6 py-4 border-b font-medium text-gray-700">
                                        {report.reportTitle}
                                    </td>
                                    <td className="px-6 py-4 border-b text-gray-600">
                                        {report.reportDescription}
                                    </td>
                                    <td className="px-6 py-4 border-b text-gray-600">
                                        {new Date(report.uploadTime).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 border-b">
                                        <button
                                            onClick={() => handleDownload(report.id, report.reportTitle)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                        >
                                            Download
                                        </button>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Reports;
