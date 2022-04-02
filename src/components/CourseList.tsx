import React, { useEffect } from "react";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import CourseCard from "./CourseCard";
import { Pagination } from "react-headless-pagination";
import { fetchCourseInfosByPage, fetchFCEInfos } from "../app/courses";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline";
import Loading from "./Loading";

const CoursePage = () => {
  const dispatch = useDispatch();
  const results = useSelector((state: RootStateOrAny) => state.courses.results);
  const loading = useSelector((state: RootStateOrAny) => state.courses.coursesLoading);
  const showFCEs = useSelector((state: RootStateOrAny) => state.user.showFCEs);
  const showCourseInfos = useSelector(
    (state: RootStateOrAny) => state.user.showCourseInfos,
  );

  const loggedIn = useSelector(
    (state: RootStateOrAny) => state.user.loggedIn,
  );

  useEffect(() => {
    if (loggedIn && results) {
      dispatch(
        fetchFCEInfos({ courseIDs: results.map((course) => course.courseID) }),
      );
    }
  }, [results, loggedIn]);

  return (
    <div className="space-y-4">
      {results &&
        results.map((course) => (
          <CourseCard info={course} key={course.courseID} showFCEs={showFCEs}
                      showCourseInfo={showCourseInfos} />
        ))}
    </div>
  );
};

const CourseList = () => {
  const pages = useSelector(
    (state: RootStateOrAny) => state.courses.totalPages,
  );
  const curPage = useSelector((state: RootStateOrAny) => state.courses.page);
  const loading = useSelector((state: RootStateOrAny) => state.courses.coursesLoading);
  const dispatch = useDispatch();

  const handlePageClick = (page) => {
    dispatch(fetchCourseInfosByPage(page + 1));
  };

  return (
    <div className="p-6">
      {loading ? (<Loading />) :
        (<><CoursePage />
          <div className="mx-auto my-6">
            <Pagination
              currentPage={curPage - 1}
              setCurrentPage={handlePageClick}
              totalPages={pages}
              className="flex justify-center w-full"
            >
              <Pagination.PrevButton className="">
                <ChevronLeftIcon className="w-5 h-5" />
              </Pagination.PrevButton>

              <div className="flex items-center align-baseline">
                <Pagination.PageButton
                  activeClassName="bg-zinc-200"
                  inactiveClassName=""
                  className="inline-flex items-center justify-center w-8 h-8 mx-3 rounded-full hover:bg-white hover:cursor-pointer"
                />
              </div>

              <Pagination.NextButton>
                <ChevronRightIcon className="w-5 h-5" />
              </Pagination.NextButton>
            </Pagination>
          </div>
        </>)
      }
    </div>
  );
};

export default CourseList;
