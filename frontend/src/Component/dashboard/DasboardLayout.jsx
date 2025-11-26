import BookCall from "./BookCall"
import Checklist from "./CheckList"
import OrderDasboard from "./OrderDasboard"
import ChatwhCall from "./ChatwhCall"
import DiyPercentageCard from "./DiyPercentageCard"

const OrderLayout = () =>{
    return (
        <>
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-12 p-4 md:p-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 order-1">
            <OrderDasboard/>
          </div>
          {/* Sidebar Area */}
          <div className="lg:col-span-1 order-2 flex flex-col gap-8">
              <DiyPercentageCard percentage={0} />
              <Checklist/>
              <BookCall/>
              <ChatwhCall/>
          </div>
        </div>
        </>
    )
}
export default OrderLayout