import { NextPage } from "next";
import Sidebar from "../components/Sidebar";
import Aggregate from "../components/Aggregate";
import ScheduleData from "../components/ScheduleData";
import CourseList from "../components/CourseList";
import React from "react";
import Topbar from "../components/Topbar";
import ScheduleSearch from "../components/ScheduleSearch";
import { useAppSelector } from "../app/hooks";
import ScheduleSelector from "../components/ScheduleSelector";

const SchedulePage: NextPage = () => {
  const scheduled = useAppSelector((state) => state.user.schedules.current);

  return (
    <div className="font-sans">
      <div className="flex flex-col md:h-screen md:flex-row">
        <div className="relative mt-28 w-full md:mt-16 md:w-72 lg:w-96">
          <Sidebar>
            <ScheduleSelector />
            <Aggregate />
          </Sidebar>
        </div>
        <div className="flex-1 overflow-y-scroll dark:bg-grey-800 md:h-full md:pt-16">
          <Topbar>
            <h1 className="text-lg font-semibold">Schedule Explorer</h1>
            <ScheduleSearch />
            <ScheduleData scheduled={scheduled} />
          </Topbar>
          <CourseList courseIDs={scheduled}>
            <div className="text-center font-semibold text-grey-500">
              Nothing in your schedule yet!
            </div>
          </CourseList>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
