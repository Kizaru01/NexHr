import SocialAuth from "@/components/Forms/SocialAuth";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center  px-4 py-10 ">
      <section className="min-w-full rounded-[10px] border px-4 py-10 shadow-md sm:min-w-[520] sm:px-8">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-2.5">
            <h1 className="h2-bold text-dark100_light900">NexHr</h1>
            <p className="paragraph-regular text-dark500_light400">
              Get join in our big Company
            </p>
          </div>
          <p>NexHr</p>
        </div>
        {children}
        <SocialAuth />
      </section>
    </main>
  );
}
