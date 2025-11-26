import { Outlet } from "react-router-dom";
import Navbar from "../Component/Navbar";
import DashboardNavbar from "../Component/dashboard/Navbar";
import Footer from "../Component/Footer";


export const Layout = () =>{
    return (
        <>
            <Navbar />
            <main className="">
                <Outlet/>
            </main>
          <Footer />

        </>
    )
}

export const SecondLayout = () =>{
    return (
        <>
            <DashboardNavbar />
            <main className="">
                <Outlet/>
            </main>
        </>
    )
}

