"use client";

import React, { useState, useEffect } from "react";
import { Alert, Table, Tag, Card, Input, Radio, Typography, Space } from "antd";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  Sparkles,
  Search,
  FileText,
  Building2,
} from "lucide-react";

const { Title, Text } = Typography;

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

export default function SeekerApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

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

  const totalCount = applications.length;
  const shortlistedCount = applications.filter((a) => a.status === "Shortlisted").length;
  const hiredCount = applications.filter((a) => a.status === "Hired").length;

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || app.status.trim().toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: "Applied Position",
      dataIndex: "jobTitle",
      key: "jobTitle",
      render: (text: string, record: Application) => (
        <Space size="middle">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Building2 className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#0f172a" }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Ref ID: {record.jobId}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Applied Date",
      dataIndex: "appliedDate",
      key: "appliedDate",
      render: (text: string) => (
        <Space size={4}>
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {text}
          </Text>
        </Space>
      ),
    },
    {
      title: "Application Status",
      dataIndex: "status",
      key: "status",
      render: (status: ApplicationStatus) => {
        const isHired = status === "Hired";
        const isShortlisted = status === "Shortlisted";
        return (
          <Tag
            color={isHired ? "success" : isShortlisted ? "processing" : "default"}
            style={{ borderRadius: 12, padding: "2px 10px", fontWeight: 600 }}
          >
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Action / Next Steps",
      key: "action",
      align: "right" as const,
      render: (_: unknown, record: Application) => {
        if (record.status === "Hired") {
          return (
            <Tag color="green" icon={<CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />} style={{ padding: "4px 12px", borderRadius: 8, fontWeight: 600 }}>
              Offer Received
            </Tag>
          );
        }
        if (record.status === "Shortlisted") {
          return (
            <Tag color="blue" icon={<Sparkles className="w-3.5 h-3.5 inline mr-1" />} style={{ padding: "4px 12px", borderRadius: 8, fontWeight: 600 }}>
              Interview Scheduled
            </Tag>
          );
        }
        return (
          <Tag icon={<Clock className="w-3.5 h-3.5 inline mr-1" />} style={{ padding: "4px 12px", borderRadius: 8, fontWeight: 600 }}>
            Under Review
          </Tag>
        );
      },
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space size="small" style={{ color: "#2563eb", fontWeight: 600, fontSize: 13 }}>
          <Briefcase className="w-4 h-4" /> JOB SEEKER PORTAL
        </Space>
        <Title level={2} style={{ margin: "4px 0 0 0" }}>
          My Job Applications
        </Title>
        <Text type="secondary">
          Track real-time updates on your active submissions and interview status.
        </Text>
      </div>

      {/* Offer Congratulatory Banner */}
      {hiredCount > 0 && (
        <Alert
          title="Congratulations!"
          description="You have received a formal offer for one or more of your active applications. Check your status below."
          type="success"
          showIcon
          style={{ marginBottom: 24, borderRadius: 12 }}
        />
      )}

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
        <Card size="small" style={{ borderRadius: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>APPLICATIONS SENT</Text>
              <Title level={3} style={{ margin: 0 }}>{totalCount}</Title>
            </div>
            <FileText className="w-6 h-6 text-slate-400" />
          </div>
        </Card>

        <Card size="small" style={{ borderRadius: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>SHORTLISTED</Text>
              <Title level={3} style={{ margin: 0, color: "#2563eb" }}>{shortlistedCount}</Title>
            </div>
            <Sparkles className="w-6 h-6 text-blue-500" />
          </div>
        </Card>

        <Card size="small" style={{ borderRadius: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>OFFERS RECEIVED</Text>
              <Title level={3} style={{ margin: 0, color: "#16a34a" }}>{hiredCount}</Title>
            </div>
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16 }}>
          <Input
            placeholder="Search position or vacancy ID..."
            prefix={<Search className="w-4 h-4 text-slate-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 280, borderRadius: 8 }}
          />
          <Radio.Group
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="ALL">ALL</Radio.Button>
            <Radio.Button value="SHORTLISTED">SHORTLISTED</Radio.Button>
            <Radio.Button value="HIRED">HIRED</Radio.Button>
            <Radio.Button value="PENDING">PENDING</Radio.Button>
          </Radio.Group>
        </div>
      </Card>

      {/* Table */}
      <Table
        dataSource={filteredApps}
        columns={columns}
        rowKey="id"
        pagination={false}
        style={{ borderRadius: 12, overflow: "hidden" }}
      />
    </div>
  );
}