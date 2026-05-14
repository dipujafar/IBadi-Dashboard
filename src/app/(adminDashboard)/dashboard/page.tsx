import StatContainer from "./_components/stats/StatContainer";
import RecentAccountList from "./_components/recentAccountList/RecentAccountList";
import TotalEarningGrowthChart from "./_components/totalEarningGrowth/TotalEarningGrowthChart";
import TotalUsersStatisticsChart from "./_components/totalUsersStatistics/TotalUsersStatisticsChart";



const DashboardPage = () => {
  return (
    <div className="lg:space-y-7 space-y-5 ">
      <StatContainer />
      <div className="grid xl:grid-cols-2 grid-cols-1 gap-5">
        <div>
          <TotalUsersStatisticsChart />
        </div>
        <div>
          <TotalEarningGrowthChart />
        </div>
      </div>
      <RecentAccountList />
    </div>
  );
};

export default DashboardPage;
