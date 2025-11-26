import { CiCircleChevDown, CiCircleChevUp } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

const ComplianceDocumentItem = ({
  item,
  index,
  expandedIndex,
  isSelected,
  price,
  isPriceLoading,
  isCompleted,
  isAlreadyInOrder,
  onToggle,
  onProceed,
}) => {
  const navigate = useNavigate();
  const isExpanded = expandedIndex === index;

  console.log(`Item ${item.outcome}: isAlreadyInOrder = ${isAlreadyInOrder}`);

  const getButtonState = () => {
    if (isCompleted) {
      return {
        text: "Check Status",
        disabled: false,
        className: "bg-[#388E3C] hover:bg-[#2E7D32]",
      };
    }
    if (isAlreadyInOrder) {
      return {
        text: "Already Selected",
        disabled: true,
        className: "bg-gray-400 cursor-not-allowed",
      };
    }
    if (isSelected) {
      return {
        text: "In Progress...",
        disabled: true,
        className: "bg-gray-400 cursor-not-allowed",
      };
    }
    return {
      text: "Proceed",
      disabled: false,
      className: "bg-[#FA9000] hover:bg-[#E8850E]",
    };
  };

  console.log(`Item ${item.outcome}: buttonState = ${JSON.stringify(buttonState)}`);

  const buttonState = getButtonState();

  const handleProceedClick = (e) => {
    e.stopPropagation();
    if (isCompleted) {
      navigate(`/dashboard/orde`);
    } else if (!buttonState.disabled) {
      onProceed(item.outcome);
    }
  };

  return (
    <div
      className={`w-[35rem] rounded-xl px-6 py-4 mx-auto my-6 ${
        isExpanded || isSelected
          ? "border-[2px] border-[#388E3C] bg-[#EAF2FF]"
          : "border border-[#CCCCCC] bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-4 flex-1">
          <div
            className={`w-4 h-4 rounded-full border flex-shrink-0 ${
              isExpanded || isSelected ? "bg-[#388E3C] border-[#388E3C]" : "border-[#388E3C]"
            } flex items-center justify-center`}
          >
            {(isExpanded || isSelected) && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="text-[#4B4B4B] font-[poppins] font-medium text-[16px] flex-1">
            {item.outcome}
          </span>
        </div>
        <div className="flex items-center gap-x-8">
          <button
            className="flex items-center justify-center w-8 h-8 flex-shrink-0"
            onClick={() => onToggle(index, item.outcome)}
          >
            {isExpanded ? (
              <CiCircleChevUp className="text-[#388E3C] w-6 h-6" />
            ) : (
              <CiCircleChevDown className="text-[#388E3C] w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 bg-white px-4 pb-4" onClick={(e) => e.stopPropagation()}>
          <hr className="border border-[#D9D9D9]" />
          <div className="mt-4 space-y-2 font-[poppins] text-sm text-[#4B4B4B]">
            {isPriceLoading ? (
              <div className="mt-4 text-[#2F5EAC] text-sm">Fetching price...</div>
            ) : price ? (
              <>
                <div className="flex justify-between mt-4"><span>Professional Fees</span><span>₹{price.professional_fees}</span></div>
                <div className="flex justify-between"><span>Government Fees</span><span>₹{price.government_fees}</span></div>
                <div className="flex justify-between font-semibold text-[#2F5EAC]"><span>Total</span><span>₹{price.total_amount}</span></div>
              </>
            ) : (<div className="text-red-500 mt-4">Pricing not available.</div>)}
          </div>
          <div className="flex justify-end mt-6">
            <button disabled={buttonState.disabled} className={`${buttonState.className} text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200 whitespace-nowrap`} onClick={handleProceedClick}>
              {buttonState.text}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceDocumentItem;