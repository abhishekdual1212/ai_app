import { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_KEY = import.meta.env.VITE_API_KEY;

const DiyProgressPopup = ({ onClose }) => {
  const [outcomes, setOutcomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const chatId = localStorage.getItem("Dchat_id");

  useEffect(() => {
    const fetchAllOutcomes = async () => {
      if (!chatId) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(
          `${API_BASE}/api/session/all-diy-outcomes/${chatId}`,
          { headers: { "x-api-key": API_KEY } }
        );
        setOutcomes(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch outcomes:", error);
        setOutcomes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOutcomes();
  }, [chatId]);

  // Close on escape key press
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          DIY Progress Status
        </h2>

        {loading ? (
          <p>Loading status...</p>
        ) : !outcomes.length ? (
          <p>No DIY projects started yet.</p>
        ) : (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {outcomes.map((outcome) => (
              <div key={outcome._id}>
                <h3 className="font-bold text-lg mb-3">
                  {outcome.OutcomeLabel || "No Label"}
                </h3>
                <div className="relative ml-4 border-l-2 border-gray-200">
                  {(outcome.progress || []).map((step, idx) => {
                    const isCompleted = step.status === "completed";
                    return (
                      <div
                        key={step._id || idx}
                        className="relative pl-8 mb-6 last:mb-0"
                      >
                        <span
                          className={`absolute left-[-9px] top-1 w-4 h-4 rounded-full border-2 ${
                            isCompleted
                              ? "bg-green-500 border-green-500"
                              : "bg-white border-gray-300"
                          }`}
                        />
                        <p
                          className={`text-sm ${
                            isCompleted
                              ? "text-green-600 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiyProgressPopup;
