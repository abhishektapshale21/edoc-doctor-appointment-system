import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { api } from "../api";

const defaultSpecialties = [
  "Accident and emergency medicine",
  "Allergology",
  "Anaesthetics",
  "Biological hematology",
  "Cardiology",
  "Child psychiatry",
  "Clinical biology",
  "Clinical chemistry",
  "Clinical neurophysiology",
  "Clinical radiology",
  "Dental, oral and maxillo-facial surgery",
  "Dermato-venerology",
  "Dermatology",
  "Endocrinology",
  "Gastro-enterologic surgery",
  "Gastroenterology",
  "General hematology",
  "General Practice",
  "General surgery",
  "Geriatrics",
  "Immunology",
  "Infectious diseases",
  "Internal medicine",
  "Laboratory medicine",
  "Maxillo-facial surgery",
  "Microbiology",
  "Nephrology",
  "Neuro-psychiatry",
  "Neurology",
  "Neurosurgery",
  "Nuclear medicine",
  "Obstetrics and gynecology",
  "Occupational medicine",
  "Ophthalmology",
  "Orthopaedics",
  "Otorhinolaryngology",
  "Paediatric surgery",
  "Paediatrics",
  "Pathology",
  "Pharmacology",
  "Physical medicine and rehabilitation",
  "Plastic surgery",
  "Podiatric Medicine",
  "Podiatric Surgery",
  "Psychiatry",
  "Public health and Preventive Medicine",
  "Radiology",
  "Radiotherapy",
  "Respiratory medicine",
  "Rheumatology",
  "Stomatology",
  "Thoracic surgery",
  "Tropical medicine",
  "Urology",
  "Vascular surgery",
  "Venereology"
];

export default function LandingPage({ onOpenAuth }) {
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);
  const [specialtiesList, setSpecialtiesList] = useState(defaultSpecialties);

  useEffect(() => {
    api.getSpecialties()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSpecialtiesList(data.map(d => d.sname));
        }
      })
      .catch(() => {});
  }, []);

  const initialCount = 11;
  const displayedSpecialties = showAllSpecialties
    ? specialtiesList
    : specialtiesList.slice(0, initialCount);
  const remainingCount = Math.max(0, specialtiesList.length - initialCount);

  const handleSpecialtyClick = (specialty) => {
    onOpenAuth("login");
  };

  const handleScrollToSpecialties = () => {
    const el = document.getElementById("specialties-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setShowAllSpecialties(true);
  };

  return (
    <div className="landing-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-badge">
            <Sparkles size={15} color="#0284c7" />
            <span>Official Doctor Channeling & Healthcare System</span>
          </div>

          <h1 className="hero-title">
            Avoid Hassles & Delays.<br />
            <span className="hero-gradient-text">Find & Book Your Doctor Online.</span>
          </h1>

          <p className="hero-subtitle">
            How is health today? Sounds like not good! Don't worry. Find your doctor online,
            book consultation sessions with eDoc, and get your digital numbered appointment token instantly.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary hero-btn-main"
              onClick={() => onOpenAuth("login")}
            >
              <Calendar size={18} />
              <span>Make Appointment</span>
              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              className="btn btn-secondary hero-btn-sub"
              onClick={() => onOpenAuth("register")}
            >
              Create Account
            </button>
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="features-section">
        <div className="features-container">
          <div className="features-grid">
            <div
              className="feature-item feature-item-clickable"
              onClick={() => onOpenAuth("login")}
              role="button"
              tabIndex={0}
              title="Click to book consultation"
            >
              <div className="feature-icon">
                <Clock size={24} color="#0284c7" />
              </div>
              <h3>Zero Waiting Room Chaos</h3>
              <p>Real-time numbered token generation gives you an exact place in line.</p>
            </div>

            <div
              className="feature-item feature-item-clickable"
              onClick={handleScrollToSpecialties}
              role="button"
              tabIndex={0}
              title="Click to view all 56 medical specialties"
            >
              <div className="feature-icon">
                <Award size={24} color="#0d9488" />
              </div>
              <h3>56 Medical Specialties</h3>
              <p>Consult with certified specialist practitioners across every major clinical field.</p>
            </div>

            <div
              className="feature-item feature-item-clickable"
              onClick={() => onOpenAuth("login")}
              role="button"
              tabIndex={0}
              title="Click to get digital pass"
            >
              <div className="feature-icon">
                <CheckCircle2 size={24} color="#10b981" />
              </div>
              <h3>Digital Appointment Passes</h3>
              <p>Instant printable confirmation slips with doctor, clinic, and scheduling details.</p>
            </div>
          </div>

          {/* Specialties Showcase */}
          <div className="specialties-preview" id="specialties-section">
            <div className="specialties-header">
              <h4>Certified Clinical Specialties ({specialtiesList.length}):</h4>
              <button
                type="button"
                className="spec-toggle-link"
                onClick={() => setShowAllSpecialties(prev => !prev)}
              >
                {showAllSpecialties ? "Show Fewer" : `View All (${specialtiesList.length})`}
              </button>
            </div>

            <div className="specialties-pills">
              {displayedSpecialties.map((spec, i) => (
                <button
                  key={i}
                  type="button"
                  className="spec-pill spec-pill-btn"
                  onClick={() => handleSpecialtyClick(spec)}
                  title={`Click to book consultation in ${spec}`}
                >
                  {spec}
                </button>
              ))}

              <button
                type="button"
                className="spec-pill spec-more"
                onClick={() => setShowAllSpecialties(prev => !prev)}
                title={showAllSpecialties ? "Show fewer specialties" : "Show all 56 specialties"}
              >
                {showAllSpecialties ? (
                  <>
                    <ChevronUp size={14} />
                    <span>Show Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    <span>+{remainingCount} More</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
