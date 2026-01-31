"use client";

import type { ChangeEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type HiringScenarioInputFeatures = {
  avg_leads_per_week?: string | number;
  avg_conversion_rate?: string | number;
  territory_type?: string;
  [key: string]: unknown;
};

type HiringScenario = {
  id: string;
  user_id: string;
  name: string;
  role: string;
  team: string;
  business_unit: string;
  market_region: string;
  ramp_weeks: number;
  dataset_id: string | null;
  model_id: string | null;
  input_features: HiringScenarioInputFeatures;
  expected_weekly_revenue: number;
  ci_low: number;
  ci_high: number;
  created_at: string;
  updated_at: string | null;
};

const API_URL = `${process.env.NEXT_PUBLIC_ML_API_BASE || "http://localhost:8000"}/api/hiring-scenarios`;

export default function HiringScenariosPage() {
  const [scenarios, setScenarios] = useState<HiringScenario[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [outsideClicks, setOutsideClicks] = useState(0);

  const modalRef = useRef<HTMLDivElement | null>(null);

  // Fetch scenarios on load
  useEffect(() => {
    fetch(`${API_URL}?user_id=test-user-1234`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched data:", data);

        if (Array.isArray(data)) {
          setScenarios(data);
        } else if (data?.items) {
          setScenarios(data.items);
        } else if (data?.scenarios) {
          setScenarios(data.scenarios);
        } else if (data?.results) {
          setScenarios(data.results);
        } else {
          setScenarios([]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Handle clicking outside the modal
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setOutsideClicks((prev) => prev + 1);
    }
  }, []);

  useEffect(() => {
    if (!showModal) return;
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showModal, handleOutsideClick]);

  // Close modal after 2 clicks outside
  useEffect(() => {
    if (outsideClicks >= 2) {
      setShowModal(false);
      setOutsideClicks(0);
    }
  }, [outsideClicks]);

  // ---------------------------
  // FORM STATE
  // ---------------------------
  const [form, setForm] = useState({
    user_id: "test-user-1234",
    name: "",
    role: "",
    team: "",
    business_unit: "",
    market_region: "",
    ramp_weeks: 0,
    dataset_id: "",
    model_id: "",
    expected_weekly_revenue: 0,
    ci_low: 0,
    ci_high: 0,
    input_features: {
      avg_leads_per_week: "",
      avg_conversion_rate: "",
      territory_type: "",
    },
  });

  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name in form.input_features) {
      setForm({
        ...form,
        input_features: {
          ...form.input_features,
          [name]: value,
        },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ---------------------------
  // SAVE NEW SCENARIO
  // ---------------------------
  const saveScenario = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save!");

      const newScenario = await res.json();

      // Prevent TS "never[]" problem + ensure array stays array
      setScenarios((prev) => [...prev, newScenario]);

      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Error saving scenario");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header flex justify-between items-center">
        <h1 className="heading-2">Hiring Scenarios</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + New Scenario
        </button>
      </div>

      {/* RENDER SCENARIOS */}
      <div className="space-y-5">
        {scenarios.map((s: HiringScenario) => (
          <div key={s.id} className="content-card">
            <div className="flex justify-between items-center">
              <h2 className="heading-3">{s.name}</h2>
              <button type="button" className="btn btn-danger btn-sm">
                Delete
              </button>
            </div>

            <p className="muted">Role: {s.role}</p>
            <p className="muted">Team: {s.team}</p>
            <p className="muted">Region: {s.market_region}</p>

            {/* Optional numeric fields */}
            <div className="mt-4 space-y-1">
              {s.expected_weekly_revenue !== null && (
                <p className="muted">
                  <span className="font-semibold">
                    Expected Weekly Revenue:
                  </span>{" "}
                  ${s.expected_weekly_revenue.toLocaleString()}
                </p>
              )}

              {s.ci_low !== null && (
                <p className="muted">
                  <span className="font-semibold">CI Low:</span> $
                  {s.ci_low.toLocaleString()}
                </p>
              )}

              {s.ci_high !== null && (
                <p className="muted">
                  <span className="font-semibold">CI High:</span> $
                  {s.ci_high.toLocaleString()}
                </p>
              )}

              {s.created_at && (
                <p className="muted">
                  <span className="font-semibold">Created:</span>{" "}
                  {new Date(s.created_at).toLocaleString()}
                </p>
              )}
            </div>

            {/* Input features formatted cleanly */}
            <div className="mt-6">
              <p className="muted font-semibold mb-2">Input Features:</p>

              <ul className="ml-4 space-y-1 text-gray-300 text-sm">
                {"avg_leads_per_week" in s.input_features && (
                  <li className="muted">
                    • Avg Leads per Week: {s.input_features.avg_leads_per_week}
                  </li>
                )}

                {"avg_conversion_rate" in s.input_features && (
                  <li className="muted">
                    • Avg Conversion Rate:{" "}
                    {s.input_features.avg_conversion_rate}
                  </li>
                )}

                {"territory_type" in s.input_features && (
                  <li className="muted">
                    • Territory Type: {s.input_features.territory_type}
                  </li>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center fade-in">
          <div
            ref={modalRef}
            className="content-card overflow-y-auto"
            style={{
              width: "500px",
              maxHeight: "75vh", // keeps it at 75% of screen height
              paddingBottom: "2rem", // bottom spacing
              marginBottom: "2rem",
            }}
          >
            <h2 className="heading-3 mb-3">Create Scenario</h2>

            <div className="form">
              <input
                className="input"
                placeholder="Scenario Name"
                name="name"
                onChange={handleFormChange}
              />

              <input
                className="input"
                placeholder="Role"
                name="role"
                onChange={handleFormChange}
              />

              <input
                className="input"
                placeholder="Team"
                name="team"
                onChange={handleFormChange}
              />

              <input
                className="input"
                placeholder="Business Unit"
                name="business_unit"
                onChange={handleFormChange}
              />

              <input
                className="input"
                placeholder="Market Region"
                name="market_region"
                onChange={handleFormChange}
              />

              <input
                className="input"
                type="number"
                placeholder="Ramp Weeks"
                name="ramp_weeks"
                onChange={handleFormChange}
              />

              {/* Input Features */}
              <h3 className="heading-4 mt-2">Input Features</h3>

              <input
                className="input"
                placeholder="Avg Leads Per Week"
                name="avg_leads_per_week"
                onChange={handleFormChange}
              />

              <input
                className="input"
                placeholder="Avg Conversion Rate"
                name="avg_conversion_rate"
                onChange={handleFormChange}
              />

              <input
                className="input"
                placeholder="Territory Type"
                name="territory_type"
                onChange={handleFormChange}
              />
            </div>

            <div className="flex justify-end mt-4 gap-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={saveScenario}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
