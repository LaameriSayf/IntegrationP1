import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import axios from "axios";

const LastTransactionAcc = () => {
  const [approvals, setApprovals] = useState([]);
  const [showAll, setShowAll] = useState(false); 

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/approvals/approvals");
        setApprovals(response.data);
      } catch (err) {
        console.error("Erreur lors du chargement des approbations :", err);
      }
    };

    fetchApprovals();
  }, []);

  const approveRequest = async (id) => {
    try {
      await axios.put(`http://localhost:5001/api/approvals/approve/${id}`);
      const updatedApprovals = approvals.filter((a) => a._id !== id);
      setApprovals(updatedApprovals);
    } catch (err) {
      console.error("Erreur lors de l'approbation :", err);
    }
  };

  return (
    <div className="col-xxl-6">
      <div className="card h-100">
        <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
          <h6 className="text-lg fw-semibold mb-0">Pending Approvals</h6>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-primary-600 hover:text-primary-800 d-flex align-items-center gap-1"
          >
            {showAll ? "View Less" : "View All"}
            <Icon icon="solar:alt-arrow-right-linear" className="icon" />
          </button>
        </div>
        <div className="card-body p-24 bg-gray-100">
          <div className="table-responsive scroll-sm">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th scope="col">Approval Type</th>
                  <th scope="col">Details</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {approvals.length > 0 ? (
                  approvals.slice(0, showAll ? approvals.length : 3).map((a) => (
                    <tr key={a._id}>
                      <td>{a.approvalType || "N/A"}</td>
                      <td>{a.details || "N/A"}</td>
                      <td>
                        {a.status ? (
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-black text-xs font-medium ${
                              a.status === "pending"
                                ? "bg-red-500"
                                : a.status === "approved"
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          >
                            {a.status.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>
                        {a.status === "pending" && (
                          <button
                            onClick={() => approveRequest(a._id)}
                            className="bg-yellow text-green-500 border border-green-500 px-2 py-1 rounded-md hover:bg-green-50 transition duration-200 text-xs font-medium"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-500 text-sm">
                      No pending requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LastTransactionAcc;