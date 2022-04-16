import { NextPage } from "next";
import { useRouter } from "next/router";
import Sidebar from "../../components/Sidebar";
import Aggregate from "../../components/Aggregate";
import ScheduleData from "../../components/ScheduleData";
import BookmarkedList from "../../components/BookmarkedList";
import React from "react";
import { SEMESTERS_COUNTED } from "../../app/constants";

const SchedulePage: NextPage = () => {
  const router = useRouter();
  const { schedule } = router.query;

  if (typeof schedule === "string") {
    const courseIds = schedule.split("_");
  }

  return (<div className="font-sans">
    <div className="flex flex-col md:h-screen md:flex-row">
      <div className="relative mt-28 w-full md:mt-16 md:w-72 lg:w-96">
        <Sidebar>
          <Aggregate />
          <div>
            <div className="text-md">Schedules</div>
            <div className="mt-3 text-sm bg-grey-50 p-2 rounded-md">
              <div>My Schedule</div>
            </div>
          </div>
        </Sidebar>
      </div>
      <div className="flex-1 overflow-y-scroll dark:bg-grey-800 md:h-full md:pt-16">
        <ScheduleData />
        {/*<BookmarkedList />*/}
      </div>
    </div>
  </div>);
};

export default SchedulePage;
