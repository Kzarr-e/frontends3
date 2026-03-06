export async function addToCart(product) {
  try {
    const token = localStorage.getItem("kzarre_token");

    if (!token) {
      alert("Please login first");
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/cart/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
          size: "M",
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to add to cart");
    }

    return data;
  } catch (err) {
    alert(err.message);
  }
}
