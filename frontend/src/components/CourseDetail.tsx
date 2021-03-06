import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { compareSessions, filterSessions } from "../app/utils";
import { FCECard } from "./FCEDetail";
import CourseCard from "./CourseCard";
import { Schedules } from "./Schedules";
import { Course, Schedule } from "../app/types";
import { fetchFCEInfosByCourse } from "../app/api/fce";

type Props = {
  info: Course;
  schedules: Schedule[];
};

const CourseDetail = ({info, schedules}: Props) => {
  const dispatch = useAppDispatch();
  const loggedIn = useAppSelector((state) => state.user.loggedIn);

  useEffect(() => {
    void dispatch(fetchFCEInfosByCourse({courseIDs: [info.courseID]}));
  }, [dispatch, info.courseID, loggedIn]);

  let sortedSchedules: Schedule[];
  if (schedules)
    sortedSchedules = filterSessions([...schedules]).sort(compareSessions);

  const fces = useAppSelector((state) => state.cache.fces[info.courseID]);

  return (
    <div className="m-auto space-y-4 p-6">
      <CourseCard info={info} showFCEs={false} showCourseInfo={true}/>
      {fces && <FCECard fces={fces}/>}
      {schedules && (
        <div className="bg-white rounded-md p-6 drop-shadow">
          <Schedules scheduleInfos={sortedSchedules}/>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
