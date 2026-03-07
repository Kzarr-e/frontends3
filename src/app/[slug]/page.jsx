import CmsPage from "../cms/CmsPage";

const API =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  "https://kzarre-backend.vercel.app";

export async function generateStaticParams() {

  const pages = [
    "contact",
    "legal",
    "about",
    "returns",
    "shipping",
    "faq",
    "sustainability",
    "accessibility"
  ];

  return pages.map((slug) => ({
    slug
  }));
}

export default async function Page({ params }) {
  const { slug } = await params;   // ✅ FIX
  return <CmsPage slug={slug} />;
}