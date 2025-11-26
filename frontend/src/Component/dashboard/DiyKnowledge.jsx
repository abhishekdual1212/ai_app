import KnowledgeBot from "./KnowledgeBot"
import Question from "./Question"

const DiyKnowledge = () =>{

    return (

           <>
          <div className="flex w-full px-10 gap-9 py-6">
            <div className="w-[60%] ">
             <Question/>
            </div>
            <div className="w-[40%] ">
             <KnowledgeBot/>
            </div>


          </div>
           
           </>


    )
  
}

export default DiyKnowledge