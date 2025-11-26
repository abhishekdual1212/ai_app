import BookCall from "./BookCall"
import Checklist from "./CheckList"

import PercentageCard from "./PercentageCard"

import OrderIntent from "./OrderIntent"
import ChatwhCall from "./ChatwhCall"

const IntentLayout = () =>{
    return (
        <>
        
     <div className="flex w-full ">
     <div className="flex w-[65%]">
   
            <OrderIntent/>
        </div>
        <div className="w-[35%] flex flex-col gap-6">
          <div className=" my-8">
            <PercentageCard />
          </div>
            <Checklist/>
            <BookCall/>
            <ChatwhCall/>

        </div>
     </div>
        
        </>
    )
}
export default IntentLayout