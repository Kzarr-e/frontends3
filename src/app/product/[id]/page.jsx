import ProductPage from "./ProductPage";

export async function generateStaticParams() {
  const API =
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    "https://kzarre-backend.vercel.app";

  try {
    const res = await fetch(`${API}/api/products`);
    const data = await res.json();

    if (!data?.products) return [];

    return data.products.map((p) => ({
      id: p._id,
    }));
  } catch (err) {
    console.error("Failed to fetch product ids:", err);
    return [];
  }
}

export default async function Page({ params }) {
  const { id } = await params;   // ✅ unwrap params promise
  return <ProductPage id={id} />;
}