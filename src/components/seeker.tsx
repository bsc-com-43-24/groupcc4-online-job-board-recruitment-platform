'use client';

import { useState } from 'react';
import { Input, Row, Col, Empty } from 'antd';
import { jobs } from '@/mock/jobs';
import { JobCard } from '@/components/common';

export function JobSearch({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);

  const results = jobs.filter((job) =>
    job.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <>
      <Input.Search
        placeholder="Job title or keyword"
        size="large"
        allowClear
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 24 }}
      />

      {results.length === 0 ? (
        <Empty description="No jobs match your search" />
      ) : (
        <Row gutter={[16, 16]}>
          {results.map((job) => (
            <Col xs={24} md={8} key={job.id}>
              <JobCard job={job} />
            </Col>
          ))}
        </Row>
      )}
    </>
  );
}