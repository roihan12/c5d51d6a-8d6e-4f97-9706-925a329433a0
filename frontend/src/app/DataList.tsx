"use client";
import React, { useCallback, useState } from "react";
import DataGrid, {
  Column,
  Editing,
  Paging,
  Lookup,
  DataGridTypes,
} from "devextreme-react/data-grid";
import { employees, states } from "./data";

// import DataGrid from "devextreme-react/data-grid";
import "devextreme/dist/css/dx.light.css";

// const getCatFacts = async (): Promise<any[]> => {
//   const dataResponse = await fetch("https://catfact.ninja/facts", {
//     cache: "no-store",
//   });
//   const facts = (await dataResponse.json()).data;
//   return facts;
// };

// const dataItemsPromise = getCatFacts();

// export const DataList: React.FC = async () => {
//   const dataItems = await dataItemsPromise; // Load the data from the Cat Facts API
//   return (
//     <>
//       <DataGrid
//         dataSource={dataItems} // Assign the data source
//         rowAlternationEnabled={true} // Use the gray background to highlight even grid rows and improve readability
//         showBorders={true} // Display grid borders
//       ></DataGrid>
//     </>
//   );
// };

const startEditActions = ["click", "dblClick"];
const actionLabel = { "aria-label": "Action" };

const DataList = () => {
  const [selectTextOnEditStart, setSelectTextOnEditStart] = useState(true);
  const [startEditAction, setStartEditAction] =
    useState<DataGridTypes.StartEditAction>("click");

  return (
    <div id="data-grid-demo">
      <DataGrid dataSource={employees} keyExpr="ID" showBorders={true}>
        <Paging enabled={false} />
        <Editing
          mode="batch"
          allowUpdating={true}
          allowAdding={true}
          allowDeleting={true}
          selectTextOnEditStart={selectTextOnEditStart}
          startEditAction={startEditAction}
        />
        <Column dataField="Prefix" caption="Title" width={70} />
        <Column dataField="FirstName" />
        <Column dataField="LastName" />
        <Column dataField="Position" width={170} />
        <Column dataField="StateID" caption="State" width={125}>
          <Lookup dataSource={states} valueExpr="ID" displayExpr="Name" />
        </Column>
        <Column dataField="BirthDate" dataType="date" />
      </DataGrid>
    </div>
  );
};

export default DataList;
