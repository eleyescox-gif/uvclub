export default function VotingLoading() {
  return (
    <div style={{ padding: '1.5rem', maxWidth: '48rem', margin: '0 auto' }}>
      <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '180px', height: '32px', borderRadius: '8px', backgroundColor: '#e2e8f0', animation: 'pulse 1.5s infinite' }} />
        <div style={{ width: '260px', height: '18px', borderRadius: '6px', backgroundColor: '#f1f5f9', animation: 'pulse 1.5s infinite' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {[1, 2].map((i) => (
          <div key={i} className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ width: '100px', height: '22px', borderRadius: '999px', backgroundColor: '#e2e8f0', animation: 'pulse 1.5s infinite' }} />
            </div>
            <div style={{ width: '70%', height: '24px', borderRadius: '6px', backgroundColor: '#e2e8f0', marginBottom: '0.75rem', animation: 'pulse 1.5s infinite' }} />
            <div style={{ width: '90%', height: '16px', borderRadius: '6px', backgroundColor: '#f1f5f9', marginBottom: '1.5rem', animation: 'pulse 1.5s infinite' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1, 2, 3].map((opt) => (
                <div key={opt} style={{ height: '42px', borderRadius: '999px', border: '1.5px solid #e5e7eb', backgroundColor: '#f8fafc', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </div>
  );
}
