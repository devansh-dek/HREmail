"use client";
import React, { useState } from "react";

type FormState = {
  name: string;
  company: string;
  email: string;
  poc1Name: string;
  poc1Phone: string;
  poc2Name: string;
  poc2Phone: string;
};

export default function Home() {
  const [form, setForm] = useState<FormState>({
    name: "",
    company: "",
    email: "",
    poc1Name: "",
    poc1Phone: "",
    poc2Name: "",
    poc2Phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  // available student contacts to optionally CC (show first names)
  const studentContacts: { email: string; name: string }[] = [
    { email: "bhumika.2023ug3002@iiitranchi.ac.in", name: "Bhumika" },
    { email: "atharv.2023ug3019@iiitranchi.ac.in", name: "Atharv" },
    { email: "abhinav@iiitranchi.ac.in", name: "Abhinav" },
    { email: "devansh.2023ug1058@iiitranchi.ac.in", name: "Devansh" },
    { email: "aman.2023ug1047@iiitranchi.ac.in", name: "Aman" },
  ];
  const templates = [
    { id: "normal", label: "Normal Invitation (default)" },
    { id: "followup", label: "Template 1: Follow-up After a Prior Conversation" },
    { id: "reengage", label: "Template 2: Re-engaging a Past Recruiter" },
    { id: "alumnus", label: "Template 3: Cold Outreach via an Alumnus" },
    { id: "role", label: "Template 4: Proactive Outreach for a Specific Role" },
    { id: "linkedin", label: "Template 5: LinkedIn follow-up" },
  ];

  const [selectedTemplate, setSelectedTemplate] = useState<string>("normal");
  // extra fields used by templates
  const [previousInteraction, setPreviousInteraction] = useState(""); // for followup
  const [alumnusName, setAlumnusName] = useState(""); // for alumnus template
  const [roleName, setRoleName] = useState(""); // for role template

  const validate = () => {
    if (!form.name.trim() || !form.company.trim() || !form.email.trim()) {
      return "Please provide recipient name, company and email.";
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) return "Please enter a valid email address.";
    if (form.poc1Name.trim() && !form.poc1Phone.trim()) {
      return "Please provide a phone number for POC 1.";
    }
    if (form.poc2Name.trim() && !form.poc2Phone.trim()) {
      return "Please provide a phone number for POC 2.";
    }
    if (!form.poc1Name.trim() && form.poc1Phone.trim()) {
      return "Please provide a name for POC 1.";
    }
    if (!form.poc2Name.trim() && form.poc2Phone.trim()) {
      return "Please provide a name for POC 2.";
    }
    return null;
  };

  const handleSubmit = async () => {
    setSuccess(null);
    setError(null);

    const clientValidation = validate();
    if (clientValidation) {
      setError(clientValidation);
      return;
    }

    setLoading(true);

  // create a payload type-safe object
  const payload: any = { ...form, companyName: form.company, template: selectedTemplate };
  // include any selected student contacts to CC
  if (selectedContacts.length) payload.selectedContacts = selectedContacts;
  // include template-specific extras
  if (selectedTemplate === "followup") payload.previousInteraction = previousInteraction;
  if (selectedTemplate === "alumnus") payload.alumnusName = alumnusName;
  if (selectedTemplate === "role") payload.roleName = roleName;

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errMsg = data?.error || data?.message || "Failed to send email";
        throw new Error(errMsg);
      }

      setSuccess("Email sent successfully to " + form.email);
      setForm({ name: "", company: "", email: "", poc1Name: "", poc1Phone: "", poc2Name: "", poc2Phone: "" });
    } catch (err: any) {
      console.error("Send Email Error:", err);
      setError(err?.message || String(err) || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ name: "", company: "", email: "", poc1Name: "", poc1Phone: "", poc2Name: "", poc2Phone: "" });
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200">
              <img
                src="https://res.cloudinary.com/shubh39/image/upload/v1741670080/ewbfrw8yxdbfzhgdegvn.png"
                alt="IIIT Ranchi"
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Placement Communication Portal
          </h1>
          <p className="text-slate-600 text-lg">
            Indian Institute of Information Technology, Ranchi
          </p>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white">
              Corporate Invitation Form
            </h2>
            <p className="text-blue-100 mt-1 text-sm">
              Send formal placement invitations to recruiting organizations
            </p>
          </div>

          <div className="p-8">
            {/* Recipient Information */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-600 rounded"></span>
                Recipient Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Recipient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-slate-50 hover:bg-white text-slate-800 placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Acme Corporation"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-slate-50 hover:bg-white text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                  <input
                    type="email"
                    placeholder="hr@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-slate-50 hover:bg-white text-slate-800 placeholder-slate-400"
                  />
              </div>
            </div>

            {/* Point of Contact Section */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-600 rounded"></span>
                Points of Contact (Optional)
              </h3>

              {/* POC 1 */}
              <div className="bg-slate-50 rounded-lg p-6 mb-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Primary Contact</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Contact Person"
                      value={form.poc1Name}
                      onChange={(e) => setForm({ ...form, poc1Name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white text-slate-800 placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number {form.poc1Name.trim() && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.poc1Phone}
                      onChange={(e) => setForm({ ...form, poc1Phone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* POC 2 */}
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Secondary Contact</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Contact Person"
                      value={form.poc2Name}
                      onChange={(e) => setForm({ ...form, poc2Name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white text-slate-800 placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number {form.poc2Name.trim() && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.poc2Phone}
                      onChange={(e) => setForm({ ...form, poc2Phone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Student CCs */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Optional CC — Student Contacts</h3>
              <p className="text-xs text-slate-500 mb-3">Select any students to CC in the mail (you can select multiple).</p>
              <div className="flex flex-wrap gap-3">
                {studentContacts.map((c) => {
                  const checked = selectedContacts.includes(c.email);
                  return (
                    <label key={c.email} className="inline-flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (checked) setSelectedContacts(selectedContacts.filter((s) => s !== c.email));
                          else setSelectedContacts([...selectedContacts, c.email]);
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">{c.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Template selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* conditional template fields */}
            {selectedTemplate === "followup" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Context of prior conversation (e.g., "at ABC Summit / last week")</label>
                <input value={previousInteraction} onChange={(e) => setPreviousInteraction(e.target.value)} placeholder="e.g. last week at ABC Tech Summit" className="w-full px-4 py-3 border rounded-lg" />
              </div>
            )}

            {selectedTemplate === "alumnus" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Alumnus Name</label>
                <input value={alumnusName} onChange={(e) => setAlumnusName(e.target.value)} placeholder="Alumnus Full Name" className="w-full px-4 py-3 border rounded-lg" />
              </div>
            )}

            {selectedTemplate === "role" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Role / Job Title (e.g., SDE-1)</label>
                <input value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="e.g. SDE-1" className="w-full px-4 py-3 border rounded-lg" />
              </div>
            )}

            {/* Status Messages */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-green-800">{success}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors"
              >
                Reset Form
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Send Invitation</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center mt-6">
              Please note: Email delivery may take a few moments. Kindly wait for confirmation.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>Training & Placement Cell, IIIT Ranchi</p>
        </div>
      </div>
    </div>
  );
}