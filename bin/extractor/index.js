const nonces = require("./splotter/nonces");
const scoops = require("./splotter/scoops");

/**
 * This is a tiny but very useful extract function with fluent API
 *
 * The function passed as argument for .do() will be executed only, if the extractor has results
 *
 * Usage: extract.on("Some text", tryGetMyShitExtractor).do( (extractedGroups) => { ... } );
 *
 * @param input  Text to be scanned by the extractor
 * @param extractor The extractor function, i.e. avx, sse
 * @returns {{do: *}} An object which may execute the passed function, if extractor returns other than null
 * @private
 */
function _extract(input, extractor) {
  const extractedResult = extractor(input);
  return {
    do: extractedResult ? fn => fn(extractedResult) : () => {}
  };
}

module.exports = {
  extract: {
    on: _extract
  },
  extractors: {
    nonces,
    scoops
  }
};