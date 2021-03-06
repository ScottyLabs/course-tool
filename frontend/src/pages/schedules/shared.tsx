import { NextPage } from "next";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Loading from "../../components/Loading";
import { getCourseIDs } from "../../app/utils";
import { useAppDispatch } from "../../app/hooks";
import { userSchedulesSlice } from "../../app/userSchedules";

const SharedSchedulePage: NextPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const coursesString = router.query.courses as string;

  useEffect(() => {
    if (router.isReady) {
      const courseIDs = getCourseIDs(coursesString);
      dispatch(userSchedulesSlice.actions.createSharedSchedule(courseIDs));
      void router.push("/schedules");
    }
  }, [dispatch, router, coursesString, router.isReady]);

  return <Loading />;
};

export default SharedSchedulePage;
