const {createButton} = this.app.plugins.plugins["buttons"];
const {DateUtils} = customJS;
const {LintingUtils} = customJS;

const thisdv = input.thisdv;

var usePlural = (qty, singular, plural) => qty == 1 ? singular : plural;

let eventContentsPath = `${dv.current().file.folder}/create event contents.md`;
let eventContentsFile = dv.page(eventContentsPath);

let date = eventContentsFile.newFileDate;
let dateString = [
	date.year,
	date.month.toString().padStart(2, "0"),
	date.day.toString().padStart(2, "0")
].join("-");
let timeString = [
  date.hour.toString().padStart(2, "0"),
  date.minute.toString().padStart(2, "0")
].join("-");
let timezone = eventContentsFile.timezone;
let newFileName = DateUtils.shiftDateToTimeZone(dateString, timeString, timezone);
let index = 
	dv.pages(`"events"`).file.name
	.filter(name => name.includes(newFileName))
	.sort(name => name, "ASC")
	.length + 1;
newFileName = `events/${newFileName} ${index}`;

let content = (await dv.io.load(eventContentsPath));
content = lintContent(content);




let location = eventContentsFile.location ? eventContentsFile.location : "\\#reddit-rplace"
let factions = eventContentsFile.factions ? eventContentsFile.factions : [dv.fileLink("factions/Kessoku Band")];
let parents = eventContentsFile.parents ? eventContentsFile.parents : [];
let tags = eventContentsFile.tags ? [...new Set(["#event"].concat(eventContentsFile.tags))] : ["#event"];
let yaml = 
`---
location: ${location} 
factions:${factions.map(
	f => 
	`\n  - "${f.markdown().replace(/\.md\|/g, "|")}"`)
	.join("")
}
parents:${parents.map(
	f => 
	`\n  - "${f.markdown().replace(/\.md\|/g, "|")}"`)
	.join("")
}
tags:${tags.map(f => `\n  - "${f}"`).join("")}
---`;

dv.paragraph(`There ${usePlural(index-1, "is", "are")} ${index - 1} ${usePlural(index-1, "event", "events")} occurring on ${dateString} at ${timeString.replace(/-/g, ":")} UTC${timezone > 0 ? "+" : ""}${timezone}.`)
dv.paragraph(`Pressing the button will create the file \`${newFileName}.md\` with the following content:`);

let newFileContents = `${yaml}\n${content}`;
dv.paragraph("`````\n" + newFileContents + "\n`````");
dv.paragraph(createButton({
	app, 
	el: thisdv.container, 
	args: {
		name: "Create Event",
		type: `note(${newFileName}, split) text`,
		action: newFileContents,
	}
}));

function getFirstAliasFromFilePath(path) {
  let page = dv.page(path);
  // console.log(page);
  return page.aliases ? page.aliases[0] : page.file.name;
}

function lintContent(content) {
  // lint content
  content = LintingUtils.removeYAML(content);
  content = LintingUtils.ensureWikiLinksHaveDisplayText(content);
  content = LintingUtils.addFullStopAfterLastLine(content);
  content = LintingUtils.onlyOneFinalNewLine(content);
  
  let userLinks = content.match(/(\[\[users\/[\w\s]+)(\|displayText)(\]\])/gm);
  if (userLinks) {
    let newUserLinks = userLinks.map((link) => {
      let path = link.match(/users\/[^|\]]*/g)[0];
      let newLink = link.replace(/\|displayText/, `|${getFirstAliasFromFilePath(path)}`);
      return newLink;
    });
    userLinks.forEach((userLink, index) => {
      content = content.replace(userLink, newUserLinks[index]);
    });
    content = content.replace(/(\*+|)(\[\[users\/[^|\]]+[|][^\[\]]+\]\])(\*+|)/gm, "*$2*");
  }
  
  let factionLinks = content.match(/(\[\[factions\/[^|\]]+)(\|displayText)(\]\])/gm);
  if (factionLinks) {
    //console.log(content);
    let newFactionLinks = factionLinks.map((link) => {
      let path = link.match(/factions\/[^|\]]*/g)[0];
      let newLink = link.replace(/\|displayText/, `|${getFirstAliasFromFilePath(path)}`);
      return newLink;
    });
    factionLinks.forEach((factionLink, index) => {
      content = content.replace(factionLink, newFactionLinks[index]);
    });
    content = content.replace(/(\*+|)(\[\[factions\/[^|\]]+[|][^\[\]]+\]\])(\*+|)/gm, "**$2**");
  }
  
  let artworkLinks = content.match(/(\[\[artwork\/[^|\]]+)(\|displayText)(\]\])/gm);
  if (artworkLinks) {
    //console.log(content);
    let newArtworkLinks = artworkLinks.map((link) => {
      let path = link.match(/artwork\/[^|\]]*/g)[0];
      let newLink = link.replace(/\|displayText/, `|${getFirstAliasFromFilePath(path)}`);
      return newLink;
    });
    artworkLinks.forEach((artworkLink, index) => {
      content = content.replace(artworkLink, newArtworkLinks[index]);
    });
    content = content.replace(/(\*+|)(\[\[artwork\/[^|\]]+[|][^\[\]]+\]\])(\*+|)/gm, "**$2**");
  }


  return content;
}