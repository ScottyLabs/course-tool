import { NextPage } from "next";
import { useRouter } from "next/router";
import Sidebar from "../../components/Sidebar";
import Aggregate from "../../components/Aggregate";
import ScheduleData from "../../components/ScheduleData";
import CourseList from "../../components/CourseList";
import React, { useEffect, useState } from "react";
import Topbar from "../../components/Topbar";
import ScheduleSearch from "../../components/ScheduleSearch";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { userSlice } from "../../app/user";

const SchedulePage: NextPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { schedule } = router.query;

  let courseIDs = typeof schedule === "string" ? [schedule] : schedule;
  if (!courseIDs) courseIDs = [];

  const scheduled = useAppSelector((state) => state.user.schedules.current);
  const [initialSchedule, setInitialSchedule] = useState([]);

  useEffect(() => {
    if (router.isReady) {
      if (courseIDs.length > 0) {
        dispatch(userSlice.actions.updateCurrentSchedule(courseIDs));
        dispatch(userSlice.actions.updateScheduleSelected(courseIDs));
        setInitialSchedule(courseIDs);
      } else if (scheduled && !initialSchedule) {
        setInitialSchedule(scheduled);
      }
    }
  }, [router.isReady, courseIDs.join(" ")]);

  useEffect(() => {
    router.replace({ pathname: "/schedule/" + scheduled.join("/") });
  }, [scheduled]);

  if (!router.isReady) {
    return <></>;
  }

  return (
    <div className="font-sans">
      <div className="flex flex-col md:h-screen md:flex-row">
        <div className="relative mt-28 w-full md:mt-16 md:w-72 lg:w-96">
          <Sidebar>
            <div>
              <div className="text-md">Schedules</div>
              <div className="mt-3 rounded-md bg-grey-50 p-2 text-sm">
                <div>My Schedule</div>
              </div>
            </div>
            <Aggregate />
          </Sidebar>
        </div>
        <div className="flex-1 overflow-y-scroll dark:bg-grey-800 md:h-full md:pt-16">
          <Topbar>
            <h1 className="text-lg font-semibold">Schedule Explorer</h1>
            <ScheduleSearch initialSchedule={initialSchedule} />
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
