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
    <head></head>
    <body>
    <p style="white-space: pre-line;">Dear ${escapeHtml(name)},</p>

    <p>Greetings from the <strong>Indian Institute of Information Technology, Ranchi!</strong></p>

    <p>We are delighted to invite your esteemed organization <strong>${escapeHtml(
      companyName
    )}</strong> to participate in the <strong>Placement/Internship drive</strong> of the Institute for the academic session <strong>2025-2026</strong>.</p>

    <p>Established in <strong>2016</strong>, <strong>IIIT Ranchi</strong> is a premier institute of national importance, created as part of a visionary initiative by the <strong>Ministry of Education, Government of India</strong>. With a focus on bridging academia and industry, <strong>IIIT Ranchi</strong> has rapidly become a hub of innovation, excellence, and future-ready talent, shaping the next generation of engineers and technologists.</p>

    <p><strong>Batch Demographics:</strong></p>
    <ul>
    <li><strong>B.Tech. CSE:</strong> <strong>115 students</strong></li>
    <li><strong>B.Tech. ECE:</strong> <strong>80 students</strong></li>
    <li><strong>B.Tech. CSE (DS&AI):</strong> <strong>30 students</strong></li>
    <li><strong>B.Tech. ECE (ES&IoT):</strong> <strong>26 students</strong></li>
    </ul>

    <p><strong>Track Record:</strong><br>We take immense pride in our students’ achievements, including:</p>
    <ul>
    <li>Securing positions in top-tier companies like <strong>Google, Amazon, Atlassian, Adobe, Walmart, NVIDIA, Flipkart, Cisco, NASDAQ, MPL, AngleOne, OnePlus, Intuit, Productiv, Zeotap, Commvault, American Express, VMware, Tekion Corp, Infoedge, Rakuten</strong>, and more.</li>
    <li>Excelling in <strong>Google Summer of Code (GSoC'25)</strong> where <strong>two students from the 2026 batch and one student from the 2027 batch</strong>, were selected.</li>
    <li>Representing the institute in <strong>ICPC 2025, with two teams securing ranks 48, 65, and 66</strong> in the <strong>Amritapuri and Kanpur regionals</strong>, continuing our legacy of strong competitive programming representation.</li>
    <li>Demonstrating exceptional skills in competitive programming, with numerous students earning <strong>Specialist, Expert, and Candidate Master</strong> rankings on <strong>Codeforces</strong>, and <strong>6-star, 5-star, and 4-star</strong> rankings on <strong>CodeChef</strong>.</li>
    <li>Achieving outstanding placement outcomes — with the </strong> highest package for the batch graduating in 2025 reaching ₹54 LPA</strong>.</li>
    </ul>

    <p>To facilitate your participation, we kindly request you to complete the attached <strong><a href="https://docs.google.com/forms/d/e/1FAIpQLSceAnAp4n1QLqntnxTNrU-nqcCSLhRCuSY7X8zYtHjcNWjoYw/viewform">Job Notification Form</a></strong> with your requirements and offerings. The <strong>Training and Placement Cell</strong> will schedule the placement process as per the criteria outlined in our <strong>Placement Policy</strong>.</p>

    <p>For more information about our programs, achievements, and policies, please refer to the attached <strong>Placement Brochure</strong>.</p>

    <p><strong>Placement Brochure:</strong> <a href="https://drive.google.com/file/d/1TQQBsLv-MP_R7Mfso6lf3jnHy7649mbl/view?usp=sharing">View Brochure</a><br>

    <p>If you need any assistance or information, please reach out to our student coordinators. We'd be more than happy to assist.</p>

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
      <p style="margin: 0; font-size: 14px; color: #1a5276;">Placement cum Public Relation Officer,</p>
      <p style="margin: 0; font-size: 14px; color: #1a5276;">Training and Placement Cell,</p>
      <p style="margin: 0; font-size: 14px; color: #1a5276;">Indian Institute of Information Technology, Ranchi</p>
      <p style="margin: 2px 0; font-style: italic; font-size: 12px; color: #555;">(An institute of national importance under MoE, Govt. of India)</p>

      <div style="margin-top: 8px; font-size: 13px;">
        <p style="margin: 0;">Mobile: +91-9936367853</p>
        <p style="margin: 0;">Email: <a href="mailto:tpo@iiitranchi.ac.in" style="color: #1a5276; text-decoration: none;">tpo@iiitranchi.ac.in</a></p>
        <p style="margin: 0;"><a href="http://www.iiitranchi.ac.in" style="color: #1a5276; text-decoration: none;">www.iiitranchi.ac.in</a></p>
      </div>
    </div>
  </div>
</div>
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
      selectedContacts,
      template,
      previousInteraction,
      alumnusName,
      roleName,
    } = rawBody as any;

    const companyName = (companyNameFromBody || company || "").toString().trim();

    // Fallback to defaults if empty
    const finalPOC1Name = (poc1Name?.toString().trim()) || "Rishabh Raj";
    const finalPOC1Phone = (poc1Phone?.toString().trim()) || "+91 7782958750";

    const finalPOC2Name = (poc2Name?.toString().trim()) || "Atharv Mittal";
    const finalPOC2Phone = (poc2Phone?.toString().trim()) || "+91 8299027502";

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

    // Build CC list: always include TPC in-charge and any selected student contacts
    const defaultCc = ["incharge.tpc@iiitranchi.ac.in"];
    const extraCc = Array.isArray(selectedContacts)
      ? selectedContacts.map((s: any) => String(s).trim()).filter((s: string) => s)
      : [];
    const ccList = Array.from(new Set([...defaultCc, ...extraCc]));

    // Build subject and html based on selected template
    const tpl = (template || "normal").toString();
    let subject = "Invitation to Participate in IIIT Ranchi's 2025-26 Campus Placement Drive";
    let htmlBody = createEmailBody(name, companyName, finalPOC1Name, finalPOC1Phone, finalPOC2Name, finalPOC2Phone);

    if (tpl === "followup") {
      subject = `Following up on our discussion: IIIT Ranchi Placement Drive 2025-26`;
      const ctx = previousInteraction ? ` ${escapeHtml(previousInteraction)}` : "";
      htmlBody = `<p>It was a pleasure speaking with you${ctx}.</p>\n` + htmlBody;
    } else if (tpl === "reengage") {
      subject = `Continuing our Partnership: IIIT Ranchi Placement Drive 2025-26 & ${companyName}`;
      htmlBody = `<p>We have had the privilege of collaborating with <strong>${escapeHtml(companyName)}</strong> for our past placement drives, and we would be delighted to continue this relationship.</p>\n` + htmlBody;
    } else if (tpl === "alumnus") {
      subject = `IIIT Ranchi TAP Coordinator - Request for ${companyName} Partnership`;
      const alumnus = alumnusName ? escapeHtml(alumnusName) : "An alumnus";
      htmlBody = `<p>My name is ${alumnus}, and I'm a TAP Coordinator at IIIT Ranchi. As an alumnus of the institute, we were hoping you could help connect us to the right recruiting team at <strong>${escapeHtml(companyName)}</strong>.</p>\n` + htmlBody;
    } else if (tpl === "role") {
      const role = roleName ? escapeHtml(roleName) : "the role";
      subject = `IIIT Ranchi - Strong Candidates for your ${role} Opening`;
      htmlBody = `<p>I noticed that <strong>${escapeHtml(companyName)}</strong> is hiring for <strong>${role}</strong>. We have students who are an excellent match and can be considered for this opening.</p>\n` + htmlBody;
    } else if (tpl === "linkedin") {
      const ctx = previousInteraction ? ` ${escapeHtml(previousInteraction)}` : "";
      subject = `Following up on our LinkedIn conversation: IIIT Ranchi Placement Drive 2025-26`;
      htmlBody = `<p>Following up on our LinkedIn conversation${ctx}.</p>\n` + htmlBody;
    }

    await transporter.sendMail({
      from: `"IIIT Ranchi - Placement" <${process.env.EMAIL_ADDRESS}>`,
      to: email,
      cc: ccList,
      subject,
      html: htmlBody,
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
