import { redirect } from "next/navigation";

import { auth } from "@/auth";
import StatCard from "@/components/Card/Stats-card";
import AttendanceOverviewChart from "@/components/Chart/AttendanceOverviewChart";
import EmployeeOverviewChart from "@/components/Chart/Employee-overview-chart";
import RecentAnnouncements from "@/components/Dashboard/RecentAnnouncements";
import RecentLeaveList from "@/components/Dashboard/RecentLeaveList";
import DashboardNavbar from "@/components/Navbar/Dashboard-navbar";
import QuickAction from "@/components/QuickAction";
import { dashboardStats } from "@/constants/dashboard-static";

const Home = async (): Promise<React.JSX.Element> => {
  const session = await auth();
  console.log("Employee Page");
  if (session?.user?.role === "employee") {
    redirect("/employee");
  }

  return (
    <div className="space-y-5 xl:space-y-6">
      <DashboardNavbar />
      <div className="dashboard-grid">
        {dashboardStats.map((stat) => {
          return <StatCard key={stat.title} {...stat} />;
        })}
      </div>

      <section aria-labelledby="overview-heading">
        <div className="grid gap-4 xl:grid-cols-2">
          <EmployeeOverviewChart />
          <AttendanceOverviewChart />
        </div>
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
