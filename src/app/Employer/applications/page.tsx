"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Users,
  Clock,
  Sparkles,
  X,
  Search,
  Filter,
} from "lucide-react";

import styles from "./applications.module.css";

export type ApplicationStatus = "Pending" | "Reviewed" | "Shortlisted" | "Hired" | "Rejected";

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  appliedDate: string;
  status: ApplicationStatus;
}

const DEFAULT_APPLICATIONS: Application[] = [
  {
    id: "app-1",
    jobId: "vac-101",
    jobTitle: "Senior Frontend Developer",
    candidateName: "Kenneth Valdez",
    candidateEmail: "kenneth.valdez@example.com",
    appliedDate: "2026-10-24",
    status: "Shortlisted",
  },
  {
    id: "app-2",
    jobId: "vac-102",
    jobTitle: "UX/UI Designer",
    candidateName: "Sarah Jenkins",
    candidateEmail: "sarah.j@example.com",
    appliedDate: "2026-10-25",
    status: "Pending",
  },
];

export default function EmployerApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [markVacancyFilled, setMarkVacancyFilled] = useState<boolean>(true);
  const [notificationSent, setNotificationSent] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Initial Load + Cross-Tab Real-Time Sync
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadData = () => {
      const stored = localStorage.getItem("job_applications");
      if (stored) {
        try {
          setApplications(JSON.parse(stored));
        } catch {
          setApplications(DEFAULT_APPLICATIONS);
        }
      } else {
        setApplications(DEFAULT_APPLICATIONS);
        localStorage.setItem("job_applications", JSON.stringify(DEFAULT_APPLICATIONS));
      }
    };

    loadData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "job_applications") {
        loadData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const saveApplications = (updated: Application[]) => {
    setApplications(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("job_applications", JSON.stringify(updated));
    }
  };

  const handleOpenHireModal = (app: Application) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSelectedApp(app);
    setMarkVacancyFilled(true);
    setNotificationSent(false);
  };

  const handleConfirmHire = () => {
    if (!selectedApp) return;

    const updatedApps = applications.map((app) =>
      app.id === selectedApp.id ? { ...app, status: "Hired" as const } : app
    );
    saveApplications(updatedApps);

    if (markVacancyFilled && typeof window !== "undefined") {
      const storedJobsRaw = localStorage.getItem("employer_jobs");
      if (storedJobsRaw) {
        try {
          const storedJobs = JSON.parse(storedJobsRaw);
          const updatedJobs = storedJobs.map((job: { id: string; status: string }) =>
            job.id === selectedApp.jobId ? { ...job, status: "Filled" } : job
          );
          localStorage.setItem("employer_jobs", JSON.stringify(updatedJobs));
        } catch (e) {
          console.error("Error parsing employer_jobs", e);
        }
      }

      const storedVacanciesRaw = localStorage.getItem("employer_vacancies");
      if (storedVacanciesRaw) {
        try {
          const storedVacancies = JSON.parse(storedVacanciesRaw);
          const updatedVacancies = storedVacancies.map((vac: { id: string; status: string }) =>
            vac.id === selectedApp.jobId ? { ...vac, status: "Filled" } : vac
          );
          localStorage.setItem("employer_vacancies", JSON.stringify(updatedVacancies));
        } catch (e) {
          console.error("Error parsing employer_vacancies", e);
        }
      }
    }

    setNotificationSent(true);

    timerRef.current = setTimeout(() => {
      setNotificationSent(false);
      setSelectedApp(null);
    }, 1800);
  };

  const totalCount = applications.length;
  const shortlistedCount = applications.filter((a) => a.status === "Shortlisted").length;
  const hiredCount = applications.filter((a) => a.status === "Hired").length;

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || app.status.trim().toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      {/* Header Banner */}
      <div className={styles.headerBanner}>
        <div>
          <div className={styles.portalBadge}>
            <Briefcase className="w-4 h-4" /> Employer Portal
          </div>
          <h1 className={styles.title}>Applicant Management & Hire Action</h1>
          <p className={styles.subtitle}>
            Review applicant pipelines, execute hiring decisions, and notify candidates.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div>
            <p className={styles.statLabel}>Total Applicants</p>
            <p className={styles.statValue}>{totalCount}</p>
          </div>
          <div className={styles.iconWrapperGrey}>
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className={styles.statCard}>
          <div>
            <p className={styles.statLabel}>Shortlisted Candidates</p>
            <p className={`${styles.statValue} ${styles.statValueBlue}`}>{shortlistedCount}</p>
          </div>
          <div className={styles.iconWrapperBlue}>
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className={styles.statCard}>
          <div>
            <p className={styles.statLabel}>Offers Extended</p>
            <p className={`${styles.statValue} ${styles.statValueDarkBlue}`}>{hiredCount}</p>
          </div>
          <div className={styles.iconWrapperLightBlue}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search candidate or job..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Medium-Sized Blue Filter Buttons */}
        <div className={styles.filterGroup}>
          <Filter className="w-5 h-5 text-blue-600 shrink-0" />
          {["ALL", "SHORTLISTED", "HIRED", "PENDING"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`${styles.filterBtn} ${
                statusFilter === status ? styles.filterBtnActive : ""
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Candidate Details</th>
                <th>Applied Position</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "2.5rem", textAlign: "center", color: "#94a3b8" }}>
                    No matching applications found.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const isShortlisted = app.status === "Shortlisted";
                  const isHired = app.status === "Hired";

                  return (
                    <tr key={app.id} className={styles.tableRow}>
                      <td className={styles.tableCell}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div className={styles.candidateAvatar}>{app.candidateName.charAt(0)}</div>
                          <div>
                            <div className={styles.candidateName}>{app.candidateName}</div>
                            <div className={styles.candidateEmail}>{app.candidateEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.tableCell} style={{ fontWeight: 500, color: "#334155" }}>
                        {app.jobTitle}
                      </td>
                      <td className={styles.tableCell} style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {app.appliedDate}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <span
                          className={`${styles.badge} ${
                            isHired
                              ? styles.badgeHired
                              : isShortlisted
                              ? styles.badgeShortlisted
                              : styles.badgePending
                          }`}
                        >
                          {isHired && <CheckCircle2 className="w-3 h-3 text-blue-600" />}
                          {isShortlisted && <Sparkles className="w-3 h-3 text-blue-600" />}
                          {app.status.toUpperCase()}
                        </span>
                      </td>
                      <td className={styles.tableCellRight}>
                        {isShortlisted && (
                          <button onClick={() => handleOpenHireModal(app)} className={styles.hireBtn}>
                            <UserCheck className="w-4 h-4" /> Hire Candidate
                          </button>
                        )}

                        {isHired && (
                          <span className={styles.offerBadge}>
                            <CheckCircle2 className="w-4 h-4 text-blue-600" /> Offer Accepted
                          </span>
                        )}

                        {!isShortlisted && !isHired && (
                          <span className={styles.inReviewBadge}>
                            <Clock className="w-4 h-4 text-slate-500" /> In Review
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {selectedApp && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div className={styles.iconWrapperBlue}>
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1.125rem", color: "#0f172a" }}>
                  Confirm Hiring Decision
                </h3>
              </div>
              <button
                onClick={() => {
                  if (timerRef.current) clearTimeout(timerRef.current);
                  setSelectedApp(null);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {notificationSent ? (
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#1e3a8a",
                  borderRadius: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>Hiring Confirmed!</p>
                  <p style={{ fontSize: "0.75rem", color: "#1d4ed8" }}>
                    Notification email dispatched to {selectedApp.candidateName}.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "1rem",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    fontSize: "0.75rem",
                    color: "#334155",
                  }}
                >
                  <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                  <span>
                    Confirming will update candidate status to <strong>Hired</strong>. An offer notification email will be dispatched to <strong>{selectedApp.candidateEmail}</strong>.
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    padding: "1rem",
                    borderRadius: "1rem",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Target Candidate:</div>
                  <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.875rem" }}>
                    {selectedApp.candidateName}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", paddingTop: "0.25rem" }}>
                    Position:
                  </div>
                  <div style={{ fontWeight: 500, color: "#334155", fontSize: "0.75rem" }}>
                    {selectedApp.jobTitle}
                  </div>
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={markVacancyFilled}
                    onChange={(e) => setMarkVacancyFilled(e.target.checked)}
                  />
                  <span>Mark job vacancy as "Filled" (Closes active recruitment)</span>
                </label>

                <div
                  style={{
                    paddingTop: "0.75rem",
                    borderTop: "1px solid #f1f5f9",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.5rem",
                  }}
                >
                  <button
                    onClick={() => {
                      if (timerRef.current) clearTimeout(timerRef.current);
                      setSelectedApp(null);
                    }}
                    className={styles.modalCancelBtn}
                  >
                    Cancel
                  </button>
                  <button onClick={handleConfirmHire} className={styles.modalConfirmBtn}>
                    Confirm & Hire Candidate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}