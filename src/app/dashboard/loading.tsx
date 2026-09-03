export default function DashboardLoading() {
  return (
    <div style={{ padding: "1rem", maxWidth: "72rem", margin: "0 auto" }}>
      {/* Top Header Skeleton */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div
            style={{
              width: "180px",
              height: "28px",
              borderRadius: "8px",
              backgroundColor: "#e2e8f0",
              animation: "pulse 1.5s infinite"
            }}
          />
          <div
            style={{
              width: "120px",
              height: "16px",
              borderRadius: "6px",
              backgroundColor: "#f1f5f9",
              animation: "pulse 1.5s infinite"
            }}
          />
        </div>
        <div
          style={{
            width: "90px",
            height: "36px",
            borderRadius: "8px",
            backgroundColor: "#f1f5f9",
            animation: "pulse 1.5s infinite"
          }}
        />
      </div>

      {/* Metric Cards Skeleton Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem"
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "1rem",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div
                style={{
                  width: "70px",
                  height: "14px",
                  borderRadius: "4px",
                  backgroundColor: "#f1f5f9",
                  animation: "pulse 1.5s infinite"
                }}
              />
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "#f1f5f9",
                  animation: "pulse 1.5s infinite"
                }}
              />
            </div>
            <div
              style={{
                width: "110px",
                height: "26px",
                borderRadius: "6px",
                backgroundColor: "#e2e8f0",
                animation: "pulse 1.5s infinite"
              }}
            />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "1rem",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
        }}
      >
        <div
          style={{
            width: "200px",
            height: "20px",
            borderRadius: "6px",
            backgroundColor: "#e2e8f0",
            animation: "pulse 1.5s infinite"
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                height: "44px",
                borderRadius: "8px",
                backgroundColor: "#f8fafc",
                border: "1px solid #f1f5f9",
                animation: "pulse 1.5s infinite"
              }}
            />
          ))}
        </div>
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
