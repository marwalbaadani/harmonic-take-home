import { DataGrid, GridRowSelectionModel } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { getCollectionsById, ICompany, addCompaniesToCollection, ICollection } from "../utils/jam-api";
import { motion } from 'framer-motion';



const CompanyTable = (props: { selectedCollectionId: string, loading: boolean, collectionsList: ICollection[] }) => {
  const [response, setResponse] = useState<ICompany[]>([]);
  const [total, setTotal] = useState<number>();
  const [offset, setOffset] = useState<number>(0);
  const [pageSize, setPageSize] = useState(25);
  const [visible, setVisibility] = useState(false);
  const [massSelected, setMassSelect] = useState(false);
  const [selectedCollectionName, setSelectedCollectionName] = useState<string>("My List");
  const [dropdownSelected, setDropdownSelected] = useState(false);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [copyRequestLoading, setCopyRequestLoading] = useState(false);
  const [copyRequestFulfilled, setCopyRequestFulfilled] = useState(false);
  
  useEffect(() => {
    getCollectionsById(props.selectedCollectionId, offset, pageSize).then(
      (newResponse) => {
        setSelectedCollectionName(newResponse.collection_name);
        setResponse(newResponse.companies);
        setTotal(newResponse.total);
      }
    );
  }, [props.selectedCollectionId, props.collectionsList, offset, pageSize]);

  useEffect(() => {
    setOffset(0);
  }, [props.selectedCollectionId]);

  useEffect(() => {
    if (copyRequestFulfilled) {
      setMassSelect(false);
      setVisibility(false);
    }
    const timer = setTimeout(() => {
      setCopyRequestFulfilled(false);
    }, 5000);
    return () => clearTimeout(timer);

  }, [copyRequestFulfilled]);

  const handleSelectionModelChange = (newSelection: GridRowSelectionModel) => {
    setSelectionModel(newSelection);
    const stringSelection = newSelection.map((id) => id.toString());
    setSelectedRowIds(stringSelection);
  };


  const addCompanies = async (collectionId: string)  => {
    setCopyRequestFulfilled(false);

    setCopyRequestLoading(true);
    try {
      const result = addCompaniesToCollection(selectedRowIds, collectionId, massSelected, props.selectedCollectionId, setCopyRequestLoading, setCopyRequestFulfilled);
      console.log('Result:', result);
  } catch (error) {
      console.error('Failed to add companies:', error);
  } finally {
      console.log("finally");
 
      

  }


  }



  return (
    <>    
   {copyRequestFulfilled &&                
    <motion.div
      className="absolute left-1/2 p-4 mt-2 w-.75 transition-all text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400"
      role="alert"
      initial={{ opacity: 0, y: -20 }}  
      animate={{ opacity: 1, y: 0 }}      
      exit={{ opacity: 0, y: -20 }}       
      transition={{
          duration: .85,              
          ease: 'easeInOut',             
      }}
    >
       <span className="font-medium">Successfully copied</span>
 </motion.div>}
    <div className="font-bold text-md ps-6 mt-4 mb-4 text-left flex justify-between items-center">
    {selectedCollectionName}

    <div className="relative inline-block text-left">
    <div>
      <button type="button" className="inline-flex justify-center items-center gap-x-1 rounded-md bg-gray-200 px-3 text-sm font-semibold text-gray-900 shadow-sm border-1 hover:bg-gray-100 me-5" id="menu-button" onClick={()=>setDropdownSelected(!dropdownSelected)} aria-expanded={dropdownSelected} aria-haspopup="true">
      Copy to
        <svg className="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
          <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

   {dropdownSelected && 
   <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 hover:color-skyblue-200 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex={-1}>
      <div className="py-1" role="none">
      {props.collectionsList?.map((collection) => {
        return (
          <a  className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex={Number(collection.id)} id="menu-item-0" onClick={() => addCompanies(`${collection.id}`)}>{collection.collection_name}</a>
        )}
      )
      }
      </div>
    </div>}
  </div>
      
 
  </div>
    <div style={{  width: "100%" }}>
     {visible &&
      massSelected && 
      <div className="flex flex-row w-100 items-center content-center justify-center bg-slate-200 h-10 m-0">
        <div className="text-xs" > All {total?.toLocaleString()} companies in this collection are selected.</div>
        <button type="button" className="text-xs font-bold text-sky-600 bg-transparent border-none hover:bg-slate-100 ms-2"  onClick={()=>setMassSelect(false)}> Only select {pageSize} companies </button>  
        </div>}
      {visible &&
        !massSelected &&  
      (<div className="flex flex-row w-100 items-center content-center justify-center bg-slate-200 h-10 m-0">
      <div className="text-xs" > {pageSize} companies selected.</div>
    <button type="button" className="text-xs font-bold text-sky-600 bg-transparent border-none hover:bg-slate-100 ms-2"  onClick={()=>setMassSelect(true)}> Select all {total?.toLocaleString()} companies </button> 
     </div>)
     }
      <DataGrid
        rows={response}
        rowHeight={46}
        columns={[
          { field: "company_name", headerName: "Company Name", width: 200 },
          { field: "liked", headerName: "Liked", width: 90 },
        ]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 25 },
          },
        }}
        rowCount={total}
        pagination
        checkboxSelection
        paginationMode="server"
        onPaginationModelChange={(newMeta) => {
          setPageSize(newMeta.pageSize);
          setOffset(newMeta.page * newMeta.pageSize);
        }}
        sx={{ border: "none", marginTop: 0, fontFamily: 'Inter Variable' }}
        onCellClick={() => {visible && setVisibility(false)}}
        onColumnHeaderClick={()=>{setVisibility(!visible)}}
        indeterminateCheckboxAction="select"
        onRowSelectionModelChange={handleSelectionModelChange}
        rowSelectionModel={selectionModel}
        slotProps={{loadingOverlay: {variant: 'linear-progress'}}}
        loading={copyRequestLoading}
      /> 
    </div>

    </>
    
  );
};

export default CompanyTable;
