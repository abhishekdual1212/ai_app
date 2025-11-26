import { Outlet } from "react-router-dom";
import Navabar from "./Navabar";


export const SLayout= () => {
  return (
    <> 
  <Navabar/>
       <main className="">
                <Outlet/>
            </main>
    </>
  );
};
