"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"; // Adjust imports if using MUI or custom UI components
import {
  ChevronRight,
  User,
  Calendar,
  Filter,
  ArrowUpDown,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
} from "lucide-react";

// Types
export type ApplicantStatus =
  | "Pending"
  | "Shortlisted"
  | "Interviewed"
  | "Rejected"
  | "Hired";

export interface Applicant {
  id: string;
  name: string;
  email: string;
  appliedDate: string; // ISO date string YYYY-MM-DD
  status: ApplicantStatus;
  resumeUrl?: string;
  coverLetter?: string;
}

export interface Vacancy {
  id: string;
  title: string;
  status: "Active" | "Closed" | "Draft";
  deadline: string;
  employerId: string;
  applicants: Applicant[];
}

// Mock Data (Replace with your actual API or context data)
const MOCK_VACANCIES: Vacancy[] = [
  {
    id: "vac-101",
    title: "Senior Frontend Developer",
    status: "Active",
    deadline: "2026-11-15",
    employerId: "emp-current",
    applicants: [
      {
        id: "app-1",
        name: "Sarah Jenkins",
        email: "sarah.j@example.com",
        appliedDate: "2026-10-25",
        status: "Pending",
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
    employerId: "emp-current",
    applicants: [
      {
        id: "app-4",
        name: "Emma Watson",
        email: "emma.w@example.com",
        appliedDate: "2026-10-27",
        status: "Interviewed",
      },
    ],
  },
  {
    id: "vac-103",
    title: "Backend Engineer (Go)",
    status: "Closed",
    deadline: "2026-10-01",
    employerId: "emp-current",
    applicants: [], // Empty state demonstration
  },
];

export default function EmployerVacanciesPage() {
  const [selectedVacancyId, setSelectedVacancyId] = useState<string>(
    MOCK_VACANCIES[0]?.id || ""
  );
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  // Currently selected vacancy
  const selectedVacancy = useMemo(
    () => MOCK_VACANCIES.find((v) => v.id === selectedVacancyId),
    [selectedVacancyId]
  );

  // Filtered & Sorted Applicants
  const processedApplicants = useMemo(() => {
    if (!selectedVacancy) return [];

    let result = [...selectedVacancy.applicants];

    // Filter by status
    if (statusFilter !== "All") {
      result = result.filter((a) => a.status === statusFilter);
    }

    // Sort by applied date
    result.sort((a, b) => {
      const dateA = new Date(a.appliedDate).getTime();
      const dateB = new Date(b.appliedDate).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [selectedVacancy, statusFilter, sortOrder]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vacancy Applications</h1>
        <p className="text-gray-500">
          Manage your job listings and review incoming candidate applications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Vacancies List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Briefcase className="w-5 h-5" /> My Vacancies ({MOCK_VACANCIES.length})
          </h2>

          <div className="space-y-3">
            {MOCK_VACANCIES.map((vacancy) => {
              const isSelected = vacancy.id === selectedVacancyId;
              return (
                <div
                  key={vacancy.id}
                  onClick={() => setSelectedVacancyId(vacancy.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-base">{vacancy.title}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vacancy.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {vacancy.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Deadline: {vacancy.deadline}
                    </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {vacancy.applicants.length} Applicant
                      {vacancy.applicants.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Applicant List & Controls */}
        <div className="lg:col-span-2 space-y-4">
          {selectedVacancy ? (
            <>
              {/* Header and Controls */}
              <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <h2 className="text-xl font-bold">{selectedVacancy.title}</h2>
                    <p className="text-xs text-gray-500">
                      Showing applications submitted for this vacancy.
                    </p>
                  </div>
                  <div className="text-sm bg-gray-100 px-3 py-1 rounded-lg font-medium">
                    Total: {selectedVacancy.applicants.length}
                  </div>
                </div>

                {/* Filter and Sort Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
                  {/* Status Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border rounded-lg px-2.5 py-1.5 text-sm bg-background"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interviewed">Interviewed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Hired">Hired</option>
                    </select>
                  </div>

                  {/* Date Sort */}
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-gray-500" />
                    <select
                      value={sortOrder}
                      onChange={(e) =>
                        setSortOrder(e.target.value as "newest" | "oldest")
                      }
                      className="border rounded-lg px-2.5 py-1.5 text-sm bg-background"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Applicants List / Empty State */}
              {processedApplicants.length === 0 ? (
                <div className="border rounded-xl p-12 text-center bg-white dark:bg-gray-900 space-y-3">
                  <User className="w-12 h-12 text-gray-300 mx-auto" />
                  <h3 className="text-lg font-medium">No Applicants Found</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    {selectedVacancy.applicants.length === 0
                      ? "There are currently no applications submitted for this position."
                      : "No applicants match the selected status filter."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {processedApplicants.map((applicant) => (
                    <div
                      key={applicant.id}
                      onClick={() => setSelectedApplicant(applicant)}
                      className="bg-white dark:bg-gray-900 border rounded-xl p-4 flex items-center justify-between hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold">
                          {applicant.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{applicant.name}</h4>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span>{applicant.email}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Applied:{" "}
                              {applicant.appliedDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            applicant.status === "Pending"
                              ? "bg-amber-100 text-amber-800"
                              : applicant.status === "Shortlisted"
                              ? "bg-blue-100 text-blue-800"
                              : applicant.status === "Interviewed"
                              ? "bg-purple-100 text-purple-800"
                              : applicant.status === "Hired"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {applicant.status}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="border rounded-xl p-12 text-center">
              Please select a vacancy to view its applicants.
            </div>
          )}
        </div>
      </div>

      {/* EMP-4 Review Screen Modal / Drawer */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg h-full p-6 shadow-xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-xl font-bold">Review Applicant (EMP-4)</h3>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="text-gray-500 hover:text-gray-800 text-lg"
                >
                  ✕
                </button>
              </div>

              <div>
                <h4 className="text-2xl font-bold">{selectedApplicant.name}</h4>
                <p className="text-sm text-gray-500">{selectedApplicant.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Applied on {selectedApplicant.appliedDate}
                </p>
              </div>

              {selectedApplicant.coverLetter && (
                <div className="space-y-2">
                  <h5 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                    Cover Letter
                  </h5>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-gray-600 dark:text-gray-300">
                    {selectedApplicant.coverLetter}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}