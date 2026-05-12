import StatContainer from "./_components/stats/StatContainer";
import RecentAccountList from "./_components/recentAccountList/RecentAccountList";
import CheckInOverview from "./_components/CheckInOverview";



const DashboardPage = () => {
  return (
    <div className="lg:space-y-7 space-y-5 ">
      <StatContainer />
      <div className="grid xl:grid-cols-3 grid-cols-1 gap-5">
        <div className="xl:col-span-2">
          <CheckInOverview />
        </div>
      </div>
      <RecentAccountList />
    </div>
  );
};

export default DashboardPage;
