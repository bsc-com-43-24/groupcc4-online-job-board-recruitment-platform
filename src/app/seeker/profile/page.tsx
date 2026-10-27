import Link from 'next/link';

export default function SeekerProfilePage() {
  return (
    <div style={{ maxWidth: 980, margin: '40px auto', padding: '0 16px' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)' }}>
        <h2 style={{ margin: 0 }}>Profile</h2>
        <p style={{ color: '#666', marginTop: 12 }}>
          This page is meant to hold the candidate profile and CV management experience.
        </p>
        <Link href="/job-seeker/home">
          <button style={{ marginTop: 8, padding: '10px 16px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Back to dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
