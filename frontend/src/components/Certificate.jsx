import React, { useRef, useEffect } from 'react';
import { Download, Award, X } from 'lucide-react';

export default function Certificate({ volunteerName, totalHours, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    drawCertificate();
  }, [volunteerName, totalHours]);

  const drawCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 1920x1080 resolution
    canvas.width = 1920;
    canvas.height = 1080;

    // --- BACKGROUND ---
    // Deep premium background gradient
    const bgGrad = ctx.createRadialGradient(960, 540, 100, 960, 540, 1000);
    bgGrad.addColorStop(0, '#12162d');
    bgGrad.addColorStop(1, '#080911');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1920, 1080);

    // --- DECORATIVE MESH / GLOWS ---
    // Top-left purple glow
    const glow1 = ctx.createRadialGradient(0, 0, 50, 0, 0, 600);
    glow1.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
    glow1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, 1920, 1080);

    // Bottom-right cyan glow
    const glow2 = ctx.createRadialGradient(1920, 1080, 50, 1920, 1080, 600);
    glow2.addColorStop(0, 'rgba(6, 182, 212, 0.12)');
    glow2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, 1920, 1080);

    // --- BORDERS ---
    // Outer border (thin gold/bronze)
    ctx.strokeStyle = '#c5a880';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, 1800, 960);

    // Inner border (thicker with decorative corners)
    ctx.strokeStyle = '#c5a880';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(80, 80, 1760, 920);

    // Draw corner designs
    const drawCorner = (x, y, xDir, yDir) => {
      ctx.beginPath();
      ctx.strokeStyle = '#c5a880';
      ctx.lineWidth = 4;
      ctx.moveTo(x + xDir * 60, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + yDir * 60);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = '#c5a880';
      ctx.arc(x + xDir * 20, y + yDir * 20, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    drawCorner(80, 80, 1, 1);       // Top-Left
    drawCorner(1840, 80, -1, 1);    // Top-Right
    drawCorner(80, 1000, 1, -1);    // Bottom-Left
    drawCorner(1840, 1000, -1, -1); // Bottom-Right

    // --- TEXT CONTENT ---
    
    // Header Organization
    ctx.font = 'bold 24px Outfit, sans-serif';
    ctx.fillStyle = '#a78bfa'; // violet accent
    ctx.textAlign = 'center';
    ctx.fillText('VOLUNTRACK COMMUNITY NETWORK', 960, 180);

    // Certificate title
    ctx.font = 'bold 72px Outfit, sans-serif';
    ctx.fillStyle = '#f3f4f6'; // primary text
    ctx.fillText('CERTIFICATE OF APPRECIATION', 960, 290);

    // Subtitle
    ctx.font = 'italic 28px Inter, sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('THIS CERTIFICATE IS PROUDLY PRESENTED TO', 960, 390);

    // Volunteer Name (Large & Glowing)
    ctx.font = '800 84px Outfit, sans-serif';
    // Create text gradient for name
    const textGrad = ctx.createLinearGradient(600, 0, 1320, 0);
    textGrad.addColorStop(0, '#f59e0b'); // gold
    textGrad.addColorStop(0.5, '#fef08a'); // bright gold
    textGrad.addColorStop(1, '#d97706'); // dark gold
    ctx.fillStyle = textGrad;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.3)';
    ctx.shadowBlur = 15;
    ctx.fillText(volunteerName.toUpperCase(), 960, 520);
    ctx.shadowBlur = 0; // reset shadow

    // Line under name
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(197, 168, 128, 0.3)';
    ctx.lineWidth = 2;
    ctx.moveTo(600, 560);
    ctx.lineTo(1320, 560);
    ctx.stroke();

    // Body Text
    ctx.font = '300 28px Inter, sans-serif';
    ctx.fillStyle = '#d4d4d8';
    
    const line1 = `In recognition of outstanding dedication, service, and exemplary citizenship.`;
    const line2 = `For committing a total of ${totalHours} hours of service and providing impactful, positive change`;
    const line3 = `to our community events and local outreach programs.`;
    
    ctx.fillText(line1, 960, 630);
    ctx.fillText(line2, 960, 680);
    ctx.fillText(line3, 960, 730);

    // --- SEAL ---
    // Draw gold award badge seal in center bottom
    const sealY = 870;
    ctx.beginPath();
    ctx.arc(960, sealY, 60, 0, Math.PI * 2);
    ctx.fillStyle = '#c5a880';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // Draw seal star details
    ctx.fillStyle = '#12162d';
    ctx.font = 'bold 36px Outfit, sans-serif';
    ctx.fillText('★', 960, sealY + 12);

    // Signatures
    // Left signature (Volunteer Coordinator)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.moveTo(350, 890);
    ctx.lineTo(650, 890);
    ctx.stroke();
    
    ctx.font = 'bold 20px Outfit, sans-serif';
    ctx.fillStyle = '#f3f4f6';
    ctx.fillText('Alex Rivers', 500, 920);
    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('Volunteer Coordinator', 500, 945);

    // Right signature (Executive Director)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.moveTo(1270, 890);
    ctx.lineTo(1570, 890);
    ctx.stroke();

    ctx.font = 'bold 20px Outfit, sans-serif';
    ctx.fillStyle = '#f3f4f6';
    ctx.fillText('Sarah Jenkins', 1420, 920);
    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('Executive Director', 1420, 945);

    // Date in seal area
    ctx.font = 'bold 16px Outfit, sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText(`DATE: ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`, 960, 970);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${volunteerName.replace(/\s+/g, '_')}_Volunteer_Certificate.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award className="text-primary" />
            Your Certificate of Appreciation
          </h3>
          <button className="btn btn-secondary" style={{ padding: '0.25rem', border: 'none', background: 'none' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', background: '#090a10' }}>
          {/* Preview Canvas scaled down via CSS */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', maxWidth: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
            This certificate verifies your active participation in community programs. You can download a high-resolution version for printing or sharing.
          </p>
        </div>
        <div className="modal-footer" style={{ background: 'var(--bg-secondary)' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handleDownload}>
            <Download size={16} />
            Download (PNG)
          </button>
        </div>
      </div>
    </div>
  );
}
