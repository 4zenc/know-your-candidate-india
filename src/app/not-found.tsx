import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-3xl font-semibold">Not found</h1>
      <Link href="/" className="mt-4 inline-block text-muted underline underline-offset-4 hover:text-foreground">Back home</Link>
    </div>
  );
}
