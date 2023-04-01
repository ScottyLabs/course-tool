import { BoolLiteral, Empty, fromBoolLiteral, singleToArray, standardizeID } from "../util";
import { Course } from "../models/course.js";
import { FCE } from "../models/fce.js";
import { RequestHandler } from "express";
import prisma from "../models/prisma";

const projection = { _id: false, __v: false };
const MAX_LIMIT = 10;

export interface GetCourseByIDParams {
  courseID: string;
}

export interface GetCourseByIDQuery {
  schedules?: "true" | "false";
}

export type GetCourseByIDResBody =
  Awaited<ReturnType<typeof prisma.courses.findFirstOrThrow>>;

export const getCourseByID:
  RequestHandler<GetCourseByIDParams, GetCourseByIDResBody, Empty, GetCourseByIDQuery> =
  async (req, res, next) => {
    const id = standardizeID(req.params.courseID);
    try {
      const course = await prisma.courses.findFirstOrThrow({
        where: {
          courseID: id,
        },
        include: {
          schedules: fromBoolLiteral(req.query.schedules),
        },
      });

      res.json(course);
    } catch (e) {
      next(e);
    }
  };

export type GetCoursesResBody =
  Awaited<ReturnType<typeof prisma.courses.findMany>>

export interface GetCoursesQuery {
  courseID: string | string[];
  schedules: BoolLiteral;
}

export const getCourses:
  RequestHandler<Empty, GetCoursesResBody, Empty, GetCoursesQuery> =
  async (req, res, next) => {
    const courseIDs = singleToArray(req.query.courseID).map(standardizeID);

    try {
      const courses = await prisma.courses.findMany({
        where: {
          courseID: { in: courseIDs },
        },
        include: {
          schedules: fromBoolLiteral(req.query.schedules) && {
            select: {
              id: true,
              year: true,
              semester: true,
              session: true,
            },
          },
        },
      });
      res.json(courses);
    } catch (e) {
      next(e);
    }
  };

export const getFilteredCourses = (req, res, next) => {
  const matchQuery = {};
  const options: any = {
    projection: { ...projection },
    limit: MAX_LIMIT,
    populate: [],
  };

  if ("department" in req.query)
    matchQuery["department"] = { $in: singleToArray(req.query.department) };

  if ("keywords" in req.query) {
    matchQuery["$text"] = { $search: req.query.keywords };
    options.projection.score = { $meta: "textScore" };
  }

  const pipeline = [];
  pipeline.push({ $match: matchQuery });

  const hasUnitsFilter =
    ("unitsMin" in req.query && parseInt(req.query.unitsMin)) ||
    ("unitsMax" in req.query && parseInt(req.query.unitsMax));

  if (hasUnitsFilter) {
    pipeline.push({
      $addFields: {
        unitsDecimal: {
          $convert: {
            input: "$units",
            to: "decimal",
            onError: null,
            onNull: null,
          },
        },
      },
    });

    const unitsQuery = {};
    unitsQuery["unitsDecimal"] = {};

    if ("unitsMin" in req.query && parseInt(req.query.unitsMin)) {
      unitsQuery["unitsDecimal"].$gte = parseInt(req.query.unitsMin) || 0;
    }

    if ("unitsMax" in req.query && parseInt(req.query.unitsMax)) {
      unitsQuery["unitsDecimal"].$lte = parseInt(req.query.unitsMax) || 100;
    }

    pipeline.push({ $match: unitsQuery });
  }

  if ("keywords" in req.query) options.sort = { score: { $meta: "textScore" } };

  if ("page" in req.query) options.page = req.query.page;

  if ("schedules" in req.query && req.query.schedules)
    pipeline.push({
      $lookup: {
        from: "schedules",
        localField: "courseID",
        foreignField: "courseID",
        as: "schedules",
      },
    });

  if ("levels" in req.query && req.query.levels.length > 0) {
    const levelRange = req.query.levels;
    pipeline.push({
      $match: {
        courseID: { $regex: `\\d\\d-[${levelRange}]\\d\\d` },
      },
    });
  }

  if ("session" in req.query) {
    const sessions = singleToArray(req.query.session).flatMap(
      (serializedSession) => {
        try {
          const session = JSON.parse(serializedSession);
          return [{ year: parseInt(session.year), semester: session.semester }];
        } catch (e) {
          // SyntaxError
          return [];
        }
      },
    );
    pipeline.push({
      $match: {
        schedules: {
          $elemMatch: {
            $or: sessions,
          },
        },
      },
    });
  }

  if (req.method === "POST") {
    if ("fces" in req.query && req.query.fces) {
      options.populate.push({
        path: "fces",
        model: FCE,
        select: "-_id",
      });
    }
  }

  Course.aggregate(pipeline).option(options).then(
    (result) => res.json(result),
    next,
  );
};

// TODO: use a better caching system
const allCoursesEntry = {
  allCourses: [],
  lastCached: null,
};

const getAllCoursesDbQuery = {
  select: {
    courseID: true,
    name: true,
    id: true,
  },
};

export type GetAllCoursesResBody =
  Awaited<ReturnType<typeof prisma.courses.findMany<typeof getAllCoursesDbQuery>>>;

export const getAllCourses:
  RequestHandler<Empty, GetAllCoursesResBody, Empty, Empty>
  = async (req, res, next) => {
    if (
      allCoursesEntry.lastCached === null ||
    new Date().valueOf() - allCoursesEntry.lastCached > 1000 * 60 * 60 * 24
    ) {
      try {
        const courses = await prisma.courses.findMany(getAllCoursesDbQuery);

        allCoursesEntry.lastCached = new Date();
        allCoursesEntry.allCourses = courses;

        res.json(courses);
      } catch (e) {
        next(e);
      }
    } else {
      res.json(allCoursesEntry.allCourses);
    }
  };
