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
    <>
      <DashboardNavbar />
      <div className="grid gap-2 sm:gap-4 md:gap-6 grid-cols-2 tablet:grid-cols-4 mt-4">
        {dashboardStats.map((stat) => {
          return <StatCard key={stat.title} {...stat} />;
        })}
      </div>
      <div className="rounded-xl border px-4 pb-2 mt-4 w-full">
        <p className="text-3xl p-2">Overview</p>
        <div className="grid gap-6 lg:grid-cols-2">
          <EmployeeOverviewChart />
          <AttendanceOverviewChart />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 2xl:hidden pt-4 max-md:px-6">
        <div className="space-y-6">
          <RecentLeaveList />
          <RecentAnnouncements />
        </div>

        <QuickAction />
      </div>

      <div className="hidden gap-6 2xl:grid 2xl:grid-cols-3 pt-4">
        <RecentLeaveList />
        <RecentAnnouncements />
        <QuickAction />
      </div>
    </>
  );
};

export default Home;
