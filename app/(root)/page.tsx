import { redirect } from "next/navigation";

import { auth } from "@/auth";
import StatCard from "@/components/Card/Stats-card";
import AttendanceOverviewChart from "@/components/Chart/AttendanceOverviewChart";
import EmployeeOverviewChart from "@/components/Chart/Employee-overview-chart";
import RecentAnnouncements from "@/components/Dashboard/RecentAnnouncements";
import RecentLeaveList from "@/components/Dashboard/RecentLeaveList";
import RecentConcernAlerts from "@/components/concerns/RecentConcernAlerts";
import DashboardNavbar from "@/components/Navbar/Dashboard-navbar";
import QuickAction from "@/components/QuickAction";
import { dashboardStats } from "@/constants/dashboard-static";
import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";
import { getConcernDashboardAlerts } from "@/lib/queries/concern.queries";

const Home = async (): Promise<React.JSX.Element> => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  if (session?.user?.role === "employee") {
    redirect("/employee");
  }
  await requireHrAdminPage();
  const concernAlerts = await getConcernDashboardAlerts(session.user.id);
  return (
    <div className="space-y-5 xl:space-y-6">
      <DashboardNavbar />
      <div className="dashboard-grid">
        {dashboardStats.map((stat) => {
          return <StatCard key={stat.title} {...stat} />;
        })}
      </div>

      <RecentConcernAlerts alerts={concernAlerts} />

      <section className="grid gap-4 xl:grid-cols-2">
        <EmployeeOverviewChart />
        <AttendanceOverviewChart />
      </section>

      <div className="grid gap-4 md:grid-cols-2 2xl:hidden">
        <div className="space-y-6">
          <RecentLeaveList />
          <RecentAnnouncements />
        </div>

        <QuickAction />
      </div>

      <div className="hidden gap-4 2xl:grid 2xl:grid-cols-3">
        <RecentLeaveList />
        <RecentAnnouncements />
        <QuickAction />
      </div>
    </div>
  );
};

export default Home;
