import React, { useState } from 'react';
import BookCall from "./BookCall"
import Checklist from "./CheckList"
import DiyStatus from "./DiyStatus"
import ChatwhCall from "./ChatwhCall"
import DiyPercentageCard from "./DiyPercentageCard"

const OrderLayout = () =>{
    const [progressPercentage, setProgressPercentage] = useState(0);

    return (
        <>
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                <DiyStatus onProgressUpdate={setProgressPercentage} />
            </div>
            <div className="w-full max-w-sm mx-auto lg:max-w-none flex flex-col gap-6 items-center">
                <DiyPercentageCard percentage={progressPercentage} />
                <Checklist/>
                <BookCall/>
                <ChatwhCall/>
            </div>
        </div>
        </>
    )
}
export default OrderLayout