import { useRef } from "react";
import Modal from "./Modal";

export default function StudentCardModal({ student, onClose }) {
  const cardRef = useRef(null);

  if (!student) return null;

  const { user, matricule, enrollments } = student;
  const currentClass = enrollments?.[0]?.classroom?.name || "Non assigné";
  
  // Utiliser la photo uploadée, ou un fallback réaliste généré
  const photoUrl = user?.photoUrl 
    ? (user.photoUrl.startsWith("http") ? user.photoUrl : `http://localhost:3001${user.photoUrl}`)
    : `https://i.pravatar.cc/200?u=${user?.email || matricule}`;
  // Générer un vrai QR Code avec le matricule de l'étudiant
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=SMARTSCHOOL-${matricule}`;

  function handlePrint() {
    window.print();
  }

  return (
    <Modal open={true} title="Carte d'identité scolaire" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30, padding: "20px 0" }}>
        
        {/* La Carte - Format CR80 Portrait (approx 320x510) */}
        <div 
          ref={cardRef}
          className="student-id-card"
          style={{
            width: 320,
            height: 510,
            background: "#ffffff",
            borderRadius: 18,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header & Photo Background */}
          <div style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
            height: 180,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 24,
            color: "#ffffff",
            position: "relative",
            clipPath: "polygon(0 0, 100% 0, 100% 85%, 0% 100%)" // Biseau dynamique
          }}>
            {/* Pattern de fond stylé */}
            <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 8, zIndex: 1 }}>
              <div style={{ width: 24, height: 24, background: "#fff", color: "#4f46e5", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14 }}>S</div>
              <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5 }}>SMARTSCHOOL</div>
            </div>
            <div style={{ fontSize: 9, opacity: 0.9, letterSpacing: 3, textTransform: "uppercase", marginTop: 4, zIndex: 1 }}>
              Carte Étudiant 2025/2026
            </div>
          </div>

          {/* Photo */}
          <div style={{
            marginTop: -70,
            alignSelf: "center",
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "#ffffff",
            padding: 4,
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
            zIndex: 2,
            position: "relative"
          }}>
            <img 
              src={photoUrl} 
              alt="Photo étudiant" 
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
            />
            {/* Petit badge vert en ligne */}
            <div style={{ position: "absolute", bottom: 8, right: 8, width: 16, height: 16, background: "#10b981", border: "3px solid #fff", borderRadius: "50%" }}></div>
          </div>

          {/* Infos principales */}
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: "#111827", letterSpacing: -0.5 }}>
              {user?.firstName} <span style={{ textTransform: "uppercase" }}>{user?.lastName}</span>
            </h2>
            <div style={{ display: "inline-block", background: "#eff6ff", color: "#1d4ed8", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
              Classe : {currentClass}
            </div>

            {/* Détails techniques */}
            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f8f9fc", borderRadius: 12, border: "1px solid #f3f4f6" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 9, color: "#9ca3af", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>ID Matricule</div>
                <div style={{ fontSize: 13, color: "#111827", fontWeight: 700, fontFamily: "monospace" }}>{matricule}</div>
              </div>
              <div style={{ width: 1, height: 30, background: "#e5e7eb" }}></div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: "#9ca3af", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>Né(e) le</div>
                <div style={{ fontSize: 12, color: "#111827", fontWeight: 600 }}>12 Sept. 2008</div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}></div>

          {/* Footer QR Code */}
          <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f3f4f6", background: "#fafafa" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png" 
                   srcSet={qrCodeUrl} /* Hack pour le chargement, mais on force le QR code dynamique */
                   alt="QR Code" 
                   style={{ width: 50, height: 50, mixBlendMode: "multiply" }} 
              />
            </div>
            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 9, color: "#6b7280", fontWeight: 500, fontStyle: "italic" }}>
                Signature Directeur
              </div>
              <div style={{ fontFamily: "'Brush Script MT', cursive", fontSize: 20, color: "#111827", transform: "rotate(-5deg)", marginRight: 10 }}>
                A. Ndiaye
              </div>
            </div>
          </div>
        </div>

        {/* Bouton d'action */}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handlePrint} className="btn btn-primary" style={{ padding: "12px 28px", fontSize: 15, borderRadius: 99, boxShadow: "0 8px 20px rgba(99,102,241,0.3)" }}>
            🖨️ Lancer l'impression
          </button>
        </div>
      </div>
      
      {/* Styles d'impression CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: auto; margin: 0; }
          body { background: white; margin: 0; padding: 0; }
          body > :not(.modal-overlay) { display: none !important; }
          .modal-overlay { position: static; background: transparent; padding: 0; animation: none; display: block; }
          .modal-box { box-shadow: none; border: none; max-width: none; animation: none; padding: 0; margin: 0; }
          .modal-header, .btn, button { display: none !important; }
          .student-id-card { 
            position: absolute; 
            left: 50%; 
            top: 50px; 
            transform: translateX(-50%); 
            box-shadow: none !important; 
            border: 2px dashed #ccc !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />
    </Modal>
  );
}
