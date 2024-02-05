const core = require('@actions/core')
const objectPath = require('object-path')

const BaseVersioning = require('./base')
const bumpVersion = require('../helpers/bumpVersion')

module.exports = class Json extends BaseVersioning {

  eol = null;
  jsonContent = {};

  constructor(fileLocation, versionPath) {
    super(fileLocation, versionPath)
    this.readJson()
  }

  /**
   * Reads and parses the json file
   */
  readJson = () => {
    // Read the file
    const fileContent = this.read()

    // Parse the file
    this.eol = fileContent.endsWith('\n') ? '\n' : ''
    try {
      this.jsonContent = JSON.parse(fileContent)
    } catch (error) {
      core.startGroup(`Error when parsing the file '${this.fileLocation}'`)
      core.info(`File-Content: ${fileContent}`)
      core.info(error) // should be 'warning' ?
      core.endGroup()
    }

    // Get the old version
    this.oldVersion = objectPath.get(this.jsonContent, this.versionPath, null)
  }

  /**
   * Bumps the version in the package.json
   *
   * @param {!string} releaseType - The type of release
   * @return {*}
   */
  bump = async (releaseType) => {
    // Read the file
    const jsonContent = this.fileContent

    // Get the new version
    this.newVersion = await bumpVersion(
      releaseType,
      this.oldVersion,
    )

    core.info(`Bumped file "${this.fileLocation}" from "${this.oldVersion}" to "${this.newVersion}"`)

    // Update the content with the new version
    objectPath.set(jsonContent, this.versionPath, this.newVersion)

    // Update the file
    this.update(
      JSON.stringify(jsonContent, null, 2) + this.eol
    )
  }

}

