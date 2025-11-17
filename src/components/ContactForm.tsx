"use client";

import React from "react";
import Image from "next/image";
import notify from "@/utils/notify";

export default function ContactForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [type, setType] = React.useState("Advertising");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const reset = () => {
    setName("");
    setEmail("");
    setSubject("");
    setType("Advertising");
    setMessage("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return notify("error", "Please enter your name.");
    if (!email.trim() || !validateEmail(email)) return notify("error", "Please enter a valid email.");
    if (!subject.trim()) return notify("error", "Please enter subject.");
    if (!message.trim()) return notify("error", "Please enter your message.");
    try {
      setLoading(true);
      // Placeholder for real API call
      await new Promise((res) => setTimeout(res, 700));
      notify("success", "Message sent. We will contact you soon.");
      reset();
    } catch (err) {
      notify("error", "Failed to send message. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full px-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-extrabold text-center text-zinc-900 dark:text-zinc-100 mb-10">Contact us</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* left image */}
          <div className="flex justify-center md:justify-start">
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-lg">
              <div className="relative w-full h-[520px] bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
                <Image src="/images/contact-chef.jpg" alt="chef" fill className="object-cover" />
              </div>
            </div>
          </div>

          {/* right form */}
          <div>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <div className="text-xs text-zinc-500 mb-2">Name</div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:bg-transparent dark:border-zinc-700"
                    placeholder="Enter your name..."
                    aria-label="Name"
                  />
                </label>

                <label className="block">
                  <div className="text-xs text-zinc-500 mb-2">Email address</div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:bg-transparent dark:border-zinc-700"
                    placeholder="Your email address..."
                    aria-label="Email"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <div className="text-xs text-zinc-500 mb-2">Subject</div>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:bg-transparent dark:border-zinc-700"
                    placeholder="Enter subject..."
                    aria-label="Subject"
                  />
                </label>

                <label className="block">
                  <div className="text-xs text-zinc-500 mb-2">Enquiry type</div>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:bg-transparent dark:border-zinc-700"
                    aria-label="Enquiry type"
                  >
                    <option>Advertising</option>
                    <option>Partnership</option>
                    <option>Support</option>
                    <option>General</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <div className="text-xs text-zinc-500 mb-2">Messages</div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:bg-transparent dark:border-zinc-700"
                  placeholder="Enter your messages..."
                  aria-label="Message"
                />
              </label>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-xl bg-black text-white hover:opacity-95 disabled:opacity-60"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
