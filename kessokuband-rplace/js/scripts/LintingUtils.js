class LintingUtils {
  removeYAML(text) {
    // remove YAML from beginning of file
    return text.replace(/---.+---\n+/s, "");
  }
  ensureWikiLinksHaveDisplayText(text) {
    // makes sure all WikiLinks have aliases ([[path/to/file|alias]])
    return text.replace(/\[\[(([\w\s]+\/)+)([^|\]]+)(\||)\]\]/g, "[[$1$3|displayText]]");
  }
  addFullStopAfterLastLine(text) {
    // ensure text ends with punctuation
    // insert the fullstop regardless, then check to see if we should remove it
    return text.replace(/()(\n+|)$/, ".$2").replace(/([.!?)"'`]+?)\.?(\n+|)$/gs, "$1$2");
  }
  onlyOneFinalNewLine(text) {
    // makes sure there is only one new line at the end of the given text.
    // replace all new lines at the end (even if none) with a single new line
    return text.replace(/\n*$/, "\n");
  }
}
