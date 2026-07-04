import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useSubmitContactMessageMutation } from "../api/storefrontApi";

const CONTACT_INFO = [
  {
    icon: MapPin,
    color: "#07b6b0",
    bg: "#07b6b015",
    label: "Our Location",
    lines: ["Okorodafe Roundabout, Market Rd", "Oteri 333105, Delta, Nigeria"],
  },
  {
    icon: Phone,
    color: "#8b5cf6",
    bg: "#8b5cf615",
    label: "Phone",
    lines: ["+234 703 878 4788", "Mon–Sat, 9am–6pm"],
  },
  {
    icon: Mail,
    color: "#f59e0b",
    bg: "#f59e0b15",
    label: "Email",
    lines: ["support@sammytechgadgets.com", "We reply within 24 hours"],
  },
  {
    icon: Clock,
    color: "#ef4444",
    bg: "#ef444415",
    label: "Business Hours",
    lines: ["Mon – Sat: 9:00 AM – 6:00 PM", "Sun: 10:00 AM – 4:00 PM"],
  },
];

function inputCls(error) {
  return `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-50 bg-white ${
    error ? "border-red-300" : "border-neutral-200"
  }`;
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitContactMessage, { isLoading: loading }] = useSubmitContactMessageMutation();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    try {
      await submitContactMessage(form).unwrap();
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-4">
            Get In Touch
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            We'd love to hear from you
          </h1>
          <p className="mt-3 text-primary-100 text-lg max-w-lg mx-auto">
            Have a question, complaint, or compliment? Our team is here to help — usually within 24 hours.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Contact info ───────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-800">Contact Information</h2>
              <p className="text-sm text-neutral-500 mt-1">
                Reach us through any of the channels below and we'll get back to you as soon as possible.
              </p>
            </div>

            <div className="space-y-3">
              {CONTACT_INFO.map(({ icon: Icon, color, bg, label, lines }) => (
                <div
                  key={label}
                  className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-4 hover:shadow-sm transition-shadow"
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: bg }}
                  >
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">{label}</p>
                    {lines.map((l) => (
                      <p key={l} className="text-sm font-medium text-neutral-700 mt-0.5">{l}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Contact form ───────────────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 sm:p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary-50 flex items-center justify-center">
                    <CheckCircle size={32} className="text-primary-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-800">Message Sent!</h3>
                    <p className="text-neutral-500 text-sm mt-1 max-w-sm">
                      Thanks for reaching out, {form.name.split(" ")[0]}. We'll get back to you at{" "}
                      <span className="font-medium text-neutral-700">{form.email}</span> within 24 hours.
                    </p>
                  </div>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="mt-2 text-sm text-primary-600 hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-neutral-800 mb-6">Send us a message</h2>
                  {submitError && (
                    <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                      <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-600">{submitError}</p>
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                          Full Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          value={form.name}
                          onChange={set("name")}
                          placeholder="John Doe"
                          className={inputCls(errors.name)}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                          Email Address <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={set("email")}
                          placeholder="john@example.com"
                          className={inputCls(errors.email)}
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                        Subject <span className="text-red-400">*</span>
                      </label>
                      <input
                        value={form.subject}
                        onChange={set("subject")}
                        placeholder="What's this about?"
                        className={inputCls(errors.subject)}
                      />
                      {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                        Message <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        rows={5}
                        value={form.message}
                        onChange={set("message")}
                        placeholder="Tell us how we can help…"
                        className={inputCls(errors.message) + " resize-none"}
                      />
                      {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors shadow-sm"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
