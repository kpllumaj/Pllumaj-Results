import Link from 'next/link';

const sections = [
  {
    title: 'Post a Need',
    description: 'Tell us what you need and instantly reach vetted providers.',
    href: '/post-need',
  },
  { 
    title: "All Needs", 
    description: "View all posted needs",
    href: "/needs"
  },
  {
    title: 'Compare Offers',
    description: 'Review quotes, timelines, and ratings in one place.',
    href: '/offers',
  },
  {
    title: 'Checkout Securely',
    description: 'Use Stripe to pay and track the order status live.',
    href: '/checkout/sample-order',
  },
  {
    title: 'Manage Your Business',
    description: 'Showcase services, respond to leads, and grow revenue.',
    href: '/providers/profile/sample-provider',
  },
  {
    title: 'Admin Controls',
    description: 'Verify providers, monitor quality, and resolve disputes.',
    href: '/admin',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <header className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold text-primary">Pllumaj Results</h1>
        <p className="mt-3 text-lg text-slate-600">
          Delivering one universal life-solutions platform for clients, providers, and businesses.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="rounded-md bg-primary px-4 py-2 text-white shadow" href="/post-need">
            Start a need
          </Link>
          <Link
            className="rounded-md border border-primary px-4 py-2 text-primary shadow"
            href="/providers/profile/sample-provider"
          >
            Become a provider
          </Link>
        </div>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="block">
            <article className="h-full rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{section.description}</p>
            </article>
          </Link>
        ))}
      </section>
    </div>
  );
}
