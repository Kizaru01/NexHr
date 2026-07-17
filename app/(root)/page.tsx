import AttendanceOverviewChart from "@/components/Chart/AttendanceOverviewChart";
import EmployeeOverviewChart from "@/components/Chart/Employee-overview-chart";
import RecentAnnouncements from "@/components/Dashboard/RecentAnnouncements";
import RecentLeaveList from "@/components/Dashboard/RecentLeaveList";
import StatCard from "@/components/Card/Stats-card";
import DashboardNavbar from "@/components/Navbar/Dashboard-navbar";
import QuickAction from "@/components/QuickAction";
import { dashboardStats } from "@/constants/dashboard-static";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const Home = async () => {
  const session = await auth();
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
      <>
        {/* XL Layout */}
        <div className="grid gap-6 md:grid-cols-2 2xl:hidden pt-4 max-md:px-6">
          <div className="space-y-6">
            <RecentLeaveList />
            <RecentAnnouncements />
          </div>

          <QuickAction />
        </div>

        {/* 2XL Layout */}
        <div className="hidden gap-6 2xl:grid 2xl:grid-cols-3 pt-4">
          <RecentLeaveList />
          <RecentAnnouncements />
          <QuickAction />
        </div>
      </>
    </>
  );
};

export default Home;
