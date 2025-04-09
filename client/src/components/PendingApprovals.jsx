import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaList, FaPlus, FaEnvelope } from "react-icons/fa";

const PendingApprovals = () => {
  const [approvals, setApprovals] = useState([]);
  const [formData, setFormData] = useState({ userEmail: "", approvalType: "", details: "" });
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/approvals/approvals");
      setApprovals(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des approbations :", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5001/api/approvals/create", formData);
      setFormData({ userEmail: "", approvalType: "", details: "" });
      setIsFormVisible(false);
      fetchApprovals();
    } catch (err) {
      console.error("Erreur lors de la soumission :", err);
    }
  };

  const approveRequest = async (id) => {
    try {
      await axios.put(`http://localhost:5001/api/approvals/approve/${id}`);
      fetchApprovals();
    } catch (err) {
      console.error("Erreur lors de l'approbation :", err);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl rounded-lg shadow-lg bg-gray-100">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6 p-4 bg-blue-200 rounded-lg shadow-inner">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FaList /> Pending Approvals
        </h2>
        <button
          onClick={() => setIsFormVisible(true)}
          className="bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition duration-200 flex items-center gap-1 text-sm font-medium"
        >
          <FaPlus /> Add
        </button>
      </div>

      {/* Formulaire intégré */}
      {isFormVisible && (
        <div className="mb-6 p-4 bg-white rounded-md border border-gray-300 shadow-md">
          <h3 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FaEnvelope /> Submit a Request
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-600 font-medium mb-1 text-sm">Email</label>
              <input
                type="email"
                placeholder="Your email"
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 text-gray-800 placeholder-gray-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1 text-sm">Request Type</label>
              <select
                value={formData.approvalType}
                onChange={(e) => setFormData({ ...formData, approvalType: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 text-gray-800 appearance-none text-sm"
              >
                <option value="" className="text-gray-500">Select a type</option>
                <option value="Accès Logiciel">Accès Logiciel</option>
                <option value="Autorisation Projet">Autorisation Projet</option>
                <option value="Validation Financière">Validation Financière</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1 text-sm">Details</label>
              <textarea
                placeholder="Details of your request"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 text-gray-800 placeholder-gray-500 h-20 resize-none text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-1.5 rounded-md hover:bg-blue-600 transition duration-200 text-sm font-medium"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => setIsFormVisible(false)}
                className="w-full bg-gray-300 text-gray-800 py-1.5 rounded-md hover:bg-gray-400 transition duration-200 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau des approbations */}
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left text-gray-700 font-semibold border-b border-gray-300 text-sm">Type</th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold border-b border-gray-300 text-sm">Details</th>
                <th className="px-4 py-2 text-center text-gray-700 font-semibold border-b border-gray-300 text-sm">Status</th>
                <th className="px-4 py-2 text-center text-gray-700 font-semibold border-b border-gray-300 text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {approvals.length > 0 ? (
                approvals.map((a) => (
                  <tr key={a._id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                    <td className="px-4 py-2 text-gray-800 text-sm">{a.approvalType || "N/A"}</td>
                    <td className="px-4 py-2 text-gray-800 text-sm">{a.details || "N/A"}</td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          a.status === "pending"
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-green-200 text-green-800"
                        }`}
                      >
                        {a.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {a.status === "pending" && (
                        <button
                          onClick={() => approveRequest(a._id)}
                          className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 transition duration-200 text-xs font-medium"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-2 text-center text-gray-500 text-sm">
                    No pending requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

        .container {
          background: #f7f7f9; /* Un arrière-plan doux et moderne */
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          font-family: 'Inter', sans-serif;
        }

        .bg-blue-200 {
          background-color: #a3bffa; /* Bleu doux */
        }

        .bg-gray-50 {
          background-color: #eaeaea; /* Gris très clair */
        }

        .bg-gray-200 {
          background-color: #e5e7eb; /* Gris clair pour en-têtes */
        }

        button:hover {
          transform: translateY(-1px);
        }

        input, select, textarea {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default PendingApprovals;
