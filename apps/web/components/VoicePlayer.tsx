export function VoicePlayer({ voiceUrl }: { voiceUrl?: string }) {
  if (!voiceUrl) {
    return (
      <div className="card">
        <h2>Ruler verdict (ElevenLabs)</h2>
        <p className="text-detail">
          Voice brief generates when ELEVENLABS_API_KEY is set and workers report to Ruler.
        </p>
      </div>
    );
  }
  return (
    <div className="card">
      <h2>Ruler verdict (ElevenLabs)</h2>
      <p className="text-detail">
        The Ruler speaks after all workers report in.
      </p>
      <audio controls src={voiceUrl}>
        Your browser does not support audio.
      </audio>
      <p className="text-detail">The same verdict and evidence remain available as text in this report.</p>
    </div>
  );
}
