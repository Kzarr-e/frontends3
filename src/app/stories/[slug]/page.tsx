import StoryPage from "./StoryPage";

export async function generateStaticParams() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/stories`
  );

  const data = await res.json();

  return data.stories.map((story: any) => ({
    slug: story.slug,
  }));
}

export default function Page() {
  return <StoryPage />;
}