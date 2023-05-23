// housekeeping for models
// this file requires in a lot of models
// to it cannot be required FROM model files
// use ModelBase for that...

const debug = require('debug-levels')('ModelUtils')
// const Locations = require('./Locations')

const AllModels = [
  '../models/Locations'
]

const ModelUtils = {

  async reset() {
    debug.warn('reset User stuff')
  },

  async initAll() {
    // await Locations.init()

    // for (let fp of AllModels) {
    //   let mod = require(fp)
    //   await mod.init()
    // }

  }

}

module.exports = ModelUtils