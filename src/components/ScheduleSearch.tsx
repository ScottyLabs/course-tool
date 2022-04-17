import React, { useRef, useState } from "react";
import { useVirtual } from "react-virtual";
import { useCombobox, useMultipleSelection } from "downshift";

// Testing
const courses = [
  {"name": "Test 1", "courseID": "15-122"},
  {"name": "Test 2", "courseID": "15-112"},
  {"name": "Test 3", "courseID": "17-232"},
  {"name": "Test 4", "courseID": "18-123"},
];

const menuStyles = {
  maxHeight: 80,
  maxWidth: 300,
  overflowY: 'scroll',
  backgroundColor: '#eee',
  padding: 0,
  listStyle: 'none',
  position: 'relative',
};

const CourseCombobox = () => {
  const [inputValue, setInputValue] = useState('');
  const listRef = useRef();

  const {
    getSelectedItemProps,
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    selectedItems,
  } = useMultipleSelection({ initialSelectedItems: [] });

  function getCourses() {
    return courses.filter((course) => ((course.courseID.includes(inputValue)
      || course.name.toLowerCase().includes(inputValue))) && selectedItems.indexOf(course) < 0);
  }

  const filteredCourses = getCourses();

  const rowVirtualizer = useVirtual({
    size: filteredCourses.length,
    parentRef: listRef
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
    itemToString: ((item) => {
      console.log(item);
      if (!item) return '';
      return `${item.courseID}`;
    }),
    selectedItem: null,
    inputValue,
    defaultHighlightedIndex: 0,
    onInputValueChange: ({ inputValue: newValue }) =>
      setInputValue(newValue),
    scrollIntoView: () => {},
    onHighlightedIndexChange: ({ highlightedIndex }) =>
      rowVirtualizer.scrollToIndex(highlightedIndex),
    stateReducer: (state, actionAndChanges) => {
      const { changes, type } = actionAndChanges
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: true, // keep the menu open after selection.
          }
      }
      return changes
    },
    onStateChange: ({ inputValue, type, selectedItem }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(inputValue)
          break
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          if (selectedItem) {
            setInputValue('')
            addSelectedItem(selectedItem)
          }
          break
        default:
          break
      }
    },
  })

  // @ts-ignore
  return <div>
    <div>
      <label {...getLabelProps()} />
      <div {...getComboboxProps()}>
        <input {...getInputProps({type: 'text'})} />
      </div>
    </div>
    <div>
      {selectedItems.map((selectedItem, index) => (
        <span
          key={`selected-item-${index}`}
          {...getSelectedItemProps({ selectedItem, index })}
        >
              {selectedItem.courseID}
          <span
            onClick={e => {
              e.stopPropagation()
              removeSelectedItem(selectedItem)
            }}
          >
                &#10005;
              </span>
            </span>
      ))}
      <div {...getComboboxProps()}>
        <input
          {...getInputProps(
            getDropdownProps({ preventKeyAction: isOpen }),
          )}
        />
        <button {...getToggleButtonProps()} aria-label={'toggle menu'}>
          &#8595;
        </button>
      </div>
    </div>
    <ul
      {...getMenuProps({
        ref: listRef,
        style: menuStyles,
      })}
    >
      {isOpen && (
        <>
          <li key="total-size" style={{height: rowVirtualizer.totalSize}} />
          {rowVirtualizer.virtualItems.map((virtualRow) => (
            <li
              key={filteredCourses[virtualRow.index].courseID}
              {...getItemProps({
                index: virtualRow.index,
                item: filteredCourses[virtualRow.index],
                style: {
                  backgroundColor:
                    highlightedIndex === virtualRow.index
                      ? 'lightgray'
                      : 'inherit',
                  fontWeight:
                    selectedItem &&
                    selectedItem.courseID === filteredCourses[virtualRow.index].courseID
                      ? 'bold'
                      : 'normal',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                },
              })}
            >
              {filteredCourses[virtualRow.index].courseID}
            </li>
          ))}
        </>
      )}
    </ul>
  </div>
}

const ScheduleSearch = () => {
  return (
    <div className="mb-3">
      <div className="flex">
        My Schedule
        <CourseCombobox />
      </div>
    </div>
  );
}

export default ScheduleSearch;