export function VoicePlayer({ voiceUrl }: { voiceUrl?: string }) {
  if (!voiceUrl) {
    return (
      <div className="card">
        <h2>Ruler verdict (ElevenLabs)</h2>
        <p style={{ color: "#999", marginTop: "0.5rem" }}>
          Voice brief generates when ELEVENLABS_API_KEY is set and workers report to Ruler.
        </p>
      </div>
    );
  }
  return (
    <div className="card">
      <h2>Ruler verdict (ElevenLabs)</h2>
      <p style={{ color: "#999", fontSize: "0.875rem", marginTop: "0.25rem" }}>
        The Ruler speaks after all workers report in.
      </p>
      <audio controls src={voiceUrl} style={{ width: "100%", marginTop: "0.75rem" }}>
        Your browser does not support audio.
      </audio>
    </div>
  );
}
