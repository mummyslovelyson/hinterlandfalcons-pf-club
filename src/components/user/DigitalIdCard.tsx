import React, { useRef } from 'react';
import { UserProfile } from '@/context/UserAuthContext';
import { Button } from '@/components/ui/button';
import { Printer, Shield, CheckCircle2 } from 'lucide-react';

interface DigitalIdCardProps {
  user: UserProfile;
}

export const DigitalIdCard: React.FC<DigitalIdCardProps> = ({ user }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const isApproved = user.status === 'approved' || user.status === 'active';

  const handlePrint = () => {
    const cardElement = document.getElementById('printable-membership-card');
    if (!cardElement) {
      window.print();
      return;
    }

    // Remove any previous print iframe
    const existingIframe = document.getElementById('print-id-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'print-id-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Copy stylesheet links so fonts and assets resolve
    const styleSheets = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <base href="${window.location.origin}" />
          <title>Membership Card - ${user.fullName}</title>
          ${styleSheets}
          <style>
            @page {
              size: landscape;
              margin: 10mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              background-color: #ffffff !important;
              margin: 0 !important;
              padding: 0 !important;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            }
            .print-badge-container {
              width: 680px;
              height: 400px;
              background-color: #ffffff;
              border: 1.5px solid #cbd5e1;
              border-radius: 16px;
              position: relative;
              overflow: hidden;
              padding: 22px 26px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-inside: avoid;
              margin: auto;
            }
            @media print {
              body {
                background: transparent;
                min-height: auto;
              }
              .print-badge-container {
                box-shadow: none !important;
                border: 1px solid #94a3b8 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-badge-container">
            ${cardElement.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Give iframe assets 350ms to settle, then open print dialog
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.print();
      }
    }, 350);
  };

  return (
    <div className="space-y-4">
      {/* Scoped In-Page Print Rules for direct Ctrl+P */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-membership-card,
          #printable-membership-card * {
            visibility: visible !important;
          }
          #printable-membership-card {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: 1.5px solid #94a3b8 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: landscape;
            margin: 0;
          }
        }
      `}</style>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-base font-bold text-slate-900">
              Official Printed Membership ID Card
            </h3>
            {isApproved ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                <CheckCircle2 className="h-3 w-3" />
                Verified Member
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Registration Pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard Landscape PVC ID Badge Format (3.375" × 2.125")
          </p>
        </div>

        <Button
          onClick={handlePrint}
          className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          Print ID Card
        </Button>
      </div>

      {/* Screen Preview Card */}
      <div className="flex justify-center p-2 sm:p-4 bg-slate-100/70 rounded-3xl border border-slate-200 overflow-x-auto">
        <div
          id="printable-membership-card"
          ref={cardRef}
          style={{
            position: 'relative',
            width: '680px',
            minWidth: '680px',
            height: '400px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #cbd5e1',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            padding: '22px 26px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            color: '#0f172a',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        >
          {/* TOP-LEFT GEOMETRIC CORNER ACCENT (Orange & Cyan swoops from reference image) */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '230px',
              height: '175px',
              pointerEvents: 'none',
              zIndex: 1,
            }}
            viewBox="0 0 230 175"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Primary Orange Curved Swoop */}
            <path
              d="M 0 0 L 180 0 C 150 35 125 75 80 150 C 55 170 20 175 0 175 Z"
              fill="#ea580c"
            />
            {/* Secondary Cyan Inner Accent Swoop */}
            <path
              d="M 0 160 C 25 145 55 125 85 90 C 115 55 138 28 172 0 L 190 0 C 150 35 125 75 80 150 C 50 170 15 175 0 175 Z"
              fill="#0284c7"
            />
          </svg>

          {/* BOTTOM-RIGHT GEOMETRIC CORNER ACCENT (Diagonal Orange & Cyan stripes from reference image) */}
          <svg
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '210px',
              height: '160px',
              pointerEvents: 'none',
              zIndex: 1,
            }}
            viewBox="0 0 210 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Large Orange Diagonal Wedge */}
            <polygon points="210,20 210,160 70,160" fill="#ea580c" />
            {/* Inner Cyan Diagonal Accent Wedge */}
            <polygon points="210,80 210,160 130,160" fill="#0284c7" />
          </svg>

          {/* TOP HEADER SECTION */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              marginBottom: '8px',
            }}
          >
            {/* Logo in Elevated White Card (matching top-left logo container in reference) */}
            <div
              style={{
                width: '74px',
                height: '74px',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '6px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.12)',
                border: '1px solid #e2e8f0',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }}
            >
              <img
                src="/falcons-logo.png"
                alt="Falcons Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '10px',
                }}
              />
            </div>

            {/* Header Text & Contact Info */}
            <div style={{ flex: 1, textAlign: 'left', paddingRight: '8px' }}>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 900,
                  color: '#0f172a',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                  margin: '0 0 2px 0',
                  lineHeight: 1.15,
                }}
              >
                Hinterland Falcons Pathfinder Club
              </h2>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#0284c7',
                  fontStyle: 'italic',
                  margin: '0 0 4px 0',
                }}
              >
                "Training for Christian Character, Service & Wilderness Skills"
              </div>
              <div
                style={{
                  fontSize: '9.5px',
                  color: '#475569',
                  fontWeight: 500,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  alignItems: 'center',
                  margin: 0,
                }}
              >
                <span>Phone: +233 24 456 7890</span>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <span>Email: santasi.falcons@gmail.com</span>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <span>Web: santasipathfinders.org</span>
              </div>
              {/* Solid dividing line matching reference image */}
              <div
                style={{
                  width: '100%',
                  height: '2px',
                  backgroundColor: '#0f172a',
                  marginTop: '8px',
                }}
              />
            </div>
          </div>

          {/* MAIN BODY: PORTRAIT PHOTO ON LEFT + TWO-COLUMN ATTRIBUTES ON RIGHT */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginTop: '4px',
              marginBottom: 'auto',
            }}
          >
            {/* Left Photo Frame with Solid Cyan Border */}
            <div
              style={{
                width: '115px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '115px',
                  height: '145px',
                  border: '2.5px solid #0284c7',
                  borderRadius: '4px',
                  backgroundColor: '#f8fafc',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                }}
              >
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.fullName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#f1f5f9',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px',
                      textAlign: 'center',
                    }}
                  >
                    <Shield style={{ width: '32px', height: '32px', color: '#0284c7', marginBottom: '4px' }} />
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 800,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      MEMBER PHOTO
                    </span>
                  </div>
                )}
              </div>
              <span
                style={{
                  fontSize: '8.5px',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginTop: '5px',
                }}
              >
                Official ID Photo
              </span>
            </div>

            {/* Right Side: Key-Value Attributes matching the reference image layout */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '7px',
              }}
            >
              {/* Row 1: Student / Member Name */}
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span
                  style={{
                    width: '130px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#ea580c',
                    flexShrink: 0,
                  }}
                >
                  Student Name:
                </span>
                <span
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#0f172a',
                    flex: 1,
                  }}
                >
                  {user.fullName}
                </span>
              </div>

              {/* Row 2: Student / Member ID */}
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span
                  style={{
                    width: '130px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#ea580c',
                    flexShrink: 0,
                  }}
                >
                  Sudent Id:
                </span>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: '#0f172a',
                    flex: 1,
                  }}
                >
                  {user.id}
                </span>
              </div>

              {/* Row 3: D.O.B */}
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span
                  style={{
                    width: '130px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#ea580c',
                    flexShrink: 0,
                  }}
                >
                  D.O.B:
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    color: '#334155',
                    flex: 1,
                  }}
                >
                  {user.dateOfBirth || '22 November 2012'}
                </span>
              </div>

              {/* Row 4: Home Address */}
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span
                  style={{
                    width: '130px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#ea580c',
                    flexShrink: 0,
                  }}
                >
                  Home Address:
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    color: '#334155',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.address || 'Santasi Anyinam, Kumasi'}
                </span>
              </div>

              {/* Row 5: Contact */}
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span
                  style={{
                    width: '130px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#ea580c',
                    flexShrink: 0,
                  }}
                >
                  Contact:
                </span>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    color: '#334155',
                    flex: 1,
                  }}
                >
                  {user.phone || user.guardianPhone || '+233 24 000 0000'}
                </span>
              </div>

              {/* Row 6: Valid Date */}
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span
                  style={{
                    width: '130px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#ea580c',
                    flexShrink: 0,
                  }}
                >
                  Valid Date:
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    flex: 1,
                  }}
                >
                  2026 – 2027 Season
                </span>
              </div>

              {/* Row 7: Class & Unit */}
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span
                  style={{
                    width: '130px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#ea580c',
                    flexShrink: 0,
                  }}
                >
                  Class & Unit:
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0f172a',
                    flex: 1,
                  }}
                >
                  {user.classLevel || 'Companion'} • Santasi AYM Unit
                </span>
              </div>
            </div>
          </div>

          {/* CARD FOOTER */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              borderTop: '1px solid #e2e8f0',
              paddingTop: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '9.5px',
              color: '#64748b',
              fontWeight: 500,
            }}
          >
            <span>Accredited by Santasi Seventh-day Adventist Youth Ministries</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>
              {user.id.replace(/[^0-9A-Z]/g, '').slice(-8) || '2026-FALCONS'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalIdCard;
