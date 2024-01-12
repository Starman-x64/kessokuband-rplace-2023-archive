class LintingUtils {
  removeYAML(text) {
    // remove YAML from beginning of file
    return text.replace(/---.+---\n+/s, "");
  }
  
}
