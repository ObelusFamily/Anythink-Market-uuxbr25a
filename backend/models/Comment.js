var mongoose = require("mongoose");
// define the layout
var CommentSchema = new mongoose.Schema(
  {
    body: String,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" }
  },
  { timestamps: true }
);

// Requires population of seller
CommentSchema.methods.toJSONFor = function(user) {
  return {
    id: this._id,
    body: this.body,
    createdAt: this.createdAt,
    seller: this.seller.toProfileJSONFor(user)
  };
};
// actually create the model and can instantiate it later 
mongoose.model("Comment", CommentSchema);
