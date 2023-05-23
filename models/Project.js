const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')

const projectSchema = mongoose.Schema({
	ID: {
    type: Number,
    unique:true
  },
  domain: {
    type: String
	}, 
  name: {
    type: String,
    unique:true
	},
  client: String,
  completed_At: Date,
  gallery: [
    {
      public_id: String,
      url: String,
      image_type: String
    }
  ],
  description: String
},
{ versionKey: false })

projectSchema.index({ ID: 1 }, {unique: true})

autoIncrement.initialize(mongoose.connection)
projectSchema.plugin(autoIncrement.plugin, { model: 'Project', field: 'ID' })
module.exports = mongoose.model('Project', projectSchema)