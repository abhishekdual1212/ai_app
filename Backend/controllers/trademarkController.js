
const Trademark = require("../models/Trademark");
 
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_FILE_PREFIXES = [
  "data:image/jpeg",
  "data:image/png",
  "data:image/jpg",
  "data:application/pdf"
];
 
// Create a new empty form
exports.createTrademark = async (req, res) => {
  try {
    const newTrademark = new Trademark({});
    await newTrademark.save();
    res.status(201).json({ success: true, id: newTrademark._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
 
// Update form step by step
exports.updateTrademark = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
 
    console.log("Updating trademark:", id, updateData);
 
    // Validate logo/file if present
    if (updateData.logo && updateData.logo !== "") {
      const logoStr = updateData.logo;
      const isAllowedType = ALLOWED_FILE_PREFIXES.some(prefix => logoStr.startsWith(prefix));
      if (!isAllowedType) return res.status(400).json({ success: false, message: "Invalid file type" });
 
      const sizeInBytes = Buffer.byteLength(logoStr.split(",")[1] || "", "base64");
      if (sizeInBytes > MAX_FILE_SIZE) return res.status(400).json({ success: false, message: "File too large" });
    }
 
    const updated = await Trademark.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: "Trademark form not found" });
 
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
 
// Return service types
exports.getServices = async (req, res) => {
  try {
    const services = [
      { value: "Consulting", label: "Consulting" },
      { value: "Technology", label: "Technology" },
      { value: "Education", label: "Education" },
      { value: "Healthcare", label: "Healthcare" },
      { value: "Finance", label: "Finance" },
      { value: "Legal", label: "Legal" },
      { value: "Manufacturing", label: "Manufacturing" },
      { value: "Retail", label: "Retail" },
      { value: "Hospitality", label: "Hospitality" },
      { value: "Other", label: "Other" }
    ];
    res.status(200).json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
 