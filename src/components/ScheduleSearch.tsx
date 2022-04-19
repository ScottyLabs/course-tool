import React, { useCallback, useEffect, useRef, useState } from "react";
import { useVirtual } from "react-virtual";
import { useCombobox, useMultipleSelection } from "downshift";
import { SearchIcon } from "@heroicons/react/solid";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config.js";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { userSlice } from "../app/user";
import { fetchAllCourses, fetchCourseInfos, fetchFCEInfos } from "../app/courses";

const fullConfig = resolveConfig(tailwindConfig);

const CourseCombobox = ({ onSelectedItemsChange, initialSchedule }) => {
  const [inputValue, setInputValue] = useState("");
  const listRef = useRef();
  const dispatch = useAppDispatch();

  const allCourses = useAppSelector((state) => state.courses.allCourses);

  useEffect(() => {
    dispatch(fetchAllCourses());
  }, []);

  function getCourses() {
    return allCourses.filter(
      (course) =>
        (course.courseID.includes(inputValue) ||
          course.name.toLowerCase().includes(inputValue)) &&
        selectedItems.map(({ courseID }) => courseID).indexOf(course.courseID) <
          0
    );
  }

  useEffect(() => {
    setSelectedItems(
      initialSchedule.map((courseID) => ({ courseID, name: "" }))
    );
  }, [initialSchedule]);

  const {
    getSelectedItemProps,
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    setSelectedItems,
    selectedItems,
  } = useMultipleSelection({
    initialSelectedItems: [],
    onSelectedItemsChange,
  });

  const filteredCourses = getCourses();

  const rowVirtualizer = useVirtual({
    size: filteredCourses.length,
    parentRef: listRef,
    estimateSize: useCallback(() => 40, []),
  });

  const {
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    selectedItem,
    getComboboxProps,
    getToggleButtonProps,
    isOpen,
  } = useCombobox({
    items: filteredCourses,
    itemToString: (item) => {
      if (!item) return "";
      return `${item.courseID}`;
    },
    selectedItem: null,
    inputValue,
    defaultHighlightedIndex: 0,
    onInputValueChange: ({ inputValue: newValue }) => setInputValue(newValue),
    scrollIntoView: () => {},
    onHighlightedIndexChange: ({ highlightedIndex }) =>
      rowVirtualizer.scrollToIndex(highlightedIndex),
    stateReducer: (state, actionAndChanges) => {
      const { changes, type } = actionAndChanges;
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: true, // keep the menu open after selection.
          };
      }
      return changes;
    },
    onStateChange: ({ inputValue, type, selectedItem }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(inputValue);
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          if (selectedItem) {
            setInputValue("");
            addSelectedItem(selectedItem);
            dispatch(
              userSlice.actions.addToCurrentSchedule(selectedItem.courseID)
            );
          }
          break;
        default:
          break;
      }
    },
  });

  return (
    <div>
      <div>
        <label {...getLabelProps()} />
      </div>
      <div className="mt-2 flex flex-col items-baseline space-y-2 md:mt-0 md:flex-row md:space-y-0">
        <div className="flex">
          {selectedItems.map((selectedItem, index) => (
            <div
              key={`selected-item-${index}`}
              className="mr-2 rounded-md bg-blue-50 px-2 py-1 text-blue-800"
              {...getSelectedItemProps({ selectedItem, index })}
            >
              {selectedItem.courseID}
              <span
                className="ml-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSelectedItem(selectedItem);
                  dispatch(
                    userSlice.actions.removeFromCurrentSchedule(
                      selectedItem.courseID
                    )
                  );
                }}
              >
                &#10005;
              </span>
            </div>
          ))}
        </div>
        <div {...getComboboxProps()} className="flex-1">
          <div className="relative flex w-full border-b border-b-grey-300">
            <span className="absolute inset-y-0 left-0 flex items-center">
              <SearchIcon className="h-5 w-5" />
            </span>
            <input
              className="flex-1 bg-transparent py-2 pl-7 text-xl text-grey-500 focus:outline-none dark:text-grey-200"
              type="search"
              {...getInputProps(getDropdownProps({ preventKeyAction: isOpen }))}
              placeholder="Add a Course by Course ID/Name"
            />
            <ul
              {...getMenuProps({
                ref: listRef,
              })}
              className="absolute left-0 right-0 top-full max-h-96 overflow-y-scroll bg-grey-50"
            >
              {isOpen && (
                <>
                  <li
                    key="total-size"
                    style={{ height: rowVirtualizer.totalSize }}
                  />
                  {rowVirtualizer.virtualItems.map((virtualRow) => {
                    const course = filteredCourses[virtualRow.index];
                    return (
                      <li
                        key={course.courseID}
                        {...getItemProps({
                          index: virtualRow.index,
                          item: course,
                          style: {
                            backgroundColor:
                              highlightedIndex === virtualRow.index
                                ? fullConfig.theme.colors.grey[100]
                                : "inherit",
                            fontWeight:
                              selectedItem &&
                              selectedItem.courseID === course.courseID
                                ? "bold"
                                : "normal",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: virtualRow.size,
                            transform: `translateY(${virtualRow.start}px)`,
                          },
                        })}
                        className="table pl-7 hover:cursor-pointer"
                      >
                        <span className="inline-block table-cell h-full align-middle">
                          <span className="inline-block w-16 font-semibold">
                            {course.courseID}
                          </span>
                          <span className="ml-2">{course.name}</span>
                        </span>
                      </li>
                    );
                  })}
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScheduleSearch = ({ initialSchedule }) => {
  const dispatch = useAppDispatch();

  return (
    <div className="mb-6">
      <div className="flex flex-col">
        <CourseCombobox
          onSelectedItemsChange={({ selectedItems }) => {
            const courseIDs = selectedItems.map(({ courseID }) => courseID);
            dispatch(fetchFCEInfos({ courseIDs }));
            dispatch(fetchCourseInfos(courseIDs));
          }}
          initialSchedule={initialSchedule}
        />
      </div>
    </div>
  );
};

export default ScheduleSearch;
