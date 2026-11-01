import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") || "দৈনিক বাংলাদেশ বার্তা - সত্য ও তথ্যের সাথে নির্ভীক সাংবাদিকতা";
    const category = searchParams.get("category") || "জাতীয় সংবাদ";
    const image = searchParams.get("image");
    const author = searchParams.get("author") || "নিজস্ব প্রতিবেদক";
    const date = searchParams.get("date") || "আজকের তাজা খবর";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#09090b",
            color: "#ffffff",
            position: "relative",
            fontFamily: "sans-serif",
          }}
        >
          {/* Background image with overlay if provided */}
          {image && (
            <img
              src={image}
              alt=""
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.28,
              }}
            />
          )}

          {/* Gradient Overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(180deg, rgba(9, 9, 11, 0.6) 0%, rgba(9, 9, 11, 0.95) 70%, #09090b 100%)",
            }}
          />

          {/* Top Brand Header */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "40px 60px 20px 60px",
              borderBottom: "2px solid #C8102E",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  backgroundColor: "#C8102E",
                  borderRadius: "4px",
                }}
              />
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "-0.5px",
                }}
              >
                দৈনিক বাংলাদেশ বার্তা
              </span>
              <span
                style={{
                  backgroundColor: "#27272a",
                  color: "#a1a1aa",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginLeft: "8px",
                }}
              >
                অনলাইন সংস্করণ
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#C8102E",
                color: "#ffffff",
                padding: "8px 20px",
                borderRadius: "6px",
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              {category}
            </div>
          </div>

          {/* Main Title Area */}
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              padding: "0 60px",
            }}
          >
            <h1
              style={{
                fontSize: title.length > 80 ? "46px" : title.length > 50 ? "54px" : "62px",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.25,
                margin: 0,
                textShadow: "0 2px 10px rgba(0,0,0,0.8)",
              }}
            >
              {title}
            </h1>
          </div>

          {/* Bottom Footer Bar */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "24px 60px 40px 60px",
              borderTop: "1px solid #27272a",
              color: "#a1a1aa",
              fontSize: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <span style={{ color: "#ffffff", fontWeight: 600 }}>✍ {author}</span>
              <span>•</span>
              <span>📅 {date}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#ef4444", fontWeight: 700 }}>●</span>
              <span style={{ color: "#d4d4d8", fontWeight: 600 }}>
                bangladeshi-news-portal.onrender.com
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    console.error("OG Image generation error:", error);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
