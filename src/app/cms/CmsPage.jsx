"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Head from "next/head";
import "./contact.css";
import PageLayout from "../components/PageLayout";

export default function CmsPage() {

  const { slug } = useParams();

  const API =
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    "https://kzarre-backend.vercel.app";

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (!slug) return;

    async function fetchPage() {
      try {

        setLoading(true);

        const res = await fetch(`${API}/api/admin/public/pages/${slug}`);

        const data = await res.json();

        setPage(data?.page || null);

      } catch (err) {

        console.error("Failed to load page:", err);

        setPage(null);

      } finally {

        setLoading(false);

      }
    }

    fetchPage();

  }, [slug, API]);

  /* ================= CONTACT FORM ================= */

  const submitMessage = async (e) => {

    e.preventDefault();

    const form = e.target;

    const payload = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
    };

    try {

      const res = await fetch(`${API}/api/admin/public/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to send message");
        return;
      }

      alert("Message sent successfully!");
      form.reset();

    } catch (err) {

      console.error("Submit failed:", err);

      alert("Server error, try again later");

    }
  };

  if (loading) {
    return <div className="contact-loading">Loading page…</div>;
  }

  if (!page) {
    return <div className="contact-error">Page not found</div>;
  }

  const isContactPage = slug === "contact";
  const pageType = page.type || "generic";

  const seoTitle = page.seoTitle || page.title;

  const seoDescription =
    page.seoDescription || `Read more about ${page.title}`;

  const faqSections =
    pageType === "faq"
      ? (page.sections || []).filter((s) => s.type === "qa")
      : [];

  const faqStructuredData =
    faqSections.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqSections.map((s) => ({
            "@type": "Question",
            name: s.meta?.question || "Question",
            acceptedAnswer: {
              "@type": "Answer",
              text: s.meta?.answer || "",
            },
          })),
        }
      : null;

  const containerClass = (() => {
    if (pageType === "policy") return "cms-container-narrow";
    if (pageType === "about") return "cms-container-wide";
    if (pageType === "faq") return "cms-container-medium";
    return "cms-container-medium";
  })();

  return (
    <>
      <Head>
        <title>{seoTitle}</title>

        <meta name="description" content={seoDescription} />

        <meta property="og:title" content={seoTitle} />

        <meta property="og:description" content={seoDescription} />

        {faqStructuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(faqStructuredData),
            }}
          />
        )}
      </Head>

      <PageLayout>
        <div className="contact-page">

          <section className="contact-hero">
            <h1>{page.title}</h1>
          </section>

          <section className={`contact-container ${containerClass}`}>

            <div className="contact-content">

              {pageType === "faq" ? (

                <FaqAccordion sections={page.sections || []} />

              ) : (

                (page.sections || [])
                  .filter((s) => s.type !== "hero")
                  .map((section) => (

                    <div
                      key={section.id}
                      className="cms-section"
                      dangerouslySetInnerHTML={{ __html: section.html }}
                    />

                  ))
              )}

            </div>

            {isContactPage && (

              <div className="contact-form-card">

                <h2>Send us a message</h2>

                <form
                  className="contact-form"
                  onSubmit={submitMessage}
                >

                  <div>
                    <label>Your Name</label>
                    <input name="name" required />
                  </div>

                  <div>
                    <label>Email</label>
                    <input name="email" type="email" required />
                  </div>

                  <div>
                    <label>Message</label>
                    <textarea name="message" required />
                  </div>

                  <button type="submit">
                    Send Message
                  </button>

                </form>

              </div>

            )}

          </section>

        </div>

      </PageLayout>
    </>
  );
}

/* ================= FAQ ACCORDION ================= */

function FaqAccordion({ sections }) {

  const [openIndex, setOpenIndex] = useState(null);

  const faqItems = sections.filter(
    (s) => s.type === "qa" && s.meta?.question
  );

  if (!faqItems.length) {

    return (
      <div className="text-sm text-gray-500">
        No FAQs available yet.
      </div>
    );
  }

  return (

    <div className="faq-accordion">

      {faqItems.map((s, i) => {

        const question =
          s.meta?.question?.trim() || "Add a question";

        const answerHtml = s.meta?.answer || "";

        return (

          <div key={s.id || i} className="faq-item">

            <button
              className="faq-question"
              onClick={() =>
                setOpenIndex(openIndex === i ? null : i)
              }
            >

              <span>{question}</span>

              <span className="text-xl">
                {openIndex === i ? "−" : "+"}
              </span>

            </button>

            {openIndex === i && (

              <div
                className="faq-answer"
                dangerouslySetInnerHTML={{
                  __html: answerHtml,
                }}
              />

            )}

          </div>

        );
      })}

    </div>
  );
}