// @ts-ignore: no declaration file for 'nodemailer' in this project
import nodemailer from "nodemailer";

// HTML escaping function
function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Email template function
function createEmailBody(name: string, companyName: string,finalPOC1Name: string , finalPOC1Phone: string , finalPOC2Name: string , finalPOC2Phone: string) {
  return `
    <html>
    <body>
    <p style="white-space: pre-line;">Dear ${escapeHtml(name)},</p>

    <p>Greetings from the <strong>Indian Institute of Information Technology, Ranchi!</strong></p>

    <p>We are delighted to invite your esteemed organization <strong>${escapeHtml(companyName)}</strong> to participate in the <strong>Placement/Internship drive</strong> of the Institute for the academic session <strong>2025-2026</strong>.</p>

    <p>Established in <strong>2016</strong>, <strong>IIIT Ranchi</strong> is a premier institute of national importance...</p>

    <p><strong>Placement Brochure:</strong> <a href="https://drive.google.com/file/d/1TQQBsLv-MP_R7Mfso6lf3jnHy7649mbl/view?usp=sharing">View Brochure</a></p>

<p><strong>${escapeHtml(finalPOC1Name)}</strong> - ${escapeHtml(finalPOC1Phone)}<br>
<strong>${escapeHtml(finalPOC2Name)}</strong> - ${escapeHtml(finalPOC2Phone)}</p>

    <div style="font-family: Arial, sans-serif; max-width: 500px; color: #333333;">
      <p style="margin-bottom: 15px; font-weight: bold;">Thanks & regards,</p>
      <div style="display: flex; align-items: flex-start;">
        <div style="margin-right: 15px;">
          <img src="https://res.cloudinary.com/shubh39/image/upload/v1741670080/ewbfrw8yxdbfzhgdegvn.png" alt="IIIT Ranchi Logo" style="width: 80px; height: 80px;" />
        </div>
        <div>
          <p style="margin: 0; font-weight: bold; color: #1a5276; font-size: 16px;">Sonali Malviya</p>
          <p style="margin: 0; font-size: 14px;">Placement cum Public Relation Officer</p>
          <p style="margin: 0; font-size: 14px;">Training and Placement Cell</p>
          <p style="margin: 0; font-size: 14px;">Indian Institute of Information Technology, Ranchi</p>
        </div>
      </div>
    </div>
    </body>
    </html>
  `;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();

    // Accept either `companyName` or `company` from client
    const {
      email,
      companyName: companyNameFromBody,
      company,
      name,
      poc1Name,
      poc1Phone,
      poc2Name,
      poc2Phone,
    } = rawBody as any;

    const companyName = (companyNameFromBody || company || "").toString().trim();

    // Fallback to defaults if empty
    const finalPOC1Name = (poc1Name?.toString().trim()) || "Akshat Kumar";
    const finalPOC1Phone = (poc1Phone?.toString().trim()) || "+91 8498972554";

    const finalPOC2Name = (poc2Name?.toString().trim()) || "Shubh Shubhanjal";
    const finalPOC2Phone = (poc2Phone?.toString().trim()) || "+91 9508112887";

    if (!email || !companyName || !name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, companyName, or name" }),
        { status: 400 }
      );
    }

    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    // Trim credentials to avoid hidden whitespace mistakes
    const smtpUser = process.env.EMAIL_ADDRESS?.toString().trim();
    const smtpPass = process.env.EMAIL_PASSWORD?.toString().trim();

    // Masked debug log for local troubleshooting — do NOT commit secrets
    console.debug("SMTP user configured:", smtpUser ? `${smtpUser.slice(0, 3)}***` : "(not set)");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER || "smtp.gmail.com",
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports (STARTTLS uses 587)
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Verify transporter connection before sending for clearer errors
    try {
      // transporter.verify can help surface auth/connectivity issues early
      // some transports may not implement verify; wrap in try/catch
      if (typeof (transporter as any).verify === "function") {
        await (transporter as any).verify();
      }
    } catch (verifyErr: any) {
      console.error("Transporter verify failed:", verifyErr);
      return new Response(
        JSON.stringify({ error: "Failed to connect to SMTP server", details: verifyErr?.message || verifyErr }),
        { status: 500 }
      );
    }

    await transporter.sendMail({
      from: `"IIIT Ranchi - Placement" <${process.env.EMAIL_ADDRESS}>`,
      to: email,
      subject:
        "Invitation to Participate in IIIT Ranchi's 2025-26 Campus Placement Drive",
      html: createEmailBody(name, companyName, finalPOC1Name, finalPOC1Phone, finalPOC2Name, finalPOC2Phone),
    });

    return new Response(
      JSON.stringify({
        message: "✅ Email sent successfully",
        recipient: { email, companyName, name },
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Email Error:", error);
    return new Response(
      JSON.stringify({
        error: "Email send failed",
        details: error?.message || String(error),
      }),
      { status: 500 }
    );
  }
}
