"use client";

import React, { useState, useMemo } from "react";
import {
  User,
  Star,
  StarOff,
  Filter,
  ArrowUpDown,
  Clock,
  Briefcase,
  Eye,
  X,
  CheckCircle2,
} from "lucide-react";

export type ApplicationStatus = "Under Review" | "Shortlisted" | "Rejected" | "Hired";

export interface Applicant {
  id: string;
  name: string;
  email: string;
  appliedDate: string;
  status: ApplicationStatus;
  resumeUrl?: string;
  coverLetter?: string;
}

export interface Vacancy {
  id: string;
  title: string;
  status: "Active" | "Closed";
  deadline: string;
  applicants: Applicant[];
}

const INITIAL_VACANCIES: Vacancy[] = [
  {
    id: "vac-101",
    title: "Senior Frontend Developer",
    status: "Active",
    deadline: "2026-11-15",
    applicants: [
      {
        id: "app-1",
        name: "Sarah Jenkins",
        email: "sarah.j@example.com",
        appliedDate: "2026-10-25",
        status: "Under Review",
        coverLetter: "I am excited to apply for the Senior Frontend Developer position...",
      },
      {
        id: "app-2",
        name: "Michael Chen",
        email: "m.chen@example.com",
        appliedDate: "2026-10-20",
        status: "Shortlisted",
        coverLetter: "With over 6 years of experience in React and Next.js...",
      },
      {
        id: "app-3",
        name: "David Kim",
        email: "dkim@example.com",
        appliedDate: "2026-10-18",
        status: "Rejected",
      },
    ],
  },
  {
    id: "vac-102",
    title: "UX/UI Designer",
    status: "Active",
    deadline: "2026-11-01",
    applicants: [
      {
        id: "app-4",
        name: "Emma Watson",
        email: "emma.w@example.com",
        appliedDate: "2026-10-27",
        status: "Shortlisted",
      },
    ],
  },
];

export default function EmployerShortlistManagement() {
  const [vacancies, setVacancies] = useState<Vacancy[]>(INITIAL_VACANCIES);
  const [selectedVacancyId, setSelectedVacancyId] = useState<string>("vac-101");
  const [activeTab, setActiveTab] = useState<"all" | "shortlisted">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  const selectedVacancy = vacancies.find((v) => v.id === selectedVacancyId);

  // Toggle shortlist status for a specific applicant
  const toggleShortlist = (applicantId: string) => {
    setVacancies((prevVacancies) =>
      prevVacancies.map((vac) => {
        if (vac.id !== selectedVacancyId) return vac;
        return {
          ...vac,
          applicants: vac.applicants.map((app) => {
            if (app.id !== applicantId) return app;
            const newStatus: ApplicationStatus =
              app.status === "Shortlisted" ? "Under Review" : "Shortlisted";
            return { ...app, status: newStatus };
          }),
        };
      })
    );

    // Sync state if modal is open
    if (selectedApplicant && selectedApplicant.id === applicantId) {
      setSelectedApplicant((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === "Shortlisted" ? "Under Review" : "Shortlisted",
            }
          : null
      );
    }
  };

  // Filter and sort applicant list
  const displayedApplicants = useMemo(() => {
    if (!selectedVacancy) return [];
    let list = [...selectedVacancy.applicants];

    if (activeTab === "shortlisted") {
      list = list.filter((a) => a.status === "Shortlisted");
    }

    list.sort((a, b) => {
      const dateA = new Date(a.appliedDate).getTime();
      const dateB = new Date(b.appliedDate).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [selectedVacancy, activeTab, sortOrder]);

  const shortlistedCount =
    selectedVacancy?.applicants.filter((a) => a.status === "Shortlisted").length || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applicant Management</h1>
        <p className="text-gray-500">Shortlist promising candidates and manage recruitment flow.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Vacancies */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-gray-600" /> Vacancies
          </h2>
          {vacancies.map((vac) => (
            <div
              key={vac.id}
              onClick={() => setSelectedVacancyId(vac.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                vac.id === selectedVacancyId
                  ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <h3 className="font-semibold text-base">{vac.title}</h3>
              <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                <span>Total: {vac.applicants.length}</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  ★ {vac.applicants.filter((a) => a.status === "Shortlisted").length} Shortlisted
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Applicants & Shortlist Filter */}
        <div className="lg:col-span-2 space-y-4">
          {selectedVacancy && (
            <>
              {/* Header & Tabs */}
              <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">{selectedVacancy.title}</h2>
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-gray-500" />
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                      className="border rounded-lg px-2.5 py-1 text-sm bg-background"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex border-b text-sm">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`pb-2 px-4 font-medium transition-colors ${
                      activeTab === "all"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    All Applicants ({selectedVacancy.applicants.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("shortlisted")}
                    className={`pb-2 px-4 font-medium flex items-center gap-1.5 transition-colors ${
                      activeTab === "shortlisted"
                        ? "border-b-2 border-amber-500 text-amber-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    Shortlisted ({shortlistedCount})
                  </button>
                </div>
              </div>

              {/* Applicant List */}
              {displayedApplicants.length === 0 ? (
                <div className="border rounded-xl p-12 text-center bg-white dark:bg-gray-900 space-y-2">
                  <User className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="font-medium text-gray-600">No applicants found</p>
                  <p className="text-xs text-gray-400">
                    {activeTab === "shortlisted"
                      ? "No candidates have been shortlisted for this vacancy yet."
                      : "No candidates applied for this job."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayedApplicants.map((applicant) => {
                    const isShortlisted = applicant.status === "Shortlisted";
                    return (
                      <div
                        key={applicant.id}
                        className={`bg-white dark:bg-gray-900 border rounded-xl p-4 flex items-center justify-between transition-all ${
                          isShortlisted ? "border-amber-300 bg-amber-50/20" : "hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 font-bold flex items-center justify-center">
                            {applicant.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-base">{applicant.name}</h4>
                              {isShortlisted && (
                                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                  Shortlisted
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{applicant.email}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedApplicant(applicant)}
                            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-xs font-medium flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" /> Review
                          </button>

                          <button
                            onClick={() => toggleShortlist(applicant.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              isShortlisted
                                ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                : "bg-gray-100 text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                            }`}
                          >
                            {isShortlisted ? (
                              <>
                                <StarOff className="w-3.5 h-3.5" /> Remove from Shortlist
                              </>
                            ) : (
                              <>
                                <Star className="w-3.5 h-3.5" /> Shortlist
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Screen Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md h-full p-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-lg">Candidate Details</h3>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div>
                <h4 className="text-2xl font-bold">{selectedApplicant.name}</h4>
                <p className="text-sm text-gray-500">{selectedApplicant.email}</p>
                <div className="mt-3 inline-block">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      selectedApplicant.status === "Shortlisted"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Status: {selectedApplicant.status}
                  </span>
                </div>
              </div>

              {selectedApplicant.coverLetter && (
                <div>
                  <h5 className="font-semibold text-sm mb-1">Cover Letter</h5>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-gray-600 dark:text-gray-300">
                    {selectedApplicant.coverLetter}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
              <button
                onClick={() => toggleShortlist(selectedApplicant.id)}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 ${
                  selectedApplicant.status === "Shortlisted"
                    ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <Star className="w-4 h-4" />
                {selectedApplicant.status === "Shortlisted"
                  ? "Remove from Shortlist"
                  : "Shortlist Candidate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}