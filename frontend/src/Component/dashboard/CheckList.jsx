const CheckList = () => {
  const handleDownload = () => {
    // TODO: Replace with actual file download logic
  
  };

  return (
    <div className="font-sans">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Invoice</h2>

      <div className="bg-[#FFCDFF40] w-[24rem] h-64 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
        <p className="text-base text-black font-medium mb-6">Invoice for Trademark</p>

        <button
          onClick={handleDownload}
          className="bg-[#2F5EAC] text-white px-6 py-2 rounded-md font-medium hover:bg-[#244a8c] transition"
        >
          Download Invoice
        </button>
      </div>
    </div>
  );
};

export default CheckList;
