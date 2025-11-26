import KnowledgeBot from "./chat-bot/KnowledgeBot"
import Payment from "./Payment"

const PayUi= () =>{
    return (
        <>
        
        <div className=' flex w-full gap-8 px-4 mt-4'>

            <div className="flex w-[60%]">
                <Payment/>
            </div>
    
      <KnowledgeBot className=""/>


    </div>
        
        </>
    )
}

export default PayUi