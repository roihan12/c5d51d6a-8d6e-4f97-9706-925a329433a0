"use client";
import React, { useCallback, useState } from "react";
import DataGrid, {
  DataGridRef,
  Column,
  DataGridTypes,
  Editing,
  RequiredRule,
  PatternRule,
  EmailRule,
  AsyncRule,
  Paging,
  Sorting,
  Scrolling,
  FilterRow,
  HeaderFilter,
  Pager,
} from "devextreme-react/data-grid";
// import { createStore } from "devextreme-aspnet-data-nojquery";
import "whatwg-fetch";
import CustomStore from "devextreme/data/custom_store";

const URL = "http://localhost:5000";
const emailValidationUrl = "http://localhost:5000/users/check-email";

function isNotEmpty(value: string | undefined | null) {
  return value !== undefined && value !== null && value !== "";
}

const usersStore = new CustomStore({
  key: "id",
  async load(loadOptions) {
    const paramNames = ["skip", "take", "requireTotalCount", "sort", "filter"];

    const queryString = paramNames
      .filter((paramName) => isNotEmpty(loadOptions[paramName]))
      .map(
        (paramName) => `${paramName}=${JSON.stringify(loadOptions[paramName])}`
      )
      .join("&");

    try {
      const response = await fetch(
        `http://localhost:5000/users?${queryString}`
      );

      const result = await response.json();

      return {
        data: result.data,
        totalCount: result.totalCount,
        summary: result.summary,
        groupCount: result.groupCount,
      };
    } catch (err) {
      throw new Error("Data Loading Error");
    }
  },
});

async function sendBatchRequest(
  url: string,
  changes: DataGridTypes.DataChange[]
) {
  const result = await fetch(url, {
    method: "POST",
    body: JSON.stringify(changes),
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
    },
    credentials: "include",
  });

  if (!result.ok) {
    const json = await result.json();
    throw json.Message;
  }
}

const asyncValidation = async (params: any) => {
  const response = await fetch(`${emailValidationUrl}/${params.value}`, {});

  const result = await response.json();

  return result.isValid; // Assume your backend returns a boolean in `isValid`
};

async function processBatchRequest(
  url: string,
  changes: DataGridTypes.DataChange[],
  component: ReturnType<DataGridRef["instance"]>
) {
  await sendBatchRequest(url, changes);
  await component.refresh(true);
  component.cancelEditData();
}

const onSaving = (e: DataGridTypes.SavingEvent) => {
  e.cancel = true;

  if (e.changes.length) {
    e.promise = processBatchRequest(
      `${URL}/users/batch`,
      e.changes,
      e.component
    );
  }
};
const displayModes = [
  { text: "Display Mode 'full'", value: "full" },
  { text: "Display Mode 'compact'", value: "compact" },
];
const allowedPageSizes: (DataGridTypes.PagerPageSize | number)[] = [
  5,
  10,
  "all",
];
const App = () => {
  const [displayMode, setDisplayMode] =
    useState<DataGridTypes.PagerDisplayMode>("full");

  return (
    <div className="container mx-auto p-6">
      <div className="p-4 flex">
        <h1 className="text-3xl">Users</h1>
      </div>
      <div className="w-full mb-8 overflow-hidden rounded-lg shadow-lg mt-20">
        <DataGrid
          id="gridContainer"
          dataSource={usersStore}
          showBorders={true}
          remoteOperations={true} // Enable remote operations for filtering, sorting, etc.
          repaintChangesOnly={true}
          onSaving={onSaving}
        >
          <Sorting mode="multiple" />
          <FilterRow visible={true} />
          <HeaderFilter visible={true} />
          <Scrolling rowRenderingMode="virtual"></Scrolling>

          <Editing
            mode="batch"
            allowAdding={true}
            allowDeleting={true}
            allowUpdating={true}
          />
          <Column dataField="firstName" caption="First Name">
            <RequiredRule />
          </Column>
          <Column dataField="lastName" caption="Last Name">
            <RequiredRule />
          </Column>
          <Column dataField="position" caption="Position">
            <RequiredRule />
          </Column>
          <Column dataField="phone" caption="Phone">
            <RequiredRule />
          </Column>
          <Column dataField="email" caption="Email">
            <RequiredRule />
            <EmailRule />
            <AsyncRule
              message="Email address is not unique"
              validationCallback={asyncValidation}
            />
          </Column>
          <Pager
            visible={true}
            allowedPageSizes={allowedPageSizes}
            displayMode={displayMode}
            showPageSizeSelector={true}
            showInfo={true}
            showNavigationButtons={true}
          />
        </DataGrid>
      </div>
    </div>
  );
};

export default App;
