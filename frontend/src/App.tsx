import "./App.css";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useEffect, useState, Suspense } from "react";
import CompanyTable from "./components/CompanyTable";
import { getCollectionsMetadata, addCompaniesToCollection } from "./utils/jam-api";
import useApi from "./utils/useApi";
import '@fontsource-variable/inter';
import { DocumentChartBarIcon } from '@heroicons/react/24/outline'
import { CircularProgress } from "@mui/material";

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

function App() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>();
  const [selectedCollectionName, setSelectedCollectionName] = useState<string>("My List");


  const { data: collectionResponse, loading: loadingState } = useApi(() => getCollectionsMetadata());
  const SplashScreen = () => (
    <div className="flex items-center justify-center h-screen bg-blue-500">
      <h1 className="text-4xl text-white">Loading Component...</h1>
    </div>
  );
  
  useEffect(() => {
    setSelectedCollectionId(collectionResponse?.[0]?.id);
  }, [collectionResponse, loadingState]);

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <div>
      <Suspense fallback={<SplashScreen />}>
        <div className="flex bg-slate-100 min-h-screen">
          <div className="w-1/5 bg-slate-100">
          <div className="flex flex-row items-center p-5">
          <img src="/vite.svg" className="logo mb-4"></img>
          </div>
            <p className="flex content-left px-3 font-bold text-sm text-zinc-500 border-b pb-2 ">Collections</p>
            {loadingState ? <div className="p-10" ><CircularProgress size="36px" disableShrink/> </div> :
            <div className="flex flex-col gap-1">
              {collectionResponse?.map((collection) => {
                return (
                  <div className={`flex flex-row w-100 items-center inline-block p-3 hover:cursor-pointer rounded-xl hover:bg-slate-300 text-sm flex content-left ${
                    selectedCollectionId === collection.id &&
                    "bg-zinc-100 font-bold bg-zinc-300  text-black"
                  }`}>
                  <DocumentChartBarIcon className={`size-5 hover:bg-slate-500  ${
                      selectedCollectionId === collection.id &&
                      "text-black "
                    }`}/>
                  <div
                    className={`inline-block hover:cursor-pointer px-1 rounded-lg text-sm flex content-left ${
                      selectedCollectionId === collection.id &&
                      "font-bold"
                    }`}
                    onClick={() => {
                      setSelectedCollectionId(collection.id);
                      setSelectedCollectionName(collection.collection_name);
                    }}
                  >
                    {collection.collection_name}
                  </div>
                  </div>
                );
              })}
            </div>}
          </div>
          <div className="w-4/5 border mt-1 rounded-lg bg-white">
              {loadingState ? <div className="h-full my-200" ><CircularProgress size="40px" disableShrink sx={{color: "darkslategray"}}/> </div> :
            selectedCollectionId && (
              <CompanyTable selectedCollectionId={selectedCollectionId} loading={loadingState} collectionsList={collectionResponse}/>
            )}
          
          </div>
        </div>
        </Suspense>
      </div>
    </ThemeProvider>
  );
}

export default App;
