import { createSlice } from "@reduxjs/toolkit";
import { standardizeIdsInString } from "./utils";
import { SEMESTERS_COUNTED } from "./constants";

export interface UserState {
  bookmarked: string[],
  bookmarkedSelected: string[]
  darkMode: boolean,
  showFCEs: boolean,
  showCourseInfos: boolean,
  loggedIn: boolean,
  filter: {
    search: string,
    departments: string[],
    exactMatchesOnly: boolean,
  },
  fceAggregation: {
    numSemesters: number,
    counted: {
      spring: boolean,
      summer: boolean,
      fall: boolean,
    }
  },
  schedules: {
    activeId: number,
    saved: string[],
    current: string[],
    selected: string[]
  },
  token: string
}

const initialState: UserState = {
  bookmarked: [],
  bookmarkedSelected: [],
  darkMode: false,
  showFCEs: false,
  showCourseInfos: true,
  loggedIn: false,
  filter: {
    search: "",
    departments: [],
    exactMatchesOnly: false,
  },
  fceAggregation: {
    numSemesters: 2,
    counted: {
      spring: true,
      summer: false,
      fall: true,
    },
  },
  schedules: {
    activeId: null,
    saved: [],
    current: [],
    selected: [],
  },
  token: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addBookmark: (state, action) => {
      if (state.bookmarked.indexOf(action.payload) == -1) {
        state.bookmarked.push(action.payload);
        state.bookmarkedSelected.push(action.payload);
      }
    },
    removeBookmark: (state, action) => {
      const index = state.bookmarked.indexOf(action.payload);
      if (index > -1) {
        state.bookmarked.splice(index, 1);
      }

      const selectedIndex = state.bookmarkedSelected.indexOf(action.payload);
      if (index > -1) {
        state.bookmarkedSelected.splice(selectedIndex, 1);
      }
    },
    clearBookmarks: (state) => {
      state.bookmarked = [];
      state.bookmarkedSelected = [];
    },
    addSelected: (state, action) => {
      if (state.bookmarked.indexOf(action.payload) == -1) return;
      if (state.bookmarkedSelected.indexOf(action.payload) == -1) {
        state.bookmarkedSelected.push(action.payload);
      }
    },
    removeSelected: (state, action) => {
      const selectedIndex = state.bookmarkedSelected.indexOf(action.payload);
      if (selectedIndex > -1) {
        state.bookmarkedSelected.splice(selectedIndex, 1);
      }
    },
    setExactMatchesOnly: (state, action) => {
      state.filter.exactMatchesOnly = action.payload;
    },
    toggleSelect: (state) => {
      if (state.bookmarkedSelected.length > 0) {
        state.bookmarkedSelected = [];
      } else {
        state.bookmarkedSelected = [...state.bookmarked];
      }
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    showFCEs: (state, action) => {
      state.showFCEs = action.payload;
    },
    showCourseInfos: (state, action) => {
      state.showCourseInfos = action.payload;
    },
    logIn: (state) => {
      state.loggedIn = true;
    },
    logOut: (state) => {
      state.token = null;
      state.loggedIn = false;
    },
    updateSearch: (state, action) => {
      state.filter.search = standardizeIdsInString(action.payload);
    },
    updateDepartments: (state, action) => {
      state.filter.departments = action.payload;
    },
    updateSemestersCounted: (state, action) => {
      if (!SEMESTERS_COUNTED.includes(action.payload.semester)) return;
      state.fceAggregation.counted[action.payload.semester] =
        action.payload.value;
    },
    updateNumSemesters: (state, action) => {
      const newNumSemesters = Math.min(
        Math.max(parseInt(action.payload), 1),
        10
      );
      if (isNaN(newNumSemesters)) return;
      state.fceAggregation.numSemesters = newNumSemesters;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    updateCurrentSchedule: (state, action) => {
      state.schedules.current = [...action.payload];
    },
    addToCurrentSchedule: (state, action) => {
      if (!state.schedules.current.includes(action.payload)) {
        state.schedules.current.push(action.payload);
        state.schedules.selected.push(action.payload);
      }
    },
    removeFromCurrentSchedule: (state, action) => {
      const currentScheduleIndex = state.schedules.current.indexOf(action.payload);
      if (currentScheduleIndex > -1) {
        state.schedules.current.splice(currentScheduleIndex, 1);
      }

      const selectedScheduleIndex = state.schedules.selected.indexOf(action.payload);
      if (selectedScheduleIndex > -1) {
        state.schedules.selected.splice(selectedScheduleIndex, 1);
      }
    }
  },
  extraReducers: (builder) => {},
});

export const reducer = userSlice.reducer;
