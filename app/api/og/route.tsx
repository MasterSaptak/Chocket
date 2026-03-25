import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Dynamic parameters
    const title = searchParams.get('title') || 'Chocket Premium';
    const price = searchParams.get('price') || '';
    const image = searchParams.get('image') || 'https://chocket.saptech.online/celebration-chocolate.png';

    // Premium Color Palette
    const bgDark = '#0D0705';
    const accentGold = '#D4AF37';
    const textCream = '#FFF3E0';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: bgDark,
            backgroundImage: `radial-gradient(circle at top right, #2C1A12, ${bgDark}), radial-gradient(circle at bottom left, #1A0F0B, ${bgDark})`,
            color: textCream,
            padding: '60px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Decorative Corner Element */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '300px',
              height: '300px',
              background: `radial-gradient(circle at 100% 0%, ${accentGold}22, transparent 70%)`,
            }}
          />

          {/* Logo / Brand Header */}
          <div
            style={{
              position: 'absolute',
              top: '50px',
              left: '60px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: `linear-gradient(135deg, ${accentGold}, #C5A55A)`,
                transform: 'rotate(45deg)',
                border: `1px solid ${textCream}44`,
              }}
            />
            <span style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '0.2em', marginLeft: '5px' }}>CHOCKET</span>
          </div>

          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '40px',
            }}
          >
            {/* Left Content: Product Details */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                gap: '24px',
                paddingRight: '40px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    color: accentGold,
                    fontSize: '18px',
                    fontWeight: 'bold',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Limited Edition
                </div>
                <div
                  style={{
                    fontSize: '64px',
                    fontWeight: '900',
                    lineHeight: '1.1',
                    color: textCream,
                    wordBreak: 'break-word',
                  }}
                >
                  {title}
                </div>
              </div>
              
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginTop: '10px',
                }}
              >
                <div
                  style={{
                    backgroundColor: `${accentGold}20`,
                    padding: '10px 24px',
                    borderRadius: '50px',
                    border: `1px solid ${accentGold}50`,
                    color: accentGold,
                    fontSize: '28px',
                    fontWeight: 'bold',
                  }}
                >
                  {price}
                </div>
                <div style={{ fontSize: '22px', color: `${textCream}66` }}>World-Class Gifting</div>
              </div>

              <div
                style={{
                  marginTop: '40px',
                  fontSize: '18px',
                  color: `${textCream}88`,
                  maxWidth: '450px',
                  lineHeight: '1.5',
                  fontStyle: 'italic',
                }}
              >
                "The ultimate expression of chocolate craftsmanship. Handpicked for the discerning palate."
              </div>
            </div>

            {/* Right Content: Product Showcase */}
            <div
              style={{
                display: 'flex',
                width: '420px',
                height: '420px',
                position: 'relative',
              }}
            >
              {/* Outer Glow Effect */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-30px',
                  borderRadius: '50%',
                  background: `${accentGold}15`,
                  filter: 'blur(50px)',
                }}
              />
              
              {/* Frame Accent */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-2px',
                  borderRadius: '42px',
                  background: `linear-gradient(135deg, ${accentGold}88, transparent)`,
                  padding: '1px',
                }}
              />

              {/* Product Image */}
              <img
                src={image}
                alt={title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '40px',
                  background: '#1A0F0B',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
                }}
              />
              
              {/* Freshness Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: accentGold,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: bgDark,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  padding: '10px',
                  transform: 'rotate(15deg)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                  border: `4px solid ${bgDark}`,
                }}
              >
                GLOBAL DELIVERY
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div
            style={{
              position: 'absolute',
              bottom: '50px',
              left: '60px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: `${textCream}44`,
            }}
          >
            <div style={{ width: '80px', height: '1px', backgroundColor: `${textCream}22` }} />
            <span style={{ fontSize: '14px', letterSpacing: '0.1em' }}>EXPERIENCE LUXURY AT CHOCKET.SAPTECH.ONLINE</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(`OG Generation Error: ${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
