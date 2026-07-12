export function VoicePlayer({ voiceUrl }: { voiceUrl?: string }) {
  if (!voiceUrl) return null;
  return (
    <div className="card">
      <h2>Listen to Fork Report</h2>
      <audio controls src={voiceUrl} style={{ width: "100%", marginTop: "0.75rem" }}>
        Your browser does not support audio.
      </audio>
    </div>
  );
}
